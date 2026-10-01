export type UserRole = 'customer' | 'waiter' | 'manager' | 'admin' | 'delivery_partner';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  addresses?: Array<{
    id: string;
    title: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
  }>;
  preferences?: {
    foodType?: 'vegetarian' | 'non-vegetarian' | 'vegan' | 'egg' | 'any';
    favoriteCuisines?: string[];
    spicinessPreference?: 'mild' | 'medium' | 'spicy';
  };
}

export interface Restaurant {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  restaurantCode: string;
  description: string;
  tagline: string;
  cuisine: string[];
  foodType: 'veg' | 'non-veg' | 'both' | 'pure-veg';
  ambience: string[];
  restaurantType: 'family' | 'cafe' | 'fast_food' | 'fine_dining' | 'cloud_kitchen';
  address: {
    street: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
  };
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  images: {
    cover: string;
    logo: string;
    gallery: string[];
  };
  rating: number;
  reviewCount: number;
  averagePriceForTwo: number;
  status: 'OPEN' | 'CLOSING_SOON' | 'CLOSED' | 'TEMPORARILY_UNAVAILABLE';
  isVerified: boolean;
  services: {
    dineIn: boolean;
    delivery: boolean;
    takeaway: boolean;
    tableBooking: boolean;
  };
  rewardsSettings?: {
    isEnabled: boolean;
    coinsPerOrderMin: number;
    coinsPerOrderMax: number;
    targetCoins: number;
    rewardTitle: string;
    rewardDescription: string;
    comboItems: string[];
  };
  calculatedDistanceKm?: number;
}

export interface MenuItem {
  _id: string;
  restaurant: string | Restaurant;
  category: string | { _id: string; name: string };
  name: string;
  description: string;
  price: number;
  foodType: 'vegetarian' | 'non-vegetarian' | 'vegan' | 'egg';
  tasteProfile: 'spicy' | 'sweet' | 'mild' | 'tangy' | 'healthy' | 'savory';
  cuisine: string;
  image: string;
  isAvailable: boolean;
  isTrending?: boolean;
  isBestseller?: boolean;
  rating: number;
  orderCount: number;
  preparationTimeMinutes: number;
  dietaryTags?: string[];
  calories?: number;
  allergens?: string[];
  stockCount?: number;
  customizationGroups?: Array<{
    name: string;
    type: 'single' | 'multiple';
    isRequired: boolean;
    options: Array<{ name: string; price: number }>;
  }>;
}

export interface CartItem {
  menuItem: MenuItem;
  restaurantId?: string;
  restaurantName?: string;
  quantity: number;
  selectedCustomizations: Array<{
    groupName: string;
    optionName: string;
    price: number;
  }>;
  specialInstructions?: string;
  unitPrice: number;
  itemTotal: number;
}

export interface OrderPricing {
  itemTotal: number;
  discountAmount: number;
  couponCode?: string;
  taxableAmount: number;
  applicableTaxes: number;
  serviceCharge: number;
  deliveryFee: number;
  packagingFee: number;
  tipAmount: number;
  grandTotal: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: string | User;
  restaurant: string | Restaurant;
  restaurantDetails: {
    name: string;
    address: string;
    phone: string;
  };
  orderType: 'dine_in' | 'online' | 'takeaway';
  tableNumber?: number;
  deliveryAddress?: {
    title?: string;
    street: string;
    area?: string;
    city: string;
    state?: string;
    pincode: string;
    coordinates?: [number, number];
    landmark?: string;
    dropoffPills?: string[];
    riderNotes?: string;
  };
  items: Array<{
    menuItemId: string;
    name: string;
    image?: string;
    quantity: number;
    unitPrice: number;
    taxAmount: number;
    customizations: Array<{ groupName: string; optionName: string; price: number }>;
    itemTotal: number;
  }>;
  pricing: OrderPricing;
  status:
    | 'PLACED'
    | 'NEW'
    | 'PAYMENT_SUCCESS'
    | 'RESTAURANT_ACCEPTED'
    | 'ACCEPTED'
    | 'PREPARING'
    | 'READY'
    | 'SERVED'
    | 'PICKED_UP'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'REFUNDED';
  statusHistory: Array<{
    status: string;
    changedAt: string;
    note?: string;
  }>;
  paymentStatus: string;
  paymentMethod: string;
  deliveryOtp?: string;
  tableQrVerified?: boolean;
  rewardVoucherClaimed?: boolean;
  rewardVoucherId?: any;
  createdAt: string;
}

export interface RewardAccount {
  _id: string;
  restaurant: Restaurant;
  coinBalance: number;
  lifetimeCoinsEarned: number;
  lifetimeCoinsRedeemed: number;
  unlockedCombosCount: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
}

export interface RewardVoucher {
  _id: string;
  voucherCode: string;
  qrToken: string;
  order: string;
  orderNumber: string;
  restaurant: Restaurant;
  coinAmount: number;
  status: 'UNCLAIMED' | 'CLAIMED' | 'EXPIRED' | 'INVALIDATED';
  expiresAt: string;
  claimedAt?: string;
}

export interface RewardRedemption {
  _id: string;
  redemptionCode: string;
  qrToken: string;
  restaurant: Restaurant;
  rewardTitle: string;
  comboItems: string[];
  coinsCost: number;
  status: 'ACTIVE' | 'SCANNED_REDEEMED' | 'EXPIRED';
  expiresAt: string;
  scannedAt?: string;
}
