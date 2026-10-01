import React, { useState, useEffect } from 'react';
import { 
  Bike, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Navigation, 
  Clock, 
  DollarSign, 
  Package, 
  ShieldCheck, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Navigate } from 'react-router-dom';

export const DeliveryDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const { socket } = useSocket();

  const [activeDeliveries, setActiveDeliveries] = useState<any[]>([]);
  const [completedDeliveries, setCompletedDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [otpInput, setOtpInput] = useState<{ [orderId: string]: string }>({});
  const [otpError, setOtpError] = useState<{ [orderId: string]: string }>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  if (!token || (user?.role !== 'delivery_partner' && user?.role !== 'admin')) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    fetchDeliveryOrders();
  }, []);

  // Listen to live socket events for assigned orders
  useEffect(() => {
    if (!socket) return;

    socket.on('order:assigned', (delivery: any) => {
      setActiveDeliveries(prev => [delivery, ...prev]);
    });

    socket.on('delivery:status', (data: any) => {
      setActiveDeliveries(prev => 
        prev.map(d => d._id === data.deliveryId || d.orderId?._id === data.orderId 
          ? { ...d, status: data.status } 
          : d
        )
      );
    });

    return () => {
      socket.off('order:assigned');
      socket.off('delivery:status');
    };
  }, [socket]);

  const fetchDeliveryOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/delivery/active');
      if (res.data.success) {
        setActiveDeliveries(res.data.data.deliveries || []);
      }
    } catch (err) {
      console.error('Failed to load deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    setActionLoading(orderId);
    try {
      const res = await api.put(`/delivery/${orderId}/status`, { status });
      if (res.data.success) {
        setActiveDeliveries(prev => prev.map(d => d.orderId?._id === orderId ? { ...d, status } : d));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerifyOtpAndDeliver = async (orderId: string) => {
    const otp = otpInput[orderId];
    if (!otp || otp.length < 4) {
      setOtpError({ ...otpError, [orderId]: 'Please enter the 4-digit customer delivery OTP' });
      return;
    }

    setActionLoading(orderId);
    setOtpError({ ...otpError, [orderId]: '' });

    try {
      const res = await api.post(`/delivery/${orderId}/verify-otp`, { otp });
      if (res.data.success) {
        // Move to completed
        const completed = activeDeliveries.find(d => d.orderId?._id === orderId);
        if (completed) {
          setCompletedDeliveries(prev => [{ ...completed, status: 'DELIVERED' }, ...prev]);
          setActiveDeliveries(prev => prev.filter(d => d.orderId?._id !== orderId));
        }
      }
    } catch (err: any) {
      setOtpError({
        ...otpError,
        [orderId]: err.response?.data?.error?.message || 'Invalid OTP. Please ask customer for correct 4-digit code.'
      });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-16">
      {/* Top Header */}
      <div className="bg-slate-950/80 border-b border-slate-800 backdrop-blur sticky top-0 z-30 px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Bike className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-white">ESSEN Rider Ops</h1>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Online & Active</span>
              </div>
              <p className="text-xs text-slate-400">Driver Partner: {user?.name || 'Employee 2'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchDeliveryOrders}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
              <span>Refresh Queue</span>
            </button>
            <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-mono">
              Vehicle: Electric EV · TN-09-EV-8842
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Earnings Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 backdrop-blur">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Today's Payout</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">₹840.00</div>
            <p className="text-[11px] text-slate-400 mt-1">12 Deliveries Completed + ₹60 Tips</p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 backdrop-blur">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Active Runs</span>
              <Package className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">{activeDeliveries.length}</div>
            <p className="text-[11px] text-slate-400 mt-1">Ready for pickup / In transit</p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 backdrop-blur">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Safety & SLA Rating</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">4.94 ⭐</div>
            <p className="text-[11px] text-slate-400 mt-1">100% OTP Verified Deliveries</p>
          </div>
        </div>

        {/* Live Active Deliveries Section */}
        <div className="space-y-6 mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Assigned Deliveries</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              </h2>
              <p className="text-xs text-slate-400">Navigate to restaurant pickup, verify items, and deliver with customer OTP.</p>
            </div>
            <span className="text-xs text-slate-500">{activeDeliveries.length} active tasks</span>
          </div>

          {activeDeliveries.length === 0 ? (
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-12 text-center">
              <Bike className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white">No active orders assigned right now</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Stay in your designated zone. The platform will automatically assign you the nearest ready restaurant orders.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {activeDeliveries.map(delivery => {
                const order = delivery.orderId || {};
                const orderId = order._id || delivery._id;
                const status = delivery.status || 'ASSIGNED';

                return (
                  <div key={delivery._id} className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-6 backdrop-blur space-y-5">
                    {/* Header: Order ID + Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 font-mono font-bold text-sm">
                          {order.orderNumber || '#ORD-8821'}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{order.restaurantId?.name || 'The Royal Spice Villa'}</div>
                          <div className="text-xs text-slate-400">Bill: ₹{order.totalAmount || 680} · {order.items?.length || 2} Items</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          status === 'ASSIGNED' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          status === 'PICKED_UP' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          status === 'OUT_FOR_DELIVERY' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Step Tracker */}
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      {[
                        { label: 'Assigned', done: true },
                        { label: 'Picked Up', done: ['PICKED_UP', 'OUT_FOR_DELIVERY', 'ARRIVED', 'DELIVERED'].includes(status) },
                        { label: 'Out for Delivery', done: ['OUT_FOR_DELIVERY', 'ARRIVED', 'DELIVERED'].includes(status) },
                        { label: 'Customer Handover', done: status === 'DELIVERED' }
                      ].map((step, idx) => (
                        <div key={idx} className={`p-2.5 rounded-xl border ${
                          step.done 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold' 
                            : 'bg-slate-900/50 text-slate-500 border-slate-800'
                        }`}>
                          {idx + 1}. {step.label}
                        </div>
                      ))}
                    </div>

                    {/* Pickup & Drop Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
                          <MapPin className="w-4 h-4" />
                          <span>Pickup From (Restaurant)</span>
                        </div>
                        <p className="text-slate-300 font-medium">{order.restaurantId?.name || 'The Royal Spice Villa'}</p>
                        <p className="text-slate-400">{order.restaurantId?.address?.street || '124 Khader Nawaz Khan Rd, Nungambakkam, Chennai'}</p>
                        <div className="flex items-center space-x-2 text-slate-400 pt-1">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>{order.restaurantId?.phone || '+91 98401 23456'}</span>
                        </div>
                      </div>

                      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center space-x-2 text-blue-400 font-semibold">
                          <Navigation className="w-4 h-4" />
                          <span>Deliver To (Customer)</span>
                        </div>
                        <p className="text-slate-300 font-medium">{order.deliveryAddress?.name || 'Customer'}</p>
                        <p className="text-slate-400">{order.deliveryAddress?.addressLine || 'Apt 4B, Emerald Heights, T. Nagar, Chennai'}</p>
                        <div className="flex items-center space-x-2 text-slate-400 pt-1">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>{order.deliveryAddress?.phone || '+91 98840 11223'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Operational Action Controls */}
                    <div className="border-t border-slate-700/60 pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                      {status === 'ASSIGNED' && (
                        <button
                          onClick={() => handleUpdateStatus(orderId, 'PICKED_UP')}
                          disabled={actionLoading === orderId}
                          className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-slate-950 font-bold py-2.5 px-6 rounded-xl text-xs transition disabled:opacity-50"
                        >
                          Confirm Restaurant Pickup
                        </button>
                      )}

                      {status === 'PICKED_UP' && (
                        <button
                          onClick={() => handleUpdateStatus(orderId, 'OUT_FOR_DELIVERY')}
                          disabled={actionLoading === orderId}
                          className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition disabled:opacity-50"
                        >
                          Start Navigation (Out for Delivery)
                        </button>
                      )}

                      {(status === 'OUT_FOR_DELIVERY' || status === 'ARRIVED') && (
                        <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              maxLength={4}
                              placeholder="Enter 4-Digit Customer OTP"
                              value={otpInput[orderId] || ''}
                              onChange={(e) => setOtpInput({ ...otpInput, [orderId]: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 tracking-widest font-mono font-bold text-center focus:outline-none focus:border-emerald-500"
                            />
                          </div>

                          <button
                            onClick={() => handleVerifyOtpAndDeliver(orderId)}
                            disabled={actionLoading === orderId}
                            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 px-6 rounded-xl text-xs transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{actionLoading === orderId ? 'Verifying OTP...' : 'Verify OTP & Complete Delivery'}</span>
                          </button>
                        </div>
                      )}

                      {otpError[orderId] && (
                        <div className="w-full text-xs text-rose-400 flex items-center space-x-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{otpError[orderId]}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
