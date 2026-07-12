export const validateCreateTrip = (req, res, next) => {
  const { vehicleId, driverId, startLocation, endLocation, cargoWeight } = req.body;

  if (vehicleId === undefined || vehicleId === null || typeof vehicleId !== 'number' || !Number.isInteger(vehicleId) || vehicleId <= 0) {
    return res.status(400).json({ error: 'vehicleId is required and must be a positive integer' });
  }

  if (driverId === undefined || driverId === null || typeof driverId !== 'number' || !Number.isInteger(driverId) || driverId <= 0) {
    return res.status(400).json({ error: 'driverId is required and must be a positive integer' });
  }

  if (cargoWeight === undefined || cargoWeight === null || typeof cargoWeight !== 'number' || cargoWeight <= 0) {
    return res.status(400).json({ error: 'cargoWeight is required and must be a positive number' });
  }

  if (!startLocation || typeof startLocation !== 'string' || startLocation.trim() === '') {
    return res.status(400).json({ error: 'startLocation is required and must be a non-empty string' });
  }

  if (!endLocation || typeof endLocation !== 'string' || endLocation.trim() === '') {
    return res.status(400).json({ error: 'endLocation is required and must be a non-empty string' });
  }

  next();
};

export const validateTripId = (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid trip ID' });
  }
  next();
};
