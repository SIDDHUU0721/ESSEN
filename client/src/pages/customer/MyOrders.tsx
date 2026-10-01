import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, Receipt, ArrowRight, Star, Clock, CheckCircle2, Award, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { Order } from '../../types';
import { getFoodImage } from '../../utils/foodImages';

export const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/my-orders');
      if (res.data?.data?.orders) {
        setOrders(res.data.data.orders);
      }
    } catch {
      console.warn('Fallback orders');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">My Dining & Delivery Orders</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track live active meals, review past orders, and download legal invoices.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-400 animate-spin" />
          <span>Fetching your order history...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-3xl border border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-slate-500">
            <History className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-white text-lg">No orders found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You haven't placed any culinary orders yet. Explore our curated partner spots!
          </p>
          <Link
            to="/restaurants"
            className="inline-block px-5 py-2.5 rounded-xl bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-500/25"
          >
            Browse Restaurants
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const totalItemsCount = order.items.reduce((s, i) => s + (i.quantity || 1), 0);
            return (
            <div
              key={order._id}
              className="glass-card p-5 sm:p-6 rounded-3xl border border-slate-800 bg-slate-900/60 hover:border-brand-500/40 transition-all space-y-4 shadow-xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-400 font-bold text-xs">
                    {order.orderType === 'online' ? '🛵' : '🍽️'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-sm sm:text-base">
                        {(order.restaurant as any)?.name || order.restaurantDetails?.name || 'Restaurant'}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-400 text-[10px] font-extrabold">
                        {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} ordered
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Order <span className="font-mono text-slate-200">{order.orderNumber}</span> •{' '}
                      {new Date(order.createdAt).toLocaleDateString()} at{' '}
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold w-fit ${
                    order.status === 'COMPLETED' || order.status === 'DELIVERED'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                      : order.status === 'CANCELLED'
                      ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                      : 'bg-brand-500/10 border border-brand-500/30 text-brand-400 animate-pulse'
                  }`}
                >
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Items with Food Photos */}
              <div className="flex flex-wrap gap-2.5 pt-1">
                {order.items.map((item, idx) => {
                  const dishPhoto = getFoodImage(item.name, undefined, item.image);
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 p-2 pr-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 text-xs shadow-sm"
                    >
                      <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 flex-shrink-0">
                        <img
                          src={dishPhoto}
                          alt={item.name}
                          onError={(e) => {
                            e.currentTarget.src = getFoodImage(item.name);
                          }}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0 right-0 px-1 py-0.2 rounded-tl-md bg-slate-950/90 text-[9px] font-extrabold text-brand-400 border-t border-l border-slate-800">
                          {item.quantity}x
                        </span>
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-white text-xs truncate max-w-[160px] block">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-brand-400 font-extrabold block mt-0.5">
                          ₹{item.itemTotal || item.unitPrice * item.quantity}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
                <div className="flex items-center gap-4 text-slate-400">
                  <span>Grand Total: <strong className="text-white text-sm">₹{order.pricing?.grandTotal || 0}</strong></span>
                  <span>Payment: <strong className="text-slate-200">{order.paymentMethod}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/invoices/${order._id}`}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Invoice</span>
                  </Link>

                  <Link
                    to={`/orders/${order._id}`}
                    className="px-4 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-500/20 transition-all"
                  >
                    <span>Track Order</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
};
