import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();

// Get Dashboard telemetry: FLEET_MANAGER, FINANCIAL_ANALYST, SAFETY_OFFICER
router.get('/', authenticateToken, authorizeRoles('FLEET_MANAGER', 'FINANCIAL_ANALYST', 'SAFETY_OFFICER'), dashboardController.getStats);

export default router;
