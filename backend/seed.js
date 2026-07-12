import { prisma } from './server/db.js';
import bcrypt from 'bcrypt';

const users = [
  { email: 'manager@transitops.com', password: 'Password123', name: 'Fleet Manager', role: 'FLEET_MANAGER' },
  { email: 'driver@transitops.com', password: 'Password123', name: 'Driver User', role: 'DRIVER' },
  { email: 'safety@transitops.com', password: 'Password123', name: 'Safety Officer', role: 'SAFETY_OFFICER' },
  { email: 'finance@transitops.com', password: 'Password123', name: 'Financial Analyst', role: 'FINANCIAL_ANALYST' }
];

async function main() {
  console.log('Updating seeded users with password "Password123"...');
  for (const u of users) {
    const hashedPassword = await bcrypt.hash(u.password, 10);
    const existing = await prisma.user.findUnique({
      where: { email: u.email }
    });

    if (existing) {
      // Update password
      await prisma.user.update({
        where: { email: u.email },
        data: { password: hashedPassword }
      });
      console.log(`Updated password for user: ${u.email}`);
    } else {
      const created = await prisma.user.create({
        data: {
          email: u.email,
          password: hashedPassword,
          name: u.name,
          role: u.role
        }
      });
      console.log(`Created user: ${created.email} (${created.role})`);
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
