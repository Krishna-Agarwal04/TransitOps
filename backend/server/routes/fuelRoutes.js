import { Router } from 'express';
import * as fuelController from '../controllers/fuelController.js';
import { validateCreateFuel } from '../validators/fuelValidator.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();

// Log fuel transaction: FLEET_MANAGER
router.post('/', authenticateToken, authorizeRoles('FLEET_MANAGER'), validateCreateFuel, fuelController.create);

// Get fuel log history: FLEET_MANAGER, FINANCIAL_ANALYST
router.get('/', authenticateToken, authorizeRoles('FLEET_MANAGER', 'FINANCIAL_ANALYST'), fuelController.getAll);

export default router;
