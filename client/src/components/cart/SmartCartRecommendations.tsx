import React, { useState } from 'react';
import { Sparkles, Plus, Check, ShoppingBag } from 'lucide-react';
import { CartItem, MenuItem } from '../../types';
import { useCart } from '../../context/CartContext';
import { getFoodImage, FOOD_IMAGES } from '../../utils/foodImages';

interface SmartCartRecommendationsProps {
  items: CartItem[];
  isCompact?: boolean;
}

interface RecommendedAddon {
  id: string;
  name: string;
  description: string;
  price: number;
  foodType: 'vegetarian' | 'non-vegetarian' | 'vegan';
  cuisine: string;
  image: string;
  matchingKeywords: string[];
  dietaryTags?: string[];
  calories?: number;
}

// Curated Pairing Database across Indian, Italian, Satvic, Japanese, and Continental
const CURATED_PAIRINGS: RecommendedAddon[] = [
  {
    id: 'addon_garlic_naan',
    name: 'Butter Garlic Naan Basket',
    description: 'Charred in traditional clay tandoor with fresh minced garlic and pure butter.',
    price: 75,
    foodType: 'vegetarian',
    cuisine: 'North Indian',
    image: FOOD_IMAGES.garlicNaan,
    matchingKeywords: ['biryani', 'curry', 'paneer', 'rogan', 'dal', 'kebab', 'nawabi', 'tikka', 'dum'],
    dietaryTags: ['Pure Veg'],
    calories: 220,
  },
  {
    id: 'addon_shahi_phirni',
    name: 'Shahi Saffron Phirni in Clay Pot',
    description: 'Ground rice dessert slow-cooked in rich milk, saffron, and slivered pistachios.',
    price: 110,
    foodType: 'vegetarian',
    cuisine: 'Mughlai',
    image: FOOD_IMAGES.shahiPhirni,
    matchingKeywords: ['biryani', 'kebab', 'dum', 'mutton', 'chicken', 'galouti', 'nawabi'],
    dietaryTags: ['Pure Veg', 'Gluten-Free'],
    calories: 260,
  },
  {
    id: 'addon_gulab_jamun',
    name: 'Warm Gulab Jamun with Malpua',
    description: 'Soft melt-in-mouth milk dumplings steeped in fragrant cardamom syrup.',
    price: 95,
    foodType: 'vegetarian',
    cuisine: 'North Indian',
    image: FOOD_IMAGES.gulabJamunRabdi,
    matchingKeywords: ['biryani', 'thali', 'paneer', 'curry', 'rice', 'sattvam'],
    dietaryTags: ['Pure Veg'],
    calories: 290,
  },
  {
    id: 'addon_garlic_bread',
    name: 'Cheesy Garlic Breadsticks',
    description: 'Crispy herb-crusted breadsticks loaded with melted whole milk mozzarella.',
    price: 140,
    foodType: 'vegetarian',
    cuisine: 'Italian',
    image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=600&auto=format&fit=crop&q=80',
    matchingKeywords: ['pizza', 'pasta', 'arrabbiata', 'fettuccine', 'margherita', 'bella', 'italian'],
    dietaryTags: ['Vegetarian'],
    calories: 310,
  },
  {
    id: 'addon_tiramisu',
    name: 'Artisan Savoiardi Tiramisu',
    description: 'Espresso-soaked ladyfingers with whipped mascarpone cream and Belgian cocoa.',
    price: 180,
    foodType: 'vegetarian',
    cuisine: 'Italian',
    image: FOOD_IMAGES.tiramisu,
    matchingKeywords: ['pizza', 'pasta', 'lasagna', 'margherita', 'bella', 'italian'],
    dietaryTags: ['Vegetarian'],
    calories: 340,
  },
  {
    id: 'addon_lassi',
    name: 'Kesariya Dry Fruit Sweet Lassi',
    description: 'Thick churned creamy yogurt infused with saffron, green cardamom, and almonds.',
    price: 85,
    foodType: 'vegetarian',
    cuisine: 'South Indian',
    image: FOOD_IMAGES.lassiBeverage,
    matchingKeywords: ['thali', 'satvic', 'dosa', 'sattvam', 'biryani', 'spicy'],
    dietaryTags: ['Pure Veg', 'Gluten-Free'],
    calories: 190,
  },
  {
    id: 'addon_gyoza',
    name: 'Crispy Pan-Fried Gyoza (6 Pcs)',
    description: 'Pan-seared Japanese dumplings with scallions, ginger, and sesame soy glaze.',
    price: 180,
    foodType: 'non-vegetarian',
    cuisine: 'Japanese',
    image: FOOD_IMAGES.crispyGyoza,
    matchingKeywords: ['ramen', 'miso', 'tonkotsu', 'noodles', 'tokyo', 'japanese', 'sushi'],
    dietaryTags: ['High Protein'],
    calories: 280,
  },
  {
    id: 'addon_matcha_cheesecake',
    name: 'Uji Matcha Basque Cheesecake',
    description: 'Creamy caramelised Basque cheesecake crafted with ceremonial grade green tea.',
    price: 195,
    foodType: 'vegetarian',
    cuisine: 'Japanese',
    image: FOOD_IMAGES.matchaCheesecake,
    matchingKeywords: ['ramen', 'tokyo', 'japanese', 'sushi', 'noodles'],
    dietaryTags: ['Vegetarian'],
    calories: 320,
  },
  {
    id: 'addon_croissant',
    name: 'Almond Butter Croissant',
    description: 'Golden flaky French pastry filled with frangipane and toasted sliced almonds.',
    price: 130,
    foodType: 'vegetarian',
    cuisine: 'Bakery',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80',
    matchingKeywords: ['coffee', 'cafe', 'parisien', 'pastry', 'bakery', 'croissant'],
    dietaryTags: ['Vegetarian'],
    calories: 270,
  },
];

