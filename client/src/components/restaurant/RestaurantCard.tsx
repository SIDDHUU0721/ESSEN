import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Award, Bike, Utensils, Clock, Sparkles } from 'lucide-react';
import { Restaurant } from '../../types';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
  return (
    <div className="glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col justify-between group border border-slate-800 bg-slate-900/60">
      {/* Cover Image & Overlay Badges */}
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={restaurant.images?.cover || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600'}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md shadow-md flex items-center gap-1 ${
              restaurant.status === 'OPEN'
                ? 'bg-emerald-500/90 text-white'
                : 'bg-rose-500/90 text-white'
            }`}
          >
            <Clock className="w-3 h-3" />
            {restaurant.status === 'OPEN' ? 'Open Now' : 'Closed'}
          </span>

          {restaurant.rewardsSettings?.isEnabled && (
            <span className="px-2.5 py-1 rounded-full bg-amber-500/90 text-slate-950 text-[11px] font-extrabold shadow-md flex items-center gap-1 backdrop-blur-md">
              <Award className="w-3 h-3" />
              <span>Rewards Ready</span>
            </span>
          )}
        </div>

        {/* Rating & Distance Overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <span className="text-xs font-semibold text-brand-300 tracking-wide uppercase">
              {restaurant.cuisine?.slice(0, 2).join(' • ') || 'Multi-Cuisine'}
            </span>
            <h3 className="text-lg font-bold text-white leading-snug drop-shadow-md">{restaurant.name}</h3>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs font-bold backdrop-blur-md">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{restaurant.rating.toFixed(1)}</span>
            <span className="text-slate-400 text-[10px] font-normal">({restaurant.reviewCount})</span>
          </div>
        </div>
      </div>

      {/* Info Body */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{restaurant.description}</p>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-brand-400" />
            <span className="truncate max-w-[140px]">{restaurant.address.area}, {restaurant.address.city}</span>
          </div>
          <span className="font-semibold text-slate-200">₹{restaurant.averagePriceForTwo} for two</span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Link
            to={`/restaurants/${restaurant._id || restaurant.id}`}
            className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Utensils className="w-3.5 h-3.5 text-brand-400" />
            <span>Menu & Tables</span>
          </Link>

          <Link
            to={`/restaurants/${restaurant._id || restaurant.id}?action=order`}
            className="py-2 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/20 transition-all"
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Order Now</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
