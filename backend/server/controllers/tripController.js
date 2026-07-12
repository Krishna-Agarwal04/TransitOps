import * as tripService from '../services/tripService.js';

export const create = async (req, res) => {
  try {
    const trip = await tripService.createTrip(req.body);
    return res.status(201).json(trip);
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ error: error.message });
  }
};

export const getAll = async (req, res) => {
  try {
    const trips = await tripService.getAllTrips();
    return res.status(200).json(trips);
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ error: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const trip = await tripService.getTripById(id);
    return res.status(200).json(trip);
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ error: error.message });
  }
};

export const dispatch = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const trip = await tripService.dispatchTrip(id);
    return res.status(200).json({ message: 'Trip dispatched successfully', trip });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ error: error.message });
  }
};

export const complete = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const trip = await tripService.completeTrip(id);
    return res.status(200).json({ message: 'Trip completed successfully', trip });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ error: error.message });
  }
};
