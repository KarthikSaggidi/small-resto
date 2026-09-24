import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "tb_admin_session";

const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET || "change-this-secret-in-production";

const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL || "admin@thirumalabakery.com";

const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || "Admin@123";

function createToken(email: string) {
  const payload = Buffer.from(
    JSON.stringify({
      email,
      role: "admin",
      createdAt: Date.now(),
    })
  ).toString("base64url");

  const signature = createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

export function verifyAdminSessionToken(
  token: string
) {
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

    return data;
  } catch {
    return false;
  }
}

export function validateAdminCredentials(
  email: string,
  password: string
) {
  return (
    email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase() &&
    password === ADMIN_PASSWORD
  );
}

export async function createAdminSession(email: string) {
  const cookieStore = await cookies();

  cookieStore.set({
    name: COOKIE_NAME,
    value: createToken(email),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();

  cookieStore.delete(COOKIE_NAME);
}

export async function getAdminSession() {
  const cookieStore = await cookies();

  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifyAdminSessionToken(token);
}