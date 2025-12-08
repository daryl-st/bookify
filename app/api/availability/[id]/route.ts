import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateSchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6).optional(),
    date: z.string().datetime().optional(),
    openTime: z.string().regex(/^[0-2][0-9]:[0-5][0-9]$/, "HH:mm").optional(),
    closeTime: z.string().regex(/^[0-2][0-9]:[0-5][0-9]$/, "HH:mm").optional(),
    durationMinutes: z.number().int().positive().optional(),
  })
  .refine((data) => data.dayOfWeek !== undefined || data.date !== undefined || data.openTime || data.closeTime || data.durationMinutes, {
    message: "Provide at least one field to update",
  });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireAuth(req, ["ADMIN"]);
    const json = await req.json();
    const body = updateSchema.parse(json);

    const availability = await prisma.availability.update({
      where: { id: params.id },
      data: {
        ...body,
        date: body.date ? new Date(body.date) : undefined,
      },
    });

    return NextResponse.json({ availability });
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
    console.error("Availability PATCH error", error);
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireAuth(req, ["ADMIN"]);
    await prisma.availability.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Availability DELETE error", error);
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }
}

