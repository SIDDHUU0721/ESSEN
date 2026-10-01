import { MenuItem } from '../models/MenuItem';
import { Restaurant } from '../models/Restaurant';
import { Order } from '../models/Order';
import { RewardAccount } from '../models/RewardAccount';
import { RewardVoucher } from '../models/RewardVoucher';
import { Review } from '../models/Review';
import { RestaurantTable } from '../models/RestaurantTable';
import { UserRole } from '../models/User';

export interface EssenAiQueryInput {
  query: string;
  userId?: string;
  userRole?: UserRole;
  restaurantId?: string;
  conversationHistory?: Array<{ sender: 'user' | 'assistant'; text: string }>;
}

export interface EssenAiResponse {
  intent: string;
  message: string;
  structuredData?: any;
  suggestions?: string[];
  cards?: Array<{
    type: 'food' | 'restaurant' | 'order' | 'reward' | 'analytics' | 'waiter_task';
    title: string;
    subtitle?: string;
    data: any;
  }>;
}

export class EssenEngine {
  /**
   * Process a natural language query with role-based intent detection and safe data synthesis
   */
  public static async processQuery(input: EssenAiQueryInput): Promise<EssenAiResponse> {
    const query = input.query.toLowerCase().trim();
    const role = input.userRole || 'customer';

    // 1. Manager-specific queries
    if (role === 'manager' || role === 'admin') {
      if (query.includes('revenue') || query.includes('sales') || query.includes('today')) {
        return this.handleManagerRevenue(input);
      }
      if (query.includes('sentiment') || query.includes('review') || query.includes('complaint')) {
        return this.handleManagerSentiment(input);
      }
      if (query.includes('popular') || query.includes('bestseller') || query.includes('peak')) {
        return this.handleManagerPerformance(input);
      }
    }

    // 2. Waiter-specific queries
    if (role === 'waiter') {
      if (query.includes('order') || query.includes('table') || query.includes('request') || query.includes('pending')) {
        return this.handleWaiterTasks(input);
      }
    }

    // 3. Loyalty & Reward queries
    if (query.includes('coin') || query.includes('reward') || query.includes('voucher') || query.includes('loyalty')) {
      return this.handleRewardInquiry(input);
    }

    // 4. Order status & history
    if (query.includes('order status') || query.includes('where is my order') || query.includes('track') || query.includes('recent order')) {
      return this.handleOrderStatus(input);
    }

    // 5. Offers and discounts
    if (query.includes('offer') || query.includes('discount') || query.includes('deal') || query.includes('combo')) {
      return this.handleOffersInquiry(input);
    }

    // 6. Spicy / Taste / Budget specific food recommendations
    if (
      query.includes('spicy') ||
      query.includes('sweet') ||
      query.includes('under') ||
      query.includes('biryani') ||
      query.includes('pizza') ||
      query.includes('burger') ||
      query.includes('healthy') ||
      query.includes('food') ||
      query.includes('suggest') ||
      query.includes('recommend') ||
      query.includes('veg')
    ) {
      return this.handleFoodRecommendation(input);
    }

    // 7. General Restaurant discovery
    if (query.includes('restaurant') || query.includes('place') || query.includes('open') || query.includes('dine') || query.includes('nearby')) {
      return this.handleRestaurantRecommendation(input);
    }

    // Default friendly response
    return {
      intent: 'general_greeting',
      message:
        "Hello! I'm ESSEN AI, your personal culinary and dining concierge. How can I help you today? You can ask me for spicy food under ₹300, top-rated restaurants, track your live order, or check your loyalty reward coins!",
      suggestions: [
        'Suggest something spicy under ₹300',
        'Top-rated vegetarian restaurants',
        'How many reward coins do I have?',
        'Where is my order?',
      ],
    };
  }

