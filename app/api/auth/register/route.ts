import { prisma } from "@/lib/prisma";
import { hashPassword, setAuthCookie, signAuthToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = registerSchema.parse(json);

    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const passwordHash = await hashPassword(body.password);
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        passwordHash,
        role: "CUSTOMER",
      },
      select: { id: true, email: true, role: true, name: true },
    });

    const token = signAuthToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    });
    const res = NextResponse.json({ user });
    setAuthCookie(res, token);
    return res;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    console.error("Register error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