export const SmartCartRecommendations: React.FC<SmartCartRecommendationsProps> = ({
  items,
  isCompact = false,
}) => {
  const { addToCart, restaurantId, restaurantName } = useCart();
  const [addedItemIds, setAddedItemIds] = useState<string[]>([]);

  if (items.length === 0) return null;

  // Collect keywords from all dishes currently in cart
  const cartKeywords = items
    .flatMap((item) => [
      item.menuItem.name.toLowerCase(),
      (item.menuItem.cuisine || '').toLowerCase(),
      (item.restaurantName || '').toLowerCase(),
    ])
    .join(' ');

  // Filter out items that are already in cart by name matching
  const currentItemNames = items.map((i) => i.menuItem.name.toLowerCase());

  // Rank recommended pairings by keyword match frequency
  const rankedRecommendations = CURATED_PAIRINGS.filter((addon) => {
    // Exclude if already in cart
    if (currentItemNames.some((n) => n.includes(addon.name.toLowerCase()) || addon.name.toLowerCase().includes(n))) {
      return false;
    }
    // Exclude if addon already added in this session
    if (addedItemIds.includes(addon.id)) {
      return true; // Still show with "Added" state
    }
    return true;
  })
    .map((addon) => {
      let score = 0;
      for (const kw of addon.matchingKeywords) {
        if (cartKeywords.includes(kw)) score += 2;
      }
      return { addon, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, isCompact ? 3 : 4)
    .map((r) => r.addon);

  if (rankedRecommendations.length === 0) return null;

  const handleAddAddon = (addon: RecommendedAddon) => {
    const menuItem: MenuItem = {
      _id: addon.id,
      name: addon.name,
      description: addon.description,
      price: addon.price,
      foodType: addon.foodType,
      tasteProfile: 'mild',
      cuisine: addon.cuisine,
      image: addon.image,
      restaurant: restaurantId || 'rest_1',
      category: 'Recommended Add-ons',
      isAvailable: true,
      rating: 4.9,
      orderCount: 450,
      preparationTimeMinutes: 10,
      dietaryTags: addon.dietaryTags,
      calories: addon.calories,
    };

    addToCart(menuItem, restaurantId || 'rest_1', restaurantName || 'ESSEN Partner', 1);
    setAddedItemIds((prev) => [...prev, addon.id]);
  };

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-950/20 via-slate-950 to-slate-900 border border-brand-500/30 space-y-3 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-brand-400 animate-pulse" />
          <h4 className="text-xs sm:text-sm font-extrabold text-white">
            Frequently Paired Together
          </h4>
        </div>
        <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
          Smart AI Recommendations
        </span>
      </div>

      <p className="text-[11px] text-slate-400 leading-snug">
        Popular accompaniments and desserts that complement your cart selection:
      </p>

      {/* Recommended Items Grid */}
      <div
        className={
          isCompact
            ? 'space-y-2'
            : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'
        }
      >
        {rankedRecommendations.map((addon) => {
          const isAdded = addedItemIds.includes(addon.id);
          const dishPhoto = getFoodImage(addon.name, addon.cuisine, addon.image);

          return (
            <div
              key={addon.id}
              className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                isAdded
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-800 shadow-sm">
                  <img
                    src={dishPhoto}
                    alt={addon.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <span
                    className={`absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full border border-slate-950 ${
                      addon.foodType === 'vegetarian'
                        ? 'bg-emerald-500'
                        : addon.foodType === 'vegan'
                        ? 'bg-green-400'
                        : 'bg-rose-500'
                    }`}
                  />
                </div>

                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-white truncate max-w-[130px] sm:max-w-[160px]">
                    {addon.name}
                  </h5>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs font-extrabold text-brand-400">
                      ₹{addon.price}
                    </span>
                    {addon.calories && (
                      <span className="text-[10px] text-slate-500">
                        • {addon.calories} kcal
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {isAdded ? (
                <span className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-[11px] font-extrabold flex items-center gap-1 flex-shrink-0 border border-emerald-500/30">
                  <Check className="w-3.5 h-3.5" />
                  <span>Added</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleAddAddon(addon)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-brand-500/20 active:scale-95 transition-all flex-shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
