import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Sparkles, Award, Shield, Phone, Mail, MapPin, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 mt-20 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">ESSEN</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              AI-Powered Unified Restaurant & Dining Platform. Integrating Dine-In QR Ordering, Online Delivery, Kitchen
              KDS, and Multi-Tier Loyalty Coin Vouchers.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Powered by ESSEN AI Engine</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Customer Hub</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/restaurants" className="hover:text-brand-400 transition-colors">Discover Restaurants</Link></li>
              <li><Link to="/search" className="hover:text-brand-400 transition-colors">Search Multi-Cuisine Food</Link></li>
              <li><Link to="/rewards" className="hover:text-brand-400 transition-colors">ESSEN Loyalty & Reward Coins</Link></li>
              <li><Link to="/qr-scan" className="hover:text-brand-400 transition-colors">Table QR Ordering</Link></li>
              <li><Link to="/orders" className="hover:text-brand-400 transition-colors">Track Active Orders</Link></li>
            </ul>
          </div>

          {/* Business Portals */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Restaurant Portals</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/reshub" className="text-amber-400 font-bold hover:underline flex items-center gap-1">★ Res Hub (Outlets & Venues)</Link></li>
              <li><Link to="/manager/dashboard" className="hover:text-amber-400 transition-colors">Manager Dashboard</Link></li>
              <li><Link to="/manager/dashboard" className="hover:text-amber-400 transition-colors">Live Kitchen KDS Display</Link></li>
              <li><Link to="/waiter/dashboard" className="hover:text-emerald-400 transition-colors">Waiter Assistance Portal</Link></li>
              <li><Link to="/delivery/dashboard" className="hover:text-cyan-400 transition-colors">Delivery Partner App</Link></li>
              <li><Link to="/admin/dashboard" className="hover:text-rose-400 transition-colors">Platform Administration</Link></li>
            </ul>
          </div>


          {/* Contact & Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Contact & Support</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-400" />
                <span>Nungambakkam & OMR, Chennai, India</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400" />
                <span>+91 98765 43210 / 1800-ESSEN-FOOD</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400" />
                <span>concierge@essen.restaurant</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>FSSAI & GST Compliant</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 text-center flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} ESSEN Technologies Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Next-Gen Gastronomy
          </p>
        </div>
      </div>
    </footer>
  );
};
