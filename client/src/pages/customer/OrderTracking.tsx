import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  ChefHat,
  Bike,
  Award,
  Receipt,
  AlertCircle,
  MapPin,
  Sparkles,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { Order, RewardVoucher } from '../../types';
import { useSocket } from '../../context/SocketContext';
import { ClaimVoucherModal } from '../../components/rewards/ClaimVoucherModal';
import { getFoodImage } from '../../utils/foodImages';
import { LiveDeliveryRiderMap } from '../../components/delivery/LiveDeliveryRiderMap';

export const OrderTracking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { joinOrderRoom, socket } = useSocket();

  const [order, setOrder] = useState<Order | null>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [delivery, setDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [claimVoucherModalOpen, setClaimVoucherModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      joinOrderRoom(id);
      fetchOrderDetails();
    }
  }, [id]);

  useEffect(() => {
    if (!socket) return;

    socket.on('order_status_update', (data: { orderId: string; status: any; statusHistory?: any }) => {
      setOrder((prev) => (prev ? { ...prev, status: data.status, statusHistory: data.statusHistory || prev.statusHistory } : null));
    });

    socket.on('delivery_location_update', (data: any) => {
      setDelivery((prev: any) => (prev ? { ...prev, currentLocation: data } : null));
    });

    return () => {
      socket.off('order_status_update');
      socket.off('delivery_location_update');
    };
  }, [socket]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/orders/${id}`);
      if (res.data?.data) {
        setOrder(res.data.data.order);
        setInvoice(res.data.data.invoice);
        setDelivery(res.data.data.delivery);
      }
    } catch {
      // Local fallback simulation
      const fallbackOrder: Order = {
        _id: id || 'ORD-83921-DEMO',
        orderNumber: 'ORD-83921',
        customer: 'usr_1',
        restaurant: 'rest_1',
        restaurantDetails: {
          name: 'The Royal Nawabi Kitchen',
          address: '14 Khader Nawaz Khan Road, Nungambakkam, Chennai',
          phone: '044-28331122',
        },
        orderType: 'online',
        items: [
          {
            menuItemId: 'm1',
            name: 'Royal Awadhi Murgh Dum Biryani',
            quantity: 2,
            unitPrice: 280,
            taxAmount: 28,
            customizations: [{ groupName: 'Portion Size', optionName: 'Regular', price: 0 }],
            itemTotal: 560,
          },
        ],
        pricing: {
          itemTotal: 560,
          discountAmount: 150,
          couponCode: 'ESSEN50',
          taxableAmount: 410,
          applicableTaxes: 20.5,
          serviceCharge: 0,
          deliveryFee: 0,
          packagingFee: 20,
          tipAmount: 30,
          grandTotal: 480.5,
        },
        status: 'PREPARING',
        statusHistory: [
          { status: 'PLACED', changedAt: new Date(Date.now() - 15 * 60000).toISOString(), note: 'Order placed' },
          { status: 'RESTAURANT_ACCEPTED', changedAt: new Date(Date.now() - 10 * 60000).toISOString(), note: 'Kitchen accepted' },
          { status: 'PREPARING', changedAt: new Date(Date.now() - 5 * 60000).toISOString(), note: 'Chef is preparing' },
        ],
        paymentStatus: 'PAID',
        paymentMethod: 'UPI',
        deliveryOtp: '4829',
        rewardVoucherClaimed: false,
        createdAt: new Date().toISOString(),
      };
      setOrder(fallbackOrder);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    try {
      await api.post(`/orders/${order?._id}/cancel`, { reason: cancelReason });
      setCancelModalOpen(false);
      fetchOrderDetails();
    } catch (err: any) {
      alert(err.message || 'Cannot cancel order due to restaurant preparation policy.');
    }
  };

  if (loading || !order) {
    return (
      <div className="py-20 text-center text-slate-400 flex items-center justify-center gap-2">
        <Sparkles className="w-5 h-5 text-brand-400 animate-spin" />
        <span>Loading live order tracking status...</span>
      </div>
    );
  }

  const steps =
    order.orderType === 'online'
      ? [
          { label: 'Placed', icon: Clock, key: ['PLACED', 'NEW', 'PAYMENT_SUCCESS'] },
          { label: 'Kitchen Accepted', icon: ChefHat, key: ['RESTAURANT_ACCEPTED', 'ACCEPTED', 'PREPARING', 'READY', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED'] },
          { label: 'Preparing', icon: ChefHat, key: ['PREPARING', 'READY', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED'] },
          { label: 'Out for Delivery', icon: Bike, key: ['PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED'] },
          { label: 'Delivered', icon: CheckCircle2, key: ['DELIVERED', 'COMPLETED'] },
        ]
      : [
          { label: 'Received', icon: Clock, key: ['NEW', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED'] },
          { label: 'In Kitchen', icon: ChefHat, key: ['PREPARING', 'READY', 'SERVED', 'COMPLETED'] },
          { label: 'Food Ready', icon: Sparkles, key: ['READY', 'SERVED', 'COMPLETED'] },
          { label: 'Served to Table', icon: CheckCircle2, key: ['SERVED', 'COMPLETED'] },
        ];

  const currentStepIndex = steps.findIndex((s) => s.key.includes(order.status));
  const totalItemsCount = order.items.reduce((s, i) => s + (i.quantity || 1), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Order Booked Confirmation Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 flex items-center justify-between gap-4 flex-wrap shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-white">Order Confirmed & Booked!</h3>
            <p className="text-[11px] text-slate-400">
              Live updates active below. You can also view this and all past orders anytime in{' '}
              <Link to="/orders" className="text-brand-400 hover:underline font-bold">
                My Orders
              </Link>
              .
            </p>
          </div>
        </div>

        <Link
          to="/orders"
          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
        >
          <span>All My Orders</span>
        </Link>
      </div>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 font-mono text-xs font-extrabold">
              {order.orderNumber}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} ordered
            </span>
            <span className="text-xs text-slate-400">
              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            {order.restaurantDetails?.name || 'Restaurant'}
          </h1>
          <p className="text-xs text-slate-400">{order.restaurantDetails?.address}</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/invoices/${order._id || id}`}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <Receipt className="w-4 h-4 text-brand-400" />
            <span>View Invoice</span>
          </Link>

          {['PLACED', 'NEW', 'PAYMENT_SUCCESS', 'RESTAURANT_ACCEPTED'].includes(order.status) && (
            <button
              onClick={() => setCancelModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 text-xs font-bold"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Visual Status Progression Timeline */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Live Status Tracker</span>
          <span className="px-3 py-1 rounded-full bg-brand-500 text-white font-extrabold text-xs shadow-md animate-pulse">
            {order.status.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="relative flex items-center justify-between">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-800 z-0" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-brand-500 to-amber-500 z-0 transition-all duration-700"
            style={{ width: `${Math.max(0, (currentStepIndex / (steps.length - 1)) * 100)}%` }}
          />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div key={idx} className="relative z-10 flex flex-col items-center group">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                    isCurrent
                      ? 'bg-brand-500 text-white shadow-xl shadow-brand-500/50 scale-110 glow-orange'
                      : isCompleted
                      ? 'bg-slate-900 border-2 border-brand-500 text-brand-400'
                      : 'bg-slate-900 border-2 border-slate-800 text-slate-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[11px] font-bold mt-2 text-center max-w-[80px] leading-tight ${
                    isCompleted ? 'text-white' : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Delivery OTP Box for Online Delivery */}
        {order.orderType === 'online' && order.deliveryOtp && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] text-amber-300 font-bold uppercase tracking-wider block">
                  Delivery Security OTP
                </span>
                <p className="text-slate-300">Share this code with your delivery driver upon doorstep arrival.</p>
              </div>
            </div>
            <div className="px-5 py-2 rounded-xl bg-slate-950 border border-amber-500/40 text-amber-400 font-mono text-xl font-extrabold tracking-widest shadow-inner">
              {order.deliveryOtp}
            </div>
          </div>
        )}
      </div>

      {/* Live Moving Delivery Rider Simulation on Map for Online Orders */}
      {order.orderType === 'online' && (
        <LiveDeliveryRiderMap
          restaurantName={order.restaurantDetails?.name}
          restaurantAddress={order.restaurantDetails?.address}
          deliveryAddress={
            order.deliveryAddress ||
            (() => {
              try {
                const raw = sessionStorage.getItem('essen_last_delivery_address');
                return raw ? JSON.parse(raw) : undefined;
              } catch {
                return undefined;
              }
            })()
          }
          orderStatus={order.status}
          deliveryOtp={order.deliveryOtp}
        />
      )}

      {/* Transaction-Linked QR Reward Voucher Claim Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-900 to-brand-950/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-brand-500 p-0.5 shadow-lg shadow-amber-500/20 flex-shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Award className="w-7 h-7 text-amber-400 animate-pulse" />
            </div>
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold uppercase">
              ESSEN Rewards
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">Order Completion QR Voucher Available</h3>
            <p className="text-xs text-slate-300">
              Claim **+5 to +10 Coins** at {order.restaurantDetails?.name} towards your 5,000 coins free combo meal!
            </p>
          </div>
        </div>

        <button
          onClick={() => setClaimVoucherModalOpen(true)}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-brand-500 hover:from-amber-600 hover:to-brand-600 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl shadow-amber-500/25 flex items-center gap-2 glow-gold transition-all whitespace-nowrap active:scale-95"
        >
          <Award className="w-4 h-4 text-slate-950" />
          <span>Claim Digital QR Voucher</span>
        </button>
      </div>

      {/* Itemized Order Snapshot */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Itemized Order Summary</h3>
          <span className="px-2.5 py-0.5 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-400 font-extrabold text-xs">
            {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} ordered
          </span>
        </div>
        <div className="space-y-3">
          {order.items.map((item, idx) => {
            const dishPhoto = getFoodImage(item.name, undefined, item.image);
            return (
              <div key={idx} className="flex items-center justify-between text-xs py-2 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex-shrink-0 shadow-sm">
                    <img
                      src={dishPhoto}
                      alt={item.name}
                      onError={(e) => {
                        e.currentTarget.src = getFoodImage(item.name);
                      }}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 rounded bg-slate-950/90 text-[9px] font-extrabold text-brand-400 border border-slate-800">
                      {item.quantity}x
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-white text-xs">{item.name}</span>
                    {item.customizations && item.customizations.length > 0 && (
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {item.customizations.map((c) => c.optionName).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                <span className="font-extrabold text-white text-sm">₹{item.itemTotal}</span>
              </div>
            );
          })}
        </div>

        {/* Pricing Summary */}
        <div className="pt-2 space-y-1.5 text-xs text-slate-400">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="text-slate-200">₹{order.pricing.itemTotal}</span>
          </div>
          {order.pricing.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-400 font-semibold">
              <span>Coupon Discount</span>
              <span>- ₹{order.pricing.discountAmount}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Applicable GST (CGST + SGST)</span>
            <span>+ ₹{order.pricing.applicableTaxes}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-800 font-extrabold text-sm text-white">
            <span>Grand Total</span>
            <span className="text-brand-400 text-base">₹{order.pricing.grandTotal}</span>
          </div>
        </div>
      </div>

      {/* Claim Voucher Modal */}
      {claimVoucherModalOpen && (
        <ClaimVoucherModal
          voucher={{
            _id: order.rewardVoucherId?._id || 'vch_demo',
            voucherCode: order.rewardVoucherId?.voucherCode || 'VOUCH-83921-9X8',
            qrToken: order.rewardVoucherId?.qrToken || 'TOK_VCH_83921',
            order: order._id,
            orderNumber: order.orderNumber,
            restaurant: {
              _id: 'rest_1',
              name: order.restaurantDetails?.name,
            } as any,
            coinAmount: 8,
            status: 'UNCLAIMED',
            expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
          }}
          isOpen={claimVoucherModalOpen}
          onClose={() => setClaimVoucherModalOpen(false)}
          onClaimSuccess={() => fetchOrderDetails()}
        />
      )}
    </div>
  );
};
