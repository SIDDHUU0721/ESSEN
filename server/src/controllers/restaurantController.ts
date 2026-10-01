import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Restaurant } from '../models/Restaurant';
import { MenuItem } from '../models/MenuItem';
import { MenuCategory } from '../models/MenuCategory';
import { Review } from '../models/Review';
import { RestaurantTable } from '../models/RestaurantTable';
import { RestaurantStaff } from '../models/RestaurantStaff';
import { AuthRequest } from '../middleware/auth';
import { calculateDistanceKm } from '../utils/geo';
import { generateSecureToken } from '../utils/qr';
import { mockStore } from '../utils/mockDataStore';

export class RestaurantController {
  /**
   * Discover and Multi-filter Restaurants
   */
  public static async discoverRestaurants(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        search,
        foodType,
        rating,
        cuisine,
        priceRange,
        distance,
        service,
        availability,
        restaurantType,
        taste,
        sortBy = 'recommended',
        userLat = 13.0827, // Default Chennai coords for distance calc
        userLng = 80.2707,
      } = req.query as Record<string, string>;

      if (mongoose.connection.readyState !== 1) {
        let list = [...mockStore.restaurants];

        if (search && search.trim() !== '') {
          const q = search.trim().toLowerCase();
          list = list.filter(
            (r) =>
              r.name.toLowerCase().includes(q) ||
              r.tagline?.toLowerCase().includes(q) ||
              r.cuisine?.some((c) => c.toLowerCase().includes(q)) ||
              r.address?.city?.toLowerCase().includes(q) ||
              r.address?.area?.toLowerCase().includes(q)
          );
        }

        if (foodType && foodType !== 'all') {
          if (foodType === 'vegetarian' || foodType === 'pure-veg') {
            list = list.filter((r) => r.foodType === 'veg' || r.foodType === 'pure-veg');
          } else if (foodType === 'non-vegetarian') {
            list = list.filter((r) => r.foodType === 'non-veg' || r.foodType === 'both');
          }
        }

        if (rating) {
          const minRating = parseFloat(rating);
          if (!isNaN(minRating)) list = list.filter((r) => r.rating >= minRating);
        }

        if (cuisine && cuisine !== 'all') {
          const cuisines = cuisine.toLowerCase().split(',').map((c) => c.trim());
          list = list.filter((r) => r.cuisine?.some((c) => cuisines.includes(c.toLowerCase())));
        }

        if (restaurantType && restaurantType !== 'all') {
          list = list.filter((r) => r.restaurantType === restaurantType);
        }

        if (service) {
          if (service === 'dine_in') list = list.filter((r) => r.services?.dineIn);
          if (service === 'delivery') list = list.filter((r) => r.services?.delivery);
          if (service === 'takeaway') list = list.filter((r) => r.services?.takeaway);
        }

        if (availability === 'open_now') {
          list = list.filter((r) => r.status === 'OPEN');
        }

        if (req.query.rewardsOnly === 'true') {
          list = list.filter((r) => r.rewardsSettings?.isEnabled);
        }

        const latNum = parseFloat(userLat as any) || 13.0827;
        const lngNum = parseFloat(userLng as any) || 80.2707;
        let results = list.map((r) => {
          const coords = r.location?.coordinates || [80.2707, 13.0827];
          const distKm = calculateDistanceKm(latNum, lngNum, coords[1], coords[0]);
          return { ...r, calculatedDistanceKm: distKm };
        });

        if (distance) {
          const maxDist = parseFloat(distance);
          if (!isNaN(maxDist)) results = results.filter((r) => (r.calculatedDistanceKm || 0) <= maxDist);
        }

        if (sortBy === 'top_rated') results.sort((a, b) => b.rating - a.rating);
        else if (sortBy === 'price_low_high') results.sort((a, b) => a.averagePriceForTwo - b.averagePriceForTwo);
        else if (sortBy === 'price_high_low') results.sort((a, b) => b.averagePriceForTwo - a.averagePriceForTwo);
        else results.sort((a, b) => b.rating - a.rating);

        res.status(200).json({
          success: true,
          count: results.length,
          data: results,
        });
        return;
      }

