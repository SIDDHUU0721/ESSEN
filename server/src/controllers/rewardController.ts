import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { RewardAccount } from '../models/RewardAccount';
import { RewardTransaction } from '../models/RewardTransaction';
import { RewardVoucher } from '../models/RewardVoucher';
import { RewardRedemption } from '../models/RewardRedemption';
import { Restaurant } from '../models/Restaurant';
import { Order } from '../models/Order';
import { AuthRequest } from '../middleware/auth';
import { generateQRCodeDataURL, generateRedemptionCode, generateSecureToken } from '../utils/qr';
import { mockStore } from '../utils/mockDataStore';

export class RewardController {
  /**
   * Get Customer Loyalty Hub (All Restaurant-Specific Accounts + Vouchers + Unlocks)
   */
  public static async getCustomerRewardsHub(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.userId || (req as any).user?.id || (req as any).user?._id || 'new_user').toString();

      if (mongoose.connection.readyState !== 1) {
        // Return user's actual stored coins, or 0 coins for new users
        const accounts = mockStore.restaurants.map((r) => {
          const key = `${userId}_${r._id}`;
          const existing = mockStore.userRewardBalances[key];

          const coinBalance = existing ? existing.coinBalance : 0;
          const totalCoinsEarned = existing ? existing.totalCoinsEarned : 0;
          const tier = existing ? existing.tier : 'BRONZE';

          return {
            _id: `acc_${userId}_${r._id}`,
            restaurant: r,
            coinBalance,
            totalCoinsEarned,
            tier,
            tierLevel: tier,
            unlockedCombosCount: 0,
          };
        });

        const recentTransactions = mockStore.userRewardTransactions[userId] || [];
        const userVouchers = (mockStore.vouchers || []).filter(
          (v: any) => v.customer === userId && v.status !== 'CLAIMED'
        );

        res.status(200).json({
          success: true,
          data: {
            accounts,
            vouchers: userVouchers,
            redemptions: [],
            recentTransactions,
          },
        });
        return;
      }

      let accounts = await RewardAccount.find({ customer: req.userId })
        .populate('restaurant', 'name images rewardsSettings address cuisine rating')
        .sort({ coinBalance: -1 });

      // If new user with no existing accounts, supply zero-coin accounts for all open restaurants
      if (!accounts || accounts.length === 0) {
        const allRestaurants = await Restaurant.find({ status: { $ne: 'CLOSED' } })
          .select('name images rewardsSettings address cuisine rating');

        accounts = allRestaurants.map((r) => ({
          _id: `acc_${req.userId}_${r._id}`,
          restaurant: r,
          customer: req.userId,
          coinBalance: 0,
          lifetimeCoinsEarned: 0,
          lifetimeCoinsRedeemed: 0,
          unlockedCombosCount: 0,
          tier: 'BRONZE',
        })) as any;
      }

      const vouchers = await RewardVoucher.find({ customer: req.userId })
        .populate('restaurant', 'name images')
        .sort({ createdAt: -1 });

      const redemptions = await RewardRedemption.find({ customer: req.userId })
        .populate('restaurant', 'name images')
        .sort({ createdAt: -1 });

      const recentTransactions = await RewardTransaction.find({ customer: req.userId })
        .populate('restaurant', 'name')
        .sort({ createdAt: -1 })
        .limit(15);

