import fs from 'fs';
import path from 'path';
import { generateSecureToken } from './qr';

const STORE_FILE = path.resolve(__dirname, '../../data/essen_local_store.json');

export interface MockUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'manager' | 'waiter' | 'delivery_partner' | 'admin';
  password?: string;
  restaurantId?: string;
  restaurantCode?: string;
  preferences?: any;
  addresses?: any[];
  isActive?: boolean;
}

export interface MockRestaurant {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  restaurantCode: string;
  description: string;
  tagline: string;
  cuisine: string[];
  foodType: 'veg' | 'non-veg' | 'pure-veg' | 'both';
  ambience: string[];
  restaurantType: string;
  address: {
    street: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
  };
  location: {
    type: string;
    coordinates: [number, number]; // [lng, lat]
  };
  contact: {
    phone: string;
    email: string;
  };
  businessInfo?: {
    gstin?: string;
    fssaiLicense?: string;
  };
  images: {
    cover: string;
    logo: string;
    gallery?: string[];
  };
  rating: number;
  reviewCount: number;
  averagePriceForTwo: number;
  status: 'OPEN' | 'CLOSED' | 'TEMPORARILY_UNAVAILABLE';
  isVerified: boolean;
  services: {
    dineIn: boolean;
    delivery: boolean;
    takeaway: boolean;
    tableBooking: boolean;
  };
  rewardsSettings: {
    isEnabled: boolean;
    coinsPerOrderMin: number;
    coinsPerOrderMax: number;
    targetCoins: number;
    rewardTitle: string;
    rewardDescription: string;
    comboItems: string[];
  };
  calculatedDistanceKm?: number;
  createdAt?: string;
}