      const filter: any = { isVerified: true };

      // 1. Keyword search (Name, Tagline, Cuisine)
      if (search && search.trim() !== '') {
        const regex = new RegExp(search.trim(), 'i');
        filter.$or = [
          { name: regex },
          { tagline: regex },
          { cuisine: { $in: [regex] } },
          { 'address.area': regex },
          { 'address.city': regex },
        ];
      }

      // 2. Food Type Filter (veg, non-veg, pure-veg)
      if (foodType && foodType !== 'all') {
        if (foodType === 'vegetarian' || foodType === 'pure-veg') {
          filter.foodType = { $in: ['veg', 'pure-veg'] };
        } else if (foodType === 'non-vegetarian') {
          filter.foodType = { $in: ['non-veg', 'both'] };
        }
      }

      // 3. Minimum Rating Filter
      if (rating) {
        const minRating = parseFloat(rating);
        if (!isNaN(minRating)) {
          filter.rating = { $gte: minRating };
        }
      }

      // 4. Cuisine Filter
      if (cuisine && cuisine !== 'all') {
        const cuisines = cuisine.split(',');
        filter.cuisine = { $in: cuisines.map((c) => new RegExp(`^${c.trim()}$`, 'i')) };
      }

      // 5. Restaurant Type
      if (restaurantType && restaurantType !== 'all') {
        filter.restaurantType = restaurantType;
      }

      // 6. Service Availability (dine-in, delivery, takeaway)
      if (service) {
        if (service === 'dine_in') filter['services.dineIn'] = true;
        if (service === 'delivery') filter['services.delivery'] = true;
        if (service === 'takeaway') filter['services.takeaway'] = true;
      }

      // 7. Open Status
      if (availability === 'open_now') {
        filter.status = 'OPEN';
      }

      // 8. Reward Eligible
      if (req.query.rewardsOnly === 'true') {
        filter['rewardsSettings.isEnabled'] = true;
      }

      // Sorting
      let sortObj: any = { rating: -1, reviewCount: -1 };
      if (sortBy === 'top_rated') sortObj = { rating: -1 };
      else if (sortBy === 'price_low_high') sortObj = { averagePriceForTwo: 1 };
      else if (sortBy === 'price_high_low') sortObj = { averagePriceForTwo: -1 };

      const restaurants = await Restaurant.find(filter).sort(sortObj);

      // Add dynamic distance and price bracket
      const latNum = parseFloat(userLat as any) || 13.0827;
      const lngNum = parseFloat(userLng as any) || 80.2707;

      const results = restaurants.map((r) => {
        const coords = r.location?.coordinates || [80.2707, 13.0827];
        const distKm = calculateDistanceKm(latNum, lngNum, coords[1], coords[0]);
        return {
          ...r.toObject(),
          calculatedDistanceKm: distKm,
        };
      });

      // Filter by distance if requested
      let finalResults = results;
      if (distance) {
        const maxDist = parseFloat(distance);
        if (!isNaN(maxDist)) {
          finalResults = results.filter((r) => r.calculatedDistanceKm <= maxDist);
        }
      }

