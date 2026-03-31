import "dotenv/config";

import { hashPassword } from "better-auth/crypto";

import { prisma } from "../lib/prisma";

async function ensureCredentialUser(
  email: string,
  name: string,
  role: "ADMIN" | "CUSTOMER",
  plainPassword: string
) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;

  const userId = crypto.randomUUID();
  const hashed = await hashPassword(plainPassword);

  return prisma.user.create({
    data: {
      id: userId,
      name,
      email,
      emailVerified: true,
      role,
      accounts: {
        create: {
          id: crypto.randomUUID(),
          accountId: userId,
          providerId: "credential",
          password: hashed,
        },
      },
    },
  });
}

async function main() {
  const admin = await ensureCredentialUser(
    "admin@bookify.test",
    "Admin User",
    "ADMIN",
    "password123"
  );

  const customer = await ensureCredentialUser(
    "customer@bookify.test",
    "Sample Customer",
    "CUSTOMER",
    "password123"
  );

  const consultation = await prisma.service.upsert({
    where: { id: "001" },
    update: {},
    create: {
      id: "001",
      name: "Premium Consultation",
      description: "60-minute one-on-one consultation session",
      priceCents: 15000,
      currency: "USD",
      durationMinutes: 60,
      capacity: 1,
    },
  });

  const quickSession = await prisma.service.upsert({
    where: { id: "002" },
    update: {},
    create: {
      id: "002",
      name: "Quick Session",
      description: "30-minute quick check-in session",
      priceCents: 7500,
      currency: "USD",
      durationMinutes: 30,
      capacity: 1,
    },
  });

  const groupWorkshop = await prisma.service.upsert({
    where: { id: "003" },
    update: {},
    create: {
      id: "003",
      name: "Group Workshop",
      description: "2-hour group workshop with up to 10 participants",
      priceCents: 5000,
      currency: "USD",
      durationMinutes: 120,
      capacity: 10,
    },
  });

  const extendedSession = await prisma.service.upsert({
    where: { id: "004" },
    update: {},
    create: {
      id: "004",
      name: "Extended Session",
      description: "90-minute comprehensive session",
      priceCents: 22500,
      currency: "USD",
      durationMinutes: 90,
      capacity: 1,
    },
  });

  const eveningConsultation = await prisma.service.upsert({
    where: { id: "005" },
    update: {},
    create: {
      id: "005",
      name: "Evening Consultation",
      description: "60-minute consultation available in evening hours",
      priceCents: 18000,
      currency: "USD",
      durationMinutes: 60,
      capacity: 1,
    },
  });

  await prisma.availability.deleteMany({});

  await prisma.availability.createMany({
    data: [
      {
        serviceId: consultation.id,
        dayOfWeek: 1,
        openTime: "09:00",
        closeTime: "17:00",
        durationMinutes: 60,
      },
      {
        serviceId: consultation.id,
        dayOfWeek: 3,
        openTime: "09:00",
        closeTime: "17:00",
        durationMinutes: 60,
      },
    ],
  });

  await prisma.availability.createMany({
    data: [
      {
        serviceId: quickSession.id,
        dayOfWeek: 2,
        openTime: "10:00",
        closeTime: "15:00",
        durationMinutes: 30,
      },
      {
        serviceId: quickSession.id,
        dayOfWeek: 4,
        openTime: "10:00",
        closeTime: "15:00",
        durationMinutes: 30,
      },
    ],
  });

  await prisma.availability.createMany({
    data: [
      {
        serviceId: groupWorkshop.id,
        dayOfWeek: 6,
        openTime: "10:00",
        closeTime: "14:00",
        durationMinutes: 120,
      },
    ],
  });

  await prisma.availability.createMany({
    data: [
      {
        serviceId: extendedSession.id,
        dayOfWeek: 5,
        openTime: "09:00",
        closeTime: "16:00",
        durationMinutes: 90,
      },
    ],
  });

  await prisma.availability.createMany({
    data: [
      {
        serviceId: eveningConsultation.id,
        dayOfWeek: 1,
        openTime: "17:00",
        closeTime: "21:00",
        durationMinutes: 60,
      },
      {
        serviceId: eveningConsultation.id,
        dayOfWeek: 3,
        openTime: "17:00",
        closeTime: "21:00",
        durationMinutes: 60,
      },
      {
        serviceId: eveningConsultation.id,
        dayOfWeek: 5,
        openTime: "17:00",
        closeTime: "21:00",
        durationMinutes: 60,
      },
    ],
  });

  await prisma.booking.createMany({
    data: [
      {
        userId: customer.id,
        serviceId: consultation.id,
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        status: "CONFIRMED",
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed completed!");
  console.log("Admin: admin@bookify.test / password123");
  console.log("Customer: customer@bookify.test / password123");
  console.log(`Admin user id: ${admin.id}`);
  console.log(`Created ${await prisma.service.count()} services`);
  console.log(`Created ${await prisma.availability.count()} availability windows`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
