/**
 * Curated High-Definition Food Photography Database
 * All photos are high-res, optimized gourmet food photography from Unsplash with focal centering.
 */

export const FOOD_IMAGES = {
  // --- Biryanis & Rice Dishes ---
  murghBiryani: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
  vegBiryani: 'https://images.unsplash.com/photo-1642821373181-696a54913e93?w=800&auto=format&fit=crop&q=80',
  hyderabadiBiryani: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80',
  pulaoRice: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&auto=format&fit=crop&q=80',

  // --- Kebabs, Tikkas & Starters (Replaced fish tank with authentic Galouti Kebabs & Tandoor starters) ---
  galoutiKebab: '/images/dishes/galouti-kebab.jpg',
  seekhKebab: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80',
  paneerTikka: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&auto=format&fit=crop&q=80',
  tandooriPlatter: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&auto=format&fit=crop&q=80',

  // --- Curries & Gravies ---
  paneerLababdar: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=80',
  dalMakhani: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
  butterPaneer: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=80',
  roganJosh: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=800&auto=format&fit=crop&q=80',

  // --- Artisanal Breads (Replaced samosas & fried chicken with tandoor charred garlic naan basket) ---
  garlicNaan: '/images/dishes/garlic-naan.jpg',
  stuffedKulcha: '/images/dishes/garlic-naan.jpg',
  rotiBasket: '/images/dishes/garlic-naan.jpg',

  // --- Woodfired Pizzas ---
  quattroFormaggiPizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
  margheritaPizza: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&auto=format&fit=crop&q=80',
  truffleMushroomPizza: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&auto=format&fit=crop&q=80',
  diavolaPepperoniPizza: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=800&auto=format&fit=crop&q=80',

  // --- Artisanal Pastas & Italian (Fixed 404 broken penne arrabbiata) ---
  arrabbiataPasta: '/images/dishes/penne-arrabbiata.jpg',
  truffleFettuccine: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=800&auto=format&fit=crop&q=80',
  bruschetta: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=800&auto=format&fit=crop&q=80',
  tiramisu: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&auto=format&fit=crop&q=80',

  // --- Satvic & South Indian (Replaced roast chicken & salad with authentic Thali & Appam Stew) ---
  maharajaThali: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80',
  masalaDosa: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&auto=format&fit=crop&q=80',
  idliVadaPlatter: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
  vegetableStew: '/images/dishes/appam-stew.jpg',
  lassiBeverage: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=800&auto=format&fit=crop&q=80',

  // --- Japanese & Asian (Replaced smoothies with matcha cheesecake) ---
  spicyMisoRamen: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80',
  tonkotsuRamen: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=800&auto=format&fit=crop&q=80',
  crispyGyoza: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&auto=format&fit=crop&q=80',
  sushiPlatter: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop&q=80',
  teriyakiDonburi: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
  matchaCheesecake: '/images/dishes/matcha-cheesecake.jpg',

  // --- Desserts & Sweets (Replaced sleeping cat and sandwich with authentic royal Indian sweets) ---
  shahiPhirni: '/images/dishes/shahi-phirni.jpg',
  gulabJamunRabdi: '/images/dishes/rabdi-malpua.jpg',
  chocolateFondant: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=80',

  // --- Universal Fallback ---
  gourmetFeastFallback: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80',
};

/**
 * High-Resolution Reward Combo Feast Photography
 */
export const REWARD_COMBO_PHOTOS: Record<string, string> = {
  nawabi: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=1000&auto=format&fit=crop&q=80',
  bella: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000&auto=format&fit=crop&q=80',
  sattvam: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=1000&auto=format&fit=crop&q=80',
  tokyo: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1000&auto=format&fit=crop&q=80',
  default: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&auto=format&fit=crop&q=80',
};

