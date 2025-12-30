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

  // Create multiple services with different availability patterns
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

  // Clear existing availability
  await prisma.availability.deleteMany({});

  // Premium Consultation: Monday & Wednesday, 9 AM - 5 PM, 60 min slots
  await prisma.availability.createMany({
    data: [
      {
        serviceId: consultation.id,
        dayOfWeek: 1, // Monday
        openTime: "09:00",
        closeTime: "17:00",
        durationMinutes: 60,
      },
      {
        serviceId: consultation.id,
        dayOfWeek: 3, // Wednesday
        openTime: "09:00",
        closeTime: "17:00",
        durationMinutes: 60,
      },
    ],
  });

  // Quick Session: Tuesday & Thursday, 10 AM - 3 PM, 30 min slots
  await prisma.availability.createMany({
    data: [
      {
        serviceId: quickSession.id,
        dayOfWeek: 2, // Tuesday
        openTime: "10:00",
        closeTime: "15:00",
        durationMinutes: 30,
      },
      {
        serviceId: quickSession.id,
        dayOfWeek: 4, // Thursday
        openTime: "10:00",
        closeTime: "15:00",
        durationMinutes: 30,
      },
    ],
  });

  // Group Workshop: Saturday, 10 AM - 2 PM, 120 min slots
  await prisma.availability.createMany({
    data: [
      {
        serviceId: groupWorkshop.id,
        dayOfWeek: 6, // Saturday
        openTime: "10:00",
        closeTime: "14:00",
        durationMinutes: 120,
      },
    ],
  });

  // Extended Session: Friday, 9 AM - 4 PM, 90 min slots
  await prisma.availability.createMany({
    data: [
      {
        serviceId: extendedSession.id,
        dayOfWeek: 5, // Friday
        openTime: "09:00",
        closeTime: "16:00",
        durationMinutes: 90,
      },
    ],
  });

  // Evening Consultation: Monday, Wednesday, Friday, 5 PM - 9 PM, 60 min slots
  await prisma.availability.createMany({
    data: [
      {
        serviceId: eveningConsultation.id,
        dayOfWeek: 1, // Monday
        openTime: "17:00",
        closeTime: "21:00",
        durationMinutes: 60,
      },
      {
        serviceId: eveningConsultation.id,
        dayOfWeek: 3, // Wednesday
        openTime: "17:00",
        closeTime: "21:00",
        durationMinutes: 60,
      },
      {
        serviceId: eveningConsultation.id,
        dayOfWeek: 5, // Friday
        openTime: "17:00",
        closeTime: "21:00",
        durationMinutes: 60,
      },
    ],
  });

  // Create a sample booking
  await prisma.booking.createMany({
    data: [
      {
        userId: customer.id,
        serviceId: consultation.id,
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        status: "CONFIRMED",
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed completed!");
  console.log("Admin: admin@bookify.test / password123");
  console.log("Customer: customer@bookify.test / password123");
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
