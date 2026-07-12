export const validateCreateFuel = (req, res, next) => {
  const { vehicleId, amount, cost, date } = req.body;

  if (vehicleId === undefined || vehicleId === null || typeof vehicleId !== 'number' || !Number.isInteger(vehicleId) || vehicleId <= 0) {
    return res.status(400).json({ error: 'vehicleId is required and must be a positive integer' });
  }

  if (amount === undefined || amount === null || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'amount is required and must be a positive number' });
  }

  if (cost === undefined || cost === null || typeof cost !== 'number' || cost <= 0) {
    return res.status(400).json({ error: 'cost is required and must be a positive number' });
  }

  if (date !== undefined && date !== null) {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
  }

  next();
};
