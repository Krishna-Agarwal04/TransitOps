import { prisma } from '../db.js';

export const createFuelLog = async ({ vehicleId, amount, cost, date }) => {
  // Check if vehicle exists
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) {
    const error = new Error(`Vehicle with ID ${vehicleId} not found`);
    error.status = 404;
    throw error;
  }

  return await prisma.fuel.create({
    data: {
      vehicleId,
      amount,
      cost,
      date: date ? new Date(date) : new Date(),
    },
    include: {
      vehicle: true,
    },
  });
};

export const getAllFuelLogs = async () => {
  return await prisma.fuel.findMany({
    include: {
      vehicle: true,
    },
    orderBy: { date: 'desc' },
  });
};
