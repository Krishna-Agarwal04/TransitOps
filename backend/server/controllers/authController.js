import * as authService from '../services/authService.js';

export const register = async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;
    const user = await authService.registerUser({ email, password, name, role });
    res.status(201).json({
      message: 'User registered successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });
    res.status(200).json({
      message: 'Login successful',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const profile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await authService.getUserProfile(userId);
    res.status(200).json({
      user,
    });
  } catch (error) {
    next(error);
  }
};
