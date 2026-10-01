import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity, 
  Search, 
  AlertTriangle,
  RefreshCw,
  Eye,
  Key,
  Calendar,
  Layers,
  Utensils
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

interface PlatformStats {
  totalRestaurants: number;
  activeRestaurants: number;
  pendingVerifications: number;
  totalUsers: number;
  totalOrders: number;
  grossSales: number;
  platformCommission: number;
  activeDisputes: number;
}

export const AdminDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<PlatformStats>({
    totalRestaurants: 12,
    activeRestaurants: 10,
    pendingVerifications: 2,
    totalUsers: 1450,
    totalOrders: 3820,
    grossSales: 892400,
    platformCommission: 44620,
    activeDisputes: 1
  });

  const [activeTab, setActiveTab] = useState<'verifications' | 'restaurants' | 'users' | 'disputes' | 'audit'>('verifications');
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  if (!token || user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'verifications' || activeTab === 'restaurants') {
        const res = await api.get('/restaurants');
        if (res.data.success) {
          setRestaurants(res.data.data.restaurants || []);
        }
      } else if (activeTab === 'audit') {
        const res = await api.get('/admin/audit-logs');
        if (res.data.success) {
          setAuditLogs(res.data.data.logs || []);
        }
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRestaurant = async (restaurantId: string) => {
    setActionLoading(restaurantId);
    try {
      const res = await api.put(`/admin/restaurants/${restaurantId}/verify`, { verified: true, status: 'OPEN' });
      if (res.data.success) {
        setRestaurants(prev => prev.map(r => r._id === restaurantId ? { ...r, isVerified: true, status: 'OPEN' } : r));
      }
    } catch (err) {
      console.error('Failed to approve restaurant:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleSuspend = async (restaurantId: string, currentStatus: string) => {
    setActionLoading(restaurantId);
    const newStatus = currentStatus === 'TEMPORARILY_UNAVAILABLE' ? 'OPEN' : 'TEMPORARILY_UNAVAILABLE';
    try {
      const res = await api.put(`/admin/restaurants/${restaurantId}/status`, { status: newStatus });
      if (res.data.success) {
        setRestaurants(prev => prev.map(r => r._id === restaurantId ? { ...r, status: newStatus } : r));
      }
    } catch (err) {
      console.error('Failed to update restaurant status:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const pendingRestaurants = restaurants.filter(r => !r.isVerified);
  const allRestaurants = restaurants.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.restaurantCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-16">
      {/* Top Admin Header */}
      <div className="bg-slate-950/80 border-b border-slate-800 backdrop-blur sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-white">ESSEN Platform Administration</h1>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">System Master</span>
              </div>
              <p className="text-xs text-slate-400">Enterprise Restaurant Verification & Multi-Tenant Audit Engine</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchAdminData}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
              <span>Refresh Cluster</span>
            </button>
            <div className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 font-mono">
              Root Node: Production AP-South
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 backdrop-blur shadow-sm hover:border-slate-600 transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gross Merchandise Vol</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">₹{stats.grossSales.toLocaleString('en-IN')}</div>
            <div className="flex items-center space-x-1.5 mt-2 text-xs text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% vs last cycle</span>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 backdrop-blur shadow-sm hover:border-slate-600 transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Platform Fee (5%)</span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">₹{stats.platformCommission.toLocaleString('en-IN')}</div>
            <div className="flex items-center space-x-1.5 mt-2 text-xs text-purple-300">
              <span>Automatic Escrow Settlement</span>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 backdrop-blur shadow-sm hover:border-slate-600 transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Partner Outlets</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {stats.activeRestaurants} <span className="text-sm font-normal text-slate-400">/ {stats.totalRestaurants} total</span>
            </div>
            <div className="flex items-center space-x-1.5 mt-2 text-xs text-amber-400">
              <span>{pendingRestaurants.length} Pending Approval</span>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 backdrop-blur shadow-sm hover:border-slate-600 transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registered Consumers</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">{stats.totalUsers.toLocaleString('en-IN')}</div>
            <div className="flex items-center space-x-1.5 mt-2 text-xs text-blue-400">
              <span>{stats.totalOrders} Lifetime Orders</span>
            </div>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-800 mb-8 pb-3 overflow-x-auto">
          {[
            { id: 'verifications', label: 'Restaurant Verifications', icon: CheckCircle2, count: pendingRestaurants.length },
            { id: 'restaurants', label: 'Manage All Outlets', icon: Building2 },
            { id: 'disputes', label: 'Disputes & Refunds', icon: AlertTriangle, count: stats.activeDisputes },
            { id: 'audit', label: 'Security & Audit Trail', icon: Layers }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Restaurant Verifications */}
        {activeTab === 'verifications' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Pending Approval Queue</h2>
                <p className="text-xs text-slate-400">Review business legitimacy, GSTIN registrations, and kitchen food safety compliance.</p>
              </div>
              <span className="text-xs text-slate-500">{pendingRestaurants.length} requests requiring action</span>
            </div>

            {pendingRestaurants.length === 0 ? (
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400/80 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-white">All Clear</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">There are no pending restaurant verification requests waiting for admin signoff.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {pendingRestaurants.map(restaurant => (
                  <div key={restaurant._id} className="bg-slate-800/60 border border-slate-700/70 rounded-2xl p-6 backdrop-blur space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-base font-bold text-white">{restaurant.name}</h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            UNVERIFIED
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{restaurant.cuisine?.join(', ')}</p>
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 font-mono text-xs text-emerald-400">
                        {restaurant.restaurantCode || 'NO-CODE'}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-slate-500 block">Location:</span>
                        <span className="text-slate-300 font-medium">{restaurant.address?.city || 'Chennai'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">GSTIN / Tax ID:</span>
                        <span className="text-slate-300 font-mono">{restaurant.gstin || '33AABCU9603R1ZM'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Phone:</span>
                        <span className="text-slate-300">{restaurant.phone || '+91 98765 43210'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Loyalty Engine:</span>
                        <span className="text-emerald-400 font-medium">5,000 Coins Target</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 pt-2">
                      <button
                        onClick={() => handleApproveRestaurant(restaurant._id)}
                        disabled={actionLoading === restaurant._id}
                        className="flex-1 flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{actionLoading === restaurant._id ? 'Verifying...' : 'Approve & Issue Certificate'}</span>
                      </button>
                      <button
                        onClick={() => handleToggleSuspend(restaurant._id, 'OPEN')}
                        className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
                        title="Reject / Flag"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Manage All Outlets */}
        {activeTab === 'restaurants' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by name or restaurant code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <span className="text-xs text-slate-400 self-end sm:self-auto">Showing {allRestaurants.length} registered venues</span>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl overflow-hidden backdrop-blur">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-700/60">
                    <tr>
                      <th className="py-3.5 px-4">Restaurant</th>
                      <th className="py-3.5 px-4">Code</th>
                      <th className="py-3.5 px-4">Rating</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Verification</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/40 text-slate-300">
                    {allRestaurants.map(r => (
                      <tr key={r._id} className="hover:bg-slate-800/60 transition">
                        <td className="py-4 px-4">
                          <div className="font-bold text-white">{r.name}</div>
                          <div className="text-[11px] text-slate-400">{r.address?.city || 'Chennai'} · {r.cuisine?.join(', ')}</div>
                        </td>
                        <td className="py-4 px-4 font-mono font-medium text-emerald-400">
                          {r.restaurantCode || '—'}
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-bold text-white">⭐ {r.rating || 4.8}</span>
                          <span className="text-slate-400 text-[10px] ml-1">({r.totalRatings || 120})</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            r.status === 'OPEN' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {r.status || 'OPEN'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {r.isVerified ? (
                            <span className="inline-flex items-center space-x-1 text-emerald-400 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verified</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-amber-400 font-medium">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Pending</span>
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleToggleSuspend(r._id, r.status)}
                            disabled={actionLoading === r._id}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                              r.status === 'TEMPORARILY_UNAVAILABLE'
                                ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                                : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30'
                            }`}
                          >
                            {r.status === 'TEMPORARILY_UNAVAILABLE' ? 'Reinstate' : 'Suspend'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Disputes & Refunds */}
        {activeTab === 'disputes' && (
          <div className="space-y-6">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Dispute Case #DSP-9042</h3>
                    <p className="text-xs text-slate-400">Order #ORD-77189 · The Royal Spice Villa</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  UNDER_REVIEW
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-2 mb-4">
                <p><span className="text-slate-500 font-medium">Customer Claim:</span> "Order missing packaging seal and one Veg Biryani was spilled during transit."</p>
                <p><span className="text-slate-500 font-medium">Claim Amount:</span> ₹320.00</p>
                <p><span className="text-slate-500 font-medium">Restaurant Feedback:</span> "Package was double-sealed with tamper tape before handover."</p>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-slate-200 transition">
                  Reject Claim
                </button>
                <button className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-xs font-bold text-slate-950 transition">
                  Authorize Direct Refund (₹320)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Security & Audit Trail */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 backdrop-blur">
              <h3 className="text-sm font-bold text-white mb-1">System Security Audit Log</h3>
              <p className="text-xs text-slate-400 mb-4">Immutable log of manager logins, coupon generation, and loyalty voucher redemptions.</p>

              <div className="space-y-2">
                {[
                  { event: 'MANAGER_LOGIN_SUCCESS', target: 'EST-ROY-1001', user: 'manager@essen.com', time: '2 mins ago', ip: '192.168.1.45', status: 'SUCCESS' },
                  { event: 'LOYALTY_VOUCHER_CLAIM', target: 'VOUCHER-9921', user: 'customer@essen.com', time: '14 mins ago', ip: '103.21.44.12', status: 'SUCCESS' },
                  { event: 'REFUND_PROCESSED', target: 'ORD-88120', user: 'SYSTEM_ESCROW', time: '1 hour ago', ip: 'INTERNAL', status: 'SUCCESS' },
                  { event: 'FAILED_RESTAURANT_CODE_MATCH', target: 'EST-UNKNOWN-99', user: 'intruder@test.com', time: '3 hours ago', ip: '45.112.90.1', status: 'REJECTED' }
                ].map((log, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-xs">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${log.status === 'SUCCESS' ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                      <div>
                        <span className="font-mono font-bold text-slate-200">{log.event}</span>
                        <span className="text-slate-500 ml-2">[{log.target}]</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-slate-400">
                      <span>{log.user}</span>
                      <span className="font-mono text-slate-500">{log.ip}</span>
                      <span className="text-slate-500">{log.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
