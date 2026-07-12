import { Router } from 'express';
import * as vehicleController from '../controllers/vehicleController.js';
import { validateCreateVehicle, validateUpdateVehicle, validateVehicleId } from '../validators/vehicleValidator.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', authenticateToken, authorizeRoles('ADMIN'), validateCreateVehicle, vehicleController.create);
router.get('/', authenticateToken, authorizeRoles('ADMIN', 'OPERATOR'), vehicleController.getAll);
router.get('/:id', authenticateToken, authorizeRoles('ADMIN', 'OPERATOR'), validateVehicleId, vehicleController.getById);
router.put('/:id', authenticateToken, authorizeRoles('ADMIN'), validateUpdateVehicle, vehicleController.update);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), validateVehicleId, vehicleController.remove);

export default router;
