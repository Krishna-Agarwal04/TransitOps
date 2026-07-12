import { Router } from 'express';
import * as maintenanceController from '../controllers/maintenanceController.js';
import { validateCreateMaintenance, validateCompleteMaintenance, validateMaintenanceId } from '../validators/maintenanceValidator.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();

// Start maintenance: FLEET_MANAGER
router.post('/', authenticateToken, authorizeRoles('FLEET_MANAGER'), validateCreateMaintenance, maintenanceController.start);

// Complete maintenance: FLEET_MANAGER
router.patch('/:id', authenticateToken, authorizeRoles('FLEET_MANAGER'), validateMaintenanceId, validateCompleteMaintenance, maintenanceController.complete);

// Get maintenance log history: FLEET_MANAGER, FINANCIAL_ANALYST, SAFETY_OFFICER
router.get('/', authenticateToken, authorizeRoles('FLEET_MANAGER', 'FINANCIAL_ANALYST', 'SAFETY_OFFICER'), maintenanceController.getAll);

export default router;
