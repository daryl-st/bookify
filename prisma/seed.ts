import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@bookify.test" },
    update: {},
    create: {
      email: "admin@bookify.test",
      name: "Admin User",
      passwordHash,
      role: "ADMIN",
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@bookify.test" },
    update: {},
    create: {
      email: "customer@bookify.test",
      name: "Sample Customer",
      passwordHash,
      role: "CUSTOMER",
    },
  });

  const service = await prisma.service.upsert({
    where: { name: "Premium Consultation", id: "001" },
    update: {},
    create: {
      name: "Premium Consultation",
      description: "60-minute consultation session",
      priceCents: 15000,
      currency: "USD",
      durationMinutes: 60,
      capacity: 1,
    },
  });

  await prisma.availability.createMany({
    data: [
      {
        serviceId: service.id,
        dayOfWeek: 1, // Monday
        openTime: "09:00",
        closeTime: "17:00",
        durationMinutes: 60,
      },
      {
        serviceId: service.id,
        dayOfWeek: 3, // Wednesday
        openTime: "09:00",
        closeTime: "17:00",
        durationMinutes: 60,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.booking.createMany({
    data: [
      {
        userId: customer.id,
        serviceId: service.id,
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        status: "CONFIRMED",
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed completed. Admin: admin@bookify.test / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

