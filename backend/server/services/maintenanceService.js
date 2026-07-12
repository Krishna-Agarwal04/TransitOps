import { prisma } from '../db.js';

export const startMaintenance = async ({ vehicleId, description }) => {
  // Find vehicle
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) {
    const error = new Error(`Vehicle with ID ${vehicleId} not found`);
    error.status = 404;
    throw error;
  }

  // Check vehicle status
  const isAvailableForMaintenance = ['ACTIVE', 'AVAILABLE'].includes(vehicle.status.toUpperCase());
  if (!isAvailableForMaintenance) {
    const error = new Error(`Vehicle cannot start maintenance (current status: ${vehicle.status})`);
    error.status = 400;
    throw error;
  }

  // Execute Prisma Transaction
  return await prisma.$transaction(async (tx) => {
    // 1. Create Maintenance record
    const log = await tx.maintenance.create({
      data: {
        vehicleId,
        description,
        status: 'STARTED',
        startDate: new Date(),
      },
      include: {
        vehicle: true,
      },
    });

    // 2. Update Vehicle Status to MAINTENANCE
    await tx.vehicle.update({
      where: { id: vehicleId },
      data: { status: 'MAINTENANCE' },
    });

    return log;
  });
};

export const completeMaintenance = async (id, { cost }) => {
  // Find maintenance log
  const log = await prisma.maintenance.findUnique({ where: { id } });
  if (!log) {
    const error = new Error(`Maintenance record with ID ${id} not found`);
    error.status = 404;
    throw error;
  }

  // Verify status is STARTED
  if (log.status !== 'STARTED') {
    const error = new Error(`Maintenance record is already completed (current status: ${log.status})`);
    error.status = 400;
    throw error;
  }

  // Execute Prisma Transaction
  return await prisma.$transaction(async (tx) => {
    // 1. Update Maintenance Log
    const updatedLog = await tx.maintenance.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        cost,
        endDate: new Date(),
      },
      include: {
        vehicle: true,
      },
    });

    // 2. Update Vehicle Status to AVAILABLE
    await tx.vehicle.update({
      where: { id: log.vehicleId },
      data: { status: 'AVAILABLE' },
    });

    return updatedLog;
  });
};

export const getAllMaintenanceLogs = async () => {
  return await prisma.maintenance.findMany({
    include: {
      vehicle: true,
    },
    orderBy: { startDate: 'desc' },
  });
};
