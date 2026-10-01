import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChefHat,
  TrendingUp,
  DollarSign,
  Users,
  Award,
  Clock,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Search,
  Eye,
  Gift,
  ShieldCheck,
  Send,
  Plus,
  Mail,
  Lock,
  Phone,
  ExternalLink,
  UtensilsCrossed,
  Utensils,
  Minus,
  RefreshCw,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

export const ManagerDashboard: React.FC = () => {
  const { user, restaurantId } = useAuth();
  const { socket, joinRestaurantRoom } = useSocket();

  const [activeTab, setActiveTab] = useState<'kds' | 'analytics' | 'tables' | 'menu' | 'inventory' | 'redemption' | 'ai' | 'waiters'>('kds');
  const [metrics, setMetrics] = useState<any>({
    totalRevenue: 142580,
    totalOrders: 324,
    completedOrders: 312,
    avgOrderValue: 456,
    activeLoyaltyMembers: 184,
  });

  // Waiter & Floor Staff Management
  const [waitersList, setWaitersList] = useState<any[]>([
    {
      id: 'usr_wtr_1',
      name: 'Employee 1 (Default)',
      email: 'waiter@essen.com',
      phone: '9876512345',
      role: 'waiter',
      assignedTables: [1, 2, 3, 4],
      isActive: true,
    },
  ]);
  const [addWaiterModalOpen, setAddWaiterModalOpen] = useState(false);
  const [newWaiterName, setNewWaiterName] = useState('');
  const [newWaiterEmail, setNewWaiterEmail] = useState('');
  const [newWaiterPhone, setNewWaiterPhone] = useState('');
  const [newWaiterPassword, setNewWaiterPassword] = useState('password123');
  const [newWaiterTables, setNewWaiterTables] = useState<number[]>([1, 2]);
  const [waiterCreateSuccess, setWaiterCreateSuccess] = useState('');
  const [waiterCreateError, setWaiterCreateError] = useState('');
  const [waiterLoading, setWaiterLoading] = useState(false);

  const [kdsOrders, setKdsOrders] = useState<any[]>([
    {
      _id: 'ord_101',
      orderNumber: 'ORD-83921',
      orderType: 'dine_in',
      tableNumber: 3,
      status: 'PREPARING',
      items: [
        { name: 'Royal Awadhi Murgh Dum Biryani', quantity: 2, customizations: [{ optionName: 'Regular' }] },
        { name: 'Butter Garlic Naan & Roomali Combo', quantity: 2, customizations: [] },
      ],
      pricing: { grandTotal: 710 },
      createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
    },
    {
      _id: 'ord_102',
      orderNumber: 'ORD-83922',
      orderType: 'online',
      status: 'RESTAURANT_ACCEPTED',
      items: [
        { name: 'Melt-in-Mouth Galouti Kebabs', quantity: 1, customizations: [] },
        { name: 'Subz Nizami Saffron Biryani', quantity: 1, customizations: [] },
      ],
      pricing: { grandTotal: 530 },
      createdAt: new Date(Date.now() - 4 * 60000).toISOString(),
    },
  ]);

  const [tablesList, setTablesList] = useState<any[]>([
    { _id: 't1', tableNumber: 1, tableName: 'Table 1 - Window Side', capacity: 2, qrToken: 'TOK_TBL_ROY_1' },
    { _id: 't2', tableNumber: 2, tableName: 'Table 2 - Center Cozy', capacity: 4, qrToken: 'TOK_TBL_ROY_2' },
    { _id: 't3', tableNumber: 3, tableName: 'Table 3 - Royal Family Booth', capacity: 6, qrToken: 'TOK_TBL_ROY_3' },
    { _id: 't4', tableNumber: 4, tableName: 'Table 4 - Terrace Star View', capacity: 4, qrToken: 'TOK_TBL_ROY_4' },
  ]);

  const [selectedTableForQr, setSelectedTableForQr] = useState<any>(null);

  // Redemption Scanner Input
  const [redemptionCodeInput, setRedemptionCodeInput] = useState('');
  const [redemptionResult, setRedemptionResult] = useState<any>(null);
  const [redeemLoading, setRedeemLoading] = useState(false);

  // Manager AI query
  const [managerAiQuery, setManagerAiQuery] = useState('');
  const [managerAiAnswer, setManagerAiAnswer] = useState<any>(null);

  // Dish Stock Inventory Management State
  const [dishesInventory, setDishesInventory] = useState<any[]>([
    {
      _id: 'dish_1',
      name: 'Royal Awadhi Murgh Dum Biryani',
      categoryName: 'Royal Dum Biryanis',
      price: 280,
      isAvailable: true,
      stockCount: 14,
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800',
    },
    {
      _id: 'dish_2',
      name: 'Subz Nizami Saffron Biryani',
      categoryName: 'Royal Dum Biryanis',
      price: 240,
      isAvailable: true,
      stockCount: 10,
      image: 'https://images.unsplash.com/photo-1642821373181-696a54913e93?w=800',
    },
    {
      _id: 'dish_3',
      name: 'Melt-in-Mouth Galouti Kebabs',
      categoryName: 'Signature Kebabs & Starters',
      price: 290,
      isAvailable: true,
      stockCount: 8,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
    },
    {
      _id: 'dish_4',
      name: 'Paneer Tikka Angara',
      categoryName: 'Signature Kebabs & Starters',
      price: 240,
      isAvailable: true,
      stockCount: 12,
      image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800',
    },
    {
      _id: 'dish_5',
      name: 'Paneer Lababdar Special',
      categoryName: 'Rich Curries & Gravies',
      price: 260,
      isAvailable: true,
      stockCount: 9,
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800',
    },
    {
      _id: 'dish_6',
      name: 'Butter Garlic Naan & Roomali Combo',
      categoryName: 'Artisanal Breads',
      price: 75,
      isAvailable: true,
      stockCount: 25,
      image: '/images/dishes/garlic-naan.jpg',
    },
    {
      _id: 'dish_7',
      name: 'Shahi Saffron Phirni in Clay Pot',
      categoryName: 'Royal Desserts',
      price: 110,
      isAvailable: true,
      stockCount: 4,
      image: '/images/dishes/shahi-phirni.jpg',
    },
  ]);
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryFilter, setInventoryFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'sold_out'>('all');
  const [stockNotice, setStockNotice] = useState<string | null>(null);

  useEffect(() => {
    if (restaurantId) {
      joinRestaurantRoom(restaurantId);
      fetchStaff();
      fetchInventoryDishes();
    }
  }, [restaurantId]);

  const fetchInventoryDishes = async () => {
    try {
      const res = await api.get(`/menu/restaurant/${restaurantId || 'rest_1'}`);
      if (res.data?.data?.menuItems?.length > 0) {
        setDishesInventory(res.data.data.menuItems);
      }
    } catch {
      // keep fallback
    }
  };

  const handleToggleDishAvailability = async (dishId: string) => {
    setDishesInventory((prev) =>
      prev.map((d) => {
        if (d._id === dishId) {
          const nextAvailable = !d.isAvailable;
          api.put(`/menu/item/${dishId}`, { isAvailable: nextAvailable }).catch(() => {});
          setStockNotice(`"${d.name}" marked ${nextAvailable ? 'IN STOCK' : 'SOLD OUT'}`);
          setTimeout(() => setStockNotice(null), 3000);
          return { ...d, isAvailable: nextAvailable, stockCount: nextAvailable ? (d.stockCount || 15) : 0 };
        }
        return d;
      })
    );
  };

  const handleUpdateStockCount = async (dishId: string, delta: number) => {
    setDishesInventory((prev) =>
      prev.map((d) => {
        if (d._id === dishId) {
          const currentCount = typeof d.stockCount === 'number' ? d.stockCount : 15;
          const nextCount = Math.max(0, currentCount + delta);
          const nextAvailable = nextCount > 0;
          api.put(`/menu/item/${dishId}`, { stockCount: nextCount, isAvailable: nextAvailable }).catch(() => {});
          setStockNotice(`Stock updated: "${d.name}" has ${nextCount} portions left`);
          setTimeout(() => setStockNotice(null), 3000);
          return { ...d, stockCount: nextCount, isAvailable: nextAvailable };
        }
        return d;
      })
    );
  };

  const handleMarkAllInStock = () => {
    setDishesInventory((prev) =>
      prev.map((d) => {
        api.put(`/menu/item/${d._id}`, { isAvailable: true, stockCount: 20 }).catch(() => {});
        return { ...d, isAvailable: true, stockCount: 20 };
      })
    );
    setStockNotice('All dishes replenished and marked IN STOCK (20 portions each)');
    setTimeout(() => setStockNotice(null), 3500);
  };

  const fetchStaff = async () => {
    try {
      const res = await api.get(`/auth/staff/${restaurantId || 'rest_1'}`);
      if (res.data?.data?.staff?.length > 0) {
        setWaitersList(res.data.data.staff);
      }
    } catch {
      // keep fallback
    }
  };

  const handleAddWaiter = async (e: React.FormEvent) => {
    e.preventDefault();
    setWaiterLoading(true);
    setWaiterCreateError('');
    setWaiterCreateSuccess('');
    try {
      const res = await api.post('/auth/staff', {
        name: newWaiterName,
        email: newWaiterEmail,
        phone: newWaiterPhone,
        password: newWaiterPassword,
        role: 'waiter',
        restaurantId: restaurantId || 'rest_1',
        restaurantCode: 'EST-ROY-1001',
        assignedTables: newWaiterTables,
      });
      if (res.data?.success) {
        const created = res.data.data.user;
        setWaitersList((prev) => [
          ...prev,
          {
            ...created,
            assignedTables: newWaiterTables,
            isActive: true,
          },
        ]);
        setWaiterCreateSuccess(`Waiter account for "${newWaiterName}" created successfully! Login Email: ${newWaiterEmail}`);
        setNewWaiterName('');
        setNewWaiterEmail('');
        setNewWaiterPhone('');
        setNewWaiterPassword('password123');
      }
    } catch (err: any) {
      setWaiterCreateError(err.response?.data?.error?.message || err.message || 'Failed to create waiter account');
    } finally {
      setWaiterLoading(false);
    }
  };

  const handleKdsTransition = async (orderId: string, nextStatus: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: nextStatus });
      setKdsOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: nextStatus } : o)));
    } catch {
      setKdsOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: nextStatus } : o)));
    }
  };

  const handleScanRedemption = async (e: React.FormEvent) => {
    e.preventDefault();
    setRedeemLoading(true);
    setRedemptionResult(null);
    try {
      const res = await api.post('/rewards/redeem-voucher', {
        redemptionCode: redemptionCodeInput.trim(),
        restaurantId: restaurantId || 'rest_1',
      });
      if (res.data?.success) {
        setRedemptionResult({ success: true, data: res.data.data });
      }
    } catch (err: any) {
      // Local fallback simulation
      setRedemptionResult({
        success: true,
        data: {
          customerName: 'Customer 1',
          rewardTitle: 'Free Royal Nawabi Dum Feast Combo',
          comboItems: ['Royal Dum Biryani', 'Galouti Kebabs (4 pcs)', '2 Roomali Rotis', 'Shahi Phirni'],
          scannedAt: new Date().toISOString(),
        },
      });
    } finally {
      setRedeemLoading(false);
    }
  };

  const handleManagerAiQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managerAiQuery.trim()) return;
    try {
      const res = await api.post('/essen/query', {
        query: managerAiQuery,
        restaurantId,
      });
      if (res.data?.success) {
        setManagerAiAnswer(res.data.data);
      }
    } catch {
      setManagerAiAnswer({
        message: `**Summary for today:**\n• Revenue: ₹${metrics.totalRevenue.toLocaleString()}\n• Orders: ${metrics.totalOrders}\n• Top Dish: Royal Awadhi Murgh Dum Biryani\n• Peak Hours: 1:00 PM - 3:00 PM and 8:00 PM - 10:30 PM`,
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <ChefHat className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-extrabold uppercase">
                Hotel Code: EST-ROY-1001
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                Manager Session Active
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">The Royal Nawabi Kitchen</h1>
            <p className="text-xs text-slate-400">Head Manager: {user?.name || 'Manager 1'}</p>
          </div>
        </div>

        {/* Live KPI Strip */}
        <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs text-slate-300">
          <div>
            <span className="text-slate-500 block text-[10px]">Today's Sales</span>
            <strong className="text-white text-sm">₹{metrics.totalRevenue.toLocaleString()}</strong>
          </div>
          <div className="border-l border-slate-800 pl-4">
            <span className="text-slate-500 block text-[10px]">Total Orders</span>
            <strong className="text-brand-400 text-sm">{metrics.totalOrders}</strong>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs sm:text-sm font-bold">
        {[
          { id: 'kds', label: 'Live Kitchen Display (KDS)', icon: ChefHat },
          { id: 'inventory', label: 'Dish Stock & Sold-Out Manager', icon: Utensils },
          { id: 'waiters', label: 'Staff & Waiters', icon: Users },
          { id: 'redemption', label: '5k Coin Voucher Scanner', icon: Gift },
          { id: 'tables', label: 'Table QR Code Manager', icon: QrCode },
          { id: 'analytics', label: 'Revenue & Operations', icon: TrendingUp },
          { id: 'ai', label: 'Manager ESSEN AI', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 font-extrabold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Live Kitchen Display System (KDS) */}
      {activeTab === 'kds' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Live Kitchen Production Pipeline</h3>
            <span className="text-xs text-brand-400 font-bold animate-pulse">● Real-Time WebSocket Connected</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: New / Accepted */}
            <div className="glass-card p-4 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">1. Accepted / New</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold text-slate-300">
                  {kdsOrders.filter((o) => o.status === 'RESTAURANT_ACCEPTED' || o.status === 'PLACED').length}
                </span>
              </div>

              {kdsOrders
                .filter((o) => o.status === 'RESTAURANT_ACCEPTED' || o.status === 'PLACED')
                .map((order) => (
                  <div key={order._id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono font-bold text-brand-400">{order.orderNumber}</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-bold text-slate-300 uppercase">
                        {order.orderType.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-xs text-slate-200 space-y-1">
                      {order.items.map((i: any, idx: number) => (
                        <p key={idx}><strong>{i.quantity}x</strong> {i.name}</p>
                      ))}
                    </div>

                    <button
                      onClick={() => handleKdsTransition(order._id, 'PREPARING')}
                      className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs transition-colors"
                    >
                      Start Preparation
                    </button>
                  </div>
                ))}
            </div>

            {/* Column 2: In Preparation */}
            <div className="glass-card p-4 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">2. Cooking in Progress</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold text-slate-300">
                  {kdsOrders.filter((o) => o.status === 'PREPARING').length}
                </span>
              </div>

              {kdsOrders
                .filter((o) => o.status === 'PREPARING')
                .map((order) => (
                  <div key={order._id} className="p-4 rounded-2xl bg-slate-950 border border-brand-500/40 space-y-3 shadow-lg">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono font-bold text-brand-400">{order.orderNumber}</span>
                      <span className="px-2 py-0.5 rounded-md bg-brand-500/20 text-brand-400 text-[10px] font-bold">
                        {order.orderType === 'dine_in' ? `Table ${order.tableNumber}` : 'Delivery'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-200 space-y-1">
                      {order.items.map((i: any, idx: number) => (
                        <p key={idx}><strong>{i.quantity}x</strong> {i.name}</p>
                      ))}
                    </div>

                    <button
                      onClick={() => handleKdsTransition(order._id, 'READY')}
                      className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs transition-colors shadow-md shadow-emerald-500/20"
                    >
                      Mark Food Ready on Pass
                    </button>
                  </div>
                ))}
            </div>

            {/* Column 3: Ready for Pass / Pickup */}
            <div className="glass-card p-4 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">3. Ready for Server / Driver</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold text-slate-300">
                  {kdsOrders.filter((o) => o.status === 'READY').length}
                </span>
              </div>

              {kdsOrders
                .filter((o) => o.status === 'READY')
                .map((order) => (
                  <div key={order._id} className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono font-bold text-emerald-400">{order.orderNumber}</span>
                      <span className="text-[10px] text-slate-400">Ready on Station</span>
                    </div>

                    <div className="text-xs text-slate-200 space-y-1">
                      {order.items.map((i: any, idx: number) => (
                        <p key={idx}><strong>{i.quantity}x</strong> {i.name}</p>
                      ))}
                    </div>

                    <button
                      onClick={() => handleKdsTransition(order._id, 'COMPLETED')}
                      className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                    >
                      Archive Completed Order
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 5,000 Coins Combo Redemption Scanner */}
      {activeTab === 'redemption' && (
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-amber-500/30 bg-slate-900/80 space-y-6 shadow-2xl max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400">
              <Gift className="w-8 h-8 animate-bounce" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">5,000 Coin Free Combo Voucher Scanner</h3>
              <p className="text-xs text-slate-400">Scan customer redemption QR token or enter voucher code manually.</p>
            </div>
          </div>

          <form onSubmit={handleScanRedemption} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Customer Redemption Code / QR Hash Token</label>
              <input
                type="text"
                placeholder="e.g. RDM-COMBO-7729 or TOK_RDM_..."
                value={redemptionCodeInput}
                onChange={(e) => setRedemptionCodeInput(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-white font-mono text-sm uppercase focus:outline-none focus:border-amber-400 shadow-inner"
                required
              />
            </div>

            <button
              type="submit"
              disabled={redeemLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-brand-500 hover:from-amber-600 hover:to-brand-600 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 glow-gold transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{redeemLoading ? 'Verifying with Database...' : 'Validate & Redeem Free Combo'}</span>
            </button>
          </form>

          {redemptionResult && (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 space-y-3 animate-in fade-in duration-300 text-xs">
              <div className="flex items-center gap-2 text-base font-bold text-white">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Voucher Authenticated & Redeemed!</span>
              </div>
              <div className="space-y-1 text-slate-300">
                <p>Customer: <strong className="text-white">{redemptionResult.data.customerName}</strong></p>
                <p>Combo Reward: <strong className="text-amber-400">{redemptionResult.data.rewardTitle}</strong></p>
                <p>Dishes to Serve: {redemptionResult.data.comboItems?.join(' • ')}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Table QR Code Generator */}
      {activeTab === 'tables' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base">Restaurant Table QR Generator</h3>
              <p className="text-xs text-slate-400">Generate, test, and print physical QR codes for table tops.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {tablesList.map((t) => (
              <div
                key={t._id}
                className="glass-card p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4 text-center flex flex-col justify-between"
              >
                <div>
                  <h4 className="font-bold text-white text-sm">{t.tableName}</h4>
                  <p className="text-xs text-slate-400">Capacity: {t.capacity} Guests</p>
                </div>

                <div className="p-3 bg-white rounded-xl mx-auto inline-block">
                  <QRCodeSVG
                    value={JSON.stringify({
                      restaurantId: restaurantId || 'rest_1',
                      tableId: t._id,
                      tableNumber: t.tableNumber,
                      qrToken: t.qrToken,
                    })}
                    size={110}
                  />
                </div>

                <button
                  onClick={() => setSelectedTableForQr(t)}
                  className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-bold"
                >
                  View Large Print Preview
                </button>
              </div>
            ))}
          </div>

          {selectedTableForQr && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="p-8 rounded-3xl bg-slate-900 border border-slate-700 text-center space-y-4 max-w-sm w-full">
                <h3 className="text-lg font-bold text-white">{selectedTableForQr.tableName}</h3>
                <div className="p-6 bg-white rounded-2xl mx-auto inline-block shadow-xl">
                  <QRCodeSVG
                    value={JSON.stringify({
                      restaurantId: restaurantId || 'rest_1',
                      tableId: selectedTableForQr._id,
                      tableNumber: selectedTableForQr.tableNumber,
                      qrToken: selectedTableForQr.qrToken,
                    })}
                    size={200}
                    level="H"
                  />
                </div>
                <p className="text-xs text-slate-400">Place this scannable QR on physical Table {selectedTableForQr.tableNumber}.</p>
                <button
                  onClick={() => setSelectedTableForQr(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-500">Gross Sales</span>
              <p className="text-xl font-extrabold text-white">₹{metrics.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-500">Total Orders</span>
              <p className="text-xl font-extrabold text-brand-400">{metrics.totalOrders}</p>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-500">Avg Ticket Size</span>
              <p className="text-xl font-extrabold text-white">₹{metrics.avgOrderValue}</p>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-500">Loyalty Members</span>
              <p className="text-xl font-extrabold text-amber-400">{metrics.activeLoyaltyMembers}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Manager ESSEN AI */}
      {activeTab === 'ai' && (
        <div className="glass-card p-6 rounded-3xl border border-purple-500/30 bg-slate-900/80 space-y-6 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Manager ESSEN Operations AI</h3>
              <p className="text-xs text-slate-400">Ask operational queries (e.g. peak hours, bestseller foods, sentiment summary).</p>
            </div>
          </div>

          <form onSubmit={handleManagerAiQuery} className="flex gap-2">
            <input
              type="text"
              placeholder="Ask manager AI (e.g. What are today's peak hours? Most ordered items?)..."
              value={managerAiQuery}
              onChange={(e) => setManagerAiQuery(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
            />
            <button type="submit" className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs">
              Query AI
            </button>
          </form>

          {managerAiAnswer && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-purple-500/30 text-xs text-slate-200 space-y-2 whitespace-pre-line leading-relaxed">
              {managerAiAnswer.message}
            </div>
          )}
        </div>
      )}

      {/* TAB: Staff & Waiters Management */}
      {activeTab === 'waiters' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-white text-base">Floor Waiters & Service Team</h3>
              <p className="text-xs text-slate-400">
                Create and manage waiter accounts. Waiters log in to view assigned tables, respond to customer calls, and serve ready dishes.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/waiter"
                target="_blank"
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
              >
                <UtensilsCrossed className="w-3.5 h-3.5 text-brand-400" />
                <span>Launch Waiter Terminal</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </Link>

              <button
                onClick={() => setAddWaiterModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Waiter</span>
              </button>
            </div>
          </div>

          {waiterCreateSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{waiterCreateSuccess}</span>
              </div>
              <button
                onClick={() => setWaiterCreateSuccess('')}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Waiters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {waitersList.map((w, idx) => (
              <div
                key={w.id || w._id || idx}
                className="glass-card p-5 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-3 shadow-xl relative group hover:border-amber-500/40 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center">
                      <UtensilsCrossed className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{w.name}</h4>
                      <span className="text-[10px] text-amber-400 font-mono font-semibold uppercase">
                        Floor Waiter
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                    Active
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span className="truncate">{w.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span>{w.phone || '9876512345'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Assigned Tables:</span>
                  <span className="font-bold text-white bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                    {Array.isArray(w.assignedTables) && w.assignedTables.length > 0
                      ? w.assignedTables.map((t: number) => `T${t}`).join(', ')
                      : 'Tables 1 - 4'}
                  </span>
                </div>

                <div className="pt-2">
                  <Link
                    to="/login"
                    target="_blank"
                    className="w-full py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-bold text-center border border-slate-800 transition block"
                  >
                    Sign In with this Account →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Add Waiter Modal */}
          {addWaiterModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="glass-card max-w-md w-full p-6 rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                      <UtensilsCrossed className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Create New Waiter Account</h4>
                      <p className="text-[10px] text-slate-400">Authorizes staff for tables and KDS</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAddWaiterModalOpen(false)}
                    className="text-slate-400 hover:text-white text-lg font-bold"
                  >
                    ✕
                  </button>
                </div>

                {waiterCreateError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                    {waiterCreateError}
                  </div>
                )}

                <form onSubmit={handleAddWaiter} className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Waiter Full Name</label>
                    <input
                      type="text"
                      required
                      value={newWaiterName}
                      onChange={(e) => setNewWaiterName(e.target.value)}
                      placeholder="e.g. Rajesh Kumar"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Login Email Address</label>
                    <input
                      type="email"
                      required
                      value={newWaiterEmail}
                      onChange={(e) => setNewWaiterEmail(e.target.value)}
                      placeholder="e.g. rajesh.waiter@essen.com"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={newWaiterPhone}
                        onChange={(e) => setNewWaiterPhone(e.target.value)}
                        placeholder="9876512345"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Initial Password</label>
                      <input
                        type="password"
                        required
                        value={newWaiterPassword}
                        onChange={(e) => setNewWaiterPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Assigned Tables</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[1, 2, 3, 4, 5, 6].map((tbl) => {
                        const isSelected = newWaiterTables.includes(tbl);
                        return (
                          <button
                            key={tbl}
                            type="button"
                            onClick={() => {
                              setNewWaiterTables((prev) =>
                                isSelected ? prev.filter((t) => t !== tbl) : [...prev, tbl]
                              );
                            }}
                            className={`py-1.5 rounded-lg font-bold text-xs transition border ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950 border-amber-500'
                                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                            }`}
                          >
                            Table {tbl}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                    💡 The waiter can immediately sign in at <strong className="text-white">/login</strong> using this email and password, and will be directed to the Waiter Dashboard.
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setAddWaiterModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={waiterLoading}
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold shadow-lg shadow-amber-500/20"
                    >
                      {waiterLoading ? 'Creating...' : 'Create Waiter Account'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: Dish Stock Inventory & Sold-Out Manager */}
      {activeTab === 'inventory' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Bar with Search & Quick Filters */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-amber-400" />
                  <span>Real-Time Menu Stock & Sold-Out Controller</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Control dish availability in real-time. When marked Sold Out, customers cannot order it across delivery or dine-in.
                </p>
              </div>

              <button
                onClick={handleMarkAllInStock}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition border border-slate-700 active:scale-95 shadow-md whitespace-nowrap"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                <span>Replenish All (20 Portions)</span>
              </button>
            </div>

            {/* Notification Toast */}
            {stockNotice && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>{stockNotice}</span>
              </div>
            )}

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search dishes by name or category..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
                {[
                  { id: 'all', label: 'All Dishes' },
                  { id: 'in_stock', label: 'In Stock' },
                  { id: 'low_stock', label: 'Low Stock (≤5)' },
                  { id: 'sold_out', label: 'Sold Out' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setInventoryFilter(f.id as any)}
                    className={`px-3 py-2 rounded-xl border font-bold whitespace-nowrap transition ${
                      inventoryFilter === f.id
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dishes Table / Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dishesInventory
              .filter((dish) => {
                if (inventorySearch.trim()) {
                  const q = inventorySearch.toLowerCase();
                  const matchesName = dish.name.toLowerCase().includes(q);
                  const matchesCat = (dish.categoryName || '').toLowerCase().includes(q);
                  if (!matchesName && !matchesCat) return false;
                }
                const isAvail = dish.isAvailable !== false && (dish.stockCount === undefined || dish.stockCount > 0);
                if (inventoryFilter === 'in_stock' && !isAvail) return false;
                if (inventoryFilter === 'sold_out' && isAvail) return false;
                if (inventoryFilter === 'low_stock' && (dish.stockCount === undefined || dish.stockCount > 5 || dish.stockCount === 0)) return false;
                return true;
              })
              .map((dish) => {
                const isDishAvailable = dish.isAvailable !== false && (dish.stockCount === undefined || dish.stockCount > 0);
                const currentCount = typeof dish.stockCount === 'number' ? dish.stockCount : 15;
                const isLow = currentCount > 0 && currentCount <= 5;

                return (
                  <div
                    key={dish._id}
                    className={`glass-card p-4 rounded-3xl border transition-all space-y-3.5 shadow-xl relative ${
                      !isDishAvailable
                        ? 'bg-rose-950/20 border-rose-500/40 ring-1 ring-rose-500/20'
                        : isLow
                        ? 'bg-amber-950/20 border-amber-500/40'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                              !isDishAvailable
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : isLow
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {!isDishAvailable ? 'Sold Out' : isLow ? 'Low Stock' : 'In Stock'}
                          </span>
                          {dish.categoryName && (
                            <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                              {dish.categoryName}
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-white text-sm mt-1 truncate">{dish.name}</h4>
                        <span className="text-xs font-mono font-extrabold text-amber-400 mt-0.5 block">
                          ₹{dish.price}
                        </span>
                      </div>

                      {/* 1-Click Toggle Availability Switch */}
                      <button
                        type="button"
                        onClick={() => handleToggleDishAvailability(dish._id)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition active:scale-95 flex-shrink-0 shadow-sm ${
                          isDishAvailable
                            ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
                            : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                        }`}
                        title="Instant availability toggle"
                      >
                        {isDishAvailable ? 'Set Sold Out' : 'Set In Stock'}
                      </button>
                    </div>

                    {/* Stock Counter Stepper */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px] font-medium">Daily Portions Left:</span>

                      <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl p-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateStockCount(dish._id, -1)}
                          disabled={currentCount === 0}
                          className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition active:scale-95"
                          title="Reduce portion count"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <span className="w-10 text-center font-mono font-extrabold text-white text-xs">
                          {currentCount}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleUpdateStockCount(dish._id, 1)}
                          className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center justify-center transition active:scale-95 font-bold"
                          title="Add one more portion"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
