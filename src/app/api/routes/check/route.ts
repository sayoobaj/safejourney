import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { findRoute, getRouteStates, MAJOR_ROUTES } from "@/data/routes";
import { calculateRouteScore, RouteScore } from "@/lib/safety";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const days = parseInt(searchParams.get("days") || "7", 10);

    if (!from || !to) {
      return NextResponse.json(
        { error: "Missing 'from' or 'to' parameter" },
        { status: 400 }
      );
    }

    // Find the route
    const route = findRoute(from, to);
    
    if (!route) {
      // If no direct route, create a simple point-to-point
      // In future, could implement pathfinding
      return NextResponse.json(
        { 
          error: "No known route between these locations",
          suggestion: "Try major cities like Lagos, Abuja, Kano, Port Harcourt",
          availableRoutes: MAJOR_ROUTES.map(r => ({ from: r.from, to: r.to }))
        },
        { status: 404 }
      );
    }

    // Get all states along the route
    const routeStates = getRouteStates(route);

    // Fetch incidents for these states in the time period
    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - days);

    const incidents = await prisma.incident.findMany({
      where: {
        state: { in: routeStates },
        date: { gte: dateFilter },
      },
      select: {
        id: true,
        type: true,
        state: true,
        title: true,
        date: true,
        killed: true,
        kidnapped: true,
        lga: true,
      },
      orderBy: { date: "desc" },
    });

    // Group incidents by state
    const incidentsByState: Record<string, { type: string; killed: number; kidnapped: number }[]> = {};
    routeStates.forEach((state) => {
      incidentsByState[state] = [];
    });
    
    incidents.forEach((inc) => {
      if (incidentsByState[inc.state]) {
        incidentsByState[inc.state].push({
          type: inc.type,
          killed: inc.killed,
          kidnapped: inc.kidnapped,
        });
      }
    });

    // Calculate route safety score
    const routeScore = calculateRouteScore(
      route.from,
      route.to,
      routeStates,
      incidentsByState,
      days
    );

    // Recent incidents for display
    const recentIncidents = incidents.slice(0, 5).map((inc) => ({
      id: inc.id,
      title: inc.title,
      state: inc.state,
      lga: inc.lga,
      type: inc.type,
      date: inc.date,
      killed: inc.killed,
      kidnapped: inc.kidnapped,
    }));

    return NextResponse.json({
      route: {
        from: route.from,
        to: route.to,
        waypoints: route.waypoints,
        distanceKm: route.distanceKm,
        estimatedHours: route.estimatedHours,
        description: route.description,
      },
      safety: routeScore,
      recentIncidents,
      checkedAt: new Date().toISOString(),
      period: `${days} days`,
    });
  } catch (error) {
    console.error("Route check error:", error);
    return NextResponse.json(
      { error: "Failed to check route safety" },
      { status: 500 }
    );
  }
}

// Get list of available routes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "list") {
      // Return all available routes
      const routes = MAJOR_ROUTES.map((r) => ({
        id: r.id,
        from: r.from,
        to: r.to,
        distanceKm: r.distanceKm,
        estimatedHours: r.estimatedHours,
      }));

      // Get unique destinations
      const destinations = new Set<string>();
      MAJOR_ROUTES.forEach((r) => {
        destinations.add(r.from);
        destinations.add(r.to);
      });

      return NextResponse.json({
        routes,
        destinations: Array.from(destinations).sort(),
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Routes API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
