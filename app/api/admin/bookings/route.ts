import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    requireAuth(req, ["ADMIN"]);
    const bookings = await prisma.booking.findMany({
      include: { user: true, service: true },
      orderBy: { startTime: "desc" },
    });
    return NextResponse.json({ bookings });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Admin bookings GET error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

