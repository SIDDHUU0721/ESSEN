import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChefHat, Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success) {
        login(res.data.data.token, res.data.data.user, res.data.data.restaurantId);
        const role = res.data.data.user.role;
        if (role === 'manager') navigate('/manager/dashboard');
        else if (role === 'waiter') navigate('/waiter/dashboard');
        else if (role === 'delivery_partner') navigate('/delivery/dashboard');
        else if (role === 'admin') navigate('/admin/dashboard');
        else navigate('/home');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 py-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-500 to-amber-500 p-0.5 mx-auto shadow-lg shadow-brand-500/25">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <ChefHat className="w-7 h-7 text-white" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Welcome to ESSEN</h1>
        <p className="text-xs text-slate-400">Sign in to access your dining concierge & orders.</p>
      </div>

      {/* Form Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl space-y-5 text-xs">
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-center font-medium space-y-1">
            <p className="font-semibold">{errorMsg}</p>
            {errorMsg.toLowerCase().includes('no account found') && (
              <p className="text-[11px] text-slate-300">
                New customer?{' '}
                <Link to="/register" className="text-brand-400 font-bold underline hover:text-brand-300">
                  Create Customer Account now →
                </Link>
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
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

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-bold text-slate-300">Password</label>
              <span className="text-[11px] text-brand-400 hover:underline cursor-pointer">Forgot?</span>
            </div>
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
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white font-bold text-sm shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-slate-400">
          <span>Don't have an account? </span>
          <Link to="/register" className="font-bold text-brand-400 hover:underline">
            Create Customer Account
          </Link>
        </div>

        <div className="text-center pt-2 border-t border-slate-800/80">
          <Link to="/manager/login" className="text-[11px] text-slate-400 hover:text-amber-400 transition font-medium">
            Restaurant Manager Terminal Login →
          </Link>
        </div>
      </div>
    </div>
  );
};
