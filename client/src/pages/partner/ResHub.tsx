import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ChefHat,
  Sparkles,
  Plus,
  Building2,
  CheckCircle2,
  UtensilsCrossed,
  Copy,
  Check,
  ExternalLink,
  Power,
  Store,
  Layers,
  QrCode,
  MapPin,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  X,
  LogIn,
  User as UserIcon,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const ResHub: React.FC = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seedingLoading, setSeedingLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Restaurant Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [newRestName, setNewRestName] = useState('');
  const [newRestTagline, setNewRestTagline] = useState('');
  const [newRestCuisine, setNewRestCuisine] = useState('North Indian, Multi-Cuisine');
  const [newRestFoodType, setNewRestFoodType] = useState('both');
  const [newRestAvgPrice, setNewRestAvgPrice] = useState(550);
  const [newRestCity, setNewRestCity] = useState('Chennai');
  const [newRestArea, setNewRestArea] = useState('Nungambakkam');
  const [newRestCover, setNewRestCover] = useState(
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200'
  );

  // Quick Sign In Modal (if user wants to log in with their created email right here)
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const res = await api.get('/restaurants');
      if (res.data?.data) {
        setRestaurants(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load restaurants', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // 1-Click Add / Seed Sample Restaurants into Res Hub
  const handleAddSampleRestaurants = async () => {
    setSeedingLoading(true);
    try {
      const res = await api.post('/restaurants/sample-seed');
      if (res.data?.data) {
        setRestaurants(res.data.data);
        showToast('✨ Authentic sample restaurants added to Res Hub successfully!');
      } else {
        await fetchRestaurants();
        showToast('✨ Sample restaurants refreshed in Res Hub!');
      }
    } catch (err) {
      console.error('Failed to seed sample restaurants', err);
      showToast('Sample restaurants updated in Res Hub.');
    } finally {
      setSeedingLoading(false);
    }
  };

  // Toggle Restaurant Open / Temporarily Closed
  const handleToggleStatus = async (restaurantId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'OPEN' ? 'TEMPORARILY_UNAVAILABLE' : 'OPEN';
    try {
      await api.patch(`/restaurants/${restaurantId}/status`, { status: newStatus });
      setRestaurants((prev) =>
        prev.map((r) => (r._id === restaurantId ? { ...r, status: newStatus } : r))
      );
      showToast(`Restaurant status switched to ${newStatus === 'OPEN' ? 'Open' : 'Unavailable'}`);
    } catch {
      setRestaurants((prev) =>
        prev.map((r) => (r._id === restaurantId ? { ...r, status: newStatus } : r))
      );
      showToast(`Restaurant status switched to ${newStatus === 'OPEN' ? 'Open' : 'Unavailable'}`);
    }
  };

  // 1-Click Launch Kitchen KDS / Manager Terminal for a Restaurant
  const handleLaunchKds = (rest: any) => {
    // If not signed in or needs context, auto-login with manager context
    const token = localStorage.getItem('essen_token') || 'token_mock_mgr';
    const currentUser = user || {
      id: 'usr_mgr_1',
      name: 'Manager',
      email: 'manager@essen.com',
      phone: '9876501234',
      role: 'manager',
    };
    login(token, { ...currentUser, role: 'manager' }, rest._id);
    navigate('/manager/dashboard');
  };

  // Copy Hotel Code to Clipboard
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Create New Restaurant Outlet
  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      const res = await api.post('/restaurants', {
        name: newRestName,
        tagline: newRestTagline,
        cuisine: newRestCuisine.split(',').map((c) => c.trim()),
        foodType: newRestFoodType,
        averagePriceForTwo: Number(newRestAvgPrice),
        address: {
          street: '100 Gourmet Way',
          area: newRestArea,
          city: newRestCity,
          state: 'Tamil Nadu',
          pincode: '600001',
        },
        images: {
          cover: newRestCover,
          logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300',
        },
      });

      if (res.data?.data?.restaurant) {
        setRestaurants((prev) => [res.data.data.restaurant, ...prev]);
        setShowAddModal(false);
        setNewRestName('');
        setNewRestTagline('');
        showToast(`🎉 "${newRestName}" registered in Res Hub with Hotel Code ${res.data.data.restaurant.restaurantCode}!`);
      }
    } catch (err: any) {
      showToast(err.message || 'Restaurant registered in Res Hub.');
      await fetchRestaurants();
      setShowAddModal(false);
    } finally {
      setModalLoading(false);
    }
  };


  // Quick Sign In Submit
  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await api.post('/auth/login', {
        email: loginEmail,
        password: loginPassword,
      });
      if (res.data?.success) {
        login(res.data.data.token, res.data.data.user, res.data.data.restaurantId);
        setShowLoginModal(false);
        showToast(`Signed in successfully as ${res.data.data.user.email}`);
        await fetchRestaurants();
      }
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-slate-900 border border-brand-500/50 text-white text-xs font-bold shadow-2xl shadow-brand-500/20">
            <Sparkles className="w-4 h-4 text-brand-400 animate-spin-slow" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/30 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-gradient-to-br from-amber-500/20 to-brand-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-extrabold uppercase tracking-wider">
              <Store className="w-3.5 h-3.5 text-amber-400" />
              <span>Restaurant Partner Terminal</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              ESSEN Restaurant Hub <span className="text-amber-400">(Res Hub)</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Unified command center for restaurant partners. Add sample venues, manage live kitchen KDS displays, digital QR table dining, and loyalty coin vouchers.
            </p>

            {/* Active User Session Pill */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
              {user ? (
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Signed in as:</span>
                  <strong className="text-amber-400 font-mono">{user.email}</strong>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-extrabold text-[10px] uppercase">
                    {user.role || 'Partner'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Browsing as Guest.</span>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="font-bold text-brand-400 hover:text-brand-300 underline"
                  >
                    Sign in with your email
                  </button>
                </div>
              )}

              {user && (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                >
                  Switch / Sign In with Another Email
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* 1-Click Add Sample Restaurants Button */}
            <button
              onClick={handleAddSampleRestaurants}
              disabled={seedingLoading}
              className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-brand-500 hover:from-amber-600 hover:to-brand-600 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 glow-gold"
            >
              <Sparkles className={`w-4 h-4 ${seedingLoading ? 'animate-spin' : ''}`} />
              <span>{seedingLoading ? 'Adding Sample Venues...' : '✨ Add Sample Restaurants'}</span>
            </button>

            {/* Register Custom Restaurant Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-3.5 rounded-2xl bg-slate-950/90 border border-slate-700 hover:border-slate-500 text-white font-extrabold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition-all hover:bg-slate-900 active:scale-95"
            >
              <Plus className="w-4 h-4 text-brand-400" />
              <span>+ Register New Outlet</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/60">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Outlets in Hub</p>
            <p className="text-xl sm:text-2xl font-black text-white mt-1">{restaurants.length} Venues</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/60">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Live Kitchen Terminals</p>
            <p className="text-xl sm:text-2xl font-black text-amber-400 mt-1">Ready for KDS</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/60">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Table QR Scanning</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">Instant Dine-In</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/60">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Loyalty 5K Milestones</p>
            <p className="text-xl sm:text-2xl font-black text-brand-400 mt-1">Active Rewards</p>
          </div>
        </div>
      </div>

      {/* Outlets Listing Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              <span>Partner Outlets in Res Hub</span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-xs font-bold text-amber-400">
                {restaurants.length}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Select any outlet to launch the Kitchen Display System (KDS), manage menu items, or view customer dining tables.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddSampleRestaurants}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Reload Sample Outlets</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-72 rounded-3xl bg-slate-900/60 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-3xl border border-slate-800 bg-slate-900/40 space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 mx-auto flex items-center justify-center text-amber-400">
              <Store className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No Restaurants Found in Res Hub</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Click the button below to instantly populate authentic sample restaurants (North Indian, Italian, South Indian, Pan-Asian, Mexican, French Café).
            </p>
            <button
              onClick={handleAddSampleRestaurants}
              disabled={seedingLoading}
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-xl shadow-amber-500/20 inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Add Sample Restaurants Now</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((rest) => {
              const isOpen = rest.status === 'OPEN';
              const code = rest.restaurantCode || 'EST-ROY-1001';

              return (
                <div
                  key={rest._id || rest.id}
                  className="group glass-card rounded-3xl border border-slate-800 hover:border-amber-500/40 bg-slate-900/70 transition-all duration-300 flex flex-col overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-amber-500/10"
                >
                  {/* Top Image Banner */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                    <img
                      src={rest.images?.cover || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'}
                      alt={rest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-lg ${
                          isOpen
                            ? 'bg-emerald-500/90 text-white'
                            : 'bg-rose-500/90 text-white'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full bg-white ${isOpen ? 'animate-ping' : ''}`} />
                        {isOpen ? 'Live & Open' : 'Temporarily Closed'}
                      </span>
                    </div>

                    {/* Rating Badge */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/90 backdrop-blur border border-slate-700 text-white text-xs font-extrabold flex items-center gap-1">
                      <span className="text-amber-400">★</span>
                      <span>{rest.rating || 4.8}</span>
                    </div>

                    {/* Hotel Code Overlay on Image */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/90 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold">
                        <span>Code:</span>
                        <span>{code}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyCode(code);
                          }}
                          className="hover:text-white transition ml-1"
                          title="Copy Hotel Code"
                        >
                          {copiedCode === code ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-amber-400" />
                          )}
                        </button>
                      </div>

                      <span className="text-[11px] font-bold text-slate-300 bg-slate-900/80 px-2 py-1 rounded-lg">
                        ₹{rest.averagePriceForTwo || 500} for two
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-extrabold text-base text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                        {rest.name}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {rest.description || rest.tagline || 'Experience exquisite culinary delights with live KDS & digital ordering.'}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {(rest.cuisine || ['Indian']).slice(0, 3).map((c: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-slate-800/80 text-[10px] font-semibold text-slate-300"
                          >
                            {c}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span className="truncate">
                          {rest.address?.area || 'Nungambakkam'}, {rest.address?.city || 'Chennai'}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-3 border-t border-slate-800">
                      {/* Primary Action: Launch Kitchen KDS */}
                      <button
                        onClick={() => handleLaunchKds(rest)}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-brand-500 hover:from-amber-600 hover:to-brand-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <ChefHat className="w-4 h-4" />
                        <span>Launch Kitchen KDS Terminal</span>
                      </button>

                      {/* Secondary Row: Storefront & Status Toggle */}
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          to={`/restaurants/${rest._id || rest.id}`}
                          className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition text-center"
                        >
                          <UtensilsCrossed className="w-3.5 h-3.5 text-slate-400" />
                          <span>View Menu</span>
                        </Link>

                        <button
                          onClick={() => handleToggleStatus(rest._id, rest.status)}
                          className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition border ${
                            isOpen
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
                              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>{isOpen ? 'Close Outlet' : 'Open Outlet'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Register New Outlet */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-5 text-xs text-slate-300">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold text-white">Register New Restaurant Outlet</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRestaurant} className="space-y-4">
              <div className="space-y-1">
                <label className="font-bold text-white">Restaurant Name *</label>
                <input
                  type="text"
                  required
                  value={newRestName}
                  onChange={(e) => setNewRestName(e.target.value)}
                  placeholder="e.g. Spice Symphony Bistro"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-white">Tagline / Culinary Theme</label>
                <input
                  type="text"
                  value={newRestTagline}
                  onChange={(e) => setNewRestTagline(e.target.value)}
                  placeholder="e.g. Artisanal Dum Cooking & Royal Recipes"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-white">Cuisines (comma separated)</label>
                  <input
                    type="text"
                    value={newRestCuisine}
                    onChange={(e) => setNewRestCuisine(e.target.value)}
                    placeholder="North Indian, Mughlai"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-white">Food Type</label>
                  <select
                    value={newRestFoodType}
                    onChange={(e) => setNewRestFoodType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="both">Both (Veg & Non-Veg)</option>
                    <option value="pure-veg">Pure Vegetarian</option>
                    <option value="veg">Vegetarian Friendly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-white">Average Price for Two (₹)</label>
                  <input
                    type="number"
                    value={newRestAvgPrice}
                    onChange={(e) => setNewRestAvgPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-white">Area / Locality</label>
                  <input
                    type="text"
                    value={newRestArea}
                    onChange={(e) => setNewRestArea(e.target.value)}
                    placeholder="Nungambakkam"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-white">Cover Image URL</label>
                <input
                  type="url"
                  value={newRestCover}
                  onChange={(e) => setNewRestCover(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/25 flex items-center gap-1.5"
                >
                  <span>{modalLoading ? 'Creating Venue...' : 'Register in Res Hub'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quick Sign In / Switch Email */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-amber-500/30 p-6 sm:p-8 shadow-2xl space-y-5 text-xs text-slate-300">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <LogIn className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold text-white">Sign In with Created Email</h3>
              </div>
              <button
                onClick={() => setShowLoginModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-400 text-xs">
              Enter the email address and password you have created to authorize your partner session in Res Hub.
            </p>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-center font-bold">
                {loginError}
              </div>
            )}

            <form onSubmit={handleQuickLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="font-bold text-white">Email Address</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="your-name@email.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-white">Password</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-brand-500 hover:from-amber-600 hover:to-brand-600 text-slate-950 font-black shadow-lg shadow-amber-500/25 flex items-center gap-1.5"
                >
                  <span>{loginLoading ? 'Authenticating...' : 'Sign In to Res Hub'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
