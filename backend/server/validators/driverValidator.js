export const validateCreateDriver = (req, res, next) => {
  const { name, email, phone, licenseNumber, licenseExpiry, status } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Name is required and must be a non-empty string' });
  }

  if (email !== undefined && email !== null) {
    if (typeof email !== 'string') {
      return res.status(400).json({ error: 'Email must be a string' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }
  }

  if (phone !== undefined && phone !== null && typeof phone !== 'string') {
    return res.status(400).json({ error: 'Phone must be a string' });
  }

  if (!licenseNumber || typeof licenseNumber !== 'string' || licenseNumber.trim() === '') {
    return res.status(400).json({ error: 'License number is required and must be a non-empty string' });
  }

  if (!licenseExpiry) {
    return res.status(400).json({ error: 'License expiry date is required' });
  }

  const expiryDate = new Date(licenseExpiry);
  if (isNaN(expiryDate.getTime())) {
    return res.status(400).json({ error: 'License expiry must be a valid ISO date string' });
  }

  // License Expiry must be in the future
  if (expiryDate <= new Date()) {
    return res.status(400).json({ error: 'License expiry date must be in the future' });
  }

  if (status !== undefined && (typeof status !== 'string' || status.trim() === '')) {
    return res.status(400).json({ error: 'Status must be a non-empty string' });
  }

  next();
};

export const validateUpdateDriver = (req, res, next) => {
  const { name, email, phone, licenseNumber, licenseExpiry, status } = req.body;
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid driver ID' });
  }

  // Check if at least one field is provided
  if (name === undefined && email === undefined && phone === undefined && licenseNumber === undefined && licenseExpiry === undefined && status === undefined) {
    return res.status(400).json({ error: 'At least one field must be provided' });
  }

  if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
    return res.status(400).json({ error: 'Name must be a non-empty string' });
  }

  if (email !== undefined && email !== null) {
    if (typeof email !== 'string') {
      return res.status(400).json({ error: 'Email must be a string' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }
  }

  if (phone !== undefined && phone !== null && typeof phone !== 'string') {
    return res.status(400).json({ error: 'Phone must be a string' });
  }

  if (licenseNumber !== undefined && (typeof licenseNumber !== 'string' || licenseNumber.trim() === '')) {
    return res.status(400).json({ error: 'License number must be a non-empty string' });
  }

  if (licenseExpiry !== undefined) {
    const expiryDate = new Date(licenseExpiry);
    if (isNaN(expiryDate.getTime())) {
      return res.status(400).json({ error: 'License expiry must be a valid ISO date string' });
    }
    if (expiryDate <= new Date()) {
      return res.status(400).json({ error: 'License expiry date must be in the future' });
    }
  }

  if (status !== undefined && (typeof status !== 'string' || status.trim() === '')) {
    return res.status(400).json({ error: 'Status must be a non-empty string' });
  }

  next();
};

export const validateDriverId = (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid driver ID' });
  }
  next();
};
