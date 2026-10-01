import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  Award,
  Utensils,
  Bike,
  Star,
  Flame,
  ArrowRight,
  TrendingUp,
  Tag,
  ShieldCheck,
  QrCode,
  Compass,
} from 'lucide-react';
import { api } from '../../services/api';
import { Restaurant, MenuItem } from '../../types';
import { RestaurantCard } from '../../components/restaurant/RestaurantCard';
import { FoodCard } from '../../components/food/FoodCard';
import { FOOD_IMAGES, getFoodImage } from '../../utils/foodImages';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [trendingDishes, setTrendingDishes] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fallbackTrendingDishes: MenuItem[] = [
    {
      _id: 'dish_trend_1',
      restaurant: 'rest_1',
      category: 'cat_1',
      name: 'Royal Awadhi Murgh Dum Biryani',
      description: 'Tender chicken marinated in saffron, rose water, and 24 royal spices, dum cooked with aged basmati rice.',
      price: 280,
      foodType: 'non-vegetarian',
      tasteProfile: 'spicy',
      cuisine: 'North Indian',
      image: FOOD_IMAGES.murghBiryani,
      isTrending: true,
      isBestseller: true,
      rating: 4.9,
      orderCount: 840,
      preparationTimeMinutes: 25,
      isAvailable: true,
    },
    {
      _id: 'dish_trend_2',
      restaurant: 'rest_2',
      category: 'cat_2',
      name: 'Quattro Formaggi & Truffle Pizza',
      description: 'San Marzano tomato base, fresh buffalo mozzarella, gorgonzola, parmesan, and black truffle oil drizzle.',
      price: 380,
      foodType: 'vegetarian',
      tasteProfile: 'savory',
      cuisine: 'Italian',
      image: FOOD_IMAGES.quattroFormaggiPizza,
      isTrending: true,
      isBestseller: true,
      rating: 4.8,
      orderCount: 420,
      preparationTimeMinutes: 18,
      isAvailable: true,
    },
    {
      _id: 'dish_trend_3',
      restaurant: 'rest_1',
      category: 'cat_1',
      name: 'Melt-in-Mouth Galouti Kebabs',
      description: 'Finely minced spiced mutton patties infused with raw papaya and aromatic spices, seared in pure desi ghee.',
      price: 290,
      foodType: 'non-vegetarian',
      tasteProfile: 'spicy',
      cuisine: 'Mughlai',
      image: FOOD_IMAGES.galoutiKebab,
      isTrending: true,
      isBestseller: true,
      rating: 4.9,
      orderCount: 650,
      preparationTimeMinutes: 15,
      isAvailable: true,
    },
    {
      _id: 'dish_trend_4',
      restaurant: 'rest_4',
      category: 'cat_4',
      name: 'Signature Spicy Miso Ramen',
      description: 'Rich 18-hour slow simmered broth, springy noodles, soft ajitsuke tamago, scallions, and nori.',
      price: 340,
      foodType: 'non-vegetarian',
      tasteProfile: 'spicy',
      cuisine: 'Japanese',
      image: FOOD_IMAGES.spicyMisoRamen,
      isTrending: true,
      isBestseller: true,
      rating: 4.8,
      orderCount: 390,
      preparationTimeMinutes: 18,
      isAvailable: true,
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [restRes, dishesRes] = await Promise.all([
          api.get('/restaurants?limit=6'),
          api.get('/restaurants/dishes/search?rating=4.5'),
        ]);

        if (restRes.data?.data && restRes.data.data.length > 0) {
          setRestaurants(restRes.data.data);
        }
        if (dishesRes.data?.data && dishesRes.data.data.length > 0) {
          setTrendingDishes(dishesRes.data.data.slice(0, 4));
        } else {
          setTrendingDishes(fallbackTrendingDishes);
        }
      } catch (err) {
        console.warn('Using seeded data for home display');
        setTrendingDishes(fallbackTrendingDishes);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/restaurants?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/restaurants');
    }
  };

  const quickFilters = [
    { label: 'Pure Veg', query: 'foodType=pure-veg', icon: '🌱' },
    { label: 'Non-Veg', query: 'foodType=non-vegetarian', icon: '🍗' },
    { label: 'Top Rated 4.5+', query: 'rating=4.5', icon: '★' },
    { label: 'Trending', query: 'sortBy=top_rated', icon: '🔥' },
    { label: 'Under ₹300', query: 'priceRange=under_300', icon: '₹' },
    { label: 'Nearby (3 km)', query: 'distance=3', icon: '📍' },
    { label: 'Reward Eligible', query: 'rewardsOnly=true', icon: '🏆' },
  ];

  const cuisines = [
    { name: 'Awadhi Biryani', image: FOOD_IMAGES.murghBiryani, filter: 'Biryani' },
    { name: 'Woodfired Pizza', image: FOOD_IMAGES.quattroFormaggiPizza, filter: 'Italian' },
    { name: 'Tokyo Ramen', image: FOOD_IMAGES.spicyMisoRamen, filter: 'Japanese' },
    { name: 'Royal Kebabs', image: FOOD_IMAGES.galoutiKebab, filter: 'Kebabs' },
    { name: 'Handmade Pasta', image: FOOD_IMAGES.arrabbiataPasta, filter: 'Pasta' },
    { name: 'Satvic Thalis', image: FOOD_IMAGES.maharajaThali, filter: 'Pure Veg' },
    { name: 'North Indian Curries', image: FOOD_IMAGES.paneerLababdar, filter: 'North Indian' },
    { name: 'Royal Desserts', image: FOOD_IMAGES.shahiPhirni, filter: 'Desserts' },
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden glass-card border border-slate-800 p-6 sm:p-12 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 shadow-2xl">
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Next-Gen Gastronomy & Unified Ordering</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Elevated Dining,{' '}
            <span className="bg-gradient-to-r from-brand-400 via-amber-400 to-brand-500 bg-clip-text text-transparent">
              Powered by ESSEN AI
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            From smart table bookings & QR dine-in ordering to ultrafast delivery and transaction-linked loyalty coins
            that unlock free gourmet feast combos.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center max-w-2xl shadow-2xl">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search restaurants, cuisines, dishes (e.g. Veg Biryani, Woodfired Pizza)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-900/90 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="absolute right-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-brand-500/25 transition-all"
            >
              Explore
            </button>
          </form>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs font-semibold text-slate-400">Quick Filters:</span>
            {quickFilters.map((qf, i) => (
              <button
                key={i}
                onClick={() => navigate(`/restaurants?${qf.query}`)}
                className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/50 hover:bg-slate-800 text-xs text-slate-300 hover:text-white transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span>{qf.icon}</span>
                <span>{qf.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ESSEN Rewards Feature Banner */}
      <section className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-amber-950/50 via-slate-900 to-brand-950/50 border border-amber-500/30 overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              <span>Transaction-Linked QR Loyalty</span>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Earn +5 to +10 Coins on Every Order
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Every completed meal generates a secure digital QR voucher. Accumulate 5,000 restaurant-specific coins to
            unlock a **Free Multi-Course Chef Special Combo**!
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            to="/rewards"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-brand-500 hover:from-amber-600 hover:to-brand-600 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl shadow-amber-500/20 flex items-center gap-2 glow-gold transition-all"
          >
            <Award className="w-4 h-4 text-slate-950" />
            <span>Open Rewards Hub</span>
          </Link>
          <Link
            to="/qr-scan"
            className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-brand-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors"
          >
            <QrCode className="w-4 h-4 text-brand-400" />
            <span>Scan Table QR</span>
          </Link>
        </div>
      </section>

      {/* Popular Cuisines Category Strip */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">Popular Cuisines</h2>
            <p className="text-xs text-slate-400">Explore authentic regional & international culinary crafts</p>
          </div>
          <Link to="/restaurants" className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1">
            <span>View All</span> <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3.5">
          {cuisines.map((c, idx) => (
            <button
              key={idx}
              onClick={() => navigate(`/restaurants?cuisine=${encodeURIComponent(c.filter)}`)}
              className="relative rounded-2xl overflow-hidden h-32 group text-left border border-slate-800 hover:border-brand-500/50 transition-all shadow-md"
            >
              <img
                src={c.image}
                alt={c.name}
                onError={(e) => {
                  e.currentTarget.src = getFoodImage(c.name);
                }}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <span className="text-xs font-bold text-white block truncate drop-shadow-md">{c.name}</span>
                <span className="text-[10px] text-brand-400 font-semibold flex items-center gap-0.5 mt-0.5">
                  Explore <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Recommended Restaurants Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
              <span>Top Rated Dining Spots</span>
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            </h2>
            <p className="text-xs text-slate-400">Handcrafted menus, pristine hygiene, verified authenticity</p>
          </div>
          <Link to="/restaurants" className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1">
            <span>See All ({restaurants.length})</span> <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((rest) => (
            <RestaurantCard key={rest._id || rest.id} restaurant={rest} />
          ))}
        </div>
      </section>

      {/* Trending Dishes Grid */}
      {trendingDishes.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
                <span>Trending Culinary Creations</span>
                <Flame className="w-5 h-5 text-rose-500 animate-pulse" />
              </h2>
              <p className="text-xs text-slate-400">Most ordered delicacies by food connoisseurs</p>
            </div>
            <Link to="/search" className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1">
              <span>Search All Dishes</span> <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {trendingDishes.map((dish) => (
              <FoodCard
                key={dish._id}
                item={dish}
                restaurantId={(dish.restaurant as any)?._id || (dish.restaurant as string)}
                restaurantName={(dish.restaurant as any)?.name || 'The Royal Nawabi Kitchen'}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
