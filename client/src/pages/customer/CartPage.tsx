import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShoppingBag,
  ArrowRight,
  Plus,
  Minus,
  Trash2,
  Tag,
  Bike,
  Utensils,
  Package,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  UtensilsCrossed,
  Info,
  Store,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';
import { getFoodImage } from '../../utils/foodImages';
import { SmartCartRecommendations } from '../../components/cart/SmartCartRecommendations';

export const CartPage: React.FC = () => {
  const {
    items,
    totalItems,
    restaurantId,
    restaurantName,
    isMultiRestaurant,
    restaurantCount,
    restaurantsInCart,
    orderType,
    setOrderType,
    tableNumber,
    setTableNumber,
    updateQuantity,
    removeFromCart,
    clearCart,
    pricing,
    couponCode,
    applyCoupon,
    removeCoupon,
    tipAmount,
    setTip,
  } = useCart();

  const navigate = useNavigate();
  const [inputCoupon, setInputCoupon] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    if (!inputCoupon.trim()) return;

    try {
      const res = await api.post('/coupons/validate', {
        code: inputCoupon.trim(),
        orderTotal: pricing.itemTotal,
      });

      if (res.data?.success) {
        applyCoupon(res.data.data.code, res.data.data.discountAmount);
        setCouponSuccess(`Coupon applied! You saved ₹${res.data.data.discountAmount}`);
      }
    } catch (err: any) {
      // Local fallback coupon validation
      const code = inputCoupon.toUpperCase().trim();
      if (code === 'ESSEN50') {
        const disc = Math.min((pricing.itemTotal * 50) / 100, 150);
        applyCoupon(code, disc);
        setCouponSuccess(`ESSEN50 Applied! Saved ₹${disc}`);
      } else if (code === 'WELCOME20') {
        const disc = Math.min(100, pricing.itemTotal);
        applyCoupon(code, disc);
        setCouponSuccess(`WELCOME20 Applied! Saved ₹${disc}`);
      } else {
        setCouponError(err.message || 'Invalid or expired coupon code');
      }
    }
  };

  const handleProceedToCheckout = () => {
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-24 h-24 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500 shadow-2xl">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Your Cart is Empty</h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            You don't have any items currently in your cart. You can browse gourmet dishes or view orders you've already booked!
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/restaurants"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white font-extrabold text-sm shadow-xl shadow-brand-500/25 transition-all active:scale-95"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Explore Restaurants & Menus</span>
          </Link>

          <Link
            to="/orders"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-extrabold text-sm shadow-xl transition-all active:scale-95"
          >
            <Package className="w-4 h-4 text-brand-400" />
            <span>View My Booked Orders</span>
          </Link>
        </div>

        {/* Informational Card */}
        <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 text-left space-y-1">
          <span className="font-bold text-slate-200 block">Looking for an order you just placed?</span>
          <p className="text-[11px] leading-relaxed">
            All orders placed from your cart are stored in <Link to="/orders" className="text-brand-400 underline font-semibold">My Orders</Link>, complete with live status tracking and tax invoices.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        <Link to="/home" className="hover:text-white transition">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <Link to="/restaurants" className="hover:text-white transition">Restaurants</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-brand-400">Your Cart</span>
      </nav>

      {/* Main Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Your Food Cart</h1>
            <span className="px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/40 text-brand-400 font-extrabold text-xs">
              {totalItems} {totalItems === 1 ? 'item' : 'items'} ordered
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            {isMultiRestaurant ? (
              <span>
                Ordering from <strong className="text-amber-400 font-bold">{restaurantCount} restaurants</strong> simultaneously
              </span>
            ) : (
              <span>
                Ordering from <strong className="text-white">{restaurantName || 'ESSEN Partner'}</strong>
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/restaurants"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
          >
            <Plus className="w-3.5 h-3.5 text-brand-400" />
            <span>Add More Dishes</span>
          </Link>

          <button
            onClick={clearCart}
            className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/40 text-xs font-semibold transition"
          >
            Clear Cart
          </button>
        </div>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LEFT COLUMN: Ordered Items List (2 Cols on lg) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-5 sm:p-6 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-brand-400" />
                <span>Dishes in Order ({totalItems} total quantity)</span>
              </h2>
              <span className="text-xs text-slate-400">
                {items.length} distinct {items.length === 1 ? 'dish' : 'dishes'}
              </span>
            </div>

            {/* Multi-Restaurant Order Banner */}
            {isMultiRestaurant && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-brand-500/15 to-purple-500/15 border border-amber-500/30 flex items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Multi-Restaurant Unified Cart Active</p>
                    <p className="text-[11px] text-slate-300">
                      Dishes across {restaurantsInCart.map((r) => r.name).join(', ')} are combined into a single checkout!
                    </p>
                  </div>
                </div>
                <span className="hidden sm:inline-block px-2.5 py-1 rounded-lg bg-slate-950/80 border border-amber-500/30 text-amber-300 font-extrabold text-[10px] uppercase">
                  Multi-Outlet
                </span>
              </div>
            )}

            {/* List of items */}
            <div className="divide-y divide-slate-800/60 space-y-3">
              {items.map((item, index) => {
                const dishImage = getFoodImage(item.menuItem.name, item.menuItem.cuisine, item.menuItem.image);
                return (
                  <div
                    key={index}
                    className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/70 hover:border-slate-700/80 transition shadow-sm"
                  >
                    {/* Minimized thumbnail + item details */}
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {/* Minimized Food Photo */}
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 flex-shrink-0 shadow-sm">
                        <img
                          src={dishImage}
                          alt={item.menuItem.name}
                          onError={(e) => {
                            e.currentTarget.src = getFoodImage(item.menuItem.name, item.menuItem.cuisine);
                          }}
                          className="w-full h-full object-cover"
                        />
                        <span
                          className={`absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border border-slate-950 ${
                            item.menuItem.foodType === 'vegetarian'
                              ? 'bg-emerald-500'
                              : item.menuItem.foodType === 'vegan'
                              ? 'bg-green-400'
                              : 'bg-rose-500'
                          }`}
                          title={item.menuItem.foodType}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white truncate max-w-[220px] sm:max-w-[280px]">
                            {item.menuItem.name}
                          </h3>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-0.5">
                          <span className="text-xs text-brand-400 font-extrabold">₹{item.unitPrice}</span>
                          <span className="text-slate-600 text-xs">•</span>
                          {item.restaurantName && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-semibold">
                              <Store className="w-3 h-3 text-amber-400" />
                              {item.restaurantName}
                            </span>
                          )}
                        </div>

                        {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.selectedCustomizations.map((c, ci) => (
                              <span
                                key={ci}
                                className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-medium"
                              >
                                {c.optionName} {c.price > 0 && `(+₹${c.price})`}
                              </span>
                            ))}
                          </div>
                        )}

                        {item.specialInstructions && (
                          <p className="text-[11px] text-amber-400/90 mt-1 italic">
                            Note: "{item.specialInstructions}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quantity controls & item total */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-900">
                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-inner">
                        <button
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition active:scale-95"
                          title="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-black text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition active:scale-95"
                          title="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Line Item Total */}
                      <div className="min-w-[70px] text-right">
                        <span className="text-sm font-extrabold text-white block">
                          ₹{item.itemTotal}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {item.quantity} × ₹{item.unitPrice}
                        </span>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => removeFromCart(index)}
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                        title="Remove dish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom info helper */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Info className="w-4 h-4 text-brand-400" />
                <span>You can adjust quantities or special cooking instructions anytime.</span>
              </span>
              <span className="font-extrabold text-slate-200">
                Item Subtotal: ₹{pricing.itemTotal}
              </span>
            </div>
          </div>

          {/* Frequently Paired Together Smart Cart Recommendations */}
          <SmartCartRecommendations items={items} isCompact={false} />
        </div>

        {/* RIGHT COLUMN: Order Type, Coupons, Price Summary, Checkout CTA */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-6 shadow-xl sticky top-24">
            {/* Dining Mode Toggle */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">Dining Preference</label>
              <div className="p-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center text-xs font-semibold">
                <button
                  onClick={() => setOrderType('online')}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    orderType === 'online' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Bike className="w-3.5 h-3.5" /> Delivery
                </button>
                <button
                  onClick={() => setOrderType('dine_in')}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    orderType === 'dine_in' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Utensils className="w-3.5 h-3.5" /> Dine-In QR
                </button>
                <button
                  onClick={() => setOrderType('takeaway')}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    orderType === 'takeaway' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" /> Takeaway
                </button>
              </div>

              {orderType === 'dine_in' && (
                <div className="pt-2 space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Table Number</label>
                  <select
                    value={tableNumber || 1}
                    onChange={(e) => setTableNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>Table {num} (Dining Hall)</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Coupon Code Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-brand-400" /> Apply Coupon
                </span>
              </div>

              {couponCode ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-brand-500/10 border border-brand-500/30 text-xs">
                  <div>
                    <span className="font-extrabold text-brand-400 uppercase tracking-wide">{couponCode}</span>
                    <p className="text-[11px] text-emerald-400 font-medium">₹{pricing.discountAmount} discount applied</p>
                  </div>
                  <button onClick={removeCoupon} className="text-xs text-rose-400 hover:underline font-bold">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. ESSEN50"
                      value={inputCoupon}
                      onChange={(e) => setInputCoupon(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white uppercase placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition shadow-md shadow-brand-500/20"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-[11px] text-rose-400">{couponError}</p>}
                  {couponSuccess && <p className="text-[11px] text-emerald-400">{couponSuccess}</p>}

                  {/* Preset quick buttons */}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setInputCoupon('ESSEN50');
                        applyCoupon('ESSEN50', Math.min((pricing.itemTotal * 50) / 100, 150));
                      }}
                      className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-brand-500/40 text-[10px] text-slate-300 font-bold"
                    >
                      Use ESSEN50
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInputCoupon('WELCOME20');
                        applyCoupon('WELCOME20', Math.min(100, pricing.itemTotal));
                      }}
                      className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-brand-500/40 text-[10px] text-slate-300 font-bold"
                    >
                      Use WELCOME20
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Driver Tip Selection */}
            {orderType === 'online' && (
              <div className="space-y-2 pt-1 border-t border-slate-800">
                <span className="text-xs font-bold text-slate-300 block">Add Delivery Partner Tip</span>
                <div className="flex gap-2">
                  {[0, 20, 30, 50].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTip(t)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition ${
                        tipAmount === t
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {t === 0 ? 'None' : `₹${t}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bill Summary */}
            <div className="space-y-2.5 pt-4 border-t border-slate-800 text-xs">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">Order Summary</h3>

              <div className="flex items-center justify-between text-slate-400">
                <span>Items Subtotal ({totalItems} items)</span>
                <span className="text-slate-200 font-medium">₹{pricing.itemTotal}</span>
              </div>

              {pricing.discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span>Coupon Savings</span>
                  <span>- ₹{pricing.discountAmount}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-400">
                <span>Applicable GST (CGST 2.5% + SGST 2.5%)</span>
                <span>+ ₹{pricing.applicableTaxes}</span>
              </div>

              {orderType === 'dine_in' && (
                <div className="flex items-center justify-between text-slate-400">
                  <span>Dine-In Service Charge (5%)</span>
                  <span>+ ₹{pricing.serviceCharge}</span>
                </div>
              )}

              {orderType === 'online' && (
                <div className="flex items-center justify-between text-slate-400">
                  <span>Delivery Fee</span>
                  <span>{pricing.deliveryFee === 0 ? <span className="text-emerald-400 font-bold">FREE</span> : `+ ₹${pricing.deliveryFee}`}</span>
                </div>
              )}

              {(orderType === 'online' || orderType === 'takeaway') && (
                <div className="flex items-center justify-between text-slate-400">
                  <span>Hygienic Packaging</span>
                  <span>+ ₹{pricing.packagingFee}</span>
                </div>
              )}

              {pricing.tipAmount > 0 && (
                <div className="flex items-center justify-between text-slate-400">
                  <span>Delivery Partner Tip</span>
                  <span>+ ₹{pricing.tipAmount}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between font-extrabold text-white text-base">
                <span>Total Amount</span>
                <span className="text-brand-400 text-lg">₹{pricing.grandTotal}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-500 via-amber-500 to-brand-600 hover:from-brand-600 hover:to-amber-600 text-white font-extrabold text-sm shadow-xl shadow-brand-500/30 flex items-center justify-center gap-2 group transition-all active:scale-95 glow-orange"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Secure Checkout with Instant Order Tracking</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
