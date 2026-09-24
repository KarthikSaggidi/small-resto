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

    const subscriptions =
      await prisma.subscription.findMany({
        orderBy: {
          createdAt: "desc",
        },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
              status: true,
              email: true,
            },
          },
          plan: {
            select: {
              id: true,
              name: true,
              slug: true,
              monthlyPrice: true,
              yearlyPrice: true,
            },
          },
          payments: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      });

    return NextResponse.json({
      success: true,
      subscriptions,
    });
  } catch (error) {
    console.error(
      "Get subscriptions error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load subscriptions.",
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

    const tenantId = String(
      body.tenantId || ""
    ).trim();

    const planId = String(
      body.planId || ""
    ).trim();

    const billingInterval =
      body.billingInterval === "YEARLY"
        ? "YEARLY"
        : "MONTHLY";

    const status =
      body.status === "ACTIVE"
        ? "ACTIVE"
        : "TRIAL";

    const trialDays =
      body.trialDays !== undefined
        ? Number(body.trialDays)
        : 14;

    if (!tenantId || !planId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Tenant and plan are required.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(trialDays) ||
      trialDays < 0 ||
      trialDays > 365
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Trial days must be between 0 and 365.",
        },
        { status: 400 }
      );
    }

    const tenant = await prisma.tenant.findUnique({
      where: {
        id: tenantId,
      },
    });

    if (!tenant) {
      return NextResponse.json(
        {
          success: false,
          message: "Tenant not found.",
        },
        { status: 404 }
      );
    }

    const plan = await prisma.plan.findUnique({
      where: {
        id: planId,
      },
    });

    if (!plan) {
      return NextResponse.json(
        {
          success: false,
          message: "Plan not found.",
        },
        { status: 404 }
      );
    }

    if (!plan.isActive) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This plan is inactive and cannot be assigned.",
        },
        { status: 400 }
      );
    }

    const existingSubscription =
      await prisma.subscription.findFirst({
        where: {
          tenantId,
          status: {
            in: [
              "TRIAL",
              "ACTIVE",
              "PAST_DUE",
            ],
          },
        },
      });

    if (existingSubscription) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This tenant already has an active subscription.",
        },
        { status: 409 }
      );
    }

    const startDate = new Date();

    let trialEndsAt: Date | null = null;
    let endDate: Date | null = null;

    if (status === "TRIAL") {
      trialEndsAt = new Date(startDate);

      trialEndsAt.setDate(
        trialEndsAt.getDate() + trialDays
      );
    }

    if (status === "ACTIVE") {
      endDate = new Date(startDate);

      if (billingInterval === "YEARLY") {
        endDate.setFullYear(
          endDate.getFullYear() + 1
        );
      } else {
        endDate.setMonth(
          endDate.getMonth() + 1
        );
      }
    }

    const subscription =
      await prisma.subscription.create({
        data: {
          tenantId,
          planId,
          status,
          billingInterval,
          startDate,
          endDate,
          trialEndsAt,
        },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          plan: {
            select: {
              id: true,
              name: true,
              monthlyPrice: true,
              yearlyPrice: true,
            },
          },
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Subscription created successfully.",
        subscription,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Create subscription error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to create subscription.",
      },
      { status: 500 }
    );
  }
}
