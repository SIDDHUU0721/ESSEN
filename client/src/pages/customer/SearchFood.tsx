import React, { useState, useEffect } from 'react';
import { Search, Flame, Sparkles, Filter } from 'lucide-react';
import { api } from '../../services/api';
import { MenuItem } from '../../types';
import { FoodCard } from '../../components/food/FoodCard';
import { FOOD_IMAGES, getFoodImage } from '../../utils/foodImages';

export const SearchFood: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dishes, setDishes] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [tasteFilter, setTasteFilter] = useState('all');
  const [foodTypeFilter, setFoodTypeFilter] = useState('all');

  const allDishesCatalog: MenuItem[] = [
    {
      _id: 'sf_1',
      restaurant: 'rest_1',
      category: 'cat_1',
      name: 'Royal Awadhi Murgh Dum Biryani',
      description: 'Tender succulent chicken marinated in saffron, rose water, and 24 royal spices, dum cooked with aged basmati rice.',
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
      _id: 'sf_2',
      restaurant: 'rest_1',
      category: 'cat_1',
      name: 'Subz Nizami Saffron Biryani',
      description: 'Seasonal baby vegetables, paneer cubes, and golden raisins layered with fragrant saffron basmati rice.',
      price: 240,
      foodType: 'vegetarian',
      tasteProfile: 'mild',
      cuisine: 'North Indian',
      image: FOOD_IMAGES.vegBiryani,
      isTrending: true,
      isBestseller: false,
      rating: 4.8,
      orderCount: 420,
      preparationTimeMinutes: 20,
      isAvailable: true,
    },
    {
      _id: 'sf_3',
      restaurant: 'rest_1',
      category: 'cat_2',
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
      _id: 'sf_4',
      restaurant: 'rest_1',
      category: 'cat_3',
      name: 'Paneer Lababdar Special',
      description: 'Fresh cottage cheese batons tossed in a rich cashew onion tomato gravy finished with butter and dried fenugreek.',
      price: 260,
      foodType: 'vegetarian',
      tasteProfile: 'savory',
      cuisine: 'North Indian',
      image: FOOD_IMAGES.paneerLababdar,
      isTrending: false,
      isBestseller: true,
      rating: 4.7,
      orderCount: 390,
      preparationTimeMinutes: 20,
      isAvailable: true,
    },
    {
      _id: 'sf_5',
      restaurant: 'rest_2',
      category: 'cat_p1',
      name: 'Quattro Formaggi & Truffle Pizza',
      description: 'San Marzano tomato base, fresh buffalo mozzarella, gorgonzola, parmesan, fontina, and black truffle oil drizzle.',
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
      _id: 'sf_6',
      restaurant: 'rest_2',
      category: 'cat_p2',
      name: 'Spicy Arrabbiata Penne',
      description: 'Penne pasta tossed in a fiery garlic chili San Marzano tomato sauce with fresh basil and extra virgin olive oil.',
      price: 260,
      foodType: 'vegan',
      tasteProfile: 'spicy',
      cuisine: 'Italian',
      image: FOOD_IMAGES.arrabbiataPasta,
      isTrending: true,
      isBestseller: false,
      rating: 4.7,
      orderCount: 290,
      preparationTimeMinutes: 15,
      isAvailable: true,
    },
    {
      _id: 'sf_7',
      restaurant: 'rest_3',
      category: 'cat_s1',
      name: 'Grand Sattvam Maharaja Thali',
      description: 'An opulent 14-dish satvic thali with paneer makhani, dal makhani, stuffed kulchas, and saffron kheer.',
      price: 350,
      foodType: 'vegetarian',
      tasteProfile: 'mild',
      cuisine: 'South Indian',
      image: FOOD_IMAGES.maharajaThali,
      isTrending: true,
      isBestseller: true,
      rating: 4.9,
      orderCount: 560,
      preparationTimeMinutes: 20,
      isAvailable: true,
    },
    {
      _id: 'sf_8',
      restaurant: 'rest_3',
      category: 'cat_s2',
      name: 'Crispy Ghee Roast Masala Dosa',
      description: 'Golden paper-thin fermented crepe smeared with pure clarified butter, spiced potato masala, and coconut chutneys.',
      price: 160,
      foodType: 'vegetarian',
      tasteProfile: 'savory',
      cuisine: 'South Indian',
      image: FOOD_IMAGES.masalaDosa,
      isTrending: true,
      isBestseller: true,
      rating: 4.8,
      orderCount: 710,
      preparationTimeMinutes: 12,
      isAvailable: true,
    },
    {
      _id: 'sf_9',
      restaurant: 'rest_4',
      category: 'cat_r1',
      name: 'Signature Spicy Miso Ramen',
      description: 'Rich 18-hour slow simmered broth, springy noodles, soft ajitsuke tamago, scallions, chashu, and nori.',
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
    {
      _id: 'sf_10',
      restaurant: 'rest_4',
      category: 'cat_r2',
      name: 'Crispy Pan-Fried Chicken Gyoza',
      description: 'Delicate handmade Japanese dumplings pan-seared to a golden crisp with ponzu sesame dipping sauce.',
      price: 220,
      foodType: 'non-vegetarian',
      tasteProfile: 'savory',
      cuisine: 'Japanese',
      image: FOOD_IMAGES.crispyGyoza,
      isTrending: false,
      isBestseller: true,
      rating: 4.7,
      orderCount: 450,
      preparationTimeMinutes: 14,
      isAvailable: true,
    },
    {
      _id: 'sf_11',
      restaurant: 'rest_1',
      category: 'cat_5',
      name: 'Shahi Saffron Phirni in Clay Pot',
      description: 'Slow-cooked ground rice pudding flavored with green cardamom, Kashmiri saffron, pistachios, and silver vark.',
      price: 110,
      foodType: 'vegetarian',
      tasteProfile: 'sweet',
      cuisine: 'Mughlai',
      image: FOOD_IMAGES.shahiPhirni,
      isTrending: false,
      isBestseller: true,
      rating: 4.9,
      orderCount: 480,
      preparationTimeMinutes: 5,
      isAvailable: true,
    },
    {
      _id: 'sf_12',
      restaurant: 'rest_2',
      category: 'cat_p3',
      name: 'Classic Espresso Mascarpone Tiramisu',
      description: 'Traditional Italian savoiardi ladyfingers soaked in espresso, layered with whipped mascarpone cream and Valrhona cocoa.',
      price: 180,
      foodType: 'vegetarian',
      tasteProfile: 'sweet',
      cuisine: 'Italian',
      image: FOOD_IMAGES.tiramisu,
      isTrending: true,
      isBestseller: true,
      rating: 4.9,
      orderCount: 520,
      preparationTimeMinutes: 5,
      isAvailable: true,
    },
  ];

  useEffect(() => {
    fetchDishes();
  }, [searchTerm, tasteFilter, foodTypeFilter]);

  const fetchDishes = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.query = searchTerm;
      if (tasteFilter !== 'all') params.taste = tasteFilter;
      if (foodTypeFilter !== 'all') params.foodType = foodTypeFilter;

      const res = await api.get('/restaurants/dishes/search', { params });
      if (res.data?.data && res.data.data.length > 0) {
        setDishes(res.data.data);
      } else {
        applyLocalFilter();
      }
    } catch {
      applyLocalFilter();
    } finally {
      setLoading(false);
    }
  };

  const applyLocalFilter = () => {
    let filtered = allDishesCatalog;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.cuisine.toLowerCase().includes(q)
      );
    }
    if (tasteFilter !== 'all') {
      filtered = filtered.filter((d) => d.tasteProfile === tasteFilter);
    }
    if (foodTypeFilter !== 'all') {
      filtered = filtered.filter((d) => d.foodType === foodTypeFilter);
    }
    setDishes(filtered);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Search Header */}
      <div className="p-6 rounded-3xl glass-card border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 space-y-4 shadow-xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Search Multi-Cuisine Dishes</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Search actual menu items across all partner dining spots with taste & dietary preferences.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by dish name (e.g. Veg Biryani, Galouti Kebab, Quattro Formaggi, Ramen)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Taste & Dietary Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 font-semibold">Taste:</span>
          {['all', 'spicy', 'savory', 'mild', 'sweet', 'healthy'].map((t) => (
            <button
              key={t}
              onClick={() => setTasteFilter(t)}
              className={`px-3 py-1.5 rounded-xl border font-semibold capitalize transition-all ${
                tasteFilter === t
                  ? 'bg-brand-500 text-white border-brand-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {t === 'spicy' && '🔥 '}
              {t}
            </button>
          ))}

          <span className="text-slate-400 font-semibold ml-2">Diet:</span>
          {['all', 'vegetarian', 'non-vegetarian', 'vegan'].map((d) => (
            <button
              key={d}
              onClick={() => setFoodTypeFilter(d)}
              className={`px-3 py-1.5 rounded-xl border font-semibold capitalize transition-all ${
                foodTypeFilter === d
                  ? 'bg-emerald-500 text-white border-emerald-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div>
        <h2 className="text-sm font-bold text-slate-300 mb-4">
          Found <span className="text-brand-400">{dishes.length}</span> Delicacies
        </h2>

        {dishes.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-2xl border border-slate-800 space-y-2">
            <p className="text-slate-400 text-sm">No dishes found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {dishes.map((dish) => (
              <FoodCard
                key={dish._id}
                item={dish}
                restaurantId={(dish.restaurant as any)?._id || (dish.restaurant as string)}
                restaurantName={(dish.restaurant as any)?.name || 'The Royal Nawabi Kitchen'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
