import { prisma } from '../db.js';

export const createVehicle = async ({ vin, registrationNumber, model, status, capacity }) => {
  const normVin = vin.toUpperCase().trim();
  const normReg = registrationNumber.toUpperCase().trim();

  // Check unique constraints
  const existingVin = await prisma.vehicle.findUnique({
    where: { vin: normVin },
  });
  if (existingVin) {
    const error = new Error(`Vehicle with VIN ${normVin} already exists`);
    error.status = 409;
    throw error;
  }

  const existingReg = await prisma.vehicle.findUnique({
    where: { registrationNumber: normReg },
  });
  if (existingReg) {
    const error = new Error(`Vehicle with registration number ${normReg} already exists`);
    error.status = 409;
    throw error;
  }

  return await prisma.vehicle.create({
    data: {
      vin: normVin,
      registrationNumber: normReg,
      model,
      status: status || 'ACTIVE',
      capacity: capacity !== undefined ? capacity : 5000.0,
    },
  });
};

export const getAllVehicles = async () => {
  return await prisma.vehicle.findMany({
    orderBy: { createdAt: 'desc' },
  });
};

export const getVehicleById = async (id) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
  });

  if (!vehicle) {
    const error = new Error(`Vehicle with ID ${id} not found`);
    error.status = 404;
    throw error;
  }

  return vehicle;
};

export const updateVehicle = async (id, data) => {
  // Check if exists
  await getVehicleById(id);

  const updates = {};
  if (data.vin !== undefined) {
    const normVin = data.vin.toUpperCase().trim();
    const existing = await prisma.vehicle.findUnique({
      where: { vin: normVin },
    });
    if (existing && existing.id !== id) {
      const error = new Error(`Vehicle with VIN ${normVin} already exists`);
      error.status = 409;
      throw error;
    }
    updates.vin = normVin;
  }

  if (data.registrationNumber !== undefined) {
    const normReg = data.registrationNumber.toUpperCase().trim();
    const existing = await prisma.vehicle.findUnique({
      where: { registrationNumber: normReg },
    });
    if (existing && existing.id !== id) {
      const error = new Error(`Vehicle with registration number ${normReg} already exists`);
      error.status = 409;
      throw error;
    }
    updates.registrationNumber = normReg;
  }

  if (data.model !== undefined) updates.model = data.model;
  if (data.status !== undefined) updates.status = data.status;
  if (data.capacity !== undefined) updates.capacity = data.capacity;

  return await prisma.vehicle.update({
    where: { id },
    data: updates,
  });
};

export const deleteVehicle = async (id) => {
  await getVehicleById(id);

  return await prisma.vehicle.delete({
    where: { id },
  });
};
