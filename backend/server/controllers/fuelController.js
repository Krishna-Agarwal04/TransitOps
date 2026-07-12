import * as fuelService from '../services/fuelService.js';

export const create = async (req, res) => {
  try {
    const log = await fuelService.createFuelLog(req.body);
    return res.status(201).json(log);
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ error: error.message });
  }
};

export const getAll = async (req, res) => {
  try {
    const logs = await fuelService.getAllFuelLogs();
    return res.status(200).json(logs);
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ error: error.message });
  }
};
