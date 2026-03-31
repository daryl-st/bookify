import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.role as "ADMIN" | "CUSTOMER";

    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role,
      },
    });
  } catch (error) {
    console.error("Auth me error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
