import { Router } from 'express';
import * as tripController from '../controllers/tripController.js';
import { validateCreateTrip, validateTripId } from '../validators/tripValidator.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();

// Create Trip: restricted to FLEET_MANAGER
router.post('/', authenticateToken, authorizeRoles('FLEET_MANAGER'), validateCreateTrip, tripController.create);

// Get All Trips: allowed for FLEET_MANAGER, DRIVER, SAFETY_OFFICER, FINANCIAL_ANALYST
router.get('/', authenticateToken, authorizeRoles('FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'), tripController.getAll);

// Get Single Trip: allowed for FLEET_MANAGER, DRIVER, SAFETY_OFFICER, FINANCIAL_ANALYST
router.get('/:id', authenticateToken, authorizeRoles('FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'), validateTripId, tripController.getById);

// Dispatch Trip: restricted to FLEET_MANAGER
router.patch('/:id/dispatch', authenticateToken, authorizeRoles('FLEET_MANAGER'), validateTripId, tripController.dispatch);

// Complete Trip: restricted to FLEET_MANAGER
router.patch('/:id/complete', authenticateToken, authorizeRoles('FLEET_MANAGER'), validateTripId, tripController.complete);

export default router;
