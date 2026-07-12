import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'transitops-super-secret-key-12345';

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...sanitized } = user;
  return sanitized;
};

export const registerUser = async ({ email, password, name, role }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    const error = new Error('User with this email already exists');
    error.status = 409; // Conflict
    throw error;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Default role to OPERATOR if not specified
  const userRole = role ? role.toUpperCase() : 'OPERATOR';

  // Create user
  const newUser = await prisma.user.create({
    data: {
      email: normalizedEmail,
      password: hashedPassword,
      name: name || null,
      role: userRole,
    },
  });

  return sanitizeUser(newUser);
};

export const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    const error = new Error('Invalid email or password');
    error.status = 401; // Unauthorized
    throw error;
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const error = new Error('Invalid email or password');
    error.status = 401; // Unauthorized
    throw error;
  }

  // Generate JWT
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return {
    user: sanitizeUser(user),
    token,
  };
};

export const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    const error = new Error('User not found');
    error.status = 404; // Not Found
    throw error;
  }

  return sanitizeUser(user);
};
