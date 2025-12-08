import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const availabilitySchema = z
  .object({
    serviceId: z.string().uuid(),
    dayOfWeek: z.number().int().min(0).max(6).optional(),
    date: z.string().datetime().optional(),
    openTime: z.string().regex(/^[0-2][0-9]:[0-5][0-9]$/, "HH:mm"),
    closeTime: z.string().regex(/^[0-2][0-9]:[0-5][0-9]$/, "HH:mm"),
    durationMinutes: z.number().int().positive(),
  })
  .refine((data) => data.dayOfWeek !== undefined || data.date !== undefined, {
    message: "Either dayOfWeek or date is required",
    path: ["dayOfWeek"],
  });

export async function GET(req: NextRequest) {
  const serviceId = req.nextUrl.searchParams.get("serviceId") ?? undefined;
  const where = serviceId ? { serviceId } : {};
  const availability = await prisma.availability.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ availability });
}

export async function POST(req: NextRequest) {
  try {
    requireAuth(req, ["ADMIN"]);
    const json = await req.json();
    const body = availabilitySchema.parse(json);

    const availability = await prisma.availability.create({
      data: {
        ...body,
        date: body.date ? new Date(body.date) : undefined,
      },
    });

    return NextResponse.json({ availability }, { status: 201 });
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
    console.error("Availability POST error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

