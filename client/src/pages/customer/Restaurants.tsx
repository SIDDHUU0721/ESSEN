import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, Star, MapPin, Award, Clock, ArrowUpDown, X, SlidersHorizontal, Search, Store, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { Restaurant } from '../../types';
import { RestaurantCard } from '../../components/restaurant/RestaurantCard';


export const Restaurants: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States initialized from URL or defaults
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [foodType, setFoodType] = useState(searchParams.get('foodType') || 'all');
  const [minRating, setMinRating] = useState(searchParams.get('rating') || 'all');
  const [cuisine, setCuisine] = useState(searchParams.get('cuisine') || 'all');
  const [maxDistance, setMaxDistance] = useState(searchParams.get('distance') || 'all');
  const [serviceType, setServiceType] = useState(searchParams.get('service') || 'all');
  const [openNow, setOpenNow] = useState(searchParams.get('availability') === 'open_now');
  const [rewardsOnly, setRewardsOnly] = useState(searchParams.get('rewardsOnly') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'recommended');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    fetchFilteredRestaurants();
  }, [searchTerm, foodType, minRating, cuisine, maxDistance, serviceType, openNow, rewardsOnly, sortBy]);

  const fetchFilteredRestaurants = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (foodType !== 'all') params.foodType = foodType;
      if (minRating !== 'all') params.rating = minRating;
      if (cuisine !== 'all') params.cuisine = cuisine;
      if (maxDistance !== 'all') params.distance = maxDistance;
      if (serviceType !== 'all') params.service = serviceType;
      if (openNow) params.availability = 'open_now';
      if (rewardsOnly) params.rewardsOnly = 'true';
      if (sortBy !== 'recommended') params.sortBy = sortBy;

      const res = await api.get('/restaurants', { params });
      if (res.data?.data) {
        setRestaurants(res.data.data);
      }
    } catch {
      console.warn('Fallback filtering');
    } finally {
      setLoading(false);
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setFoodType('all');
    setMinRating('all');
    setCuisine('all');
    setMaxDistance('all');
    setServiceType('all');
    setOpenNow(false);
    setRewardsOnly(false);
    setSortBy('recommended');
    setSearchParams({});
  };

  const hasActiveFilters =
    searchTerm ||
    foodType !== 'all' ||
    minRating !== 'all' ||
    cuisine !== 'all' ||
    maxDistance !== 'all' ||
    serviceType !== 'all' ||
    openNow ||
    rewardsOnly;

  return (
    <div className="space-y-6 pb-12">
      {/* Restaurant Partner / Res Hub Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-brand-500/10 to-transparent border border-amber-500/30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Restaurant Partner or Venue Manager?</p>
            <p className="text-[11px] text-slate-400">Add sample restaurants, manage live kitchen KDS, or register your outlet in Res Hub.</p>
          </div>
        </div>
        <Link
          to="/reshub"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-brand-500 hover:from-amber-600 hover:to-brand-600 text-slate-950 text-xs font-black shadow-md flex items-center justify-center gap-1.5 self-start sm:self-auto shrink-0 transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Open Res Hub</span>
        </Link>
      </div>

      {/* Top Search & Filter Bar */}

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl glass-card border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search restaurants by name, cuisine, or neighborhood..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden px-3 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-4 h-4 text-brand-400" />
            <span>Filters</span>
          </button>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-brand-500"
            >
              <option value="recommended">Sort: Recommended</option>
              <option value="top_rated">Sort: Top Rated (★)</option>
              <option value="price_low_high">Price: Low to High</option>
              <option value="price_high_low">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Filter Sidebar + Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Filter Sidebar */}
        <div className={`md:block ${mobileFilterOpen ? 'block' : 'hidden'} space-y-5 glass-card p-5 rounded-2xl border border-slate-800 h-fit sticky top-20`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Filter className="w-4 h-4 text-brand-400" />
              <span>Multi-Filters</span>
            </div>
            {hasActiveFilters && (
              <button onClick={clearAllFilters} className="text-xs text-rose-400 hover:underline">
                Reset All
              </button>
            )}
          </div>

          {/* Food Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Food Classification</label>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {[
                { id: 'all', label: 'All' },
                { id: 'pure-veg', label: 'Pure Veg 🌱' },
                { id: 'vegetarian', label: 'Vegetarian' },
                { id: 'non-vegetarian', label: 'Non-Veg 🍗' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setFoodType(opt.id)}
                  className={`py-1.5 px-2.5 rounded-lg border text-xs font-semibold text-center transition-all ${
                    foodType === opt.id
                      ? 'bg-brand-500/20 border-brand-500 text-brand-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Rating</label>
            <div className="flex gap-1.5 text-xs">
              {[
                { id: 'all', label: 'Any' },
                { id: '4.5', label: '4.5+' },
                { id: '4.0', label: '4.0+' },
                { id: '3.5', label: '3.5+' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setMinRating(opt.id)}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold text-center transition-all ${
                    minRating === opt.id
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cuisine Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Cuisine</label>
            <select
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Cuisines</option>
              <option value="North Indian">North Indian & Mughlai</option>
              <option value="Biryani">Biryani & Kebabs</option>
              <option value="Italian">Italian (Woodfired Pizza / Pasta)</option>
              <option value="South Indian">South Indian</option>
              <option value="Japanese">Japanese & Ramen</option>
              <option value="Asian">Asian Multi-Cuisine</option>
            </select>
          </div>

          {/* Distance Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Proximity (Nearby)</label>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {[
                { id: 'all', label: 'Any Distance' },
                { id: '1', label: 'Within 1 km' },
                { id: '3', label: 'Within 3 km' },
                { id: '5', label: 'Within 5 km' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setMaxDistance(opt.id)}
                  className={`py-1.5 px-2 rounded-lg border text-xs font-semibold text-center transition-all ${
                    maxDistance === opt.id
                      ? 'bg-brand-500/20 border-brand-500 text-brand-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Service Channel */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Service Mode</label>
            <div className="grid grid-cols-3 gap-1 text-xs">
              {[
                { id: 'all', label: 'All' },
                { id: 'dine_in', label: 'Dine-In' },
                { id: 'delivery', label: 'Delivery' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setServiceType(opt.id)}
                  className={`py-1.5 rounded-lg border text-xs font-semibold text-center transition-all ${
                    serviceType === opt.id
                      ? 'bg-brand-500/20 border-brand-500 text-brand-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
              <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Open Now Only
              </span>
              <input
                type="checkbox"
                checked={openNow}
                onChange={(e) => setOpenNow(e.target.checked)}
                className="rounded accent-brand-500"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
              <span className="text-xs text-amber-300 font-semibold flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                ESSEN Rewards Enabled
              </span>
              <input
                type="checkbox"
                checked={rewardsOnly}
                onChange={(e) => setRewardsOnly(e.target.checked)}
                className="rounded accent-amber-500"
              />
            </label>
          </div>
        </div>

        {/* Right Results Grid */}
        <div className="md:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">
              Showing <span className="text-brand-400">{restaurants.length}</span> Verified Restaurant(s)
            </h2>
          </div>

          {restaurants.length === 0 ? (
            <div className="text-center py-20 glass-card rounded-2xl border border-slate-800 space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-slate-500">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-white">No restaurants match your filter criteria</h3>
              <p className="text-xs text-slate-400">Try loosening your dietary, distance, or cuisine filters.</p>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {restaurants.map((rest) => (
                <RestaurantCard key={rest._id || rest.id} restaurant={rest} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