// Blacklisted unverified/erroneous stock photos (sleeping cat, fish tank, broken 404, non-food items)
const BLACKLISTED_IMAGE_PATTERNS = [
  'photo-1541781774459-bb2af2f05b55', // Sleeping cat
  'photo-1599488615731-7e5c2823ff28', // Fish tank / aquarium
  'photo-1621996346565-e3d5d62817ee', // 404 broken penne image
  'photo-1528735602780-2552fd46c7af', // Grilled sandwich for gulab jamun
  'photo-1626082927389-6cd097cdc6ec', // Fried chicken for roti basket
  'photo-1505252585461-04db1eb84625', // Smoothie glasses for matcha cheesecake
  'photo-1610057099443-fde8c4d50f91', // Roast chicken for satvic thali
  'photo-1572490122747-3968b75cc699', // Oreo milkshake for lassi
  'photo-1512621776951-a57141f2eefd', // Salad bowl for vegetable stew
  'placeholder',
];

/**
 * Intelligent food image resolver based on dish name, description, and cuisine keywords.
 */
export function getFoodImage(dishName?: string, cuisine?: string, existingUrl?: string): string {
  if (existingUrl && existingUrl.trim()) {
    const isBlacklisted = BLACKLISTED_IMAGE_PATTERNS.some((pat) => existingUrl.includes(pat));
    if (!isBlacklisted && (existingUrl.startsWith('http') || existingUrl.startsWith('/'))) {
      return existingUrl;
    }
  }

  const name = (dishName || '').toLowerCase();
  const c = (cuisine || '').toLowerCase();

  // Biryani matching
  if (name.includes('biryani') || name.includes('dum')) {
    if (name.includes('veg') || name.includes('subz') || name.includes('paneer')) {
      return FOOD_IMAGES.vegBiryani;
    }
    return FOOD_IMAGES.murghBiryani;
  }

  // Kebab / Tikka / Tandoori
  if (name.includes('galouti') || name.includes('kebab') || name.includes('kabab')) {
    return FOOD_IMAGES.galoutiKebab;
  }
  if (name.includes('seekh') || name.includes('tandoori')) {
    return FOOD_IMAGES.seekhKebab;
  }
  if (name.includes('tikka') || name.includes('angara')) {
    return FOOD_IMAGES.paneerTikka;
  }

  // Pizzas
  if (name.includes('pizza')) {
    if (name.includes('margherita') || name.includes('classic')) {
      return FOOD_IMAGES.margheritaPizza;
    }
    if (name.includes('formaggi') || name.includes('cheese') || name.includes('truffle')) {
      return FOOD_IMAGES.quattroFormaggiPizza;
    }
    if (name.includes('pepperoni') || name.includes('spicy') || name.includes('diavola')) {
      return FOOD_IMAGES.diavolaPepperoniPizza;
    }
    return FOOD_IMAGES.truffleMushroomPizza;
  }

  // Pastas
  if (name.includes('pasta') || name.includes('penne') || name.includes('arrabbiata')) {
    return FOOD_IMAGES.arrabbiataPasta;
  }
  if (name.includes('fettuccine') || name.includes('alfredo') || name.includes('spaghetti')) {
    return FOOD_IMAGES.truffleFettuccine;
  }
  if (name.includes('bruschetta') || name.includes('crostini') || name.includes('starter')) {
    return FOOD_IMAGES.bruschetta;
  }

  // Japanese / Asian / Ramen
  if (name.includes('ramen') || name.includes('miso')) {
    return FOOD_IMAGES.spicyMisoRamen;
  }
  if (name.includes('tonkotsu') || name.includes('chashu') || name.includes('noodle')) {
    return FOOD_IMAGES.tonkotsuRamen;
  }
  if (name.includes('gyoza') || name.includes('dumpling') || name.includes('dim sum')) {
    return FOOD_IMAGES.crispyGyoza;
  }
  if (name.includes('sushi') || name.includes('sashimi') || name.includes('roll') || name.includes('maki')) {
    return FOOD_IMAGES.sushiPlatter;
  }
  if (name.includes('teriyaki') || name.includes('donburi') || name.includes('bowl')) {
    return FOOD_IMAGES.teriyakiDonburi;
  }

  // South Indian / Satvic
  if (name.includes('thali') || name.includes('platter') || name.includes('feast')) {
    return FOOD_IMAGES.maharajaThali;
  }
  if (name.includes('dosa') || name.includes('roast')) {
    return FOOD_IMAGES.masalaDosa;
  }
  if (name.includes('idli') || name.includes('vada') || name.includes('sambar')) {
    return FOOD_IMAGES.idliVadaPlatter;
  }
  if (name.includes('stew') || name.includes('appam')) {
    return FOOD_IMAGES.vegetableStew;
  }

  // Curries & Gravies
  if (name.includes('lababdar') || name.includes('paneer')) {
    return FOOD_IMAGES.paneerLababdar;
  }
  if (name.includes('dal') || name.includes('makhani')) {
    return FOOD_IMAGES.dalMakhani;
  }
  if (name.includes('curry') || name.includes('masala') || name.includes('gravy')) {
    return FOOD_IMAGES.butterPaneer;
  }
  if (name.includes('mutton') || name.includes('rogan') || name.includes('gosht')) {
    return FOOD_IMAGES.roganJosh;
  }

  // Breads
  if (name.includes('naan') || name.includes('garlic')) {
    return FOOD_IMAGES.garlicNaan;
  }
  if (name.includes('kulcha') || name.includes('paratha')) {
    return FOOD_IMAGES.stuffedKulcha;
  }
  if (name.includes('roti') || name.includes('roomali') || name.includes('bread')) {
    return FOOD_IMAGES.rotiBasket;
  }

  // Desserts
  if (name.includes('phirni') || name.includes('kheer')) {
    return FOOD_IMAGES.shahiPhirni;
  }
  if (name.includes('tiramisu')) {
    return FOOD_IMAGES.tiramisu;
  }
  if (name.includes('rabdi') || name.includes('malpua') || name.includes('jamun') || name.includes('halwa')) {
    return FOOD_IMAGES.gulabJamunRabdi;
  }
  if (name.includes('matcha') || name.includes('cheesecake') || name.includes('cake')) {
    return FOOD_IMAGES.matchaCheesecake;
  }
  if (name.includes('chocolate') || name.includes('fondant') || name.includes('brownie')) {
    return FOOD_IMAGES.chocolateFondant;
  }
  if (name.includes('lassi') || name.includes('drink') || name.includes('beverage') || name.includes('tea')) {
    return FOOD_IMAGES.lassiBeverage;
  }

  // Cuisine-level fallback
  if (c.includes('italian') || c.includes('pizza') || c.includes('pasta')) {
    return FOOD_IMAGES.quattroFormaggiPizza;
  }
  if (c.includes('japanese') || c.includes('asian') || c.includes('ramen')) {
    return FOOD_IMAGES.spicyMisoRamen;
  }
  if (c.includes('south indian') || c.includes('pure veg')) {
    return FOOD_IMAGES.maharajaThali;
  }
  if (c.includes('mughlai') || c.includes('north indian') || c.includes('biryani')) {
    return FOOD_IMAGES.murghBiryani;
  }

  return FOOD_IMAGES.gourmetFeastFallback;
}

