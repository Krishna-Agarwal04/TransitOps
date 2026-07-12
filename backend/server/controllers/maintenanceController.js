import * as maintenanceService from '../services/maintenanceService.js';

export const start = async (req, res) => {
  try {
    const log = await maintenanceService.startMaintenance(req.body);
    return res.status(201).json(log);
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ error: error.message });
  }
};

export const complete = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const log = await maintenanceService.completeMaintenance(id, req.body);
    return res.status(200).json({ message: 'Maintenance completed successfully', log });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ error: error.message });
  }
};

export const getAll = async (req, res) => {
  try {
    const logs = await maintenanceService.getAllMaintenanceLogs();
    return res.status(200).json(logs);
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ error: error.message });
  }
};
