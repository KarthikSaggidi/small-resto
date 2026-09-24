import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "dropx_super_admin_session";

const SESSION_SECRET =
  process.env.SUPER_ADMIN_SESSION_SECRET ||
  process.env.ADMIN_SESSION_SECRET ||
  "change-this-secret-in-production";

function createToken(userId: string, email: string) {
  const payload = Buffer.from(
    JSON.stringify({
      userId,
      email,
      role: "SUPER_ADMIN",
      createdAt: Date.now(),
    })
  ).toString("base64url");

  const signature = createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

export function verifySuperAdminSessionToken(token: string) {
  try {
    const [payload, signature] = token.split(".");

    if (!payload || !signature) {
      return false;
    }

    const expectedSignature = createHmac("sha256", SESSION_SECRET)
      .update(payload)
      .digest("base64url");

    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }

    if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
      return false;
    }

    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString()
    );

    if (data.role !== "SUPER_ADMIN") {
      return false;
    }

    return data;
  } catch {
    return false;
  }
}

export async function createSuperAdminSession(
  userId: string,
  email: string
) {
  const cookieStore = await cookies();

  cookieStore.set({
    name: COOKIE_NAME,
    value: createToken(userId, email),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySuperAdminSession() {
  const cookieStore = await cookies();

  cookieStore.delete(COOKIE_NAME);
}

export async function getSuperAdminSession() {
  const cookieStore = await cookies();

  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySuperAdminSessionToken(token);
}