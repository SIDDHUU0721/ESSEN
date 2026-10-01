import React, { useState, useEffect, useRef } from 'react';
import {
  UtensilsCrossed,
  BellRing,
  Droplets,
  Receipt,
  CheckCircle2,
  Clock,
  Sparkles,
  User,
  ChefHat,
  Volume2,
  VolumeX,
  Smartphone,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

export const WaiterDashboard: React.FC = () => {
  const { user, restaurantId } = useAuth();
  const { socket } = useSocket();

  // Audio & Haptic Chime Settings
  const [chimeAlertsEnabled, setChimeAlertsEnabled] = useState(true);
  const [lastChimePlayedAt, setLastChimePlayedAt] = useState<string | null>(null);

  const [tables, setTables] = useState<any[]>([
    { tableNumber: 1, tableName: 'Table 1 - Window Corner', capacity: 2, status: 'AVAILABLE' },
    { tableNumber: 2, tableName: 'Table 2 - Center Hall', capacity: 4, status: 'OCCUPIED' },
    { tableNumber: 3, tableName: 'Table 3 - Royal Family Booth', capacity: 6, status: 'BILL_REQUESTED' },
    { tableNumber: 4, tableName: 'Table 4 - Terrace View', capacity: 4, status: 'AVAILABLE' },
  ]);

  const [customerRequests, setCustomerRequests] = useState<any[]>([
    { tableNumber: 3, requestType: 'request_bill', note: 'Customer requested invoice & bill', timestamp: new Date(Date.now() - 120000) },
    { tableNumber: 2, requestType: 'request_water', note: 'Cold drinking water', timestamp: new Date(Date.now() - 300000) },
  ]);

  const [activeOrders, setActiveOrders] = useState<any[]>([
    {
      _id: 'ord_1',
      orderNumber: 'ORD-83921',
      tableNumber: 2,
      status: 'READY',
      items: [{ name: 'Royal Awadhi Murgh Dum Biryani', quantity: 2 }, { name: 'Butter Garlic Naan', quantity: 2 }],
      pricing: { grandTotal: 635 },
    },
  ]);

  /**
   * Synthesize high-fidelity 2-tone melodic waiter service chime (D5 -> A5)
   * Uses browser native Web Audio API with exponential gain decay. Works 100% offline.
   */
  const playServiceChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Tone 1: D5 (587.33 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.45);

      // Tone 2: A5 (880 Hz) - pleasant bright bell chime
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.14);
      gain2.gain.setValueAtTime(0.35, now + 0.14);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.14);
      osc2.stop(now + 0.85);

      // Haptic Vibration feedback on mobile device
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([150, 70, 200]);
      }

      setLastChimePlayedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.warn('Audio chime playback error:', err);
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('waiter_customer_request', (data: any) => {
      setCustomerRequests((prev) => [data, ...prev]);
      if (chimeAlertsEnabled) {
        playServiceChime();
      }
    });

    socket.on('kds_order_update', () => {
      fetchLiveOrders();
    });

    return () => {
      socket.off('waiter_customer_request');
      socket.off('kds_order_update');
    };
  }, [socket, chimeAlertsEnabled]);

  const fetchLiveOrders = async () => {
    try {
      const res = await api.get(`/orders/restaurant/${restaurantId || 'rest_1'}?status=READY`);
      if (res.data?.data?.orders) {
        setActiveOrders(res.data.data.orders);
      }
    } catch {
      console.warn('Fallback orders');
    }
  };

  const handleDismissRequest = (index: number) => {
    setCustomerRequests((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMarkServed = async (orderId: string, tableNumber: number) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'SERVED', note: `Served to Table ${tableNumber}` });
      setActiveOrders((prev) => prev.filter((o) => o._id !== orderId));
    } catch {
      setActiveOrders((prev) => prev.filter((o) => o._id !== orderId));
    }
  };

  const handleUpdateTableStatus = (tableNumber: number, newStatus: string) => {
    setTables((prev) => prev.map((t) => (t.tableNumber === tableNumber ? { ...t, status: newStatus } : t)));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top Banner */}
      <div className="glass-card p-6 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Waiter Terminal</span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">Assigned Tables & Service Desk</h1>
            <p className="text-xs text-slate-400">Staff: {user?.name || 'Employee 1'} • Code: WTR-101</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sound Alert Toggle */}
          <button
            onClick={() => setChimeAlertsEnabled(!chimeAlertsEnabled)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
              chimeAlertsEnabled
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle Web Audio Chime Alerts"
          >
            {chimeAlertsEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            <span>Chime: {chimeAlertsEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Test Chime Trigger */}
          <button
            onClick={playServiceChime}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition active:scale-95 shadow-sm"
            title="Play two-tone Web Audio chime"
          >
            <BellRing className="w-3.5 h-3.5 text-amber-400" />
            <span>Test Bell Chime</span>
          </button>

          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 font-semibold">
            {tables.filter((t) => t.status === 'OCCUPIED' || t.status === 'BILL_REQUESTED').length} Active Tables
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Tables Grid & Kitchen Ready Orders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tables Board */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-emerald-400" />
              <span>Assigned Tables Status</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tables.map((table) => (
                <div
                  key={table.tableNumber}
                  className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 transition-all ${
                    table.status === 'BILL_REQUESTED'
                      ? 'bg-purple-950/30 border-purple-500/50 shadow-lg'
                      : table.status === 'OCCUPIED'
                      ? 'bg-amber-950/20 border-amber-500/30'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{table.tableName}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        table.status === 'BILL_REQUESTED'
                          ? 'bg-purple-500 text-white animate-pulse'
                          : table.status === 'OCCUPIED'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {table.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                    <span className="text-slate-400">Capacity: {table.capacity} Guests</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleUpdateTableStatus(table.tableNumber, 'AVAILABLE')}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold"
                      >
                        Free
                      </button>
                      <button
                        onClick={() => handleUpdateTableStatus(table.tableNumber, 'OCCUPIED')}
                        className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold"
                      >
                        Seat
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ready Orders in Kitchen */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-brand-400" />
              <span>Ready Dishes to Serve ({activeOrders.length})</span>
            </h3>

            {activeOrders.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No dishes currently waiting on the pass.</p>
            ) : (
              <div className="space-y-3">
                {activeOrders.map((order) => (
                  <div
                    key={order._id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-brand-500 text-white font-mono text-[10px] font-bold">
                          Table {order.tableNumber || 3}
                        </span>
                        <span className="font-bold text-xs text-white">Order {order.orderNumber}</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        {order.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}
                      </p>
                    </div>

                    <button
                      onClick={() => handleMarkServed(order._id, order.tableNumber || 3)}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Served</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Live Customer Assistance Requests */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4 shadow-xl h-fit">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BellRing className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>Live Customer Calls</span>
            </h3>
            <span className="text-xs text-amber-400 font-bold">{customerRequests.length} Active</span>
          </div>

          {/* Quick Simulation Trigger */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const sampleCall = {
                  tableNumber: Math.floor(Math.random() * 4) + 1,
                  requestType: 'call_waiter',
                  note: 'Customer requested waiter assistance at table',
                  timestamp: new Date(),
                };
                setCustomerRequests((prev) => [sampleCall, ...prev]);
                if (chimeAlertsEnabled) playServiceChime();
              }}
              className="w-full py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-[11px] font-bold text-amber-400 flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>Simulate Table Call & Chime</span>
            </button>
          </div>

          {customerRequests.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-12">No active assistance calls at this moment.</p>
          ) : (
            <div className="space-y-3">
              {customerRequests.map((req, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold">
                      Table {req.tableNumber}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-white">{req.note || req.requestType}</p>

                  <button
                    onClick={() => handleDismissRequest(idx)}
                    className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                  >
                    Resolve / Complete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
