import * as driverService from '../services/driverService.js';

export const create = async (req, res, next) => {
  try {
    const { name, email, phone, licenseNumber, licenseExpiry, status } = req.body;
    const driver = await driverService.createDriver({ name, email, phone, licenseNumber, licenseExpiry, status });
    res.status(201).json(driver);
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const drivers = await driverService.getAllDrivers();
    res.status(200).json(drivers);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const driver = await driverService.getDriverById(id);
    res.status(200).json(driver);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const driver = await driverService.updateDriver(id, req.body);
    res.status(200).json({
      message: 'Driver updated successfully',
      driver,
    });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const driver = await driverService.deleteDriver(id);
    res.status(200).json({
      message: 'Driver deleted successfully',
      driver,
    });
  } catch (error) {
    next(error);
  }
};
