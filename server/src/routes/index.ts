import { Router } from 'express';
import authRoutes from './authRoutes';
import restaurantRoutes from './restaurantRoutes';
import menuRoutes from './menuRoutes';
import dineInRoutes from './dineInRoutes';
import orderRoutes from './orderRoutes';
import deliveryRoutes from './deliveryRoutes';
import paymentRoutes from './paymentRoutes';
import rewardRoutes from './rewardRoutes';
import reviewRoutes from './reviewRoutes';
import couponRoutes from './couponRoutes';
import supportRoutes from './supportRoutes';
import analyticsRoutes from './analyticsRoutes';
import adminRoutes from './adminRoutes';
import essenAiRoutes from './essenAiRoutes';
import { seedDatabase } from '../config/seed';

const router = Router();

router.all('/seed', async (_req, res) => {
  try {
    await seedDatabase(false);
    res.json({ success: true, message: 'Database seeded successfully with sample restaurants, menus, and test accounts!' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.use('/auth', authRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/menu', menuRoutes);
router.use('/dine-in', dineInRoutes);
router.use('/orders', orderRoutes);
router.use('/delivery', deliveryRoutes);
router.use('/payments', paymentRoutes);
router.use('/rewards', rewardRoutes);
router.use('/reviews', reviewRoutes);
router.use('/coupons', couponRoutes);
router.use('/support', supportRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin', adminRoutes);
router.use('/essen', essenAiRoutes);

export default router;
