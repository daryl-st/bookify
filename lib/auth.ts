import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { NextRequest } from "next/server";

import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  secret:
    process.env.BETTER_AUTH_SECRET ??
    "development-only-better-auth-secret-min-32-chars-long!!",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  trustedOrigins: [
    process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  ],
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },
  user: {
    additionalFields: {
      role: {
        type: ["CUSTOMER", "ADMIN"],
        required: true,
        defaultValue: "CUSTOMER",
        input: false,
      },
    },
  },
  plugins: [nextCookies()],
});

export type AppSessionUser = {
  userId: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
};

export async function getSessionFromRequest(req: NextRequest) {
  return auth.api.getSession({ headers: req.headers });
}

export async function requireAuth(
  req: NextRequest,
  roles?: Array<"ADMIN" | "CUSTOMER">
): Promise<AppSessionUser> {
  const session = await getSessionFromRequest(req);
  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }
  const role = session.user.role as "ADMIN" | "CUSTOMER";
  if (roles && !roles.includes(role)) {
    throw new Error("FORBIDDEN");
  }
  return {
    userId: session.user.id,
    email: session.user.email,
    role,
  };
}
