import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { MenuCategory } from '../models/MenuCategory';
import { MenuItem } from '../models/MenuItem';
import { AuthRequest } from '../middleware/auth';
import { mockStore } from '../utils/mockDataStore';

export class MenuController {
  /**
   * Get Categories & Menu for a Restaurant
   */
  public static async getMenuByRestaurant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { restaurantId } = req.params;

      if (mongoose.connection.readyState !== 1) {
        const categories = mockStore.categories.filter((c) => c.restaurant === restaurantId);
        const items = mockStore.menuItems.filter((i) => i.restaurant === restaurantId);
        res.status(200).json({
          success: true,
          data: { categories, items },
        });
        return;
      }

      const categories = await MenuCategory.find({ restaurant: restaurantId, isActive: true }).sort({ sortOrder: 1 });
      const items = await MenuItem.find({ restaurant: restaurantId });

      res.status(200).json({
        success: true,
        data: { categories, items },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add Menu Item (Manager)
   */
  public static async addMenuItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const itemData = req.body;

      if (mongoose.connection.readyState !== 1) {
        const item = {
          _id: `dish_${Date.now()}`,
          restaurant: restaurantId,
          ...itemData,
          rating: 4.9,
          orderCount: 1,
          isAvailable: true,
        };
        mockStore.menuItems.push(item);
        res.status(201).json({
          success: true,
          message: 'Menu item created successfully.',
          data: { item },
        });
        return;
      }

      const item = await MenuItem.create({
        ...itemData,
        restaurant: restaurantId,
      });

      res.status(201).json({
        success: true,
        message: 'Menu item created successfully.',
        data: { item },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update Menu Item or Stock Availability (Manager)
   */
  public static async updateMenuItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (mongoose.connection.readyState !== 1) {
        const item = mockStore.menuItems.find((i) => i._id === id);
        if (!item) {
          res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Menu item not found' } });
          return;
        }
        Object.assign(item, req.body);
        mockStore.saveToDisk();
        res.status(200).json({
          success: true,
          message: 'Menu item updated.',
          data: { item },
        });
        return;
      }

      const item = await MenuItem.findByIdAndUpdate(id, req.body, { new: true });
      if (!item) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Menu item not found' } });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Menu item updated.',
        data: { item },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create Menu Category
   */
  public static async createCategory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const { name, description, sortOrder } = req.body;

      if (mongoose.connection.readyState !== 1) {
        const category = {
          _id: `cat_${Date.now()}`,
          restaurant: restaurantId,
          name,
          description,
          sortOrder: sortOrder || 0,
          isActive: true,
        };
        mockStore.categories.push(category);
        res.status(201).json({
          success: true,
          message: 'Category created.',
          data: { category },
        });
        return;
      }

      const category = await MenuCategory.create({
        restaurant: restaurantId,
        name,
        description,
        sortOrder: sortOrder || 0,
      });

      res.status(201).json({
        success: true,
        message: 'Category created.',
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  }
}

