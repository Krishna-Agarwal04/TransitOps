import { Router } from 'express';
import * as vehicleController from '../controllers/vehicleController.js';
import { validateCreateVehicle, validateUpdateVehicle, validateVehicleId } from '../validators/vehicleValidator.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', authenticateToken, authorizeRoles('FLEET_MANAGER'), validateCreateVehicle, vehicleController.create);
router.get('/', authenticateToken, authorizeRoles('FLEET_MANAGER', 'DRIVER'), vehicleController.getAll);
router.get('/:id', authenticateToken, authorizeRoles('FLEET_MANAGER', 'DRIVER'), validateVehicleId, vehicleController.getById);
router.put('/:id', authenticateToken, authorizeRoles('FLEET_MANAGER'), validateUpdateVehicle, vehicleController.update);
router.delete('/:id', authenticateToken, authorizeRoles('FLEET_MANAGER'), validateVehicleId, vehicleController.remove);

export default router;
