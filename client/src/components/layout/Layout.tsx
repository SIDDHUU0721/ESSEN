import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CartDrawer } from '../cart/CartDrawer';
import { FloatingCartBar } from '../cart/FloatingCartBar';
import { EssenAiDrawer } from '../ai/EssenAiDrawer';
import { Sparkles } from 'lucide-react';

export const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [cartOpen, setCartOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const location = useLocation();

  // Hide Navbar/Footer on special full-screen KDS or focused POS modes if desired
  const isDashboardView =
    location.pathname.startsWith('/manager') ||
    location.pathname.startsWith('/waiter') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/delivery');

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-brand-500 selection:text-white">
      <Navbar onOpenCart={() => setCartOpen(true)} onOpenAi={() => setAiOpen(true)} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children || <Outlet />}
      </main>

      {!isDashboardView && <Footer />}

      {/* Persistent Floating Bottom Cart Bar */}
      <FloatingCartBar onOpenCart={() => setCartOpen(true)} />

      {/* Slide-over Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Floating / Slide-over ESSEN AI Concierge */}
      <EssenAiDrawer isOpen={aiOpen} onClose={() => setAiOpen(false)} />

      {/* Universal Floating AI Action Bubble on Bottom Right */}
      {!aiOpen && (
        <button
          onClick={() => setAiOpen(true)}
          className="fixed bottom-6 right-6 z-30 p-3.5 rounded-full bg-gradient-to-r from-brand-500 via-amber-500 to-brand-600 text-white shadow-2xl shadow-brand-500/50 hover:scale-110 active:scale-95 transition-all glow-orange flex items-center gap-2 group"
          aria-label="Open ESSEN AI Concierge"
        >
          <Sparkles className="w-5 h-5 text-white animate-spin-slow group-hover:rotate-45 transition-transform" />
          <span className="text-xs font-bold tracking-wide pr-1 hidden sm:inline">Ask ESSEN</span>
        </button>
      )}
    </div>
  );
};
