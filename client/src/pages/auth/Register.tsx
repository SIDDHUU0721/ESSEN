import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChefHat, Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff, UtensilsCrossed, Store } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const RESTAURANT_OPTIONS = [
  { id: 'rest_1', name: 'The Royal Nawabi Kitchen', code: 'EST-ROY-1001' },
  { id: 'rest_2', name: 'Trattoria Bella Napoli', code: 'EST-BEL-2002' },
  { id: 'rest_3', name: 'Sattvam Pure Vegetarian Haven', code: 'EST-SAT-3003' },
  { id: 'rest_4', name: 'Tokyo Blossom Ramen & Izakaya', code: 'EST-TOK-4004' },
  { id: 'rest_5', name: 'El Fuego Mexican Cantina', code: 'EST-FUE-5005' },
  { id: 'rest_6', name: 'Le Petit Parisien Patisserie', code: 'EST-PAR-6006' },
];

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState<'customer' | 'waiter'>('customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [foodType, setFoodType] = useState('any');
  const [selectedRestId, setSelectedRestId] = useState(RESTAURANT_OPTIONS[0].id);
  const [restaurantCode, setRestaurantCode] = useState(RESTAURANT_OPTIONS[0].code);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRestaurantChange = (restId: string) => {
    setSelectedRestId(restId);
    const found = RESTAURANT_OPTIONS.find((r) => r.id === restId);
    if (found) {
      setRestaurantCode(found.code);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        phone,
        password,
        role,
        restaurantId: role === 'waiter' ? selectedRestId : undefined,
        restaurantCode: role === 'waiter' ? restaurantCode : undefined,
        preferences: { foodType },
      });

      if (res.data?.success) {
        login(res.data.data.token, res.data.data.user, res.data.data.restaurantId);
        if (role === 'waiter') {
          navigate('/waiter/dashboard');
        } else {
          navigate('/home');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 py-8">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-500 to-amber-500 p-0.5 mx-auto shadow-lg shadow-brand-500/25">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <ChefHat className="w-7 h-7 text-white" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          {role === 'waiter' ? 'Create Waiter Account' : 'Create Customer Account'}
        </h1>
        <p className="text-xs text-slate-400">
          {role === 'waiter'
            ? 'Register as restaurant floor waiter to manage assigned tables and orders.'
            : 'Join ESSEN to earn coins, customize meals, and book tables.'}
        </p>
      </div>

      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl space-y-4 text-xs">
        {/* Role Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              role === 'customer'
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Customer</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('waiter')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              role === 'waiter'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Floor Waiter / Staff</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-center font-medium space-y-1">
            <p className="font-semibold">{errorMsg}</p>
            {errorMsg.toLowerCase().includes('already exists') && (
              <p className="text-[11px] text-slate-300">
                Already registered?{' '}
                <Link to="/login" className="text-brand-400 font-bold underline hover:text-brand-300">
                  Click here to Sign In with your password →
                </Link>
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {role === 'waiter' && (
            <div className="space-y-1.5 p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
              <label className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5" />
                <span>Assigned Restaurant & Hotel Code</span>
              </label>
              <select
                value={selectedRestId}
                onChange={(e) => handleRestaurantChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 text-xs"
              >
                {RESTAURANT_OPTIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.code})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400">
                You will be authorized as a floor waiter for this restaurant's table service and KDS alerts.
              </p>
            </div>
          )}

          <div className="space-y-1">
            <label className="font-bold text-slate-300">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'waiter' ? 'Rajesh Kumar (Waiter)' : 'Aarav Sharma'}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@essen.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-300">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white font-bold text-sm shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 transition-all"
          >
            <span>{loading ? 'Creating Account...' : 'Register'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-slate-400 pt-2">
          <span>Already registered? </span>
          <Link to="/login" className="font-bold text-brand-400 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
