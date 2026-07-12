import { Router } from 'express';
import * as driverController from '../controllers/driverController.js';
import { validateCreateDriver, validateUpdateDriver, validateDriverId } from '../validators/driverValidator.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', authenticateToken, authorizeRoles('SAFETY_OFFICER'), validateCreateDriver, driverController.create);
router.get('/', authenticateToken, authorizeRoles('SAFETY_OFFICER', 'DRIVER'), driverController.getAll);
router.get('/:id', authenticateToken, authorizeRoles('SAFETY_OFFICER', 'DRIVER'), validateDriverId, driverController.getById);
router.put('/:id', authenticateToken, authorizeRoles('SAFETY_OFFICER'), validateUpdateDriver, driverController.update);
router.delete('/:id', authenticateToken, authorizeRoles('SAFETY_OFFICER'), validateDriverId, driverController.remove);

export default router;
