import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db";
import { getSuperAdminSession } from "@/lib/auth/super-admin-session";

export async function POST(request: Request) {
  try {
    const session = await getSuperAdminSession();

    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const name = String(body.name || "").trim();
    const slug = String(body.slug || "")
      .trim()
      .toLowerCase();

    const businessType = String(
      body.businessType || ""
    ).trim();

    const email = String(body.email || "")
      .trim()
      .toLowerCase();

    const phone = String(body.phone || "").trim();

    const ownerName = String(body.ownerName || "").trim();

    const ownerEmail = String(body.ownerEmail || "")
      .trim()
      .toLowerCase();

    const ownerPassword = String(body.ownerPassword || "");

    if (
      !name ||
      !slug ||
      !ownerName ||
      !ownerEmail ||
      !ownerPassword
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Business name, slug, owner name, owner email and password are required.",
        },
        { status: 400 }
      );
    }

    if (ownerPassword.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Owner password must contain at least 8 characters.",
        },
        { status: 400 }
      );
    }

    const existingTenant = await prisma.tenant.findUnique({
      where: {
        slug,
      },
    });

    if (existingTenant) {
      return NextResponse.json(
        {
          success: false,
          message: "A tenant with this slug already exists.",
        },
        { status: 409 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: ownerEmail,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A user with this owner email already exists.",
        },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(
      ownerPassword,
      12
    );

    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name,
          slug,
          businessType: businessType || null,
          email: email || null,
          phone: phone || null,
          status: "TRIAL",
        },
      });

      const user = await tx.user.create({
        data: {
          name: ownerName,
          email: ownerEmail,
          passwordHash,
          role: "TENANT_ADMIN",
          isActive: true,
        },
      });

      const tenantUser = await tx.tenantUser.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
        },
      });

      return {
        tenant,
        user,
        tenantUser,
      };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Tenant created successfully.",
        tenant: {
          id: result.tenant.id,
          name: result.tenant.name,
          slug: result.tenant.slug,
          status: result.tenant.status,
        },
        owner: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create tenant error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong while creating the tenant.",
      },
      { status: 500 }
    );
  }
}
