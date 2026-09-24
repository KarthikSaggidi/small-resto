import { NextResponse } from "next/server";
import { SubscriptionStatus } from "@/generated/prisma/client";

import { prisma } from "@/lib/db";
import { getSuperAdminSession } from "@/lib/auth/super-admin-session";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
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

    const { id } = await params;

    const existingSubscription =
      await prisma.subscription.findUnique({
        where: {
          id,
        },
        include: {
          tenant: true,
          plan: true,
        },
      });

    if (!existingSubscription) {
      return NextResponse.json(
        {
          success: false,
          message: "Subscription not found.",
        },
        { status: 404 }
      );
    }

    const body = await request.json();

    const planId =
      body.planId !== undefined
        ? String(body.planId).trim()
        : existingSubscription.planId;

    const billingInterval =
      body.billingInterval === "YEARLY"
        ? "YEARLY"
        : body.billingInterval === "MONTHLY"
          ? "MONTHLY"
          : existingSubscription.billingInterval;

    const rawStatus =
      body.status !== undefined
        ? String(body.status)
        : existingSubscription.status;

    const allowedStatuses = [
      "TRIAL",
      "ACTIVE",
      "PAST_DUE",
      "CANCELLED",
      "EXPIRED",
    ] as const;

    if (!allowedStatuses.includes(rawStatus as (typeof allowedStatuses)[number])) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid subscription status.",
        },
        { status: 400 }
      );
    }

    const status =
      rawStatus as SubscriptionStatus;

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

    let endDate =
      existingSubscription.endDate;

    let trialEndsAt =
      existingSubscription.trialEndsAt;

    /*
     * Activate subscription
     */
    if (
      status === "ACTIVE" &&
      existingSubscription.status !== "ACTIVE"
    ) {
      const startDate = new Date();

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

      trialEndsAt = null;
    }

    /*
     * Start / extend trial
     */
    if (status === "TRIAL") {
      const trialDays =
        body.trialDays !== undefined
          ? Number(body.trialDays)
          : 14;

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

      const trialStart = new Date();

      trialEndsAt = new Date(trialStart);

      trialEndsAt.setDate(
        trialEndsAt.getDate() + trialDays
      );

      endDate = null;
    }

    /*
     * Cancel / expire
     */
    if (
      status === "CANCELLED" ||
      status === "EXPIRED"
    ) {
      endDate = new Date();
      trialEndsAt = null;
    }

    const subscription =
      await prisma.subscription.update({
        where: {
          id,
        },
        data: {
          planId,
          billingInterval,
          status,
          endDate,
          trialEndsAt,
        },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
              status: true,
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

    return NextResponse.json({
      success: true,
      message: "Subscription updated successfully.",
      subscription,
    });
  } catch (error) {
    console.error(
      "Update subscription error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to update subscription.",
      },
      { status: 500 }
    );
  }
}
