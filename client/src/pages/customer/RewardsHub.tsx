import React, { useState, useEffect } from 'react';
import { Award, Sparkles, QrCode, CheckCircle2, ArrowRight, ShieldCheck, Flame, Gift, Clock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { RewardAccount, RewardVoucher, RewardRedemption } from '../../types';
import { ClaimVoucherModal } from '../../components/rewards/ClaimVoucherModal';
import { getRewardComboImage } from '../../utils/foodImages';

export const RewardsHub: React.FC = () => {
  const [accounts, setAccounts] = useState<RewardAccount[]>([]);
  const [vouchers, setVouchers] = useState<RewardVoucher[]>([]);
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [activeClaimVoucher, setActiveClaimVoucher] = useState<RewardVoucher | null>(null);
  const [activeRedemptionModal, setActiveRedemptionModal] = useState<any>(null);
  const [unlockLoading, setUnlockLoading] = useState(false);

  useEffect(() => {
    fetchRewardsData();
  }, []);

  const fetchRewardsData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/rewards/hub');
      if (res.data?.data) {
        setAccounts(res.data.data.accounts || []);
        setVouchers(res.data.data.vouchers || []);
        setRedemptions(res.data.data.redemptions || []);
        setTransactions(res.data.data.recentTransactions || []);
      }
    } catch {
      // Fresh new account state with 0 coins
      setAccounts([
        {
          _id: 'acc_1',
          restaurant: {
            _id: 'rest_1',
            name: 'The Royal Nawabi Kitchen',
            cuisine: ['Mughlai', 'Biryani'],
            rewardsSettings: {
              targetCoins: 5000,
              rewardTitle: 'Free Royal Nawabi Dum Feast Combo',
              comboItems: ['Royal Dum Biryani', 'Galouti Kebabs (4 pcs)', '2 Roomali Rotis', 'Shahi Phirni'],
            },
          } as any,
          coinBalance: 0,
          lifetimeCoinsEarned: 0,
          lifetimeCoinsRedeemed: 0,
          unlockedCombosCount: 0,
          tier: 'BRONZE',
        },
      ]);
      setVouchers([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockCombo = async (restaurantId: string) => {
    setUnlockLoading(true);
    try {
      const res = await api.post('/rewards/unlock-combo', { restaurantId });
      if (res.data?.success) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#fbbf24', '#f97316', '#10b981', '#ffffff'],
        });
        setActiveRedemptionModal(res.data.data);
        fetchRewardsData();
      }
    } catch (err: any) {
      alert(err.message || 'Need 5,000 coins at this restaurant to unlock the combo.');
    } finally {
      setUnlockLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Hero Loyalty Banner */}
      <div className="relative rounded-3xl p-6 sm:p-10 glass-card border border-amber-500/30 bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-950 shadow-2xl overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-2xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-extrabold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            <span>ESSEN Proprietary Loyalty Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
            Restaurant-Specific Coins &{' '}
            <span className="bg-gradient-to-r from-amber-400 via-brand-400 to-amber-500 bg-clip-text text-transparent">
              Free Gourmet Feasts
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Every completed order rewards you with a cryptographically verified digital voucher granting **+5 to +10
            Coins**. Reach **5,000 Coins** at your favorite restaurant to unlock a full complimentary multi-course combo
            meal!
          </p>
        </div>
      </div>

      {/* Unclaimed Vouchers Strip */}
      {vouchers.filter((v) => v.status === 'UNCLAIMED').length > 0 && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-brand-950/60 via-slate-900 to-amber-950/60 border border-brand-500/30 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400 animate-pulse" />
              <span>Unclaimed Digital Order Vouchers</span>
            </h3>
            <span className="text-xs text-brand-400 font-bold">
              {vouchers.filter((v) => v.status === 'UNCLAIMED').length} Voucher(s) Waiting
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {vouchers
              .filter((v) => v.status === 'UNCLAIMED')
              .map((voucher) => (
                <div
                  key={voucher._id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 font-extrabold text-sm">
                      +{voucher.coinAmount}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Order {voucher.orderNumber}</h4>
                      <p className="text-[11px] text-slate-400">{voucher.restaurant?.name}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveClaimVoucher(voucher)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Claim QR</span>
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Restaurant Coin Progress Accounts */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <span>Active Restaurant Loyalty Accounts</span>
          <Award className="w-5 h-5 text-amber-400" />
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {accounts.map((acc) => {
            const target = acc.restaurant?.rewardsSettings?.targetCoins || 5000;
            const percentage = Math.min(100, Math.round((acc.coinBalance / target) * 100));
            const remaining = Math.max(0, target - acc.coinBalance);
            const canUnlock = acc.coinBalance >= target;

            return (
              <div
                key={acc._id}
                className="glass-card p-6 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-5 flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-brand-400 uppercase tracking-wider">
                        {acc.restaurant?.cuisine?.slice(0, 2).join(' • ')}
                      </span>
                      <h3 className="text-lg font-bold text-white mt-0.5">{acc.restaurant?.name}</h3>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                        acc.tier === 'PLATINUM'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : acc.tier === 'GOLD'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {acc.tier} TIER
                    </span>
                  </div>

                  {/* Coin Counter */}
                  <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-extrabold text-amber-400 font-mono">{acc.coinBalance.toLocaleString()}</span>
                      <span className="text-xs text-slate-400 font-semibold">/ {target.toLocaleString()} Coins</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-brand-500 via-amber-400 to-emerald-400 transition-all duration-700"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                      <span>{percentage}% Progress</span>
                      <span>
                        {remaining > 0 ? (
                          <strong className="text-brand-400">{remaining} coins remaining</strong>
                        ) : (
                          <strong className="text-emerald-400 font-bold">🎉 Milestone Achieved!</strong>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Target Reward Info with Feast Photo */}
                  <div className="mt-4 rounded-2xl overflow-hidden border border-amber-500/20 bg-slate-950/80 shadow-md group">
                    <div className="relative h-28 w-full overflow-hidden bg-slate-900">
                      <img
                        src={getRewardComboImage(acc.restaurant?.name)}
                        alt={acc.restaurant?.rewardsSettings?.rewardTitle || 'Free Special Combo'}
                        onError={(e) => {
                          e.currentTarget.src = getRewardComboImage();
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500/90 text-slate-950 text-[10px] font-extrabold shadow-md flex items-center gap-1 backdrop-blur-md">
                        <Gift className="w-3 h-3" />
                        <span>5,000 Coins Reward</span>
                      </div>
                      <div className="absolute bottom-2 left-3 right-3">
                        <span className="text-xs font-bold text-white block drop-shadow-md">
                          {acc.restaurant?.rewardsSettings?.rewardTitle || 'Free Special Combo Meal'}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 text-[11px] text-slate-300">
                      <p className="font-semibold text-amber-300 mb-0.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" /> Complimentary Feast Inclusions:
                      </p>
                      <p className="text-slate-400 leading-relaxed">
                        {(acc.restaurant?.rewardsSettings?.comboItems || ['Signature Main Dish', 'Drink', 'Dessert']).join(
                          ' • '
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Unlock / Order Action Button */}
                <div>
                  {canUnlock ? (
                    <button
                      onClick={() => handleUnlockCombo(acc.restaurant._id)}
                      disabled={unlockLoading}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 glow-gold transition-all active:scale-95"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Unlock Complimentary Combo Voucher</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => alert(`Earn ${remaining} more coins by ordering at ${acc.restaurant?.name}. Each order gives +5 to +10 coins!`)}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Order to Earn More Coins</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Coin Activity Audit Log */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-400" />
          <span>Recent Coin Audit Trail</span>
        </h3>

        <div className="space-y-2 text-xs">
          {transactions.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center space-y-1.5">
              <Sparkles className="w-6 h-6 text-brand-400 mx-auto opacity-70" />
              <p className="font-semibold text-slate-300">No coin transactions yet</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Complete a dine-in or online order to earn your digital QR reward vouchers and collect restaurant-specific coins toward a free 5,000-coin combo.
              </p>
            </div>
          ) : (
            transactions.map((tx, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      tx.coins > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-purple-500/10 text-purple-400'
                    }`}
                  >
                    {tx.coins > 0 ? `+${tx.coins}` : tx.coins}
                  </div>
                  <div>
                    <span className="font-semibold text-white">{tx.description}</span>
                    <span className="text-[10px] text-slate-500 block">
                      {new Date(tx.createdAt).toLocaleDateString()} at{' '}
                      {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-slate-400">
                  {tx.type === 'EARNED_VOUCHER' ? 'Verified Claim' : 'Redemption'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Claim Voucher Modal */}
      {activeClaimVoucher && (
        <ClaimVoucherModal
          voucher={activeClaimVoucher}
          isOpen={!!activeClaimVoucher}
          onClose={() => setActiveClaimVoucher(null)}
          onClaimSuccess={() => {
            setActiveClaimVoucher(null);
            fetchRewardsData();
          }}
        />
      )}

      {/* Unlocked Combo Redemption QR Modal */}
      {activeRedemptionModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl p-6 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 p-0.5 mx-auto shadow-lg shadow-emerald-500/30">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Gift className="w-7 h-7 text-emerald-400" />
              </div>
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-extrabold uppercase">
                Redemption Voucher Active
              </span>
              <h3 className="text-xl font-extrabold text-white mt-2">
                {activeRedemptionModal.redemption?.rewardTitle || 'Free Chef Special Combo'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">Show this QR to the restaurant manager/waiter to redeem!</p>
            </div>

            <div className="p-5 rounded-2xl bg-white text-slate-950 flex flex-col items-center justify-center space-y-2">
              <QRCodeSVG
                value={JSON.stringify({
                  redemptionCode: activeRedemptionModal.redemption?.redemptionCode || 'RDM-COMBO-7729',
                  qrToken: activeRedemptionModal.redemption?.qrToken || 'TOK_RDM_1',
                })}
                size={160}
                level="H"
              />
              <span className="font-mono text-xs font-extrabold text-slate-900">
                {activeRedemptionModal.redemption?.redemptionCode || 'RDM-COMBO-7729'}
              </span>
            </div>

            <button
              onClick={() => setActiveRedemptionModal(null)}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
            >
              Done / Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