  private static async handleFoodRecommendation(input: EssenAiQueryInput): Promise<EssenAiResponse> {
    const q = input.query.toLowerCase();
    const filter: any = { isAvailable: true };

    // Taste filter
    if (q.includes('spicy')) filter.tasteProfile = 'spicy';
    else if (q.includes('sweet')) filter.tasteProfile = 'sweet';
    else if (q.includes('healthy')) filter.tasteProfile = 'healthy';
    else if (q.includes('mild')) filter.tasteProfile = 'mild';

    // Dietary filter
    if (q.includes('pure veg') || q.includes('vegetarian')) filter.foodType = 'vegetarian';
    else if (q.includes('vegan')) filter.foodType = 'vegan';
    else if (q.includes('non-veg') || q.includes('chicken') || q.includes('mutton')) filter.foodType = 'non-vegetarian';

    // Budget extraction (e.g. "under 300", "under ₹300", "under 200")
    const budgetMatch = q.match(/under\s*(?:₹|rs\.?)?\s*(\d+)/i);
    if (budgetMatch && budgetMatch[1]) {
      filter.price = { $lte: parseInt(budgetMatch[1], 10) };
    }

    // Search query keyword if specific item mentioned
    let items = await MenuItem.find(filter)
      .populate('restaurant', 'name rating address')
      .limit(4)
      .sort({ rating: -1, orderCount: -1 });

    if (items.length === 0) {
      // Fallback to top-rated items
      items = await MenuItem.find({ isAvailable: true })
        .populate('restaurant', 'name rating address')
        .limit(4)
        .sort({ rating: -1 });
    }

    const cards = items.map((item: any) => ({
      type: 'food' as const,
      title: item.name,
      subtitle: `${item.restaurant?.name || 'Restaurant'} • ₹${item.price} • ★ ${item.rating}`,
      data: {
        id: item._id,
        restaurantId: item.restaurant?._id,
        name: item.name,
        price: item.price,
        foodType: item.foodType,
        tasteProfile: item.tasteProfile,
        image: item.image,
        description: item.description,
      },
    }));

    return {
      intent: 'food_recommendation',
      message: `I found ${items.length} exquisite dishes matching your taste preferences. Here are our top recommendations:`,
      cards,
      suggestions: ['Show restaurants with offers', 'How many coins do I have?', 'Suggest desserts'],
    };
  }

  private static async handleRestaurantRecommendation(input: EssenAiQueryInput): Promise<EssenAiResponse> {
    const q = input.query.toLowerCase();
    const filter: any = { isVerified: true };

    if (q.includes('open')) filter.status = 'OPEN';
    if (q.includes('veg')) filter.foodType = { $in: ['veg', 'pure-veg', 'both'] };

    const restaurants = await Restaurant.find(filter).limit(4).sort({ rating: -1 });

    const cards = restaurants.map((r: any) => ({
      type: 'restaurant' as const,
      title: r.name,
      subtitle: `${r.cuisine.slice(0, 3).join(', ')} • ★ ${r.rating} (${r.reviewCount} reviews) • ₹${r.averagePriceForTwo} for two`,
      data: {
        id: r._id,
        name: r.name,
        slug: r.slug,
        image: r.images?.cover,
        cuisine: r.cuisine,
        rating: r.rating,
        address: `${r.address.area}, ${r.address.city}`,
        services: r.services,
      },
    }));

    return {
      intent: 'restaurant_recommendation',
      message: `Here are the highest-rated dining spots curated for you:`,
      cards,
      suggestions: ['View top vegetarian options', 'Show rewards enabled spots', 'Suggest something spicy under ₹300'],
    };
  }

