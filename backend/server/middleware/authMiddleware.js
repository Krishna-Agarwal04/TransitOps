import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'transitops-super-secret-key-12345';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Expecting format: Bearer <token>
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token is missing or invalid' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Access token is expired or invalid' });
    }

    req.user = user;
    next();
  });
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User is not authenticated' });
    }

    const hasRole = roles.map(r => r.toUpperCase()).includes(req.user.role.toUpperCase());
    if (!hasRole) {
      return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    }

    next();
  };
};
