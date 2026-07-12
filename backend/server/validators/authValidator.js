export const validateRegister = (req, res, next) => {
  const { email, password, name, role } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required and must be a string' });
  }

  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Password is required and must be a string' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  if (name !== undefined && typeof name !== 'string') {
    return res.status(400).json({ error: 'Name must be a string' });
  }

  if (role !== undefined) {
    if (typeof role !== 'string' || !['ADMIN', 'OPERATOR'].includes(role.toUpperCase())) {
      return res.status(400).json({ error: 'Role must be either ADMIN or OPERATOR' });
    }
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required and must be a string' });
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Password is required and must be a string' });
  }

  next();
};