/**
 * Resolve reward combo feast image by restaurant name or slug
 */
export function getRewardComboImage(restaurantName?: string): string {
  const n = (restaurantName || '').toLowerCase();
  if (n.includes('nawabi') || n.includes('royal')) return REWARD_COMBO_PHOTOS.nawabi;
  if (n.includes('bella') || n.includes('napoli') || n.includes('italian')) return REWARD_COMBO_PHOTOS.bella;
  if (n.includes('sattvam') || n.includes('vegetarian')) return REWARD_COMBO_PHOTOS.sattvam;
  if (n.includes('tokyo') || n.includes('ramen') || n.includes('blossom')) return REWARD_COMBO_PHOTOS.tokyo;
  return REWARD_COMBO_PHOTOS.default;
}

import { MenuItem } from '../types';

/**
 * Returns full verified menus with high-res food photos for partner restaurants
 */
export function getDishesForRestaurant(restaurantName?: string, restaurantId = 'rest_default'): MenuItem[] {
  const n = (restaurantName || '').toLowerCase();

  if (n.includes('bella') || n.includes('napoli') || n.includes('italian')) {
    return [
      {
        _id: `${restaurantId}_d1`,
        restaurant: restaurantId,
        category: 'cat_pizza',
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
        orderCount: 380,
        preparationTimeMinutes: 18,
        isAvailable: true,
      },
      {
        _id: `${restaurantId}_d2`,
        restaurant: restaurantId,
        category: 'cat_pizza',
        name: 'Margherita Classica di Bufala',
        description: 'Crushed sweet San Marzano tomatoes, fresh creamy buffalo mozzarella, sweet Italian basil leaves, and cold-pressed olive oil.',
        price: 320,
        foodType: 'vegetarian',
        tasteProfile: 'savory',
        cuisine: 'Italian',
        image: FOOD_IMAGES.margheritaPizza,
        isTrending: false,
        isBestseller: true,
        rating: 4.9,
        orderCount: 620,
        preparationTimeMinutes: 15,
        isAvailable: true,
      },
      {
        _id: `${restaurantId}_d3`,
        restaurant: restaurantId,
        category: 'cat_pizza',
        name: 'Spicy Diavola Pepperoni Pizza',
        description: 'Signature crispy sourdough crust topped with spicy artisanal salami, pickled jalapenos, chili honey drizzle, and mozzarella.',
        price: 410,
        foodType: 'non-vegetarian',
        tasteProfile: 'spicy',
        cuisine: 'Italian',
        image: FOOD_IMAGES.diavolaPepperoniPizza,
        isTrending: true,
        isBestseller: true,
        rating: 4.8,
        orderCount: 440,
        preparationTimeMinutes: 18,
        isAvailable: true,
      },
      {
        _id: `${restaurantId}_d4`,
        restaurant: restaurantId,
        category: 'cat_pasta',
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
        _id: `${restaurantId}_d5`,
        restaurant: restaurantId,
        category: 'cat_pasta',
        name: 'Truffle Fettuccine Al Funghi',
        description: 'Fresh ribbon pasta folded in a velvet butter emulsion of wild porcini mushrooms, black summer truffle paste, and Parmigiano Reggiano.',
        price: 340,
        foodType: 'vegetarian',
        tasteProfile: 'savory',
        cuisine: 'Italian',
        image: FOOD_IMAGES.truffleFettuccine,
        isTrending: true,
        isBestseller: true,
        rating: 4.9,
        orderCount: 350,
        preparationTimeMinutes: 16,
        isAvailable: true,
      },
      {
        _id: `${restaurantId}_d6`,
        restaurant: restaurantId,
        category: 'cat_dessert',
        name: 'Classic Espresso Mascarpone Tiramisu',
        description: 'Traditional Italian savoiardi ladyfingers soaked in dark roast espresso, layered with whipped sweet mascarpone cream and dusted with Valrhona cocoa.',
        price: 190,
        foodType: 'vegetarian',
        tasteProfile: 'sweet',
        cuisine: 'Italian',
        image: FOOD_IMAGES.tiramisu,
        isTrending: true,
        isBestseller: true,
        rating: 4.9,
        orderCount: 480,
        preparationTimeMinutes: 5,
        isAvailable: true,
      },
    ];
  }

  if (n.includes('sattvam') || n.includes('vegetarian')) {
    return [
      {
        _id: `${restaurantId}_s1`,
        restaurant: restaurantId,
        category: 'cat_thali',
        name: 'Grand Sattvam Maharaja Thali',
        description: 'An opulent 14-dish satvic feast: Paneer Makhanwala, Slow-cooked Dal Makhani, Subz Panchmel, Steamed Basmati, 2 Desi Ghee Phulkas, Saffron Rabdi, and Kesar Lassi.',
        price: 350,
        foodType: 'vegetarian',
        tasteProfile: 'mild',
        cuisine: 'Pure Veg',
        image: FOOD_IMAGES.maharajaThali,
        isTrending: true,
        isBestseller: true,
        rating: 4.9,
        orderCount: 780,
        preparationTimeMinutes: 20,
        isAvailable: true,
      },
      {
        _id: `${restaurantId}_s2`,
        restaurant: restaurantId,
        category: 'cat_curry',
        name: 'Paneer Makhanwala in Desi Ghee',
        description: 'Soft cottage cheese simmered in a silky tomato cashew gravy made without onion or garlic, finished with pure cow ghee and fragrant kasuri methi.',
        price: 250,
        foodType: 'vegetarian',
        tasteProfile: 'mild',
        cuisine: 'North Indian',
        image: FOOD_IMAGES.butterPaneer,
        isTrending: false,
        isBestseller: true,
        rating: 4.8,
        orderCount: 410,
        preparationTimeMinutes: 18,
        isAvailable: true,
      },
      {
        _id: `${restaurantId}_s3`,
        restaurant: restaurantId,
        category: 'cat_curry',
        name: 'Slow Cooked Dal Makhani',
        description: 'Whole black lentils and kidney beans slow simmered for 16 hours over low charcoal heat, infused with churned butter and mild spices.',
        price: 210,
        foodType: 'vegetarian',
        tasteProfile: 'savory',
        cuisine: 'North Indian',
        image: FOOD_IMAGES.dalMakhani,
        isTrending: true,
        isBestseller: true,
        rating: 4.8,
        orderCount: 520,
        preparationTimeMinutes: 15,
        isAvailable: true,
      },
      {
        _id: `${restaurantId}_s4`,
        restaurant: restaurantId,
        category: 'cat_south',
        name: 'Crispy Ghee Roast Masala Dosa',
        description: 'Golden, paper-crisp fermented rice-lentil crepe smeared with aromatic pure ghee, stuffed with spiced tempered potato masala, served with 3 fresh chutneys.',
        price: 160,
        foodType: 'vegetarian',
        tasteProfile: 'savory',
        cuisine: 'South Indian',
        image: FOOD_IMAGES.masalaDosa,
        isTrending: true,
        isBestseller: true,
        rating: 4.9,
        orderCount: 890,
        preparationTimeMinutes: 12,
        isAvailable: true,
      },
      {
        _id: `${restaurantId}_s5`,
        restaurant: restaurantId,
        category: 'cat_sweet',
        name: 'Saffron Pistachio Rabdi & Malpua',
        description: 'Crispy sweet fennel-infused pancakes soaked in aromatic sugar syrup, topped with thick condensed rabdi, silver leaf, and sliced Iranian pistachios.',
        price: 140,
        foodType: 'vegetarian',
        tasteProfile: 'sweet',
        cuisine: 'Pure Veg',
        image: FOOD_IMAGES.gulabJamunRabdi,
        isTrending: false,
        isBestseller: true,
        rating: 4.9,
        orderCount: 390,
        preparationTimeMinutes: 5,
        isAvailable: true,
      },
      {
        _id: `${restaurantId}_s6`,
        restaurant: restaurantId,
        category: 'cat_sweet',
        name: 'Kesar Dry Fruit Chilled Lassi',
        description: 'Thick hand-churned sweet curd beverage infused with saffron strands, crushed almonds, cashews, and a dollop of fresh clotted malai.',
        price: 110,
        foodType: 'vegetarian',
        tasteProfile: 'sweet',
        cuisine: 'Pure Veg',
        image: FOOD_IMAGES.lassiBeverage,
        isTrending: false,
        isBestseller: true,
        rating: 4.8,
        orderCount: 610,
        preparationTimeMinutes: 5,
        isAvailable: true,
      },
    ];
  }

  if (n.includes('tokyo') || n.includes('ramen') || n.includes('blossom')) {
    return [
      {
        _id: `${restaurantId}_t1`,
        restaurant: restaurantId,
        category: 'cat_ramen',
        name: 'Signature Spicy Miso Ramen',
        description: 'Rich 18-hour slow simmered broth with fermented red miso, springy handmade noodles, tender chashu, soft molten ajitsuke egg, menma, and roasted nori.',
        price: 340,
        foodType: 'non-vegetarian',
        tasteProfile: 'spicy',
        cuisine: 'Japanese',
        image: FOOD_IMAGES.spicyMisoRamen,
        isTrending: true,
        isBestseller: true,
        rating: 4.9,
        orderCount: 680,
        preparationTimeMinutes: 18,
        isAvailable: true,
      },
      {
        _id: `${restaurantId}_t2`,
        restaurant: restaurantId,
        category: 'cat_ramen',
        name: 'Creamy Black Garlic Tonkotsu Ramen',
        description: 'Ultra-creamy rich pork broth infused with charred black garlic oil (mayu), topped with seared pork belly, wood ear mushrooms, and scallions.',
        price: 360,
        foodType: 'non-vegetarian',
        tasteProfile: 'savory',
        cuisine: 'Japanese',
        image: FOOD_IMAGES.tonkotsuRamen,
        isTrending: true,
        isBestseller: true,
        rating: 4.8,
        orderCount: 540,
        preparationTimeMinutes: 18,
        isAvailable: true,
      },
      {
        _id: `${restaurantId}_t3`,
        restaurant: restaurantId,
        category: 'cat_izakaya',
        name: 'Crispy Pan-Fried Chicken Gyoza',
        description: 'Six delicate handmade dumplings filled with spiced ground chicken and scallions, seared with a crisp lace skirt, served with chili citrus ponzu dip.',
        price: 220,
        foodType: 'non-vegetarian',
        tasteProfile: 'savory',
        cuisine: 'Japanese',
        image: FOOD_IMAGES.crispyGyoza,
        isTrending: true,
        isBestseller: true,
        rating: 4.7,
        orderCount: 490,
        preparationTimeMinutes: 12,
        isAvailable: true,
      },
      {
        _id: `${restaurantId}_t4`,
        restaurant: restaurantId,
        category: 'cat_sushi',
        name: 'Crunchy Tempura & Avocado Roll (8 pcs)',
        description: 'Golden crunchy tiger prawn tempura and ripe hass avocado rolled with vinegared sushi rice, sesame seeds, and sweet unagi drizzle.',
        price: 360,
        foodType: 'non-vegetarian',
        tasteProfile: 'savory',
        cuisine: 'Japanese',
        image: FOOD_IMAGES.sushiPlatter,
        isTrending: true,
        isBestseller: false,
        rating: 4.8,
        orderCount: 370,
        preparationTimeMinutes: 15,
        isAvailable: true,
      },
      {
        _id: `${restaurantId}_t5`,
        restaurant: restaurantId,
        category: 'cat_donburi',
        name: 'Teriyaki Chicken Donburi Bowl',
        description: 'Grilled juicy chicken thighs glazed in house-brewed sweet soy mirin teriyaki glaze over steamed Koshihikari rice with sesame greens.',
        price: 280,
        foodType: 'non-vegetarian',
        tasteProfile: 'savory',
        cuisine: 'Japanese',
        image: FOOD_IMAGES.teriyakiDonburi,
        isTrending: false,
        isBestseller: true,
        rating: 4.7,
        orderCount: 320,
        preparationTimeMinutes: 15,
        isAvailable: true,
      },
      {
        _id: `${restaurantId}_t6`,
        restaurant: restaurantId,
        category: 'cat_matcha',
        name: 'Japanese Uji Matcha Basque Cheesecake',
        description: 'Velvety burnt Basque-style cheesecake infused with ceremonial grade Uji green tea powder, served with sweet red azuki bean compote.',
        price: 190,
        foodType: 'vegetarian',
        tasteProfile: 'sweet',
        cuisine: 'Japanese',
        image: FOOD_IMAGES.matchaCheesecake,
        isTrending: true,
        isBestseller: true,
        rating: 4.9,
        orderCount: 410,
        preparationTimeMinutes: 5,
        isAvailable: true,
      },
    ];
  }

  // Default / The Royal Nawabi Kitchen
  return [
    {
      _id: `${restaurantId}_n1`,
      restaurant: restaurantId,
      category: 'cat_biryani',
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
      dietaryTags: ['High Protein', 'Halal'],
      calories: 580,
      allergens: ['Dairy'],
      stockCount: 14,
    },
    {
      _id: `${restaurantId}_n2`,
      restaurant: restaurantId,
      category: 'cat_biryani',
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
      dietaryTags: ['Pure Veg', 'Jain'],
      calories: 420,
      allergens: ['Dairy', 'Cashews'],
      stockCount: 10,
    },
    {
      _id: `${restaurantId}_n3`,
      restaurant: restaurantId,
      category: 'cat_kebab',
      name: 'Melt-in-Mouth Galouti Kebabs',
      description: 'Finely minced spiced mutton patties infused with raw papaya and aromatic spices, shallow pan seared in pure desi ghee.',
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
      dietaryTags: ['High Protein', 'Keto Friendly'],
      calories: 460,
      allergens: ['Cashews'],
      stockCount: 8,
    },
    {
      _id: `${restaurantId}_n4`,
      restaurant: restaurantId,
      category: 'cat_kebab',
      name: 'Paneer Tikka Angara',
      description: 'Cubes of fresh malai paneer steeped in mustard oil, ajwain, and Kashmiri red chili marinade, glazed with butter in charcoal oven.',
      price: 240,
      foodType: 'vegetarian',
      tasteProfile: 'spicy',
      cuisine: 'North Indian',
      image: FOOD_IMAGES.paneerTikka,
      isTrending: true,
      isBestseller: false,
      rating: 4.8,
      orderCount: 380,
      preparationTimeMinutes: 12,
      isAvailable: true,
      dietaryTags: ['Pure Veg', 'Gluten-Free', 'High Protein'],
      calories: 360,
      allergens: ['Dairy', 'Mustard'],
      stockCount: 12,
    },
    {
      _id: `${restaurantId}_n5`,
      restaurant: restaurantId,
      category: 'cat_curry',
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
      dietaryTags: ['Pure Veg', 'Gluten-Free'],
      calories: 440,
      allergens: ['Dairy', 'Cashews'],
      stockCount: 9,
    },
    {
      _id: `${restaurantId}_n6`,
      restaurant: restaurantId,
      category: 'cat_bread',
      name: 'Butter Garlic Naan & Roomali Combo',
      description: 'Tandoor charred garlic butter naan accompanied by a soft hand-stretched roomali roti.',
      price: 75,
      foodType: 'vegetarian',
      tasteProfile: 'savory',
      cuisine: 'North Indian',
      image: FOOD_IMAGES.garlicNaan,
      isTrending: false,
      isBestseller: false,
      rating: 4.8,
      orderCount: 500,
      preparationTimeMinutes: 10,
      isAvailable: true,
      dietaryTags: ['Pure Veg'],
      calories: 230,
      allergens: ['Gluten', 'Dairy'],
      stockCount: 25,
    },
    {
      _id: `${restaurantId}_n7`,
      restaurant: restaurantId,
      category: 'cat_dessert',
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
      dietaryTags: ['Pure Veg', 'Gluten-Free'],
      calories: 250,
      allergens: ['Dairy', 'Pistachios'],
      stockCount: 5,
    },
  ];
}
