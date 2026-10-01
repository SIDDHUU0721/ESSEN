import { Router } from 'express';
import { RewardController } from '../controllers/rewardController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.get('/hub', authenticate, RewardController.getCustomerRewardsHub);
router.post('/claim-voucher', authenticate, RewardController.claimRewardVoucher);
router.post('/unlock-combo', authenticate, RewardController.unlockComboReward);
router.post('/redeem-voucher', authenticate, requireRole(['waiter', 'manager', 'admin']), RewardController.scanAndRedeemVoucher);
router.get('/manager-stats/:restaurantId', authenticate, requireRole(['manager', 'admin']), RewardController.getManagerRewardsStats);

export default router;
