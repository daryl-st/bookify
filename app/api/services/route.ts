import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const serviceSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  priceCents: z.number().int().positive(),
  currency: z.string().min(3).max(3).default("USD"),
  durationMinutes: z.number().int().positive(),
  capacity: z.number().int().positive().default(1),
});

export async function GET() {
  const services = await prisma.service.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ services });
}

export async function POST(req: NextRequest) {
  try {
    requireAuth(req, ["ADMIN"]);
    const json = await req.json();
    const body = serviceSchema.parse(json);

    const service = await prisma.service.create({ data: body });
    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Service POST error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

