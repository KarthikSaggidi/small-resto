import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getSuperAdminSession } from "@/lib/auth/super-admin-session";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
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

    const existingPlan = await prisma.plan.findUnique({
      where: {
        id,
      },
    });

    if (!existingPlan) {
      return NextResponse.json(
        {
          success: false,
          message: "Plan not found.",
        },
        { status: 404 }
      );
    }

    const body = await request.json();

    const name =
      body.name !== undefined
        ? String(body.name).trim()
        : existingPlan.name;

    const slug =
      body.slug !== undefined
        ? String(body.slug).trim().toLowerCase()
        : existingPlan.slug;

    const description =
      body.description !== undefined
        ? String(body.description).trim()
        : existingPlan.description;

    const monthlyPrice =
      body.monthlyPrice !== undefined
        ? Number(body.monthlyPrice)
        : Number(existingPlan.monthlyPrice);

    const yearlyPrice =
      body.yearlyPrice !== undefined
        ? Number(body.yearlyPrice)
        : Number(existingPlan.yearlyPrice);

    const maxUsers =
      body.maxUsers !== undefined
        ? Number(body.maxUsers)
        : existingPlan.maxUsers;

    const maxProducts =
      body.maxProducts !== undefined
        ? Number(body.maxProducts)
        : existingPlan.maxProducts;

    const maxLocations =
      body.maxLocations !== undefined
        ? Number(body.maxLocations)
        : existingPlan.maxLocations;

    const isActive =
      body.isActive !== undefined
        ? Boolean(body.isActive)
        : existingPlan.isActive;

    const onlineOrders =
      body.onlineOrders !== undefined
        ? Boolean(body.onlineOrders)
        : existingPlan.onlineOrders;

    const billing =
      body.billing !== undefined
        ? Boolean(body.billing)
        : existingPlan.billing;

    const inventory =
      body.inventory !== undefined
        ? Boolean(body.inventory)
        : existingPlan.inventory;

    const reports =
      body.reports !== undefined
        ? Boolean(body.reports)
        : existingPlan.reports;

    const loyalty =
      body.loyalty !== undefined
        ? Boolean(body.loyalty)
        : existingPlan.loyalty;

    const advancedReports =
      body.advancedReports !== undefined
        ? Boolean(body.advancedReports)
        : existingPlan.advancedReports;

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

    const duplicatePlan = await prisma.plan.findFirst({
      where: {
        OR: [
          {
            name,
          },
          {
            slug,
          },
        ],
        NOT: {
          id,
        },
      },
    });

    if (duplicatePlan) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Another plan already uses this name or slug.",
        },
        { status: 409 }
      );
    }

    const plan = await prisma.plan.update({
      where: {
        id,
      },
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
        isActive,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Plan updated successfully.",
      plan,
    });
  } catch (error) {
    console.error("Update plan error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update plan.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
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

    const plan = await prisma.plan.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
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

    if (plan._count.subscriptions > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This plan cannot be deleted because it is assigned to one or more subscriptions. Deactivate it instead.",
        },
        { status: 409 }
      );
    }

    await prisma.plan.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Plan deleted successfully.",
    });
  } catch (error) {
    console.error("Delete plan error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to delete plan.",
      },
      { status: 500 }
    );
  }
}
