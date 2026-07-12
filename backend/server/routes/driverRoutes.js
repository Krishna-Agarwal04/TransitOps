import { Router } from 'express';
import * as driverController from '../controllers/driverController.js';
import { validateCreateDriver, validateUpdateDriver, validateDriverId } from '../validators/driverValidator.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', authenticateToken, authorizeRoles('ADMIN'), validateCreateDriver, driverController.create);
router.get('/', authenticateToken, authorizeRoles('ADMIN', 'OPERATOR'), driverController.getAll);
router.get('/:id', authenticateToken, authorizeRoles('ADMIN', 'OPERATOR'), validateDriverId, driverController.getById);
router.put('/:id', authenticateToken, authorizeRoles('ADMIN'), validateUpdateDriver, driverController.update);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), validateDriverId, driverController.remove);

export default router;