  private static async handleOrderStatus(input: EssenAiQueryInput): Promise<EssenAiResponse> {
    if (!input.userId) {
      return {
        intent: 'order_status',
        message: 'Please sign in to view and track your live orders.',
        suggestions: ['Sign In', 'Browse Restaurants'],
      };
    }

    const latestOrder = await Order.findOne({ customer: input.userId })
      .sort({ createdAt: -1 })
      .populate('restaurant', 'name images');

    if (!latestOrder) {
      return {
        intent: 'order_status',
        message: "You haven't placed any orders yet. Discover our top restaurants to place your first delicious order!",
        suggestions: ['Find top restaurants', 'Suggest something spicy'],
      };
    }

    return {
      intent: 'order_status',
      message: `Your latest order **${latestOrder.orderNumber}** from **${(latestOrder.restaurant as any)?.name || 'Restaurant'}** is currently **${latestOrder.status.replace(/_/g, ' ')}**.`,
      cards: [
        {
          type: 'order',
          title: `Order ${latestOrder.orderNumber}`,
          subtitle: `Status: ${latestOrder.status} • Total: ₹${latestOrder.pricing.grandTotal}`,
          data: {
            orderId: latestOrder._id,
            orderNumber: latestOrder.orderNumber,
            status: latestOrder.status,
            orderType: latestOrder.orderType,
            items: latestOrder.items,
            pricing: latestOrder.pricing,
            deliveryOtp: latestOrder.deliveryOtp,
          },
        },
      ],
      suggestions: ['Track live on map', 'View invoice', 'Check reward coins'],
    };
  }

  private static async handleRewardInquiry(input: EssenAiQueryInput): Promise<EssenAiResponse> {
    if (!input.userId) {
      return {
        intent: 'rewards_inquiry',
        message: 'Please sign in to view your ESSEN reward coins, digital vouchers, and free combo progress.',
        suggestions: ['Sign In', 'Learn how ESSEN Rewards work'],
      };
    }

    const accounts = await RewardAccount.find({ customer: input.userId }).populate('restaurant', 'name images rewardsSettings');
    const unclaimedVouchers = await RewardVoucher.find({ customer: input.userId, status: 'UNCLAIMED' }).populate('restaurant', 'name');

    if (accounts.length === 0 && unclaimedVouchers.length === 0) {
      return {
        intent: 'rewards_inquiry',
        message:
          'You currently do not have active reward coins. Every completed order at participating restaurants grants an anti-fraud QR voucher giving **+5 to +10 ESSEN Coins** towards a free gourmet combo!',
        suggestions: ['Browse reward-eligible restaurants', 'How rewards work'],
      };
    }

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.coinBalance, 0);

    const cards = accounts.map((acc: any) => {
      const target = acc.restaurant?.rewardsSettings?.targetCoins || 5000;
      const progressPercent = Math.min(100, Math.round((acc.coinBalance / target) * 100));
      return {
        type: 'reward' as const,
        title: acc.restaurant?.name || 'Restaurant Loyalty',
        subtitle: `${acc.coinBalance} / ${target} Coins (${progressPercent}% toward Free Combo)`,
        data: {
          restaurantId: acc.restaurant?._id,
          restaurantName: acc.restaurant?.name,
          coinBalance: acc.coinBalance,
          targetCoins: target,
          remaining: Math.max(0, target - acc.coinBalance),
          rewardTitle: acc.restaurant?.rewardsSettings?.rewardTitle || 'Free Special Combo',
        },
      };
    });

    let voucherMsg = '';
    if (unclaimedVouchers.length > 0) {
      voucherMsg = ` You also have **${unclaimedVouchers.length} unclaimed digital QR voucher(s)** waiting in your Rewards tab!`;
    }

