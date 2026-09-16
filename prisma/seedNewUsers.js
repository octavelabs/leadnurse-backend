require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const USERS = [
  { name: 'Cosmas Ngwu', email: 'cosmasngwu@gmail.com', password: 'Cosmasngwu@123', role: 'EMPLOYEE' },
  { name: 'Admin', email: 'admin@leadnurse.co.uk', password: 'Admin@123', role: 'ADMIN' },
];

async function main() {
  for (const u of USERS) {
    const hashedPassword = await bcrypt.hash(u.password, 12);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        password: hashedPassword,
        role: u.role,
        isActive: true,
        emailVerified: true,
      },
      create: {
        name: u.name,
        email: u.email,
        password: hashedPassword,
        role: u.role,
        isActive: true,
        emailVerified: true,
      },
    });
    console.log(`✅ ${user.role.padEnd(8)} ${user.email}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
