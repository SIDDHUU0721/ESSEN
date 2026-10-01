import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { User, IUser } from '../models/User';
import { Restaurant } from '../models/Restaurant';
import { RestaurantStaff } from '../models/RestaurantStaff';
import { generateToken } from '../utils/token';
import { AuthRequest } from '../middleware/auth';
import { mockStore } from '../utils/mockDataStore';

export class AuthController {
  /**
   * Customer / Partner Registration
   */
  public static async registerCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, phone, password, preferences, role, restaurantId, restaurantCode } = req.body;
      const cleanEmail = email?.toLowerCase().trim();

      if (!cleanEmail || !password) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_INPUT', message: 'Email and password are required.' },
        });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({
          success: false,
          error: { code: 'PASSWORD_TOO_SHORT', message: 'Password must be at least 6 characters long.' },
        });
        return;
      }

      if (mongoose.connection.readyState !== 1) {
        // Resilient persistent fallback when MongoDB is not running locally
        if (mockStore.userExists(cleanEmail)) {
          res.status(400).json({
            success: false,
            error: {
              code: 'USER_EXISTS',
              message: 'An account with this email address already exists. Please sign in instead.',
            },
          });
          return;
        }

        const newUser = mockStore.registerUser({
          name: name || cleanEmail.split('@')[0],
          email: cleanEmail,
          phone: phone || '9876543210',
          password: password,
          role: role || 'customer',
          preferences: preferences || { foodType: 'any', favoriteCuisines: [], spicinessPreference: 'medium' },
          restaurantId: restaurantId || 'rest_1',
          restaurantCode: restaurantCode || 'EST-ROY-1001',
        });

        const token = generateToken({
          userId: newUser.id,
          role: newUser.role,
          restaurantId: newUser.restaurantId,
        });

        res.status(201).json({
          success: true,
          message: 'Account registered successfully.',
          data: {
            token,
            restaurantId: newUser.restaurantId,
            user: {
              id: newUser.id,
              name: newUser.name,
              email: newUser.email,
              phone: newUser.phone,
              role: newUser.role,
              preferences: newUser.preferences,
            },
          },
        });
        return;
      }

      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        res.status(400).json({
          success: false,
          error: { code: 'USER_EXISTS', message: 'An account with this email address already exists. Please sign in instead.' },
        });
        return;
      }

      const user = await User.create({
        name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        phone: phone || '9876543210',
        password,
        role: role || 'customer',
        preferences: preferences || { foodType: 'any', favoriteCuisines: [], spicinessPreference: 'medium' },
      });

      const token = generateToken({ userId: user._id.toString(), role: user.role });

      res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            preferences: user.preferences,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * General / Customer / Partner Login
   */
  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const cleanEmail = email?.toLowerCase().trim();

      if (!cleanEmail || !password) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Email and password are required.' },
        });
        return;
      }

      if (mongoose.connection.readyState !== 1) {
        const offlineUser = mockStore.getUserByEmail(cleanEmail);

        if (!offlineUser) {
          res.status(401).json({
            success: false,
            error: {
              code: 'INVALID_CREDENTIALS',
              message: 'No account found with this email. Please register first.',
            },
          });
          return;
        }

        // Validate password against persistent offline store
        if (offlineUser.password && offlineUser.password !== password) {
          res.status(401).json({
            success: false,
            error: {
              code: 'INVALID_CREDENTIALS',
              message: 'Incorrect password. Please verify your password and try again.',
            },
          });
          return;
        }

        const token = generateToken({
          userId: offlineUser.id,
          role: offlineUser.role,
          restaurantId: offlineUser.restaurantId || 'rest_1',
        });

        res.status(200).json({
          success: true,
          message: 'Login successful.',
          data: {
            token,
            restaurantId: offlineUser.restaurantId || 'rest_1',
            user: {
              id: offlineUser.id,
              name: offlineUser.name,
              email: offlineUser.email,
              phone: offlineUser.phone,
              role: offlineUser.role,
              preferences: offlineUser.preferences,
              restaurantId: offlineUser.restaurantId,
              restaurantCode: offlineUser.restaurantCode,
            },
          },
        });
        return;
      }

      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        res.status(401).json({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'No account found with this email. Please register first.' },
        });
        return;
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Incorrect password. Please verify your password and try again.' },
        });
        return;
      }

      let restaurantId: string | undefined;
      if (user.role === 'manager' || user.role === 'waiter') {
        const staff = await RestaurantStaff.findOne({ user: user._id, isActive: true });
        if (staff) {
          restaurantId = staff.restaurant.toString();
        }
      }

      const token = generateToken({ userId: user._id.toString(), role: user.role, restaurantId });

      res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: {
          token,
          restaurantId,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            avatar: user.avatar,
            addresses: user.addresses,
            preferences: user.preferences,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Manager Login with Restaurant Hotel Code Verification
   * Authenticated User -> Manager Role -> Restaurant Association -> Restaurant Code -> Authorized Restaurant
   */
  public static async managerLoginWithCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, restaurantCode } = req.body;

      if (mongoose.connection.readyState !== 1) {
        let offlineUser = mockStore.getUserByEmail(email);
        if (!offlineUser) {
          offlineUser = mockStore.registerUser({
            email,
            password: password || 'password123',
            name: email.split('@')[0],
            role: 'manager',
          });
        }
        const rest = mockStore.restaurants.find((r) => r.restaurantCode === restaurantCode?.toUpperCase().trim()) || mockStore.restaurants[0];
        const token = generateToken({ userId: offlineUser.id, role: 'manager', restaurantId: rest._id });
        res.status(200).json({
          success: true,
          message: 'Manager verified and authorized.',
          data: {
            token,
            restaurant: { id: rest._id, name: rest.name, code: rest.restaurantCode, status: rest.status },
            user: offlineUser,
          },
        });
        return;
      }

      const user = await User.findOne({ email });
      if (!user) {
        res.status(401).json({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid manager credentials.' },
        });
        return;
      }

      if (user.role !== 'manager' && user.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: { code: 'NOT_A_MANAGER', message: 'User does not possess manager privileges.' },
        });
        return;
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid manager credentials.' },
        });
        return;
      }

      // Verify the restaurant with code exists
      const restaurant = await Restaurant.findOne({ restaurantCode: restaurantCode.toUpperCase().trim() });
      if (!restaurant) {
        res.status(404).json({
          success: false,
          error: { code: 'INVALID_RESTAURANT_CODE', message: 'Restaurant code is invalid or not registered.' },
        });
        return;
      }

      // Check manager's actual staff assignment
      const staffRecord = await RestaurantStaff.findOne({
        user: user._id,
        restaurant: restaurant._id,
        isActive: true,
      });

      if (!staffRecord && user.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED_RESTAURANT_BINDING',
            message: 'You are not an authorized manager for this specific restaurant.',
          },
        });
        return;
      }

      const token = generateToken({
        userId: user._id.toString(),
        role: user.role,
        restaurantId: restaurant._id.toString(),
      });

      res.status(200).json({
        success: true,
        message: 'Manager verified and authorized.',
        data: {
          token,
          restaurant: {
            id: restaurant._id,
            name: restaurant.name,
            code: restaurant.restaurantCode,
            status: restaurant.status,
          },
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Current Authenticated Profile
   */
  public static async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (mongoose.connection.readyState !== 1) {
        const user = mockStore.getUserById(req.userId || '') || req.user;
        const rest =
          mockStore.restaurants.find((r) => r._id === (user?.restaurantId || req.restaurantId)) ||
          mockStore.restaurants[0];
        res.status(200).json({
          success: true,
          data: {
            user,
            restaurant: rest,
          },
        });
        return;
      }

      const user = req.user;
      let restaurantDetails: any = null;

      if (req.userRole === 'manager' || req.userRole === 'waiter') {
        const staff = await RestaurantStaff.findOne({ user: req.userId, isActive: true }).populate('restaurant');
        if (staff) {
          restaurantDetails = staff.restaurant;
        }
      }

      res.status(200).json({
        success: true,
        data: {
          user,
          restaurant: restaurantDetails,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update Profile & Preferences
   */
  public static async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, phone, preferences, addresses } = req.body;

      if (mongoose.connection.readyState !== 1) {
        const user = mockStore.getUserById(req.userId || '');
        if (user) {
          if (name) user.name = name;
          if (phone) user.phone = phone;
          if (preferences) user.preferences = { ...user.preferences, ...preferences };
          if (addresses) user.addresses = addresses;
        }
        res.status(200).json({
          success: true,
          message: 'Profile updated successfully.',
          data: { user: user || req.user },
        });
        return;
      }

      const user = await User.findById(req.userId);
      if (!user) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
        return;
      }

      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (preferences) user.preferences = { ...user.preferences, ...preferences };
      if (addresses) user.addresses = addresses;

      await user.save();

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Staff / Waiters for a Restaurant
   */
  public static async getRestaurantStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { restaurantId } = req.params;

      if (mongoose.connection.readyState !== 1) {
        const staff = mockStore.getStaffByRestaurant(restaurantId).map((u) => ({
          _id: u.id,
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          restaurantId: u.restaurantId,
          isActive: u.isActive !== false,
        }));
        res.status(200).json({ success: true, data: { staff } });
        return;
      }

      const staffDocs = await RestaurantStaff.find({ restaurant: restaurantId }).populate('user', 'name email phone role isActive');
      res.status(200).json({ success: true, data: { staff: staffDocs } });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create New Waiter / Staff Member
   */
  public static async createStaffMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, phone, password, role = 'waiter', restaurantId, restaurantCode, assignedTables = [1, 2, 3, 4] } = req.body;
      const cleanEmail = email?.toLowerCase().trim();

      if (!cleanEmail || !password || !name) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_INPUT', message: 'Name, email, and password are required to create a waiter account.' },
        });
        return;
      }

      if (mongoose.connection.readyState !== 1) {
        if (mockStore.userExists(cleanEmail)) {
          res.status(400).json({
            success: false,
            error: { code: 'USER_EXISTS', message: 'An account with this email address already exists.' },
          });
          return;
        }

        const newUser = mockStore.registerUser({
          name,
          email: cleanEmail,
          phone: phone || '9876500000',
          password,
          role: role as any,
          restaurantId: restaurantId || 'rest_1',
          restaurantCode: restaurantCode || 'EST-ROY-1001',
        });

        res.status(201).json({
          success: true,
          message: `Waiter account for "${name}" created successfully.`,
          data: {
            user: {
              id: newUser.id,
              name: newUser.name,
              email: newUser.email,
              phone: newUser.phone,
              role: newUser.role,
              restaurantId: newUser.restaurantId,
              restaurantCode: newUser.restaurantCode,
            },
          },
        });
        return;
      }

      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        res.status(400).json({
          success: false,
          error: { code: 'USER_EXISTS', message: 'An account with this email address already exists.' },
        });
        return;
      }

      const user = await User.create({
        name,
        email: cleanEmail,
        phone: phone || '9876500000',
        password,
        role: role as any,
      });

      if (restaurantId) {
        await RestaurantStaff.create({
          user: user._id,
          restaurant: restaurantId,
          staffRole: role,
          assignedTables,
          isActive: true,
        });
      }

      res.status(201).json({
        success: true,
        message: `Waiter account for "${name}" created successfully.`,
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
