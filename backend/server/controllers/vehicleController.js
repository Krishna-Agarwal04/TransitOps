import * as vehicleService from '../services/vehicleService.js';

export const create = async (req, res, next) => {
  try {
    const { vin, registrationNumber, model, status } = req.body;
    const vehicle = await vehicleService.createVehicle({ vin, registrationNumber, model, status });
    res.status(201).json(vehicle);
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const vehicles = await vehicleService.getAllVehicles();
    res.status(200).json(vehicles);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const vehicle = await vehicleService.getVehicleById(id);
    res.status(200).json(vehicle);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const vehicle = await vehicleService.updateVehicle(id, req.body);
    res.status(200).json({
      message: 'Vehicle updated successfully',
      vehicle,
    });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const vehicle = await vehicleService.deleteVehicle(id);
    res.status(200).json({
      message: 'Vehicle deleted successfully',
      vehicle,
    });
  } catch (error) {
    next(error);
  }
};
