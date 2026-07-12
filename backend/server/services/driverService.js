import { prisma } from '../db.js';

export const createDriver = async ({ name, email, phone, licenseNumber, licenseExpiry, status }) => {
  const normLicense = licenseNumber.toUpperCase().trim();
  const normEmail = email ? email.toLowerCase().trim() : null;

  // Check unique constraints
  const existingLicense = await prisma.driver.findUnique({
    where: { licenseNumber: normLicense },
  });
  if (existingLicense) {
    const error = new Error(`Driver with license number ${normLicense} already exists`);
    error.status = 409;
    throw error;
  }

  if (normEmail) {
    const existingEmail = await prisma.driver.findUnique({
      where: { email: normEmail },
    });
    if (existingEmail) {
      const error = new Error(`Driver with email ${normEmail} already exists`);
      error.status = 409;
      throw error;
    }
  }

  return await prisma.driver.create({
    data: {
      name,
      email: normEmail,
      phone: phone || null,
      licenseNumber: normLicense,
      licenseExpiry: new Date(licenseExpiry),
      status: status || 'ACTIVE',
    },
  });
};

export const getAllDrivers = async () => {
  return await prisma.driver.findMany({
    orderBy: { createdAt: 'desc' },
  });
};

export const getDriverById = async (id) => {
  const driver = await prisma.driver.findUnique({
    where: { id },
  });

  if (!driver) {
    const error = new Error(`Driver with ID ${id} not found`);
    error.status = 404;
    throw error;
  }

  return driver;
};

export const updateDriver = async (id, data) => {
  // Check if exists
  await getDriverById(id);

  const updates = {};
  if (data.licenseNumber !== undefined) {
    const normLicense = data.licenseNumber.toUpperCase().trim();
    const existing = await prisma.driver.findUnique({
      where: { licenseNumber: normLicense },
    });
    if (existing && existing.id !== id) {
      const error = new Error(`Driver with license number ${normLicense} already exists`);
      error.status = 409;
      throw error;
    }
    updates.licenseNumber = normLicense;
  }

  if (data.email !== undefined) {
    const normEmail = data.email ? data.email.toLowerCase().trim() : null;
    if (normEmail) {
      const existing = await prisma.driver.findUnique({
        where: { email: normEmail },
      });
      if (existing && existing.id !== id) {
        const error = new Error(`Driver with email ${normEmail} already exists`);
        error.status = 409;
        throw error;
      }
    }
    updates.email = normEmail;
  }

  if (data.name !== undefined) updates.name = data.name;
  if (data.phone !== undefined) updates.phone = data.phone;
  if (data.licenseExpiry !== undefined) updates.licenseExpiry = new Date(data.licenseExpiry);
  if (data.status !== undefined) updates.status = data.status;

  return await prisma.driver.update({
    where: { id },
    data: updates,
  });
};

export const deleteDriver = async (id) => {
  await getDriverById(id);

  return await prisma.driver.delete({
    where: { id },
  });
};