    return {
      intent: 'rewards_inquiry',
      message: `You have active loyalty accounts across ${accounts.length} restaurant(s) with a cumulative balance of **${totalBalance} coins**.${voucherMsg}`,
      cards,
      suggestions: ['Claim my voucher QR', 'Show restaurants with offers', 'View order history'],
    };
  }

  private static async handleOffersInquiry(input: EssenAiQueryInput): Promise<EssenAiResponse> {
    const restaurants = await Restaurant.find({ isVerified: true }).limit(3).sort({ rating: -1 });

    return {
      intent: 'deals_inquiry',
      message:
        'Here are today’s featured dining promotions! Use coupon **ESSEN50** for 50% OFF up to ₹150, or **WELCOME20** on your initial orders.',
      cards: restaurants.map((r: any) => ({
        type: 'restaurant' as const,
        title: r.name,
        subtitle: `Use Code: ESSEN50 • ★ ${r.rating} • ${r.cuisine[0] || 'Cuisine'}`,
        data: {
          id: r._id,
          name: r.name,
          rating: r.rating,
          coupon: 'ESSEN50',
          image: r.images?.cover,
        },
      })),
      suggestions: ['Apply coupon in cart', 'Suggest something spicy under ₹300'],
    };
  }

  private static async handleManagerRevenue(input: EssenAiQueryInput): Promise<EssenAiResponse> {
    const restaurantId = input.restaurantId;
    const filter = restaurantId ? { restaurant: restaurantId } : {};

    const orders = await Order.find(filter);
    const totalRevenue = orders
      .filter((o) => o.paymentStatus === 'PAID')
      .reduce((sum, o) => sum + o.pricing.grandTotal, 0);

    const completedOrders = orders.filter((o) => o.status === 'COMPLETED' || o.status === 'DELIVERED').length;
    const pendingOrders = orders.filter((o) => ['PLACED', 'ACCEPTED', 'PREPARING'].includes(o.status)).length;

    return {
      intent: 'manager_revenue',
      message: `**Manager Summary Report:**\n• Total Revenue: **₹${totalRevenue.toLocaleString('en-IN')}**\n• Total Orders: **${orders.length}**\n• Completed Orders: **${completedOrders}**\n• Currently Active / In Kitchen: **${pendingOrders}**`,
      suggestions: ['View live kitchen KDS', 'Show customer reviews sentiment', 'Peak hours analysis'],
    };
  }

  private static async handleManagerSentiment(input: EssenAiQueryInput): Promise<EssenAiResponse> {
    const restaurantId = input.restaurantId;
    const filter = restaurantId ? { restaurant: restaurantId } : {};

    const reviews = await Review.find(filter);
    const positive = reviews.filter((r) => r.sentiment === 'positive').length;
    const neutral = reviews.filter((r) => r.sentiment === 'neutral').length;
    const negative = reviews.filter((r) => r.sentiment === 'negative').length;
    const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '4.5';

    return {
      intent: 'manager_sentiment',
      message: `**Customer Review Sentiment Breakdown:**\n• Average Customer Rating: **★ ${avgRating} / 5.0**\n• Positive Sentiment: **${positive}** reviews\n• Neutral Feedback: **${neutral}** reviews\n• Actionable / Complaints: **${negative}** items`,
      suggestions: ['View revenue dashboard', 'Manage staff accounts', 'Kitchen status'],
    };
  }

  private static async handleManagerPerformance(input: EssenAiQueryInput): Promise<EssenAiResponse> {
    const restaurantId = input.restaurantId;
    const filter = restaurantId ? { restaurant: restaurantId } : {};

    const bestsellers = await MenuItem.find(filter).sort({ orderCount: -1 }).limit(3);

    return {
      intent: 'manager_analytics',
      message: `**Bestselling Menu Items:**\n${bestsellers
        .map((b, i) => `${i + 1}. **${b.name}** — ${b.orderCount} orders (₹${b.price})`)
        .join('\n')}\n\n**Peak Operational Hours:** 1:00 PM - 3:00 PM & 8:00 PM - 10:30 PM`,
      suggestions: ['Update menu stock', 'Check live KDS board'],
    };
  }

  private static async handleWaiterTasks(input: EssenAiQueryInput): Promise<EssenAiResponse> {
    const restaurantId = input.restaurantId;
    const tables = await RestaurantTable.find(restaurantId ? { restaurant: restaurantId } : {}).limit(6);
    const occupied = tables.filter((t) => t.status === 'OCCUPIED' || t.status === 'BILL_REQUESTED').length;

    return {
      intent: 'waiter_tasks',
      message: `**Waiter Live Status:**\n• Assigned Tables Active: **${occupied} / ${tables.length}**\n• Tables Requesting Bill: **${tables.filter((t) => t.status === 'BILL_REQUESTED').length}**`,
      suggestions: ['View waiter dashboard', 'Check ready orders in kitchen'],
    };
  }
}
