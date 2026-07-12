export const validateCreateVehicle = (req, res, next) => {
  const { vin, registrationNumber, model, status } = req.body;

  if (!vin || typeof vin !== 'string' || vin.trim() === '') {
    return res.status(400).json({ error: 'VIN is required and must be a non-empty string' });
  }

  if (!registrationNumber || typeof registrationNumber !== 'string' || registrationNumber.trim() === '') {
    return res.status(400).json({ error: 'Registration number is required and must be a non-empty string' });
  }

  if (!model || typeof model !== 'string' || model.trim() === '') {
    return res.status(400).json({ error: 'Model is required and must be a non-empty string' });
  }

  if (status !== undefined && (typeof status !== 'string' || status.trim() === '')) {
    return res.status(400).json({ error: 'Status must be a non-empty string' });
  }

  next();
};

export const validateUpdateVehicle = (req, res, next) => {
  const { vin, registrationNumber, model, status } = req.body;
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid vehicle ID' });
  }

  // Check if at least one field is provided
  if (vin === undefined && registrationNumber === undefined && model === undefined && status === undefined) {
    return res.status(400).json({ error: 'At least one field (vin, registrationNumber, model, status) must be provided' });
  }

  if (vin !== undefined && (typeof vin !== 'string' || vin.trim() === '')) {
    return res.status(400).json({ error: 'VIN must be a non-empty string' });
  }

  if (registrationNumber !== undefined && (typeof registrationNumber !== 'string' || registrationNumber.trim() === '')) {
    return res.status(400).json({ error: 'Registration number must be a non-empty string' });
  }

  if (model !== undefined && (typeof model !== 'string' || model.trim() === '')) {
    return res.status(400).json({ error: 'Model must be a non-empty string' });
  }

  if (status !== undefined && (typeof status !== 'string' || status.trim() === '')) {
    return res.status(400).json({ error: 'Status must be a non-empty string' });
  }

  next();
};

export const validateVehicleId = (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid vehicle ID' });
  }
  next();
};
