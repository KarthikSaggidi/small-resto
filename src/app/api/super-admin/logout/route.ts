import { NextResponse } from "next/server";
import { destroySuperAdminSession } from "@/lib/auth/super-admin-session";

export async function POST() {
  await destroySuperAdminSession();

  return NextResponse.json({
    success: true,
  });
}
