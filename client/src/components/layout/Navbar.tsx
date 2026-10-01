import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  ShoppingBag,
  Award,
  Search,
  User as UserIcon,
  ChefHat,
  UtensilsCrossed,
  ShieldCheck,
  Bike,
  LogOut,
  QrCode,
  Compass,
  Menu,
  X,
  History,
  Store,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { UserRole } from '../../types';

interface NavbarProps {
  onOpenCart: () => void;
  onOpenAi: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCart, onOpenAi }) => {
  const { user, role, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const totalCartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const navLinks = [
    { name: 'Home', path: '/home', icon: Compass },
    { name: 'Restaurants', path: '/restaurants', icon: UtensilsCrossed },
    { name: 'Res Hub', path: '/reshub', icon: Store, isHighlight: true },
    { name: 'Search Food', path: '/search', icon: Search },
    { name: 'Scan Table QR', path: '/qr-scan', icon: QrCode },
    { name: 'Rewards Hub', path: '/rewards', icon: Award },
    { name: 'My Orders', path: '/orders', icon: History },
  ];


  return (
    <header className="sticky top-0 z-40 w-full glass-card border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link to="/home" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-brand-400 bg-clip-text text-transparent">
                  ESSEN
                </span>
                <span className="text-[10px] tracking-wider text-brand-400 font-semibold uppercase -mt-1">
                  Unified Dining
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link: any) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? link.isHighlight
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm font-bold'
                          : 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                        : link.isHighlight
                        ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.name}
                  </Link>
                );
              })}
            </nav>

          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-3">
            {/* ESSEN AI Sparkle Trigger */}
            <button
              onClick={onOpenAi}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-900/60 to-brand-900/60 border border-purple-500/30 text-purple-200 text-xs font-semibold hover:border-purple-400 hover:glow-orange transition-all group"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-spin-slow group-hover:scale-110 transition-transform" />
              <span>ESSEN AI</span>
            </button>

            {/* Cart Button with Total Count of Items Ordered */}
            <Link
              to="/cart"
              className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-brand-500/50 transition-colors flex items-center gap-1.5 group"
              aria-label={`View Cart - ${totalCartCount} items ordered`}
              title={`${totalCartCount} items ordered - View Cart Page`}
            >
              <ShoppingBag className="w-5 h-5 text-brand-400 group-hover:scale-105 transition-transform" />
              {totalCartCount > 0 ? (
                <>
                  <span className="hidden sm:inline text-xs font-extrabold text-white pr-1">
                    {totalCartCount}
                  </span>
                  <span className="absolute -top-1 -right-1 sm:hidden w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-black flex items-center justify-center shadow-lg shadow-brand-500/50">
                    {totalCartCount}
                  </span>
                </>
              ) : null}
            </Link>

            {/* Profile / Auth Status */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 border-l border-slate-800 text-xs text-slate-300 hover:text-white transition group"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-900 border border-brand-500/40 group-hover:border-brand-400 flex items-center justify-center text-brand-400 transition">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <span className="font-semibold hidden sm:inline max-w-[120px] truncate">{user?.name || 'Account'}</span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-1.5 border-b border-slate-800">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-brand-500/20 text-brand-400 capitalize">
                        {role.replace('_', ' ')}
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-slate-300 hover:bg-slate-800 hover:text-white transition"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      My Profile
                    </Link>

                    <Link
                      to="/reshub"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-amber-400 hover:bg-amber-500/10 transition font-bold"
                    >
                      <Store className="w-3.5 h-3.5" />
                      Res Hub (Manage Outlets)
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-slate-300 hover:bg-slate-800 hover:text-white transition"
                    >
                      <History className="w-3.5 h-3.5 text-slate-400" />
                      My Orders
                    </Link>

                    <Link
                      to="/rewards"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-slate-300 hover:bg-slate-800 hover:text-white transition"
                    >
                      <Award className="w-3.5 h-3.5 text-slate-400" />
                      Rewards Hub
                    </Link>


                    <div className="border-t border-slate-800 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition font-semibold"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-850 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20 transition"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-900"
              >
                <Icon className="w-4 h-4 text-brand-400" />
                {link.name}
              </Link>
            );
          })}
          {role === 'manager' && (
            <Link
              to="/manager/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-amber-400 bg-amber-500/10"
            >
              <ChefHat className="w-4 h-4" /> Manager Portal
            </Link>
          )}
          {role === 'waiter' && (
            <Link
              to="/waiter/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-emerald-400 bg-emerald-500/10"
            >
              <UtensilsCrossed className="w-4 h-4" /> Waiter Portal
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
