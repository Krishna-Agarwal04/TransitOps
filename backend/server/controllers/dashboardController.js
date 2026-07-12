import * as dashboardService from '../services/dashboardService.js';

export const getStats = async (req, res) => {
  try {
    const stats = await dashboardService.getDashboardStats();
    return res.status(200).json(stats);
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ error: error.message });
  }
};
