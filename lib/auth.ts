import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

type JwtPayload = {
  userId: string;
  role: "ADMIN" | "CUSTOMER";
  email: string;
};

const TOKEN_COOKIE = "bookify_token";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const TOKEN_EXPIRY = "7d";

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signAuthToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyAuthToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function setAuthCookie(res: NextResponse, token: string) {
  res.cookies.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export function clearAuthCookie(res: NextResponse) {
  res.cookies.delete(TOKEN_COOKIE);
}

export function getAuthFromRequest(req: NextRequest): JwtPayload | null {
  const token =
    req.cookies.get(TOKEN_COOKIE)?.value ??
    req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return verifyAuthToken(token);
}

export function requireAuth(
  req: NextRequest,
  roles?: Array<"ADMIN" | "CUSTOMER">
): JwtPayload {
  const auth = getAuthFromRequest(req);
  if (!auth) {
    throw new Error("UNAUTHORIZED");
  }
  if (roles && !roles.includes(auth.role)) {
    throw new Error("FORBIDDEN");
  }
  return auth;
}

