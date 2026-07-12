export const validateCreateMaintenance = (req, res, next) => {
  const { vehicleId, description } = req.body;

  if (vehicleId === undefined || vehicleId === null || typeof vehicleId !== 'number' || !Number.isInteger(vehicleId) || vehicleId <= 0) {
    return res.status(400).json({ error: 'vehicleId is required and must be a positive integer' });
  }

  if (!description || typeof description !== 'string' || description.trim() === '') {
    return res.status(400).json({ error: 'description is required and must be a non-empty string' });
  }

  next();
};

export const validateCompleteMaintenance = (req, res, next) => {
  const { cost } = req.body;

  if (cost === undefined || cost === null || typeof cost !== 'number' || cost <= 0) {
    return res.status(400).json({ error: 'cost is required and must be a positive number' });
  }

  next();
};

export const validateMaintenanceId = (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid maintenance ID' });
  }
  next();
};