export interface MockCategory {
  _id: string;
  restaurant: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

export interface MockMenuItem {
  _id: string;
  restaurant: string | any;
  category: string | any;
  name: string;
  description: string;
  price: number;
  foodType: 'vegetarian' | 'non-vegetarian' | 'vegan' | 'egg';
  tasteProfile: 'mild' | 'medium' | 'spicy' | 'sweet' | 'tangy';
  cuisine: string;
  image: string;
  isAvailable: boolean;
  isTrending: boolean;
  isBestseller: boolean;
  rating: number;
  orderCount: number;
  preparationTimeMinutes: number;
  customizationGroups?: Array<{
    name: string;
    type: 'single' | 'multiple';
    isRequired: boolean;
    options: Array<{ name: string; price: number }>;
  }>;
}

export interface MockTable {
  _id: string;
  restaurant: string;
  tableNumber: number;
  tableName: string;
  capacity: number;
  section: 'indoor' | 'outdoor' | 'rooftop' | 'bar' | 'private_dining';
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
  qrToken: string;
}

// Initial Sample Restaurants
const INITIAL_RESTAURANTS: MockRestaurant[] = [
  {
    _id: 'rest_1',
    name: 'The Royal Nawabi Kitchen',
    slug: 'the-royal-nawabi-kitchen',
    restaurantCode: 'EST-ROY-1001',
    description: 'Heritage Awadhi and Mughal delicacies cooked in traditional slow dum pots with hand-ground spices.',
    tagline: 'Legacy of Royal Mughal & Awadhi Flavors',
    cuisine: ['North Indian', 'Mughlai', 'Biryani', 'Kebabs'],
    foodType: 'both',
    ambience: ['Fine Dining', 'Heritage', 'Family'],
    restaurantType: 'fine_dining',
    address: { street: '14 Khader Nawaz Khan Road', area: 'Nungambakkam', city: 'Chennai', state: 'Tamil Nadu', pincode: '600034' },
    location: { type: 'Point', coordinates: [80.2435, 13.0604] },
    contact: { phone: '044-28331122', email: 'nawabi@royalessen.com' },
    businessInfo: { gstin: '33AAACR1234F1Z1', fssaiLicense: '10019042004561' },
    images: {
      cover: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200',
      logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300',
      gallery: [
        'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
        'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800',
      ],
    },
    rating: 4.8,
    reviewCount: 420,
    averagePriceForTwo: 650,
    status: 'OPEN',
    isVerified: true,
    services: { dineIn: true, delivery: true, takeaway: true, tableBooking: true },
    rewardsSettings: {
      isEnabled: true,
      coinsPerOrderMin: 8,
      coinsPerOrderMax: 10,
      targetCoins: 5000,
      rewardTitle: 'Free Royal Nawabi Dum Feast Combo',
      rewardDescription: 'Exclusive 4-course royal feast featuring Murgh Dum Biryani, Galouti Kebabs, Roomali Roti, and Shahi Phirni.',
      comboItems: ['Royal Dum Biryani', 'Galouti Kebabs (4 pcs)', '2 Roomali Rotis', 'Shahi Saffron Phirni'],
    },
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'rest_2',
    name: 'Trattoria Bella Napoli',
    slug: 'trattoria-bella-napoli',
    restaurantCode: 'EST-BEL-2002',
    description: 'Authentic wood-fired Neapolitan pizzas, handmade fresh artisanal pasta, and Tuscan wines.',
    tagline: 'Woodfired Italian Perfection',
    cuisine: ['Italian', 'Pizza', 'Pasta', 'European'],
    foodType: 'both',
    ambience: ['Casual', 'Romantic', 'Outdoor'],
    restaurantType: 'cafe',
    address: { street: '28 Chamiers Road', area: 'R.A. Puram', city: 'Chennai', state: 'Tamil Nadu', pincode: '600028' },
    location: { type: 'Point', coordinates: [80.2522, 13.0245] },
    contact: { phone: '044-24358899', email: 'ciao@bellanapoli.com' },
    businessInfo: { gstin: '33AABCT9876E1Z5', fssaiLicense: '10019042004562' },
    images: {
      cover: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200',
      logo: 'https://images.unsplash.com/photo-1579684947550-22e945225d9a?w=300',
      gallery: [],
    },
    rating: 4.7,
    reviewCount: 310,
    averagePriceForTwo: 550,
    status: 'OPEN',
    isVerified: true,
    services: { dineIn: true, delivery: true, takeaway: true, tableBooking: true },
    rewardsSettings: {
      isEnabled: true,
      coinsPerOrderMin: 6,
      coinsPerOrderMax: 10,
      targetCoins: 5000,
      rewardTitle: 'Free Woodfired Gourmet Pizza & Tiramisu Combo',
      rewardDescription: '12-inch artisanal sourdough pizza paired with classic espresso mascarpone tiramisu.',
      comboItems: ['12-inch Woodfired Margherita', 'Classic Tiramisu', 'Peach Iced Tea'],
    },
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'rest_3',
    name: 'Sattvam Pure Vegetarian Haven',
    slug: 'sattvam-pure-vegetarian-haven',
    restaurantCode: 'EST-SAT-3003',
    description: 'Pure satvic gourmet vegetarian feast prepared with farm-fresh organic produce and clarified butter.',
    tagline: 'Pure Satvic Gourmet Dining',
    cuisine: ['South Indian', 'North Indian', 'Pure Veg', 'Healthy'],
    foodType: 'pure-veg',
    ambience: ['Family', 'Peaceful', 'Traditional'],
    restaurantType: 'family',
    address: { street: '55 TTK Road', area: 'Alwarpet', city: 'Chennai', state: 'Tamil Nadu', pincode: '600018' },
    location: { type: 'Point', coordinates: [80.2514, 13.0338] },
    contact: { phone: '044-24997788', email: 'contact@sattvam.com' },
    businessInfo: { gstin: '33AADCS5544K1Z3', fssaiLicense: '10019042004563' },
    images: {
      cover: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200',
      logo: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300',
      gallery: [],
    },
    rating: 4.9,
    reviewCount: 560,
    averagePriceForTwo: 350,
    status: 'OPEN',
    isVerified: true,
    services: { dineIn: true, delivery: true, takeaway: true, tableBooking: true },
    rewardsSettings: {
      isEnabled: true,
      coinsPerOrderMin: 5,
      coinsPerOrderMax: 8,
      targetCoins: 5000,
      rewardTitle: 'Free Royal Sattvam Grand Thali Combo',
      rewardDescription: 'An opulent 14-dish satvic thali with paneer makhani, dal makhani, stuffed kulchas, and saffron kheer.',
      comboItems: ['Grand Sattvam Thali', 'Saffron Rabdi', 'Dry Fruit Lassi'],
    },
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'rest_4',
    name: 'Tokyo Blossom Ramen & Izakaya',
    slug: 'tokyo-blossom-ramen',
    restaurantCode: 'EST-TOK-4004',
    description: 'Rich 18-hour slow simmered broths, handmade bouncy ramen noodles, gyoza, and Japanese yakitori.',
    tagline: 'Artisanal Ramen & Japanese Izakaya',
    cuisine: ['Japanese', 'Asian', 'Ramen', 'Sushi'],
    foodType: 'both',
    ambience: ['Modern', 'Cozy', 'Casual'],
    restaurantType: 'cafe',
    address: { street: '18 Gandhi Nagar 2nd Main', area: 'Adyar', city: 'Chennai', state: 'Tamil Nadu', pincode: '600020' },
    location: { type: 'Point', coordinates: [80.2554, 13.0067] },
    contact: { phone: '044-24419900', email: 'tokyo@blossom.com' },
    businessInfo: { gstin: '33AABCT3322P1Z8', fssaiLicense: '10019042004564' },
    images: {
      cover: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1200',
      logo: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=300',
      gallery: [],
    },
    rating: 4.6,
    reviewCount: 280,
    averagePriceForTwo: 600,
    status: 'OPEN',
    isVerified: true,
    services: { dineIn: true, delivery: true, takeaway: true, tableBooking: true },
    rewardsSettings: {
      isEnabled: true,
      coinsPerOrderMin: 7,
      coinsPerOrderMax: 10,
      targetCoins: 5000,
      rewardTitle: 'Free Signature Spicy Miso Ramen & Crispy Gyoza Combo',
      rewardDescription: 'Our bestselling spicy miso ramen paired with pan-fried chicken gyoza and Japanese matcha iced tea.',
      comboItems: ['Spicy Miso Ramen', 'Crispy Gyoza (6 pcs)', 'Matcha Green Iced Tea'],
    },
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'rest_5',
    name: 'El Fuego Mexican Cantina',
    slug: 'el-fuego-mexican-cantina',
    restaurantCode: 'EST-FUE-5005',
    description: 'Sizzling fajitas, slow-cooked carnitas tacos, guacamole prepared tableside, and warm cinnamon churros.',
    tagline: 'Vibrant Latin Flavors & Sizzling Cantina',
    cuisine: ['Mexican', 'Tacos', 'Burritos', 'Latin American'],
    foodType: 'both',
    ambience: ['Festive', 'Casual', 'Lively'],
    restaurantType: 'casual_dining',
    address: { street: '42 Phoenix Market City, OMR', area: 'Velachery', city: 'Chennai', state: 'Tamil Nadu', pincode: '600042' },
    location: { type: 'Point', coordinates: [80.2176, 12.9915] },
    contact: { phone: '044-22445566', email: 'hola@elfuego.com' },
    businessInfo: { gstin: '33AABCE1122Q1Z9', fssaiLicense: '10019042004565' },
    images: {
      cover: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200',
      logo: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=300',
      gallery: [],
    },
    rating: 4.7,
    reviewCount: 195,
    averagePriceForTwo: 500,
    status: 'OPEN',
    isVerified: true,
    services: { dineIn: true, delivery: true, takeaway: true, tableBooking: true },
    rewardsSettings: {
      isEnabled: true,
      coinsPerOrderMin: 6,
      coinsPerOrderMax: 10,
      targetCoins: 5000,
      rewardTitle: 'Free Cantina Supreme Taco Fiesta Combo',
      rewardDescription: 'Trio of handcrafted street tacos with fresh guacamole and Mexican spiced hot cocoa.',
      comboItems: ['Street Tacos Trio', 'Loaded Nachos', 'Warm Cinnamon Churros'],
    },
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'rest_6',
    name: 'Le Petit Parisien Patisserie & Café',
    slug: 'le-petit-parisien-patisserie',
    restaurantCode: 'EST-PAR-6006',
    description: 'Flaky pure French butter croissants, delicate fruit tarts, artisan sourdough toast, and specialty espresso.',
    tagline: 'Artisanal French Viennoiserie & Café',
    cuisine: ['Bakery', 'French', 'Desserts', 'Coffee', 'European'],
    foodType: 'both',
    ambience: ['Chic', 'Cozy', 'Aesthetic'],
    restaurantType: 'cafe',
    address: { street: '7 Wallace Garden 3rd Street', area: 'Nungambakkam', city: 'Chennai', state: 'Tamil Nadu', pincode: '600006' },
    location: { type: 'Point', coordinates: [80.2478, 13.0642] },
    contact: { phone: '044-28223344', email: 'bonjour@lepetitparisien.com' },
    businessInfo: { gstin: '33AABCL4433R1Z7', fssaiLicense: '10019042004566' },
    images: {
      cover: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200',
      logo: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300',
      gallery: [],
    },
    rating: 4.9,
    reviewCount: 340,
    averagePriceForTwo: 450,
    status: 'OPEN',
    isVerified: true,
    services: { dineIn: true, delivery: true, takeaway: true, tableBooking: true },
    rewardsSettings: {
      isEnabled: true,
      coinsPerOrderMin: 5,
      coinsPerOrderMax: 9,
      targetCoins: 5000,
      rewardTitle: 'Free French Patisserie High-Tea Platter',
      rewardDescription: 'Artisanal butter almond croissant, raspberry macaron duo, and Madagascar vanilla bean cappuccino.',
      comboItems: ['Almond Butter Croissant', 'Raspberry Macarons', 'Specialty Flat White Coffee'],
    },
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_CATEGORIES: MockCategory[] = [
  // Nawabi
  { _id: 'cat_1', restaurant: 'rest_1', name: 'Royal Dum Biryanis', sortOrder: 1, isActive: true },
  { _id: 'cat_2', restaurant: 'rest_1', name: 'Signature Kebabs & Starters', sortOrder: 2, isActive: true },
  { _id: 'cat_3', restaurant: 'rest_1', name: 'Rich Curries & Gravies', sortOrder: 3, isActive: true },
  // Bella Napoli
  { _id: 'cat_4', restaurant: 'rest_2', name: 'Wood-Fired Neapolitan Pizzas', sortOrder: 1, isActive: true },
  { _id: 'cat_5', restaurant: 'rest_2', name: 'Handmade Fresh Pastas', sortOrder: 2, isActive: true },
  // Sattvam
  { _id: 'cat_6', restaurant: 'rest_3', name: 'Satvic Gourmet Thalis & Curries', sortOrder: 1, isActive: true },
  // Tokyo Blossom
  { _id: 'cat_7', restaurant: 'rest_4', name: 'Craft Ramen Bowls & Noodles', sortOrder: 1, isActive: true },
  // El Fuego
  { _id: 'cat_8', restaurant: 'rest_5', name: 'Street Tacos & Burritos', sortOrder: 1, isActive: true },
  // Parisien
  { _id: 'cat_9', restaurant: 'rest_6', name: 'Artisan Pastries & Viennoiserie', sortOrder: 1, isActive: true },
];

const INITIAL_MENU_ITEMS: MockMenuItem[] = [
  {
    _id: 'dish_1',
    restaurant: 'rest_1',
    category: 'cat_1',
    name: 'Royal Awadhi Murgh Dum Biryani',
    description: 'Tender succulent chicken marinated in saffron, rose water, and 24 royal spices, dum cooked with aged basmati rice.',
    price: 280,
    foodType: 'non-vegetarian',
    tasteProfile: 'spicy',
    cuisine: 'North Indian',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800',
    isTrending: true,
    isBestseller: true,
    rating: 4.9,
    orderCount: 840,
    preparationTimeMinutes: 25,
    isAvailable: true,
    customizationGroups: [
      {
        name: 'Portion Size',
        type: 'single',
        isRequired: true,
        options: [
          { name: 'Regular (Serves 1)', price: 0 },
          { name: 'Large (Serves 2)', price: 150 },
        ],
      },
    ],
  },
  {
    _id: 'dish_2',
    restaurant: 'rest_1',
    category: 'cat_1',
    name: 'Subz Nizami Saffron Biryani',
    description: 'Seasonal baby vegetables, paneer cubes, and golden raisins layered with fragrant saffron basmati rice.',
    price: 240,
    foodType: 'vegetarian',
    tasteProfile: 'mild',
    cuisine: 'North Indian',
    image: 'https://images.unsplash.com/photo-1642821373181-696a54913e93?w=800',
    isTrending: true,
    isBestseller: false,
    rating: 4.8,
    orderCount: 420,
    preparationTimeMinutes: 20,
    isAvailable: true,
  },
  {
    _id: 'dish_3',
    restaurant: 'rest_1',
    category: 'cat_2',
    name: 'Melt-in-Mouth Galouti Kebabs',
    description: 'Minced lamb infused with 160 secret aromatic herbs and raw papaya, pan-seared to silk-soft perfection on a mahi tawa.',
    price: 290,
    foodType: 'non-vegetarian',
    tasteProfile: 'spicy',
    cuisine: 'North Indian',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
    isTrending: true,
    isBestseller: true,
    rating: 4.9,
    orderCount: 650,
    preparationTimeMinutes: 20,
    isAvailable: true,
  },
  {
    _id: 'dish_4',
    restaurant: 'rest_2',
    category: 'cat_4',
    name: 'Margherita Verace D.O.P Pizza',
    description: 'San Marzano tomato sauce, fresh buffalo mozzarella, fresh sweet basil leaves, and cold-pressed extra virgin olive oil.',
    price: 360,
    foodType: 'vegetarian',
    tasteProfile: 'mild',
    cuisine: 'Italian',
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=800',
    isTrending: true,
    isBestseller: true,
    rating: 4.9,
    orderCount: 520,
    preparationTimeMinutes: 15,
    isAvailable: true,
  },
  {
    _id: 'dish_5',
    restaurant: 'rest_3',
    category: 'cat_6',
    name: 'Royal Sattvam Grand Thali',
    description: 'Elaborate satvic feast with paneer makhani, dal makhani, fresh vegetable korma, saffron pulao, stuffed kulchas, and saffron kheer.',
    price: 320,
    foodType: 'vegetarian',
    tasteProfile: 'medium',
    cuisine: 'South Indian',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800',
    isTrending: true,
    isBestseller: true,
    rating: 4.9,
    orderCount: 710,
    preparationTimeMinutes: 15,
    isAvailable: true,
  },
  {
    _id: 'dish_6',
    restaurant: 'rest_4',
    category: 'cat_7',
    name: 'Spicy Tonkotsu Chashu Ramen',
    description: '18-hour slow-simmered rich broth with tender braised chashu pork, seasoned ajitsuke tamago egg, bamboo shoots, and scallions.',
    price: 380,
    foodType: 'non-vegetarian',
    tasteProfile: 'spicy',
    cuisine: 'Japanese',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
    isTrending: true,
    isBestseller: true,
    rating: 4.8,
    orderCount: 490,
    preparationTimeMinutes: 20,
    isAvailable: true,
  },
  {
    _id: 'dish_7',
    restaurant: 'rest_5',
    category: 'cat_8',
    name: 'Birria Beef Street Tacos Trio',
    description: 'Crispy corn tortillas dipped in chili broth, loaded with melted Oaxaca cheese and tender slow-braised shredded beef, served with consommé.',
    price: 310,
    foodType: 'non-vegetarian',
    tasteProfile: 'spicy',
    cuisine: 'Mexican',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800',
    isTrending: true,
    isBestseller: true,
    rating: 4.8,
    orderCount: 390,
    preparationTimeMinutes: 15,
    isAvailable: true,
  },
  {
    _id: 'dish_8',
    restaurant: 'rest_6',
    category: 'cat_9',
    name: 'French Butter Almond Croissant',
    description: 'Twice-baked flaky croissant with rich almond cream frangipane filling, topped with toasted sliced almonds and powdered sugar.',
    price: 180,
    foodType: 'vegetarian',
    tasteProfile: 'sweet',
    cuisine: 'Bakery',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
    isTrending: true,
    isBestseller: true,
    rating: 4.9,
    orderCount: 620,
    preparationTimeMinutes: 5,
    isAvailable: true,
  },
];

class MockDataStore {
  public users: Record<string, MockUser> = {
    'customer@essen.com': {
      id: 'usr_cust_1',
      name: 'Customer 1',
      email: 'customer@essen.com',
      phone: '9876543210',
      role: 'customer',
      password: 'password123',
      preferences: { foodType: 'any', favoriteCuisines: ['North Indian', 'Biryani'], spicinessPreference: 'spicy' },
      isActive: true,
    },
    'manager@essen.com': {
      id: 'usr_mgr_1',
      name: 'Manager 1',
      email: 'manager@essen.com',
      phone: '9876501234',
      role: 'manager',
      password: 'password123',
      restaurantCode: 'EST-ROY-1001',
      restaurantId: 'rest_1',
      isActive: true,
    },
    'waiter@essen.com': {
      id: 'usr_wtr_1',
      name: 'Employee 1',
      email: 'waiter@essen.com',
      phone: '9876512345',
      role: 'waiter',
      password: 'password123',
      restaurantId: 'rest_1',
      isActive: true,
    },
    'driver@essen.com': {
      id: 'usr_drv_1',
      name: 'Employee 2',
      email: 'driver@essen.com',
      phone: '9876523456',
      role: 'delivery_partner',
      password: 'password123',
      isActive: true,
    },
    'admin@essen.com': {
      id: 'usr_adm_1',
      name: 'Admin 1',
      email: 'admin@essen.com',
      phone: '9876534567',
      role: 'admin',
      password: 'admin123',
      isActive: true,
    },
  };

  public restaurants: MockRestaurant[] = [...INITIAL_RESTAURANTS];
  public categories: MockCategory[] = [...INITIAL_CATEGORIES];
  public menuItems: MockMenuItem[] = [...INITIAL_MENU_ITEMS];
  public tables: MockTable[] = [];
  public orders: any[] = [];
  public vouchers: any[] = [];
  public userRewardBalances: { [key: string]: { coinBalance: number; totalCoinsEarned: number; tier: string } } = {};
  public userRewardTransactions: { [userId: string]: any[] } = {};

  constructor() {
    const loaded = this.loadFromDisk();
    if (!loaded) {
      this.initTables();
      this.saveToDisk();
    }
  }

  private loadFromDisk(): boolean {
    try {
      if (fs.existsSync(STORE_FILE)) {
        const raw = fs.readFileSync(STORE_FILE, 'utf-8');
        const data = JSON.parse(raw);
        if (data.users && typeof data.users === 'object') {
          this.users = { ...this.users, ...data.users };
        }
        if (Array.isArray(data.restaurants) && data.restaurants.length > 0) {
          this.restaurants = data.restaurants;
        }
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          this.categories = data.categories;
        }
        if (Array.isArray(data.menuItems) && data.menuItems.length > 0) {
          this.menuItems = data.menuItems;
        }
        if (Array.isArray(data.tables) && data.tables.length > 0) {
          this.tables = data.tables;
        }
        if (Array.isArray(data.orders)) {
          this.orders = data.orders;
        }
        if (Array.isArray(data.vouchers)) {
          this.vouchers = data.vouchers;
        }
        if (data.userRewardBalances && typeof data.userRewardBalances === 'object') {
          this.userRewardBalances = data.userRewardBalances;
        }
        if (data.userRewardTransactions && typeof data.userRewardTransactions === 'object') {
          this.userRewardTransactions = data.userRewardTransactions;
        }
        return true;
      }
    } catch (err) {
      console.warn('Could not read persistent store from disk:', err);
    }
    return false;
  }

  public saveToDisk(): void {
    try {
      const dir = path.dirname(STORE_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const data = {
        users: this.users,
        restaurants: this.restaurants,
        categories: this.categories,
        menuItems: this.menuItems,
        tables: this.tables,
        orders: this.orders,
        vouchers: this.vouchers,
        userRewardBalances: this.userRewardBalances,
        userRewardTransactions: this.userRewardTransactions,
      };
      fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Could not write persistent store to disk:', err);
    }
  }

  private initTables() {
    for (const rest of this.restaurants) {
      for (let i = 1; i <= 6; i++) {
        this.tables.push({
          _id: `tbl_${rest._id}_${i}`,
          restaurant: rest._id,
          tableNumber: i,
          tableName: `Table ${i} - ${i <= 2 ? 'Window Side' : i <= 4 ? 'Center Hall' : 'Terrace View'}`,
          capacity: i % 2 === 0 ? 4 : 2,
          section: i === 4 ? 'rooftop' : 'indoor',
          status: i === 2 ? 'OCCUPIED' : 'AVAILABLE',
          qrToken: generateSecureToken(`TBL_${rest._id}_${i}`),
        });
      }
    }
  }

  public userExists(email: string): boolean {
    if (!email) return false;
    const clean = email.toLowerCase().trim();
    return !!this.users[clean];
  }

  public registerUser(user: Partial<MockUser>): MockUser {
    const emailKey = user.email?.toLowerCase().trim() || `user_${Date.now()}@essen.com`;
    const id = user.id || `usr_${Date.now()}`;
    const newUser: MockUser = {
      id,
      name: user.name || emailKey.split('@')[0],
      email: emailKey,
      phone: user.phone || '9876543210',
      role: user.role || 'customer',
      password: user.password || 'password123',
      preferences: user.preferences || { foodType: 'any' },
      restaurantId: user.restaurantId || 'rest_1',
      restaurantCode: user.restaurantCode || 'EST-ROY-1001',
      isActive: true,
    };
    this.users[emailKey] = newUser;
    this.saveToDisk();
    return newUser;
  }

  public getUserByEmail(email: string): MockUser | undefined {
    if (!email) return undefined;
    return this.users[email.toLowerCase().trim()];
  }

  public getUserById(id: string): MockUser | undefined {
    if (!id) return undefined;
    return Object.values(this.users).find((u) => u.id === id);
  }

  public getStaffByRestaurant(restaurantId: string): MockUser[] {
    const allUsers = Object.values(this.users);
    return allUsers.filter(
      (u) =>
        u.role === 'waiter' &&
        (!restaurantId || u.restaurantId === restaurantId || !u.restaurantId)
    );
  }

  public updateRestaurantStatus(id: string, status: 'OPEN' | 'CLOSED' | 'TEMPORARILY_UNAVAILABLE'): MockRestaurant | undefined {
    const rest = this.restaurants.find((r) => r._id === id || r.id === id);
    if (rest) {
      rest.status = status;
      this.saveToDisk();
    }
    return rest;
  }

  public addSampleRestaurants(): MockRestaurant[] {
    for (const sample of INITIAL_RESTAURANTS) {
      if (!this.restaurants.some((r) => r.restaurantCode === sample.restaurantCode)) {
        this.restaurants.push({ ...sample, createdAt: new Date().toISOString() });
        for (let i = 1; i <= 4; i++) {
          this.tables.push({
            _id: `tbl_${sample._id}_${i}`,
            restaurant: sample._id,
            tableNumber: i,
            tableName: `Table ${i} - Dining Area`,
            capacity: 4,
            section: 'indoor',
            status: 'AVAILABLE',
            qrToken: generateSecureToken(`TBL_${sample._id}_${i}`),
          });
        }
      }
    }
    this.saveToDisk();
    return this.restaurants;
  }

  public addRestaurant(data: any, ownerUserId?: string): MockRestaurant {
    const codeRandom = Math.floor(1000 + Math.random() * 9000);
    const prefix = (data.name || 'EST').slice(0, 3).toUpperCase();
    const restaurantCode = data.restaurantCode || `EST-${prefix}-${codeRandom}`;
    const _id = `rest_${Date.now().toString().slice(-6)}`;
    const slug = `${(data.name || 'restaurant').toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;

    const newRest: MockRestaurant = {
      _id,
      name: data.name,
      slug,
      restaurantCode,
      description: data.description || `Welcome to ${data.name}, serving delightful cuisine.`,
      tagline: data.tagline || 'Exquisite Flavors & Hospitality',
      cuisine: Array.isArray(data.cuisine) ? data.cuisine : (data.cuisine || 'Multi-Cuisine').split(',').map((c: string) => c.trim()),
      foodType: data.foodType || 'both',
      ambience: data.ambience || ['Casual', 'Family'],
      restaurantType: data.restaurantType || 'casual_dining',
      address: data.address || {
        street: '100 Gourmet Avenue',
        area: 'Downtown',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600001',
      },
      location: data.location || { type: 'Point', coordinates: [80.25, 13.05] },
      contact: data.contact || { phone: '9876543210', email: 'partner@restaurant.com' },
      images: data.images || {
        cover: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200',
        logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300',
        gallery: [],
      },
      rating: 4.8,
      reviewCount: 1,
      averagePriceForTwo: data.averagePriceForTwo || 500,
      status: 'OPEN',
      isVerified: true,
      services: data.services || { dineIn: true, delivery: true, takeaway: true, tableBooking: true },
      rewardsSettings: data.rewardsSettings || {
        isEnabled: true,
        coinsPerOrderMin: 5,
        coinsPerOrderMax: 10,
        targetCoins: 5000,
        rewardTitle: 'Free Special Combo',
        rewardDescription: 'Enjoy a free chef signature combo upon reaching 5,000 ESSEN coins.',
        comboItems: ['Signature Main Course', 'Fresh Breads', 'Gourmet Dessert'],
      },
      createdAt: new Date().toISOString(),
    };

    this.restaurants.unshift(newRest);

    // Create 4 initial tables
    for (let i = 1; i <= 4; i++) {
      this.tables.push({
        _id: `tbl_${_id}_${i}`,
        restaurant: _id,
        tableNumber: i,
        tableName: `Table ${i} - Main Hall`,
        capacity: i % 2 === 0 ? 4 : 2,
        section: 'indoor',
        status: 'AVAILABLE',
        qrToken: generateSecureToken(`TBL_${_id}_${i}`),
      });
    }

    // Default category & sample dish
    const catId = `cat_${Date.now()}`;
    this.categories.push({
      _id: catId,
      restaurant: _id,
      name: 'Chef Specials',
      sortOrder: 1,
      isActive: true,
    });

    this.menuItems.push({
      _id: `dish_${Date.now()}`,
      restaurant: _id,
      category: catId,
      name: `${data.name} Special Platter`,
      description: 'Handcrafted signature platter featuring our finest culinary ingredients.',
      price: Math.round((newRest.averagePriceForTwo * 0.5) / 10) * 10 || 250,
      foodType: newRest.foodType === 'pure-veg' ? 'vegetarian' : 'non-vegetarian',
      tasteProfile: 'medium',
      cuisine: newRest.cuisine[0] || 'Multi-Cuisine',
      image: newRest.images.cover,
      isAvailable: true,
      isTrending: true,
      isBestseller: true,
      rating: 4.9,
      orderCount: 10,
      preparationTimeMinutes: 20,
    });

    // If owner user is specified, bind this restaurant to them
    if (ownerUserId) {
      const u = this.getUserById(ownerUserId);
      if (u) {
        u.restaurantId = _id;
        u.restaurantCode = restaurantCode;
        u.role = 'manager';
      }
    }

    this.saveToDisk();
    return newRest;
  }
}

export const mockStore = new MockDataStore();
