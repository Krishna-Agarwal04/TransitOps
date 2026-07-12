import { prisma } from './server/db.js';
import bcrypt from 'bcrypt';

const users = [
  { email: 'manager@transitops.com', password: 'password', name: 'Fleet Manager', role: 'FLEET_MANAGER' },
  { email: 'driver@transitops.com', password: 'password', name: 'Driver User', role: 'DRIVER' },
  { email: 'safety@transitops.com', password: 'password', name: 'Safety Officer', role: 'SAFETY_OFFICER' },
  { email: 'finance@transitops.com', password: 'password', name: 'Financial Analyst', role: 'FINANCIAL_ANALYST' }
];

async function main() {
  console.log('Seeding initial system users into database...');
  for (const u of users) {
    const hashedPassword = await bcrypt.hash(u.password, 10);
    const existing = await prisma.user.findUnique({
      where: { email: u.email }
    });

    if (!existing) {
      const created = await prisma.user.create({
        data: {
          email: u.email,
          password: hashedPassword,
          name: u.name,
          role: u.role
        }
      });
      console.log(`Created user: ${created.email} (${created.role})`);
    } else {
      console.log(`User already exists: ${u.email}`);
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
    // Also disconnect the pool if needed, but disconnect is enough
  });