      res.status(200).json({
        success: true,
        count: finalResults.length,
        data: finalResults,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search Food Dishes Across All Restaurants
   */
  public static async searchDishes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { query, foodType, taste, maxPrice, rating } = req.query as Record<string, string>;

      if (mongoose.connection.readyState !== 1) {
        let items = [...mockStore.menuItems];
        if (query && query.trim()) {
          const q = query.trim().toLowerCase();
          items = items.filter(
            (i) =>
              i.name.toLowerCase().includes(q) ||
              i.description?.toLowerCase().includes(q) ||
              i.cuisine?.toLowerCase().includes(q)
          );
        }
        if (foodType && foodType !== 'all') {
          items = items.filter((i) => i.foodType === foodType);
        }
        if (taste && taste !== 'all') {
          items = items.filter((i) => i.tasteProfile === taste);
        }
        if (maxPrice) {
          const p = parseFloat(maxPrice);
          if (!isNaN(p)) items = items.filter((i) => i.price <= p);
        }
        if (rating) {
          const r = parseFloat(rating);
          if (!isNaN(r)) items = items.filter((i) => i.rating >= r);
        }

        const populated = items.map((dish) => {
          const rest = mockStore.restaurants.find((r) => r._id === dish.restaurant);
          return {
            ...dish,
            restaurant: rest || { name: 'ESSEN Partner Outlet', restaurantCode: 'EST-100', rating: 4.8 },
          };
        });

        res.status(200).json({
          success: true,
          count: populated.length,
          data: populated,
        });
        return;
      }

      const filter: any = { isAvailable: true };

      if (query && query.trim()) {
        const regex = new RegExp(query.trim(), 'i');
        filter.$or = [{ name: regex }, { description: regex }, { cuisine: regex }];
      }

      if (foodType && foodType !== 'all') {
        filter.foodType = foodType;
      }

      if (taste && taste !== 'all') {
        filter.tasteProfile = taste;
      }

      if (maxPrice) {
        const price = parseFloat(maxPrice);
        if (!isNaN(price)) filter.price = { $lte: price };
      }

      if (rating) {
        const r = parseFloat(rating);
        if (!isNaN(r)) filter.rating = { $gte: r };
      }

      const dishes = await MenuItem.find(filter)
        .populate('restaurant', 'name images rating address restaurantCode services rewardsSettings')
        .sort({ rating: -1, orderCount: -1 })
        .limit(30);

      res.status(200).json({
        success: true,
        count: dishes.length,
        data: dishes,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Restaurant Details with Full Menu, Reviews, Tables, Rewards
   */
  public static async getRestaurantById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (mongoose.connection.readyState !== 1) {
        const restaurant = mockStore.restaurants.find(
          (r) => r._id === id || r.slug === id || r.restaurantCode === id
        );
        if (!restaurant) {
          res.status(404).json({
            success: false,
            error: { code: 'NOT_FOUND', message: 'Restaurant not found' },
          });
          return;
        }

        const categories = mockStore.categories.filter((c) => c.restaurant === restaurant._id);
        const menuItems = mockStore.menuItems.filter((m) => m.restaurant === restaurant._id);
        const tables = mockStore.tables.filter((t) => t.restaurant === restaurant._id);

        res.status(200).json({
          success: true,
          data: {
            restaurant,
            categories,
            menuItems,
            tables,
            reviews: [
              {
                _id: 'rev_1',
                userName: 'Priya Raman',
                rating: 5,
                comment: 'Exceptional hospitality and sublime authentic taste!',
                createdAt: new Date().toISOString(),
              },
              {
                _id: 'rev_2',
                userName: 'Karthik S.',
                rating: 4.8,
                comment: 'Speedy table QR ordering and fantastic food quality.',
                createdAt: new Date().toISOString(),
              },
            ],
          },
        });
        return;
      }

      const restaurant = await Restaurant.findById(id);
      if (!restaurant) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Restaurant not found' },
        });
        return;
      }

      const categories = await MenuCategory.find({ restaurant: id, isActive: true }).sort({ sortOrder: 1 });
      const menuItems = await MenuItem.find({ restaurant: id, isAvailable: true }).populate('category');
      const recentReviews = await Review.find({ restaurant: id }).sort({ createdAt: -1 }).limit(10);

      res.status(200).json({
        success: true,
        data: {
          restaurant,
          categories,
          menuItems,
          reviews: recentReviews,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 1-Click Seed Sample Restaurants into Res Hub
   */
  public static async seedSampleRestaurants(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const seeded = mockStore.addSampleRestaurants();
      res.status(200).json({
        success: true,
        message: 'Sample restaurants loaded into Res Hub successfully!',
        count: seeded.length,
        data: seeded,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Register New Restaurant (Creates Restaurant and Manager Binding in Res Hub)
   */
  public static async registerRestaurant(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (mongoose.connection.readyState !== 1) {
        const restaurant = mockStore.addRestaurant(req.body, req.userId);
        res.status(201).json({
          success: true,
          message: 'Restaurant created and verified successfully in Res Hub.',
          data: { restaurant },
        });
        return;
      }

      const {
        name,
        description,
        tagline,
        cuisine,
        foodType,
        ambience,
        restaurantType,
        address,
        location,
        contact,
        businessInfo,
        images,
        openingHours,
        services,
        averagePriceForTwo,
        rewardsSettings,
      } = req.body;

      const codeRandom = Math.floor(1000 + Math.random() * 9000);
      const restaurantCode = `EST-${name.slice(0, 3).toUpperCase()}-${codeRandom}`;
      const slug = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;

      const restaurant = await Restaurant.create({
        name,
        slug,
        restaurantCode,
        description: description || `Welcome to ${name}, experiencing authentic culinary flavors.`,
        tagline: tagline || 'Authentic & Delightful Dining',
        cuisine: cuisine || ['Indian', 'Multi-Cuisine'],
        foodType: foodType || 'both',
        ambience: ambience || ['Casual', 'Family'],
        restaurantType: restaurantType || 'family',
        address: address || { street: '123 Food Street', area: 'Downtown', city: 'Chennai', state: 'Tamil Nadu', pincode: '600001' },
        location: location || { type: 'Point', coordinates: [80.2707, 13.0827] },
        contact: contact || { phone: '9876543210', email: 'contact@restaurant.com' },
        businessInfo: businessInfo || {},
        images: images || {
          cover: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
          logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200',
          gallery: [],
        },
        openingHours: openingHours || { openTime: '10:00', closeTime: '23:00', daysOpen: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
        services: services || { dineIn: true, delivery: true, takeaway: true, tableBooking: true },
        averagePriceForTwo: averagePriceForTwo || 500,
        rewardsSettings: rewardsSettings || {
          isEnabled: true,
          coinsPerOrderMin: 5,
          coinsPerOrderMax: 10,
          targetCoins: 5000,
          rewardTitle: 'Free Special Combo',
          rewardDescription: 'Enjoy a free Chef Special combo meal upon reaching 5,000 ESSEN coins.',
          comboItems: ['Signature Main Course', 'Fresh Breads', 'Gourmet Dessert'],
        },
        verificationStatus: 'VERIFIED',
        isVerified: true,
      });

      if (req.userId) {
        await RestaurantStaff.create({
          user: req.userId,
          restaurant: restaurant._id,
          staffRole: 'manager',
          employeeCode: `MGR-1`,
          assignedTables: [],
        });
      }

      const sampleTables = [
        { tableNumber: 1, tableName: 'Table 1 - Window Corner', capacity: 2, section: 'indoor' },
        { tableNumber: 2, tableName: 'Table 2 - Center Hall', capacity: 4, section: 'indoor' },
        { tableNumber: 3, tableName: 'Table 3 - Family Booth', capacity: 6, section: 'indoor' },
        { tableNumber: 4, tableName: 'Table 4 - Terrace View', capacity: 4, section: 'rooftop' },
      ];

      for (const t of sampleTables) {
        await RestaurantTable.create({
          restaurant: restaurant._id,
          tableNumber: t.tableNumber,
          tableName: t.tableName,
          capacity: t.capacity,
          section: t.section as any,
          qrToken: generateSecureToken(`TBL_${restaurant._id}_${t.tableNumber}`),
        });
      }

      res.status(201).json({
        success: true,
        message: 'Restaurant created and verified successfully.',
        data: { restaurant },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update Restaurant Status (OPEN, CLOSING_SOON, CLOSED, TEMPORARILY_UNAVAILABLE)
   */
  public static async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (mongoose.connection.readyState !== 1) {
        const rest = mockStore.restaurants.find((r) => r._id === id || r.slug === id || r.restaurantCode === id);
        if (!rest) {
          res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Restaurant not found' } });
          return;
        }
        rest.status = status;
        res.status(200).json({
          success: true,
          message: `Restaurant status updated to ${status}`,
          data: { restaurant: rest },
        });
        return;
      }

      const restaurant = await Restaurant.findByIdAndUpdate(id, { status }, { new: true });
      if (!restaurant) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Restaurant not found' } });
        return;
      }

      res.status(200).json({
        success: true,
        message: `Restaurant status updated to ${status}`,
        data: { restaurant },
      });
    } catch (error) {
      next(error);
    }
  }
}
