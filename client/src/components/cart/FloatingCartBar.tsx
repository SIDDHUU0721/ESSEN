import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, UtensilsCrossed } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface FloatingCartBarProps {
  onOpenCart?: () => void;
}

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({ onOpenCart }) => {
  const { totalItems, pricing, restaurantName } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  // Hide on checkout, dedicated cart page, and operational dashboards
  const isExcluded =
    totalItems === 0 ||
    location.pathname === '/cart' ||
    location.pathname === '/checkout' ||
    location.pathname.startsWith('/manager') ||
    location.pathname.startsWith('/waiter') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/delivery') ||
    location.pathname.startsWith('/invoices');

  if (isExcluded) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-2xl animate-in slide-in-from-bottom-4 duration-300">
      <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/95 border border-brand-500/50 shadow-2xl shadow-brand-500/25 backdrop-blur-xl flex items-center justify-between gap-3 text-white ring-1 ring-brand-500/30">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-brand-500/30 flex-shrink-0">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-slate-950 text-[10px] font-black flex items-center justify-center shadow-md">
              {totalItems}
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-extrabold text-white">
                {totalItems} {totalItems === 1 ? 'item' : 'items'} ordered
              </span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="text-brand-400 font-extrabold text-xs sm:text-sm">
                ₹{pricing.itemTotal}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[160px] sm:max-w-[260px]">
              {restaurantName || 'ESSEN Partner Restaurant'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => {
              if (onOpenCart) onOpenCart();
              else navigate('/cart');
            }}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 hidden sm:inline-flex"
          >
            Quick View
          </button>

          <Link
            to="/cart"
            className="px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-brand-500/25 flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <span>View Cart Page</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