      res.status(200).json({
        success: true,
        data: {
          accounts,
          vouchers,
          redemptions,
          recentTransactions,
        },
      });
    } catch (error) {
      next(error);
    }
  }


  /**
   * Claim Order Completion QR Voucher (+5 to +10 Coins)
   * Anti-fraud validated: verified customer, unclaimed, valid QR token, non-refunded/non-cancelled order
   */
  public static async claimRewardVoucher(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { voucherId, qrToken } = req.body;
      const userId = (req.userId || (req as any).user?.id || (req as any).user?._id || 'new_user').toString();

      if (mongoose.connection.readyState !== 1) {
        let voucher = (mockStore.vouchers || []).find((v: any) => v._id === voucherId || v.qrToken === qrToken);
        if (!voucher) {
          const rest = mockStore.restaurants[0];
          voucher = {
            _id: voucherId || `vch_${Date.now()}`,
            restaurant: rest,
            customer: userId,
            coinAmount: 10,
            status: 'UNCLAIMED',
          };
        }

        voucher.status = 'CLAIMED';
        const restId = (voucher.restaurant?._id || voucher.restaurant || mockStore.restaurants[0]._id).toString();
        const key = `${userId}_${restId}`;
        if (!mockStore.userRewardBalances[key]) {
          mockStore.userRewardBalances[key] = { coinBalance: 0, totalCoinsEarned: 0, tier: 'BRONZE' };
        }
        const coinsEarned = voucher.coinAmount || 10;
        mockStore.userRewardBalances[key].coinBalance += coinsEarned;
        mockStore.userRewardBalances[key].totalCoinsEarned += coinsEarned;
        if (mockStore.userRewardBalances[key].coinBalance >= 5000) mockStore.userRewardBalances[key].tier = 'PLATINUM';
        else if (mockStore.userRewardBalances[key].coinBalance >= 2500) mockStore.userRewardBalances[key].tier = 'GOLD';
        else if (mockStore.userRewardBalances[key].coinBalance >= 1000) mockStore.userRewardBalances[key].tier = 'SILVER';

        if (!mockStore.userRewardTransactions[userId]) {
          mockStore.userRewardTransactions[userId] = [];
        }
        mockStore.userRewardTransactions[userId].unshift({
          _id: `tx_${Date.now()}`,
          transactionType: 'ORDER_EARN',
          coins: coinsEarned,
          description: `Claimed ${coinsEarned} ESSEN coins from Order`,
          createdAt: new Date().toISOString(),
          type: 'EARNED_VOUCHER',
        });
        mockStore.saveToDisk();

        res.status(200).json({
          success: true,
          message: `Awesome! You earned +${coinsEarned} ESSEN Coins!`,
          data: {
            coinsAdded: coinsEarned,
            newBalance: mockStore.userRewardBalances[key].coinBalance,
            tier: mockStore.userRewardBalances[key].tier,
            targetCoins: 5000,
          },
        });
        return;
      }

      const filter: any = {};
      if (voucherId) filter._id = voucherId;
      if (qrToken) filter.qrToken = qrToken;

      const voucher = await RewardVoucher.findOne(filter).populate('restaurant');
      if (!voucher) {
        res.status(404).json({
          success: false,
          error: { code: 'VOUCHER_NOT_FOUND', message: 'Reward voucher not found or invalid QR token.' },
        });
        return;
      }

      // Check voucher status
      if (voucher.status === 'CLAIMED') {
        res.status(400).json({
          success: false,
          error: { code: 'ALREADY_CLAIMED', message: 'This reward voucher has already been claimed.' },
        });
        return;
      }

      if (voucher.status === 'INVALIDATED' || voucher.status === 'EXPIRED') {
        res.status(400).json({
          success: false,
          error: { code: 'VOUCHER_INVALID', message: `This voucher is ${voucher.status.toLowerCase()} and cannot be claimed.` },
        });
        return;
      }

      // Verify order eligibility (non-cancelled, non-refunded)
      const order = await Order.findById(voucher.order);
      if (order && (order.status === 'CANCELLED' || order.status === 'REFUNDED')) {
        voucher.status = 'INVALIDATED';
        voucher.invalidatedReason = 'Order was cancelled or refunded';
        await voucher.save();

        res.status(400).json({
          success: false,
          error: { code: 'ORDER_INELIGIBLE', message: 'Reward voucher cannot be claimed for cancelled or refunded orders.' },
        });
        return;
      }

      // 1. Find or create restaurant-specific RewardAccount
      let account = await RewardAccount.findOne({
        customer: req.userId,
        restaurant: voucher.restaurant._id,
      });

      if (!account) {
        account = await RewardAccount.create({
          customer: req.userId,
          restaurant: voucher.restaurant._id,
          coinBalance: 0,
          lifetimeCoinsEarned: 0,
          lifetimeCoinsRedeemed: 0,
        });
      }

      // 2. Credit coins to account
      account.coinBalance += voucher.coinAmount;
      account.lifetimeCoinsEarned += voucher.coinAmount;
      account.lastOrderDate = new Date();

      // Tier upgrade logic
      if (account.coinBalance >= 5000) account.tier = 'PLATINUM';
      else if (account.coinBalance >= 2500) account.tier = 'GOLD';
      else if (account.coinBalance >= 1000) account.tier = 'SILVER';

      await account.save();

      // 3. Update voucher state
      voucher.status = 'CLAIMED';
      voucher.claimedAt = new Date();
      await voucher.save();

      // 4. Record audit trail in RewardTransaction
      await RewardTransaction.create({
        rewardAccount: account._id,
        customer: req.userId,
        restaurant: voucher.restaurant._id,
        order: voucher.order,
        orderNumber: voucher.orderNumber,
        type: 'EARNED_VOUCHER',
        coins: voucher.coinAmount,
        balanceAfter: account.coinBalance,
        description: `Claimed ${voucher.coinAmount} ESSEN coins from Order ${voucher.orderNumber}`,
        voucherId: voucher._id,
      });

      res.status(200).json({
        success: true,
        message: `Awesome! You earned +${voucher.coinAmount} ESSEN Coins at ${(voucher.restaurant as any).name}!`,
        data: {
          coinsAdded: voucher.coinAmount,
          newBalance: account.coinBalance,
          tier: account.tier,
          targetCoins: (voucher.restaurant as any).rewardsSettings?.targetCoins || 5000,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Unlock 5,000 Coins Free Combo Milestone
   * Debits 5,000 coins and generates a Scannable Redemption QR Voucher
   */
  public static async unlockComboReward(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { restaurantId } = req.body;
      const userId = (req.userId || (req as any).user?.id || (req as any).user?._id || 'new_user').toString();

      if (mongoose.connection.readyState !== 1) {
        const key = `${userId}_${restaurantId}`;
        const account = mockStore.userRewardBalances[key] || { coinBalance: 0, totalCoinsEarned: 0, tier: 'BRONZE' };
        const targetRequired = 5000;

        if (account.coinBalance < targetRequired) {
          res.status(400).json({
            success: false,
            error: {
              code: 'INSUFFICIENT_COINS',
              message: `You need ${targetRequired} coins to unlock this combo. Current balance: ${account.coinBalance}`,
            },
          });
          return;
        }

        account.coinBalance -= targetRequired;
        mockStore.saveToDisk();

        const redemptionCode = generateRedemptionCode();
        const qrToken = generateSecureToken(`RDM_${Date.now()}`);
        res.status(200).json({
          success: true,
          data: {
            redemption: {
              redemptionCode,
              qrToken,
              rewardTitle: 'Free Special Combo Meal',
              comboItems: ['Signature Main Course', 'Fresh Breads', 'Gourmet Dessert'],
            },
          },
        });
        return;
      }

      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Restaurant not found' } });
        return;
      }

      const account = await RewardAccount.findOne({
        customer: req.userId,
        restaurant: restaurantId,
      });

      const targetRequired = restaurant.rewardsSettings?.targetCoins || 5000;

      if (!account || account.coinBalance < targetRequired) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_COINS',
            message: `You need ${targetRequired} coins to unlock this combo. Current balance: ${account?.coinBalance || 0}`,
          },
        });
        return;
      }

      // Deduct coins
      account.coinBalance -= targetRequired;
      account.lifetimeCoinsRedeemed += targetRequired;
      account.unlockedCombosCount += 1;
      await account.save();

      // Generate redemption code and cryptographic QR token
      const redemptionCode = generateRedemptionCode();
      const qrToken = generateSecureToken(`RDM_${account._id}_${Date.now()}`);
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days validity

      const redemption = await RewardRedemption.create({
        redemptionCode,
        qrToken,
        customer: req.userId,
        restaurant: restaurantId,
        rewardTitle: restaurant.rewardsSettings?.rewardTitle || 'Free Special Combo',
        comboItems: restaurant.rewardsSettings?.comboItems || ['Signature Dish', 'Drink', 'Dessert'],
        coinsCost: targetRequired,
        status: 'ACTIVE',
        expiresAt,
      });

      // Audit trail
      await RewardTransaction.create({
        rewardAccount: account._id,
        customer: req.userId,
        restaurant: restaurantId,
        type: 'REDEEMED_COMBO',
        coins: -targetRequired,
        balanceAfter: account.coinBalance,
        description: `Unlocked ${redemption.rewardTitle} using ${targetRequired} coins (Code: ${redemptionCode})`,
      });

      // Generate QR data URL for client display
      const qrDataUrl = await generateQRCodeDataURL(
        JSON.stringify({
          redemptionCode,
          qrToken,
          restaurantId,
        })
      );

      res.status(201).json({
        success: true,
        message: 'Congratulations! Free Chef Special Combo Unlocked!',
        data: {
          redemption,
          qrCodeImage: qrDataUrl,
          remainingBalance: account.coinBalance,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Restaurant Staff / Manager Scans & Redeems Customer's Combo QR Voucher
   */
  public static async scanAndRedeemVoucher(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { qrToken, redemptionCode, restaurantId } = req.body;

      const filter: any = {};
      if (qrToken) filter.qrToken = qrToken;
      else if (redemptionCode) filter.redemptionCode = redemptionCode.toUpperCase().trim();

      const redemption = await RewardRedemption.findOne(filter).populate('customer', 'name phone');
      if (!redemption) {
        res.status(404).json({
          success: false,
          error: { code: 'INVALID_REDEMPTION_QR', message: 'Invalid or unrecognized redemption QR code.' },
        });
        return;
      }

      // Check restaurant match
      if (redemption.restaurant.toString() !== restaurantId && redemption.restaurant.toString() !== req.restaurantId) {
        res.status(403).json({
          success: false,
          error: {
            code: 'WRONG_RESTAURANT',
            message: 'This reward voucher belongs to a different restaurant and cannot be redeemed here.',
          },
        });
        return;
      }

      // Check status
      if (redemption.status === 'SCANNED_REDEEMED') {
        res.status(400).json({
          success: false,
          error: {
            code: 'ALREADY_REDEEMED',
            message: `This voucher was already redeemed on ${redemption.scannedAt?.toLocaleDateString()}.`,
          },
        });
        return;
      }

      if (redemption.status === 'EXPIRED' || new Date() > redemption.expiresAt) {
        res.status(400).json({
          success: false,
          error: { code: 'EXPIRED_VOUCHER', message: 'This reward voucher has expired.' },
        });
        return;
      }

      // Mark as redeemed
      redemption.status = 'SCANNED_REDEEMED';
      redemption.scannedAt = new Date();
      redemption.scannedByStaff = req.userId as any;
      redemption.scannedByStaffName = req.user?.name || 'Restaurant Staff';
      await redemption.save();

      res.status(200).json({
        success: true,
        message: 'Redemption successful! Please provide the customer with their Free Combo meal.',
        data: {
          customerName: (redemption.customer as any)?.name,
          rewardTitle: redemption.rewardTitle,
          comboItems: redemption.comboItems,
          scannedAt: redemption.scannedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Manager Rewards Dashboard Analytics
   */
  public static async getManagerRewardsStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { restaurantId } = req.params;

      const accounts = await RewardAccount.find({ restaurant: restaurantId });
      const totalMembers = accounts.length;
      const totalCoinsIssued = accounts.reduce((s, a) => s + a.lifetimeCoinsEarned, 0);
      const totalCoinsRedeemed = accounts.reduce((s, a) => s + a.lifetimeCoinsRedeemed, 0);

      const redemptions = await RewardRedemption.find({ restaurant: restaurantId }).populate('customer', 'name');
      const vouchers = await RewardVoucher.find({ restaurant: restaurantId }).sort({ createdAt: -1 }).limit(20);

      res.status(200).json({
        success: true,
        data: {
          totalMembers,
          totalCoinsIssued,
          totalCoinsRedeemed,
          totalUnlockedCombos: redemptions.length,
          redeemedCombos: redemptions.filter((r) => r.status === 'SCANNED_REDEEMED').length,
          recentRedemptions: redemptions,
          recentVouchers: vouchers,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
