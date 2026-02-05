import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { NIGERIAN_STATES } from "@/data/states";
import { calculateStateScore, calculateNationalIndex, StateScore } from "@/lib/safety";

// GET /api/safety - Get safety scores for all states
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "7", 10);
    const state = searchParams.get("state"); // Optional: get specific state

    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - days);

    // Previous period for trend calculation
    const previousDateStart = new Date(dateFilter);
    previousDateStart.setDate(previousDateStart.getDate() - days);

    if (state) {
      // Get specific state score
      const [currentIncidents, previousIncidents] = await Promise.all([
        prisma.incident.findMany({
          where: {
            state,
            date: { gte: dateFilter },
          },
          select: { type: true, killed: true, kidnapped: true },
        }),
        prisma.incident.count({
          where: {
            state,
            date: { gte: previousDateStart, lt: dateFilter },
          },
        }),
      ]);

      const stateScore = calculateStateScore(
        state,
        currentIncidents,
        days,
        previousIncidents
      );

      // Get recent incidents
      const recentIncidents = await prisma.incident.findMany({
        where: { state, date: { gte: dateFilter } },
        orderBy: { date: "desc" },
        take: 10,
      });

      return NextResponse.json({
        state: stateScore,
        recentIncidents,
        period: `${days} days`,
      });
    }

    // Get all states' scores
    const [currentIncidents, previousCounts] = await Promise.all([
      prisma.incident.findMany({
        where: { date: { gte: dateFilter } },
        select: { state: true, type: true, killed: true, kidnapped: true },
      }),
      prisma.incident.groupBy({
        by: ["state"],
        where: { date: { gte: previousDateStart, lt: dateFilter } },
        _count: true,
      }),
    ]);

    // Group current incidents by state
    const incidentsByState: Record<string, { type: string; killed: number; kidnapped: number }[]> = {};
    NIGERIAN_STATES.forEach((s) => {
      incidentsByState[s.name] = [];
    });
    currentIncidents.forEach((inc) => {
      if (incidentsByState[inc.state]) {
        incidentsByState[inc.state].push({
          type: inc.type,
          killed: inc.killed,
          kidnapped: inc.kidnapped,
        });
      }
    });

    // Previous counts map
    const previousCountMap: Record<string, number> = {};
    previousCounts.forEach((p) => {
      previousCountMap[p.state] = p._count;
    });

    // Calculate scores for all states
    const stateScores: StateScore[] = NIGERIAN_STATES.map((s) => 
      calculateStateScore(
        s.name,
        incidentsByState[s.name] || [],
        days,
        previousCountMap[s.name]
      )
    );

    // Sort by incidents (descending) for hotspot ranking
    const hotspots = [...stateScores]
      .filter((s) => s.incidents > 0)
      .sort((a, b) => b.incidents - a.incidents);

    // Calculate national index
    const nationalIndex = calculateNationalIndex(stateScores);

    // Top improving and worsening
    const improving = stateScores
      .filter((s) => s.trend === "improving")
      .sort((a, b) => a.trendPercent - b.trendPercent)
      .slice(0, 5);

    const worsening = stateScores
      .filter((s) => s.trend === "worsening")
      .sort((a, b) => b.trendPercent - a.trendPercent)
      .slice(0, 5);

    return NextResponse.json({
      nationalIndex,
      states: stateScores,
      hotspots: hotspots.slice(0, 10),
      improving,
      worsening,
      period: `${days} days`,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Safety API error:", error);
    return NextResponse.json(
      { error: "Failed to calculate safety scores" },
      { status: 500 }
    );
  }
}
