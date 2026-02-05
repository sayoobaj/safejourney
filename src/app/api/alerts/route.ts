import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/alerts - List subscriptions for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform");
    const userId = searchParams.get("userId");

    if (!platform || !userId) {
      return NextResponse.json(
        { error: "Missing platform or userId" },
        { status: 400 }
      );
    }

    const subscriptions = await prisma.alertSubscription.findMany({
      where: {
        platform,
        userId,
        active: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error("Alerts API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}

// POST /api/alerts - Create or update subscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, userId, type, target, minSeverity = "MODERATE", active = true } = body;

    if (!platform || !userId || !type || !target) {
      return NextResponse.json(
        { error: "Missing required fields: platform, userId, type, target" },
        { status: 400 }
      );
    }

    // Validate type
    if (!["state", "route", "national"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be: state, route, or national" },
        { status: 400 }
      );
    }

    // Validate severity
    if (!["LOW", "MODERATE", "HIGH", "SEVERE"].includes(minSeverity)) {
      return NextResponse.json(
        { error: "Invalid minSeverity. Must be: LOW, MODERATE, HIGH, or SEVERE" },
        { status: 400 }
      );
    }

    // Upsert subscription
    const subscription = await prisma.alertSubscription.upsert({
      where: {
        platform_userId_type_target: {
          platform,
          userId,
          type,
          target,
        },
      },
      update: {
        minSeverity,
        active,
        updatedAt: new Date(),
      },
      create: {
        platform,
        userId,
        type,
        target,
        minSeverity,
        active,
      },
    });

    return NextResponse.json({ subscription }, { status: 201 });
  } catch (error) {
    console.error("Alerts API error:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}

// DELETE /api/alerts - Remove subscription
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const platform = searchParams.get("platform");
    const userId = searchParams.get("userId");
    const type = searchParams.get("type");
    const target = searchParams.get("target");

    if (id) {
      // Delete by ID
      await prisma.alertSubscription.delete({
        where: { id },
      });
    } else if (platform && userId && type && target) {
      // Delete by composite key
      await prisma.alertSubscription.delete({
        where: {
          platform_userId_type_target: {
            platform,
            userId,
            type,
            target,
          },
        },
      });
    } else {
      return NextResponse.json(
        { error: "Missing id or (platform, userId, type, target)" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Alerts API error:", error);
    return NextResponse.json(
      { error: "Failed to delete subscription" },
      { status: 500 }
    );
  }
}
