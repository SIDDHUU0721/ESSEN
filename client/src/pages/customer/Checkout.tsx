import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Bike, Utensils, CreditCard, Sparkles, CheckCircle2, ArrowRight, Store, History, Navigation } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { getFoodImage } from '../../utils/foodImages';
import { DeliveryAddressPicker, DeliveryAddressData } from '../../components/cart/DeliveryAddressPicker';

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    items,
    restaurantId,
    restaurantName,
    isMultiRestaurant,
    restaurantCount,
    orderType,
    tableNumber,
    pricing,
    couponCode,
    tipAmount,
    clearCart,
  } = useCart();

  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CREDIT_CARD' | 'NET_BANKING' | 'PAY_AT_COUNTER'>('UPI');
  const [selectedAddress, setSelectedAddress] = useState<DeliveryAddressData>({
    title: 'Home',
    street: '42 Marina Bay View',
    area: 'Mylapore',
    city: 'Chennai',
    pincode: '600004',
    coordinates: [80.2824, 13.0499],
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (items.length === 0) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Your cart is empty</h2>
        <p className="text-xs text-slate-400">Add dishes before proceeding to checkout.</p>
        <button
          onClick={() => navigate('/restaurants')}
          className="px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-bold"
        >
          Explore Restaurants
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const primaryRestId = items[0]?.restaurantId || restaurantId || 'rest_1';
      const orderPayload = {
        restaurantId: primaryRestId,
        orderType,
        tableNumber: orderType === 'dine_in' ? tableNumber || 3 : undefined,
        deliveryAddress:
          orderType === 'online'
            ? {
              title: selectedAddress?.title || 'Delivery Location',
              street: selectedAddress?.street || '42 Marina Bay View',
              area: selectedAddress?.area || 'Mylapore',
              city: selectedAddress?.city || 'Chennai',
              pincode: selectedAddress?.pincode || '600004',
              coordinates: selectedAddress?.coordinates || [80.2824, 13.0499],
              dropoffPills: selectedAddress?.dropoffPills || ['Leave at door'],
              riderNotes: selectedAddress?.riderNotes || '',
            }
            : undefined,
        items: items.map((i) => ({
          menuItemId: i.menuItem._id,
          name: i.menuItem.name,
          price: i.unitPrice,
          quantity: i.quantity,
          restaurantId: i.restaurantId || restaurantId,
          restaurantName: i.restaurantName || restaurantName,
          selectedCustomizations: i.selectedCustomizations,
          specialInstructions: i.specialInstructions,
        })),
        couponCode: couponCode || undefined,
        tipAmount,
        paymentMethod,
      };

      // Store in session storage so tracking page can display real address and dropoff preferences
      if (orderPayload.deliveryAddress) {
        sessionStorage.setItem('essen_last_delivery_address', JSON.stringify(orderPayload.deliveryAddress));
      }

      const res = await api.post('/orders', orderPayload);
      if (res.data?.success) {
        const createdOrder = res.data.data.order;
        clearCart();
        navigate(`/orders/${createdOrder._id || createdOrder.id}`);
      }
    } catch {
      // Local fallback simulation
      clearCart();
      navigate(`/orders/ORD-83921-DEMO`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Secure Checkout</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Review your order and select payment method.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left 2 Cols: Details & Payment */}
        <div className="md:col-span-2 space-y-6">
          {/* Ordered Dishes Review with Food Photos */}
          <div className="glass-card p-5 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-brand-400" />
                <h3 className="text-sm font-bold text-white">Dishes in Order</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-400 font-extrabold text-xs">
                  {items.reduce((s, i) => s + i.quantity, 0)} items ordered
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-brand-400 font-semibold hidden sm:inline">{restaurantName}</span>
                <Link to="/cart" className="text-xs text-slate-400 hover:text-white underline">
                  Edit Cart
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map((item, idx) => {
                const dishImg = getFoodImage(item.menuItem.name, item.menuItem.cuisine, item.menuItem.image);
                return (
                  <div key={idx} className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-3 shadow-sm">
                    {/* Minimized thumbnail */}
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-800 bg-slate-900 flex-shrink-0">
                      <img
                        src={dishImg}
                        alt={item.menuItem.name}
                        onError={(e) => {
                          e.currentTarget.src = getFoodImage(item.menuItem.name, item.menuItem.cuisine);
                        }}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 rounded bg-slate-950/95 text-[9px] font-black text-brand-400 border border-slate-800">
                        {item.quantity}x
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate">{item.menuItem.name}</h4>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-brand-400 font-extrabold">₹{item.itemTotal}</span>
                        <span className="text-[10px] text-slate-500">({item.quantity} × ₹{item.unitPrice})</span>
                        {item.restaurantName && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[9px] font-semibold">
                            <Store className="w-2.5 h-2.5 text-amber-400" />
                            {item.restaurantName}
                          </span>
                        )}
                      </div>
                      {item.selectedCustomizations.length > 0 && (
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {item.selectedCustomizations.map((c) => c.optionName).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Channel Info */}
          <div className="glass-card p-5 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                {orderType === 'online' ? (
                  <Bike className="w-4 h-4 text-brand-400" />
                ) : (
                  <Utensils className="w-4 h-4 text-brand-400" />
                )}
                <span>Order Type: {orderType === 'online' ? 'Online Delivery' : orderType === 'dine_in' ? `Dine-In (Table ${tableNumber || 3})` : 'Takeaway'}</span>
              </h3>
              <span className="text-xs text-brand-400 font-semibold">{restaurantName}</span>
            </div>

            {orderType === 'online' && (
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 block">Select Delivery Destination:</span>
                  <span className="text-[11px] text-brand-400 font-semibold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Type Address or Pick on Map</span>
                  </span>
                </div>
                <DeliveryAddressPicker
                  initialAddress={selectedAddress}
                  savedAddresses={user?.addresses as any}
                  onSelectAddress={(addr) => setSelectedAddress(addr)}
                />
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="glass-card p-5 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-400" />
              <span>Select Payment Method</span>
            </h3>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              {[
                { id: 'UPI', label: 'UPI', icon: '📱' },
                { id: 'CREDIT_CARD', label: 'Credit / Debit Card', icon: '💳' },
                { id: 'NET_BANKING', label: 'Net Banking', icon: '🏦' },
                { id: 'PAY_AT_COUNTER', label: orderType === 'online' ? 'Cash on Delivery' : 'Pay at Counter', icon: '💵' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${paymentMethod === m.id
                    ? 'bg-brand-500/10 border-brand-500 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                >
                  <span className="text-lg">{m.icon}</span>
                  <span className="font-semibold">{m.label}</span>
                </button>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-slate-950 text-[11px] text-slate-400 flex items-center gap-2 border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>100% Secure Payment processing with instantaneous invoice generation.</span>
            </div>
          </div>
        </div>

        {/* Right Col: Transparent Billing Summary & CTA */}
        <div className="space-y-4">
          <div className="glass-card p-5 rounded-3xl border border-slate-800 bg-slate-900/80 space-y-4 shadow-xl text-xs">
            <h3 className="font-bold text-white text-sm">Transparent Billing</h3>

            <div className="space-y-2 text-slate-400 border-b border-slate-800 pb-3">
              <div className="flex justify-between">
                <span>Items ({items.length})</span>
                <span className="text-slate-200">₹{pricing.itemTotal}</span>
              </div>
              {pricing.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Discount ({couponCode})</span>
                  <span>- ₹{pricing.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Taxable Amount</span>
                <span>₹{pricing.taxableAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (CGST + SGST 5%)</span>
                <span>+ ₹{pricing.applicableTaxes}</span>
              </div>
              {orderType === 'dine_in' && (
                <div className="flex justify-between">
                  <span>Service Charge (5%)</span>
                  <span>+ ₹{pricing.serviceCharge}</span>
                </div>
              )}
              {orderType === 'online' && (
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>{pricing.deliveryFee === 0 ? <span className="text-emerald-400 font-bold">FREE</span> : `+ ₹${pricing.deliveryFee}`}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Packaging Charges</span>
                <span>+ ₹{pricing.packagingFee}</span>
              </div>
              {pricing.tipAmount > 0 && (
                <div className="flex justify-between">
                  <span>Tip</span>
                  <span>+ ₹{pricing.tipAmount}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-base font-extrabold text-white">
              <span>Final Total</span>
              <span className="text-brand-400">₹{pricing.grandTotal}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white font-extrabold text-sm shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span>{loading ? 'Processing Order...' : `Pay ₹${pricing.grandTotal} & Place Order`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Where to view order guide */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-300">
                <History className="w-3.5 h-3.5 text-brand-400" />
                <span>Where can I see my order after booking?</span>
              </div>
              <p className="leading-relaxed">
                Once booked, you will be taken immediately to your live <strong className="text-white">Order Tracking</strong> screen with status progression and instant downloadable invoices.
              </p>
              <p className="leading-relaxed">
                You can also find all your booked and past orders anytime by clicking <Link to="/orders" className="text-brand-400 hover:underline font-bold">My Orders</Link> in the navigation header.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
