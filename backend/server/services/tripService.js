import { prisma } from '../db.js';

export const createTrip = async ({ vehicleId, driverId, startLocation, endLocation, cargoWeight }) => {
  // Retrieve vehicle
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) {
    const error = new Error(`Vehicle with ID ${vehicleId} not found`);
    error.status = 404;
    throw error;
  }

  // Retrieve driver
  const driver = await prisma.driver.findUnique({ where: { id: driverId } });
  if (!driver) {
    const error = new Error(`Driver with ID ${driverId} not found`);
    error.status = 404;
    throw error;
  }

  // Check vehicle availability
  const isVehicleAvailable = ['ACTIVE', 'AVAILABLE'].includes(vehicle.status.toUpperCase());
  if (!isVehicleAvailable) {
    const error = new Error(`Vehicle is not available (current status: ${vehicle.status})`);
    error.status = 400;
    throw error;
  }

  // Check driver availability
  const isDriverAvailable = ['ACTIVE', 'AVAILABLE'].includes(driver.status.toUpperCase());
  if (!isDriverAvailable) {
    const error = new Error(`Driver is not available (current status: ${driver.status})`);
    error.status = 400;
    throw error;
  }

  // Check driver license expiry
  if (new Date(driver.licenseExpiry) <= new Date()) {
    const error = new Error('Driver license is expired');
    error.status = 400;
    throw error;
  }

  // Check cargo weight capacity
  if (cargoWeight > vehicle.capacity) {
    const error = new Error(`Cargo weight (${cargoWeight}) exceeds vehicle capacity (${vehicle.capacity})`);
    error.status = 400;
    throw error;
  }

  // Create Trip
  return await prisma.trip.create({
    data: {
      vehicleId,
      driverId,
      startLocation,
      endLocation,
      cargoWeight,
      status: 'PENDING',
    },
    include: {
      vehicle: true,
      driver: true,
    },
  });
};

export const getAllTrips = async () => {
  return await prisma.trip.findMany({
    include: {
      vehicle: true,
      driver: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getTripById = async (id) => {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      vehicle: true,
      driver: true,
    },
  });

  if (!trip) {
    const error = new Error(`Trip with ID ${id} not found`);
    error.status = 404;
    throw error;
  }

  return trip;
};

export const dispatchTrip = async (id) => {
  const trip = await getTripById(id);

  if (trip.status !== 'PENDING') {
    const error = new Error(`Trip cannot be dispatched (current status: ${trip.status})`);
    error.status = 400;
    throw error;
  }

  // Execute Prisma Transaction
  return await prisma.$transaction(async (tx) => {
    // 1. Update Trip Status to DISPATCHED
    const updatedTrip = await tx.trip.update({
      where: { id },
      data: { status: 'DISPATCHED' },
      include: {
        vehicle: true,
        driver: true,
      },
    });

    // 2. Update Vehicle Status to ON_TRIP
    await tx.vehicle.update({
      where: { id: trip.vehicleId },
      data: { status: 'ON_TRIP' },
    });

    // 3. Update Driver Status to ON_TRIP
    await tx.driver.update({
      where: { id: trip.driverId },
      data: { status: 'ON_TRIP' },
    });

    return updatedTrip;
  });
};

export const completeTrip = async (id) => {
  const trip = await getTripById(id);

  if (trip.status !== 'DISPATCHED') {
    const error = new Error(`Trip cannot be completed (current status: ${trip.status})`);
    error.status = 400;
    throw error;
  }

  // Execute Prisma Transaction
  return await prisma.$transaction(async (tx) => {
    // 1. Update Trip Status to COMPLETED
    const updatedTrip = await tx.trip.update({
      where: { id },
      data: { status: 'COMPLETED' },
      include: {
        vehicle: true,
        driver: true,
      },
    });

    // 2. Update Vehicle Status to AVAILABLE
    await tx.vehicle.update({
      where: { id: trip.vehicleId },
      data: { status: 'AVAILABLE' },
    });

    // 3. Update Driver Status to AVAILABLE
    await tx.driver.update({
      where: { id: trip.driverId },
      data: { status: 'AVAILABLE' },
    });

    return updatedTrip;
  });
};
