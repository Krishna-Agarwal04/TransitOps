import { prisma } from './server/db.js';
import bcrypt from 'bcrypt';

const users = [
  { email: 'manager@transitops.com', password: 'Password123', name: 'Fleet Manager', role: 'FLEET_MANAGER' },
  { email: 'driver@transitops.com', password: 'Password123', name: 'Driver User', role: 'DRIVER' },
  { email: 'safety@transitops.com', password: 'Password123', name: 'Safety Officer', role: 'SAFETY_OFFICER' },
  { email: 'finance@transitops.com', password: 'Password123', name: 'Financial Analyst', role: 'FINANCIAL_ANALYST' }
];

const initialVehicles = [
  { name: 'Van-05', registrationNumber: 'MH-12-AB-1234', vin: 'VIN-MH12AB1234', capacity: 500, status: 'AVAILABLE' },
  { name: 'Truck-02', registrationNumber: 'DL-01-XY-5678', vin: 'VIN-DL01XY5678', capacity: 1500, status: 'AVAILABLE' },
  { name: 'Sedan-03', registrationNumber: 'KA-03-CD-9012', vin: 'VIN-KA03CD9012', capacity: 300, status: 'AVAILABLE' },
  { name: 'Truck-04', registrationNumber: 'MH-14-EF-3456', vin: 'VIN-MH14EF3456', capacity: 2000, status: 'AVAILABLE' },
  { name: 'Van-01', registrationNumber: 'DL-03-GH-7890', vin: 'VIN-DL03GH7890', capacity: 600, status: 'AVAILABLE' },
  { name: 'Truck-05', registrationNumber: 'KA-05-JK-1234', vin: 'VIN-KA05JK1234', capacity: 2500, status: 'AVAILABLE' }
];

const initialDrivers = [
  { name: 'Alex Morgan', licenseNumber: 'DL-123456', licenseExpiry: new Date('2027-12-31').toISOString(), status: 'AVAILABLE' },
  { name: 'Clark Kent', licenseNumber: 'DL-555555', licenseExpiry: new Date('2027-01-01').toISOString(), status: 'AVAILABLE' },
  { name: 'Sarah Connor', licenseNumber: 'DL-987654', licenseExpiry: new Date('2028-06-30').toISOString(), status: 'AVAILABLE' }
];

async function main() {
  console.log('Seeding initial system users...');
  for (const u of users) {
    const hashedPassword = await bcrypt.hash(u.password, 10);
    const existing = await prisma.user.findUnique({
      where: { email: u.email }
    });

    if (existing) {
      await prisma.user.update({
        where: { email: u.email },
        data: { password: hashedPassword }
      });
      console.log(`Updated password for user: ${u.email}`);
    } else {
      await prisma.user.create({
        data: {
          email: u.email,
          password: hashedPassword,
          name: u.name,
          role: u.role
        }
      });
      console.log(`Created user: ${u.email}`);
    }
  }

  console.log('Seeding initial vehicles...');
  for (const v of initialVehicles) {
    const existing = await prisma.vehicle.findUnique({
      where: { registrationNumber: v.registrationNumber }
    });

    if (!existing) {
      await prisma.vehicle.create({
        data: {
          model: v.name,
          registrationNumber: v.registrationNumber,
          vin: v.vin,
          capacity: v.capacity,
          status: v.status
        }
      });
      console.log(`Created vehicle: ${v.name}`);
    }
  }

  console.log('Seeding initial drivers...');
  for (const d of initialDrivers) {
    const existing = await prisma.driver.findUnique({
      where: { licenseNumber: d.licenseNumber }
    });

    if (!existing) {
      await prisma.driver.create({
        data: {
          name: d.name,
          licenseNumber: d.licenseNumber,
          licenseExpiry: d.licenseExpiry,
          status: d.status
        }
      });
      console.log(`Created driver: ${d.name}`);
    }
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
