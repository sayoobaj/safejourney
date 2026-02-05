import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/trends - Get trend data for charts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get("state"); // Optional state filter
    const days = parseInt(searchParams.get("days") || "30", 10);
    const groupBy = searchParams.get("groupBy") || "day"; // day, week, month

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Base where clause
    const where: any = {
      date: { gte: startDate },
    };
    if (state) {
      where.state = state;
    }

    // Get all incidents in the period
    const incidents = await prisma.incident.findMany({
      where,
      select: {
        id: true,
        date: true,
        type: true,
        state: true,
        killed: true,
        kidnapped: true,
      },
      orderBy: { date: "asc" },
    });

    // Group by time period
    const groupedData: Record<string, {
      count: number;
      killed: number;
      kidnapped: number;
    }> = {};

    incidents.forEach((inc) => {
      let key: string;
      const date = new Date(inc.date);

      if (groupBy === "week") {
        // Get week number
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split("T")[0];
      } else if (groupBy === "month") {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      } else {
        // Day
        key = date.toISOString().split("T")[0];
      }

      if (!groupedData[key]) {
        groupedData[key] = { count: 0, killed: 0, kidnapped: 0 };
      }
      groupedData[key].count++;
      groupedData[key].killed += inc.killed;
      groupedData[key].kidnapped += inc.kidnapped;
    });

    // Convert to array and fill gaps
    const timeline: { label: string; incidents: number; killed: number; kidnapped: number }[] = [];
    const sortedKeys = Object.keys(groupedData).sort();

    // Fill in missing dates
    if (sortedKeys.length > 0) {
      const current = new Date(sortedKeys[0]);
      const end = new Date(sortedKeys[sortedKeys.length - 1]);

      while (current <= end) {
        let key: string;
        if (groupBy === "week") {
          const weekStart = new Date(current);
          weekStart.setDate(current.getDate() - current.getDay());
          key = weekStart.toISOString().split("T")[0];
          current.setDate(current.getDate() + 7);
        } else if (groupBy === "month") {
          key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
          current.setMonth(current.getMonth() + 1);
        } else {
          key = current.toISOString().split("T")[0];
          current.setDate(current.getDate() + 1);
        }

        const data = groupedData[key] || { count: 0, killed: 0, kidnapped: 0 };
        timeline.push({
          label: formatLabel(key, groupBy),
          incidents: data.count,
          killed: data.killed,
          kidnapped: data.kidnapped,
        });
      }
    }

    // Group by incident type
    const byType: Record<string, number> = {};
    incidents.forEach((inc) => {
      byType[inc.type] = (byType[inc.type] || 0) + 1;
    });

    // Group by state (top 10)
    const byState: Record<string, number> = {};
    incidents.forEach((inc) => {
      byState[inc.state] = (byState[inc.state] || 0) + 1;
    });
    const topStates = Object.entries(byState)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([state, count]) => ({ state, count }));

    // Summary stats
    const totalIncidents = incidents.length;
    const totalKilled = incidents.reduce((sum, i) => sum + i.killed, 0);
    const totalKidnapped = incidents.reduce((sum, i) => sum + i.kidnapped, 0);

    // Calculate week-over-week change
    const midpoint = new Date(startDate.getTime() + (Date.now() - startDate.getTime()) / 2);
    const firstHalf = incidents.filter((i) => new Date(i.date) < midpoint).length;
    const secondHalf = incidents.filter((i) => new Date(i.date) >= midpoint).length;
    const trendPercent = firstHalf > 0 
      ? Math.round(((secondHalf - firstHalf) / firstHalf) * 100)
      : 0;

    return NextResponse.json({
      timeline,
      byType: Object.entries(byType).map(([type, count]) => ({
        type,
        count,
        color: getTypeColor(type),
      })),
      topStates,
      summary: {
        totalIncidents,
        totalKilled,
        totalKidnapped,
        trendPercent,
        trendDirection: trendPercent > 5 ? "worsening" : trendPercent < -5 ? "improving" : "stable",
      },
      period: {
        start: startDate.toISOString(),
        end: new Date().toISOString(),
        days,
      },
    });
  } catch (error) {
    console.error("Trends API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trends" },
      { status: 500 }
    );
  }
}

function formatLabel(key: string, groupBy: string): string {
  if (groupBy === "month") {
    const [year, month] = key.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[parseInt(month) - 1]} ${year.slice(2)}`;
  }
  
  const date = new Date(key);
  if (groupBy === "week") {
    return `W${getWeekNumber(date)}`;
  }
  
  // Day
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    KIDNAPPING: "#DC2626",
    BANDITRY: "#F97316",
    TERRORISM: "#1F2937",
    ARMED_ROBBERY: "#7C3AED",
    OTHER: "#6B7280",
  };
  return colors[type] || "#6B7280";
}
