import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { IncidentType, IncidentStatus } from "@prisma/client";

// GET /api/incidents - List incidents with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const state = searchParams.get("state");
    const type = searchParams.get("type") as IncidentType | null;
    const status = searchParams.get("status") as IncidentStatus | null;
    const days = parseInt(searchParams.get("days") || "30", 10);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    
    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - days);
    
    const where: any = {
      date: { gte: dateFilter },
    };
    
    if (state) where.state = state;
    if (type) where.type = type;
    if (status) where.status = status;
    
    const [incidents, total] = await Promise.all([
      prisma.incident.findMany({
        where,
        orderBy: { date: "desc" },
        take: Math.min(limit, 500),
        skip: offset,
      }),
      prisma.incident.count({ where }),
    ]);
    
    // Calculate stats
    const stats = await prisma.incident.aggregate({
      where,
      _sum: {
        killed: true,
        kidnapped: true,
        rescued: true,
        injured: true,
      },
      _count: true,
    });
    
    // Group by state
    const byState = await prisma.incident.groupBy({
      by: ["state"],
      where,
      _count: true,
      _sum: { killed: true, kidnapped: true },
    });
    
    // Group by type
    const byType = await prisma.incident.groupBy({
      by: ["type"],
      where,
      _count: true,
    });
    
    return NextResponse.json({
      incidents,
      total,
      stats: {
        count: stats._count,
        killed: stats._sum.killed || 0,
        kidnapped: stats._sum.kidnapped || 0,
        rescued: stats._sum.rescued || 0,
        injured: stats._sum.injured || 0,
      },
      byState: byState.map((s) => ({
        state: s.state,
        count: s._count,
        killed: s._sum.killed || 0,
        kidnapped: s._sum.kidnapped || 0,
      })),
      byType: byType.map((t) => ({
        type: t.type,
        count: t._count,
      })),
    });
  } catch (error) {
    console.error("Error fetching incidents:", error);
    return NextResponse.json(
      { error: "Failed to fetch incidents" },
      { status: 500 }
    );
  }
}

// POST /api/incidents - Create new incident
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      type,
      state,
      lga,
      location,
      latitude,
      longitude,
      date,
      title,
      description,
      killed = 0,
      kidnapped = 0,
      rescued = 0,
      injured = 0,
      sourceUrl,
      sourceName,
    } = body;
    
    // Validate required fields
    if (!type || !state || !title || !date) {
      return NextResponse.json(
        { error: "Missing required fields: type, state, title, date" },
        { status: 400 }
      );
    }
    
    // Validate type
    if (!Object.values(IncidentType).includes(type)) {
      return NextResponse.json(
        { error: `Invalid incident type. Must be one of: ${Object.values(IncidentType).join(", ")}` },
        { status: 400 }
      );
    }
    
    const incident = await prisma.incident.create({
      data: {
        type: type as IncidentType,
        state,
        lga,
        location,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        date: new Date(date),
        title,
        description,
        killed: parseInt(killed, 10) || 0,
        kidnapped: parseInt(kidnapped, 10) || 0,
        rescued: parseInt(rescued, 10) || 0,
        injured: parseInt(injured, 10) || 0,
        sourceUrl,
        sourceName,
      },
    });
    
    return NextResponse.json({ incident }, { status: 201 });
  } catch (error) {
    console.error("Error creating incident:", error);
    return NextResponse.json(
      { error: "Failed to create incident" },
      { status: 500 }
    );
  }
}
