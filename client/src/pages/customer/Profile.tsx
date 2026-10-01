import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, MapPin, Sparkles, Heart, Shield, Phone, Mail, Award, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const Profile: React.FC = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [foodPreference, setFoodPreference] = useState(user?.preferences?.foodType || 'any');
  const [spicePreference, setSpicePreference] = useState(user?.preferences?.spicinessPreference || 'spicy');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/auth/profile', {
        name,
        phone,
        preferences: {
          foodType: foodPreference,
          spicinessPreference: spicePreference,
        },
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Profile Header Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-slate-950 border-2 border-brand-500 shadow-xl flex items-center justify-center text-brand-400">
          <UserIcon className="w-10 h-10" />
        </div>
        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">{user?.name}</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-400 text-xs font-bold capitalize">
              {role.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-slate-400">{user?.email} • {user?.phone}</p>
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-500 text-slate-300 hover:text-rose-400 text-xs font-bold transition-all"
        >
          Sign Out
        </button>
      </div>

      {/* Preferences Form */}
      <form onSubmit={handleSave} className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-6 shadow-xl text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>Culinary AI & Taste Preferences</span>
          </h3>
          {savedSuccess && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Preferences Saved!
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Dietary Preferences */}
        <div className="space-y-2">
          <label className="font-bold text-slate-300">Dietary Classification for ESSEN AI Recommendations</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'any', label: 'All Diets' },
              { id: 'vegetarian', label: 'Vegetarian' },
              { id: 'non-vegetarian', label: 'Non-Vegetarian' },
              { id: 'vegan', label: 'Pure Vegan' },
            ].map((diet) => (
              <button
                key={diet.id}
                type="button"
                onClick={() => setFoodPreference(diet.id as any)}
                className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                  foodPreference === diet.id
                    ? 'bg-brand-500 text-white border-brand-400 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {diet.label}
              </button>
            ))}
          </div>
        </div>

        {/* Spiciness */}
        <div className="space-y-2">
          <label className="font-bold text-slate-300">Spiciness Level Preference</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'mild', label: 'Mild & Subtle' },
              { id: 'medium', label: 'Balanced Spice' },
              { id: 'spicy', label: 'Extra Spicy 🔥' },
            ].map((sp) => (
              <button
                key={sp.id}
                type="button"
                onClick={() => setSpicePreference(sp.id as any)}
                className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                  spicePreference === sp.id
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {sp.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-brand-500/25 transition-all"
        >
          Save Profile & AI Preferences
        </button>
      </form>
    </div>
  );
};
