import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getSuperAdminSession } from "@/lib/auth/super-admin-session";

export async function GET() {
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

    const plans = await prisma.plan.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      plans,
    });
  } catch (error) {
    console.error("Get plans error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load plans.",
      },
      { status: 500 }
    );
  }
}

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

    const description = String(
      body.description || ""
    ).trim();

    const monthlyPrice = Number(body.monthlyPrice);
    const yearlyPrice = Number(body.yearlyPrice);

    const maxUsers = Number(body.maxUsers);
    const maxProducts = Number(body.maxProducts);
    const maxLocations = Number(body.maxLocations);

    const onlineOrders = Boolean(body.onlineOrders);
    const billing = Boolean(body.billing);
    const inventory = Boolean(body.inventory);
    const reports = Boolean(body.reports);
    const loyalty = Boolean(body.loyalty);
    const advancedReports = Boolean(body.advancedReports);

    if (!name || !slug) {
      return NextResponse.json(
        {
          success: false,
          message: "Plan name and slug are required.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(monthlyPrice) ||
      monthlyPrice < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Monthly price must be a valid number.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(yearlyPrice) ||
      yearlyPrice < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Yearly price must be a valid number.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(maxUsers) ||
      maxUsers < 1
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Maximum users must be at least 1.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(maxProducts) ||
      maxProducts < 1
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Maximum products must be at least 1.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(maxLocations) ||
      maxLocations < 1
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Maximum locations must be at least 1.",
        },
        { status: 400 }
      );
    }

    const existingPlan = await prisma.plan.findFirst({
      where: {
        OR: [
          {
            name,
          },
          {
            slug,
          },
        ],
      },
    });

    if (existingPlan) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A plan with this name or slug already exists.",
        },
        { status: 409 }
      );
    }

    const plan = await prisma.plan.create({
      data: {
        name,
        slug,
        description: description || null,

        monthlyPrice,
        yearlyPrice,

        maxUsers,
        maxProducts,
        maxLocations,

        onlineOrders,
        billing,
        inventory,
        reports,
        loyalty,
        advancedReports,

        isActive: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Plan created successfully.",
        plan,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create plan error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create plan.",
      },
      { status: 500 }
    );
  }
}
