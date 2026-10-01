import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Order, OrderStatus } from '../models/Order';
import { MenuItem } from '../models/MenuItem';
import { Restaurant } from '../models/Restaurant';
import { Coupon } from '../models/Coupon';
import { RewardVoucher } from '../models/RewardVoucher';
import { Invoice } from '../models/Invoice';
import { Delivery } from '../models/Delivery';
import { AuthRequest } from '../middleware/auth';
import { calculateOrderPricing, CartInputItem } from '../utils/pricing';
import {
  generateInvoiceNumber,
  generateOrderNumber,
  generateOtp,
  generateSecureToken,
  generateVoucherCode,
} from '../utils/qr';
import { emitToOrder, emitToRestaurant, emitToUser } from '../config/socket';
import { mockStore } from '../utils/mockDataStore';

export class OrderController {
  /**
   * Create Order (Backend is source of truth for pricing, taxes, items)
   */
  public static async createOrder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        restaurantId,
        orderType,
        tableNumber,
        deliveryAddress,
        items,
        couponCode,
        tipAmount = 0,
        paymentMethod = 'UPI',
      } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        res.status(400).json({ success: false, error: { code: 'EMPTY_CART', message: 'Cart cannot be empty.' } });
        return;
      }

      if (mongoose.connection.readyState !== 1) {
        const rest = mockStore.restaurants.find((r) => r._id === restaurantId) || mockStore.restaurants[0];
        const orderId = `ord_${Date.now()}`;
        const orderNum = generateOrderNumber();

        // Calculate accurate pricing from submitted items
        const calculatedItemTotal = items.reduce(
          (sum: number, it: any) => sum + (Number(it.price) || 250) * (Number(it.quantity) || 1),
          0
        );
        const calculatedTaxes = Math.round(calculatedItemTotal * 0.05);
        const deliveryFee = orderType === 'online' ? (calculatedItemTotal >= 500 ? 0 : 40) : 0;
        const packagingFee = orderType === 'online' || orderType === 'takeaway' ? 20 : 0;
        const calculatedGrandTotal = calculatedItemTotal + calculatedTaxes + deliveryFee + packagingFee + Number(tipAmount || 0);

        // Multi-restaurant names summary
        const uniqueRestNames = Array.from(new Set(items.map((it: any) => it.restaurantName).filter(Boolean)));
        const displayRestName =
          uniqueRestNames.length > 1
            ? `Multi-Restaurant Order (${uniqueRestNames.length} Outlets)`
            : rest.name;

        const mockOrder = {
          _id: orderId,
          orderNumber: orderNum,
          customer: req.userId || 'usr_cust_1',
          customerDetails: {
            name: req.user?.name || 'Customer',
            phone: req.user?.phone || '9876543210',
            email: req.user?.email || 'customer@essen.com',
          },
          restaurant: rest._id,
          restaurantDetails: {
            name: displayRestName,
            address: `${rest.address.street}, ${rest.address.city}`,
            phone: rest.contact.phone,
          },
          orderType,
          tableNumber: orderType === 'dine_in' ? tableNumber || 1 : undefined,
          deliveryAddress,
          items: items.map((it: any) => ({
            menuItem: it.menuItemId,
            name: it.name || 'Gourmet Dish',
            restaurantId: it.restaurantId,
            restaurantName: it.restaurantName,
            quantity: it.quantity || 1,
            unitPrice: Number(it.price) || 250,
            itemTotal: (Number(it.price) || 250) * (it.quantity || 1),
          })),
          pricing: {
            itemTotal: calculatedItemTotal,
            applicableTaxes: calculatedTaxes,
            deliveryFee,
            packagingFee,
            grandTotal: calculatedGrandTotal,
          },
          status: 'PLACED',
          paymentStatus: 'PAID',
          paymentMethod,
          createdAt: new Date().toISOString(),
        };
        mockStore.orders.unshift(mockOrder);
        mockStore.saveToDisk();
        res.status(201).json({
          success: true,
          message: 'Order placed successfully.',
          data: { order: mockOrder },
        });
        return;
      }


      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Restaurant not found' } });
        return;
      }

      // Check if restaurant is currently open/taking orders
      if (restaurant.status === 'CLOSED' || restaurant.status === 'TEMPORARILY_UNAVAILABLE') {
        res.status(400).json({
          success: false,
          error: { code: 'RESTAURANT_CLOSED', message: 'This restaurant is currently closed for new orders.' },
        });
        return;
      }

      // 1. Fetch genuine menu items from database
      const itemIds = items.map((i: CartInputItem) => i.menuItemId);
      const dbMenuItems = await MenuItem.find({ _id: { $in: itemIds }, restaurant: restaurantId });

      if (dbMenuItems.length !== items.length) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_MENU_ITEMS', message: 'One or more items are not available from this restaurant.' },
        });
        return;
      }

      const itemsWithDetails = items.map((inputItem: CartInputItem) => {
        const itemDoc = dbMenuItems.find((d) => d._id.toString() === inputItem.menuItemId);
        if (!itemDoc || !itemDoc.isAvailable) {
          throw new Error(`Item "${itemDoc?.name || inputItem.menuItemId}" is currently out of stock.`);
        }
        return { itemDoc, input: inputItem };
      });

      // 2. Validate Coupon if provided
      let discountAmount = 0;
      let appliedCoupon: string | undefined;

      if (couponCode && couponCode.trim()) {
        const coupon = await Coupon.findOne({
          code: couponCode.toUpperCase().trim(),
          isActive: true,
          expiryDate: { $gte: new Date() },
        });

        if (coupon) {
          const rawItemTotal = itemsWithDetails.reduce((sum, pair) => sum + pair.itemDoc.price * pair.input.quantity, 0);
          if (rawItemTotal >= coupon.minOrderValue) {
            if (coupon.discountType === 'percentage') {
              discountAmount = Math.min((rawItemTotal * coupon.discountValue) / 100, coupon.maxDiscountAmount);
            } else {
              discountAmount = Math.min(coupon.discountValue, rawItemTotal);
            }
            appliedCoupon = coupon.code;
          }
        }
      }

      // 3. Recalculate full billing breakdown on backend
      const { items: snapshotItems, pricing } = calculateOrderPricing(
        itemsWithDetails,
        orderType,
        discountAmount,
        appliedCoupon,
        tipAmount
      );

      const orderNum = generateOrderNumber();
      const deliveryOtp = orderType === 'online' ? generateOtp() : undefined;

      const order = await Order.create({
        orderNumber: orderNum,
        customer: req.userId || (req.user?._id as any),
        customerDetails: {
          name: req.user?.name || 'Customer',
          phone: req.user?.phone || '9876543210',
          email: req.user?.email || 'customer@essen.com',
        },
        restaurant: restaurantId,
        restaurantDetails: {
          name: restaurant.name,
          address: `${restaurant.address.street}, ${restaurant.address.area}, ${restaurant.address.city}`,
          phone: restaurant.contact.phone,
          gstin: restaurant.businessInfo?.gstin,
        },
        orderType,
        tableNumber: orderType === 'dine_in' ? tableNumber : undefined,
        deliveryAddress: orderType === 'online' ? deliveryAddress : undefined,
        items: snapshotItems,
        pricing,
        status: orderType === 'dine_in' ? 'NEW' : 'PLACED',
        statusHistory: [{ status: orderType === 'dine_in' ? 'NEW' : 'PLACED', changedAt: new Date(), note: 'Order placed' }],
        paymentStatus: 'PAID', // In production/mock prototype, payment completes upon checkout initiation
        paymentMethod,
        deliveryOtp,
        tableQrVerified: orderType === 'dine_in',
      });

      // Update dish order counts
      for (const item of items) {
        await MenuItem.findByIdAndUpdate(item.menuItemId, { $inc: { orderCount: item.quantity } });
      }

      // 4. Generate Invoice automatically
      const invNum = generateInvoiceNumber();
      const cgstVal = Number((pricing.applicableTaxes / 2).toFixed(2));
      const sgstVal = Number((pricing.applicableTaxes / 2).toFixed(2));

      await Invoice.create({
        invoiceNumber: invNum,
        order: order._id,
        orderNumber: order.orderNumber,
        customer: req.userId,
        restaurant: restaurantId,
        restaurantDetails: {
          name: restaurant.name,
          address: `${restaurant.address.street}, ${restaurant.address.city}`,
          phone: restaurant.contact.phone,
          gstin: restaurant.businessInfo?.gstin || '33ABCDE1234F1Z5',
          fssaiLicense: restaurant.businessInfo?.fssaiLicense || '10019042004567',
        },
        customerDetails: {
          name: req.user?.name || 'Customer',
          phone: req.user?.phone || '9876543210',
          email: req.user?.email || 'customer@essen.com',
        },
        items: snapshotItems.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          taxRate: i.taxRate,
          taxAmount: i.taxAmount,
          itemTotal: i.itemTotal,
        })),
        subtotal: pricing.itemTotal,
        discount: pricing.discountAmount,
        taxableAmount: pricing.taxableAmount,
        cgst: cgstVal,
        sgst: sgstVal,
        serviceCharge: pricing.serviceCharge,
        deliveryFee: pricing.deliveryFee,
        packagingFee: pricing.packagingFee,
        tip: pricing.tipAmount,
        grandTotal: pricing.grandTotal,
        paymentMethod,
        transactionId: `TXN_${Date.now()}`,
        paymentStatus: 'PAID',
      });

      // 5. Generate transaction-linked QR Reward Voucher (+5 to +10 coins) for order completion
      if (restaurant.rewardsSettings?.isEnabled) {
        const coinAmount = Math.floor(
          Math.random() * (restaurant.rewardsSettings.coinsPerOrderMax - restaurant.rewardsSettings.coinsPerOrderMin + 1) +
            restaurant.rewardsSettings.coinsPerOrderMin
        );
        const voucherCode = generateVoucherCode();
        const qrToken = generateSecureToken(`VCH_${order._id}`);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days expiry

        const voucher = await RewardVoucher.create({
          voucherCode,
          qrToken,
          order: order._id,
          orderNumber: order.orderNumber,
          customer: req.userId,
          restaurant: restaurantId,
          coinAmount,
          status: 'UNCLAIMED',
          expiresAt,
        });

        order.rewardVoucherId = voucher._id as any;
        await order.save();
      }

      // 6. If online delivery, create Delivery tracking entity
      if (orderType === 'online') {
        await Delivery.create({
          order: order._id,
          orderNumber: order.orderNumber,
          restaurant: restaurantId,
          customer: req.userId,
          status: 'PENDING_ASSIGNMENT',
          deliveryOtp: deliveryOtp!,
          pickupAddress: {
            name: restaurant.name,
            street: restaurant.address.street,
            city: restaurant.address.city,
            coordinates: restaurant.location.coordinates,
          },
          deliveryAddress: {
            name: req.user?.name || 'Customer',
            street: deliveryAddress?.street || '123 Main St',
            city: deliveryAddress?.city || 'Chennai',
            phone: req.user?.phone || '9876543210',
          },
          currentLocation: {
            lat: 13.0827,
            lng: 80.2707,
            updatedAt: new Date(),
          },
          estimatedMinutesRemaining: 25,
          timeline: [{ status: 'Order Placed', timestamp: new Date(), note: 'Waiting for restaurant acceptance' }],
        });
      }

      // Broadcast real-time notifications
      emitToRestaurant(restaurantId, 'new_order', { order });

      res.status(201).json({
        success: true,
        message: 'Order placed successfully.',
        data: { order },
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get Customer's Orders
   */
  public static async getMyOrders(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (mongoose.connection.readyState !== 1) {
        res.status(200).json({
          success: true,
          data: { orders: mockStore.orders },
        });
        return;
      }

      const orders = await Order.find({ customer: req.userId })
        .populate('restaurant', 'name images rating cuisine address')
        .populate('rewardVoucherId')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: { orders },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Order by ID
   */
  public static async getOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (mongoose.connection.readyState !== 1) {
        const order =
          mockStore.orders.find((o) => o._id === id || o.orderNumber === id) || mockStore.orders[0];
        if (!order) {
          res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
          return;
        }
        res.status(200).json({
          success: true,
          data: {
            order,
            invoice: { invoiceNumber: 'INV-1001', grandTotal: order.pricing?.grandTotal || 500 },
            delivery: { status: 'PREPARING', estimatedMinutesRemaining: 20 },
          },
        });
        return;
      }

      const order = await Order.findById(id)
        .populate('restaurant', 'name images address contact cancellationPolicy rewardsSettings')
        .populate('rewardVoucherId')
        .populate('assignedDeliveryPartner', 'name phone');

      if (!order) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
        return;
      }

      const invoice = await Invoice.findOne({ order: order._id });
      const delivery = await Delivery.findOne({ order: order._id });

      res.status(200).json({
        success: true,
        data: {
          order,
          invoice,
          delivery,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Transition Order Status (KDS / Waiter / Delivery / Manager)
   */
  public static async updateOrderStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, note } = req.body as { status: OrderStatus; note?: string };

      const order = await Order.findById(id);
      if (!order) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
        return;
      }

      order.status = status;
      order.statusHistory.push({
        status,
        changedAt: new Date(),
        note: note || `Status transitioned to ${status}`,
      });

      await order.save();

      // Emit real-time updates
      emitToOrder(order._id.toString(), 'order_status_update', { orderId: order._id, status, statusHistory: order.statusHistory });
      emitToRestaurant(order.restaurant.toString(), 'kds_order_update', { orderId: order._id, status });
      emitToUser(order.customer.toString(), 'order_status_notification', { orderId: order._id, status, orderNumber: order.orderNumber });

      res.status(200).json({
        success: true,
        message: `Order status updated to ${status}`,
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel Order (Server-side check of restaurant cancellation rules)
   */
  public static async cancelOrder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const order = await Order.findById(id).populate('restaurant');
      if (!order) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
        return;
      }

      const rest = order.restaurant as any;
      // Check cancellation rules
      if (['PREPARING', 'READY', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED'].includes(order.status)) {
        if (!rest.cancellationPolicy?.allowDuringPreparation) {
          res.status(400).json({
            success: false,
            error: {
              code: 'CANCELLATION_RESTRICTED',
              message: 'This order cannot be cancelled as kitchen preparation has already begun.',
            },
          });
          return;
        }
      }

      order.status = 'CANCELLED';
      order.cancellationReason = reason || 'Customer requested cancellation';
      order.cancelledBy = req.userRole === 'customer' ? 'customer' : 'restaurant';
      order.statusHistory.push({
        status: 'CANCELLED',
        changedAt: new Date(),
        note: `Cancelled: ${order.cancellationReason}`,
      });

      // If a reward voucher was created for this order, invalidate it
      if (order.rewardVoucherId) {
        await RewardVoucher.findByIdAndUpdate(order.rewardVoucherId, {
          status: 'INVALIDATED',
          invalidatedReason: 'Order was cancelled',
        });
      }

      await order.save();

      emitToOrder(order._id.toString(), 'order_status_update', { orderId: order._id, status: 'CANCELLED' });
      emitToRestaurant(order.restaurant._id.toString(), 'order_cancelled', { orderId: order._id });

      res.status(200).json({
        success: true,
        message: 'Order cancelled successfully.',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Orders for Restaurant (Manager / Kitchen / Staff)
   */
  public static async getRestaurantOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const { status, type } = req.query;

      const filter: any = { restaurant: restaurantId };
      if (status) filter.status = status;
      if (type) filter.orderType = type;

      const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(100);

      res.status(200).json({
        success: true,
        count: orders.length,
        data: { orders },
      });
    } catch (error) {
      next(error);
    }
  }
}
