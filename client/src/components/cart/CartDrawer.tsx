import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Plus, Minus, Trash2, Tag, ArrowRight, Bike, Utensils, Package, ShieldCheck, Maximize2, ExternalLink } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';
import { getFoodImage } from '../../utils/foodImages';
import { SmartCartRecommendations } from './SmartCartRecommendations';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const {
    items,
    totalItems,
    restaurantName,
    orderType,
    setOrderType,
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

  if (!isOpen) return null;

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
    onClose();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between ring-1 ring-brand-500/20">
          {/* Top Header */}
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-white text-base">Your Cart</h3>
                  {totalItems > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-brand-500/20 border border-brand-500/40 text-brand-400 font-extrabold text-[11px] whitespace-nowrap">
                      {totalItems} {totalItems === 1 ? 'item' : 'items'} ordered
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 truncate max-w-[180px] sm:max-w-[220px]">
                  {restaurantName || 'Empty Cart'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => {
                  onClose();
                  navigate('/cart');
                }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-bold border border-slate-700"
                title="Open separate cart page"
              >
                <Maximize2 className="w-3.5 h-3.5 text-brand-400" />
                <span className="hidden sm:inline">Separate Page</span>
              </button>

              {items.length > 0 && (
                <button onClick={clearCart} className="text-xs text-slate-400 hover:text-rose-400 transition-colors px-1.5">
                  Clear
                </button>
              )}

              <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Content Scrollable */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-800/80 mx-auto flex items-center justify-center text-slate-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200">Your cart is empty</h4>
                  <p className="text-xs text-slate-400 mt-1">Discover flavorful culinary dishes or track an existing order.</p>
                </div>
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/restaurants');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-lg shadow-brand-500/20 transition"
                  >
                    Explore Restaurants
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/orders');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Package className="w-3.5 h-3.5 text-brand-400" />
                    <span>View My Booked Orders</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Dining Mode Toggle */}
                <div className="p-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center text-xs font-semibold">
                  <button
                    onClick={() => setOrderType('online')}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      orderType === 'online' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Bike className="w-3.5 h-3.5" /> Delivery
                  </button>
                  <button
                    onClick={() => setOrderType('dine_in')}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      orderType === 'dine_in' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Utensils className="w-3.5 h-3.5" /> Dine-In QR
                  </button>
                  <button
                    onClick={() => setOrderType('takeaway')}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      orderType === 'takeaway' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Package className="w-3.5 h-3.5" /> Takeaway
                  </button>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  {items.map((item, index) => {
                    const dishImage = getFoodImage(item.menuItem.name, item.menuItem.cuisine, item.menuItem.image);
                    return (
                      <div key={index} className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3 shadow-md">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Minimized Dish Photo Thumbnail */}
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-800 bg-slate-900 flex-shrink-0 shadow-sm">
                            <img
                              src={dishImage}
                              alt={item.menuItem.name}
                              onError={(e) => {
                                e.currentTarget.src = getFoodImage(item.menuItem.name, item.menuItem.cuisine);
                              }}
                              className="w-full h-full object-cover"
                            />
                            <span
                              className={`absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full border border-slate-950 ${
                                item.menuItem.foodType === 'vegetarian'
                                  ? 'bg-emerald-500'
                                  : item.menuItem.foodType === 'vegan'
                                  ? 'bg-green-400'
                                  : 'bg-rose-500'
                              }`}
                            />
                          </div>

                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate max-w-[140px] sm:max-w-[180px]">{item.menuItem.name}</h4>
                            <p className="text-xs text-brand-400 font-extrabold mt-0.5">₹{item.unitPrice}</p>
                            {item.selectedCustomizations.length > 0 && (
                              <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[140px] sm:max-w-[180px]">
                                {item.selectedCustomizations.map((c) => c.optionName).join(', ')}
                              </p>
                            )}
                          </div>
                        </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1">
                          <button
                            onClick={() => updateQuantity(index, item.quantity - 1)}
                            className="p-1 rounded text-slate-400 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold px-1.5 text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(index, item.quantity + 1)}
                            className="p-1 rounded text-slate-400 hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(index)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                </div>

                {/* Frequently Paired Together Smart Cart Recommendations */}
                <SmartCartRecommendations items={items} isCompact={true} />

                {/* Coupon Box */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <Tag className="w-4 h-4 text-brand-400" />
                    <span>Apply Coupon</span>
                  </div>
                  {couponCode ? (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-brand-500/10 border border-brand-500/20 text-xs">
                      <div>
                        <span className="font-bold text-brand-400 uppercase">{couponCode}</span>
                        <p className="text-[11px] text-emerald-400 font-medium">₹{pricing.discountAmount} saved</p>
                      </div>
                      <button onClick={removeCoupon} className="text-xs text-rose-400 hover:underline">
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. ESSEN50"
                        value={inputCoupon}
                        onChange={(e) => setInputCoupon(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white uppercase placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold"
                      >
                        Apply
                      </button>
                    </form>
                  )}
                  {couponError && <p className="text-[11px] text-rose-400">{couponError}</p>}
                  {couponSuccess && <p className="text-[11px] text-emerald-400">{couponSuccess}</p>}
                </div>

                {/* Delivery Tip (if online) */}
                {orderType === 'online' && (
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <span className="text-xs font-semibold text-slate-300">Tip Delivery Partner</span>
                    <div className="flex gap-2 text-xs">
                      {[0, 20, 30, 50].map((tip) => (
                        <button
                          key={tip}
                          onClick={() => setTip(tip)}
                          className={`flex-1 py-1 rounded-lg border text-xs font-semibold transition-all ${
                            tipAmount === tip
                              ? 'bg-brand-500 text-white border-brand-400'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {tip === 0 ? 'None' : `₹${tip}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transparent Billing Breakdown (Section 30 of Spec) */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Item Total</span>
                    <span className="text-slate-200">₹{pricing.itemTotal}</span>
                  </div>

                  {pricing.discountAmount > 0 && (
                    <div className="flex items-center justify-between text-emerald-400 font-medium">
                      <span>Coupon Discount</span>
                      <span>- ₹{pricing.discountAmount}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Taxable Amount</span>
                    <span>₹{pricing.taxableAmount}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Applicable GST (CGST 2.5% + SGST 2.5%)</span>
                    <span>+ ₹{pricing.applicableTaxes}</span>
                  </div>

                  {orderType === 'dine_in' && (
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Service Charge (5%)</span>
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
                      <span>Packaging Charges</span>
                      <span>+ ₹{pricing.packagingFee}</span>
                    </div>
                  )}

                  {pricing.tipAmount > 0 && (
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Driver Tip</span>
                      <span>+ ₹{pricing.tipAmount}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-bold text-sm text-white">
                    <span>Grand Total</span>
                    <span className="text-brand-400 text-base">₹{pricing.grandTotal}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Bottom CTA */}
          {items.length > 0 && (
            <div className="p-4 border-t border-slate-800 bg-slate-950 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Guaranteed Transparent Pricing
                </span>
                <span className="font-bold text-white">₹{pricing.grandTotal}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onClose();
                    navigate('/cart');
                  }}
                  className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-brand-500/50 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
                  <span>Full Cart Page</span>
                </button>
                <button
                  onClick={handleProceedToCheckout}
                  className="flex-[1.5] py-3 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm shadow-xl shadow-brand-500/25 flex items-center justify-center gap-1.5 group transition-all"
                >
                  <span>Checkout • ₹{pricing.grandTotal}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
