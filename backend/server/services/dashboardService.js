import { prisma } from '../db.js';

export const getDashboardStats = async () => {
  // 1. Vehicle counts
  const vehicleCounts = await prisma.vehicle.groupBy({
    by: ['status'],
    _count: { _all: true },
  });

  let totalVehicles = 0;
  let availableVehicles = 0;
  let vehiclesOnTrip = 0;
  let vehiclesInMaintenance = 0;

  vehicleCounts.forEach((group) => {
    const count = group._count._all;
    const status = group.status.toUpperCase();
    totalVehicles += count;
    if (status === 'AVAILABLE' || status === 'ACTIVE') {
      availableVehicles += count;
    } else if (status === 'ON_TRIP') {
      vehiclesOnTrip += count;
    } else if (status === 'MAINTENANCE') {
      vehiclesInMaintenance += count;
    }
  });

  // 2. Driver counts
  const driverCounts = await prisma.driver.groupBy({
    by: ['status'],
    _count: { _all: true },
  });

  let totalDrivers = 0;
  let availableDrivers = 0;

  driverCounts.forEach((group) => {
    const count = group._count._all;
    const status = group.status.toUpperCase();
    totalDrivers += count;
    if (status === 'AVAILABLE' || status === 'ACTIVE') {
      availableDrivers += count;
    }
  });

  // 3. Trip counts
  const tripCounts = await prisma.trip.groupBy({
    by: ['status'],
    _count: { _all: true },
  });

  let tripsRunning = 0;
  let completedTrips = 0;

  tripCounts.forEach((group) => {
    const count = group._count._all;
    const status = group.status; // TripStatus is enum: PENDING, DISPATCHED, COMPLETED, CANCELLED
    if (status === 'DISPATCHED') {
      tripsRunning += count;
    } else if (status === 'COMPLETED') {
      completedTrips += count;
    }
  });

  // 4. Fuel Cost
  const fuelAgg = await prisma.fuel.aggregate({
    _sum: { cost: true },
  });
  const totalFuelCost = fuelAgg._sum.cost || 0.0;

  // 5. Maintenance Cost
  const maintAgg = await prisma.maintenance.aggregate({
    _sum: { cost: true },
  });
  const totalMaintCost = maintAgg._sum.cost || 0.0;

  return {
    totalVehicles,
    availableVehicles,
    vehiclesOnTrip,
    vehiclesInMaintenance,
    totalDrivers,
    availableDrivers,
    tripsRunning,
    completedTrips,
    fuelCost: totalFuelCost,
    maintenanceCost: totalMaintCost,
  };
};
