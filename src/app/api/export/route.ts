import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/export - Export incident data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json"; // json, csv
    const state = searchParams.get("state");
    const type = searchParams.get("type");
    const days = parseInt(searchParams.get("days") || "30", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "1000", 10), 5000);

    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - days);

    // Build where clause
    const where: any = {
      date: { gte: dateFilter },
    };
    if (state) where.state = state;
    if (type) where.type = type;

    // Fetch incidents
    const incidents = await prisma.incident.findMany({
      where,
      orderBy: { date: "desc" },
      take: limit,
      select: {
        id: true,
        type: true,
        state: true,
        lga: true,
        location: true,
        date: true,
        title: true,
        killed: true,
        kidnapped: true,
        rescued: true,
        injured: true,
        sourceUrl: true,
        sourceName: true,
      },
    });

    if (format === "csv") {
      // Generate CSV
      const headers = [
        "id",
        "date",
        "type",
        "state",
        "lga",
        "location",
        "title",
        "killed",
        "kidnapped",
        "rescued",
        "injured",
        "source_name",
        "source_url",
      ];

      const rows = incidents.map((inc) => [
        inc.id,
        new Date(inc.date).toISOString().split("T")[0],
        inc.type,
        inc.state,
        inc.lga || "",
        (inc.location || "").replace(/,/g, ";"),
        (inc.title || "").replace(/,/g, ";").replace(/"/g, '""'),
        inc.killed,
        inc.kidnapped,
        inc.rescued,
        inc.injured,
        inc.sourceName || "",
        inc.sourceUrl || "",
      ]);

      const csv = [
        headers.join(","),
        ...rows.map((row) =>
          row.map((cell) => (typeof cell === "string" && cell.includes(",") ? `"${cell}"` : cell)).join(",")
        ),
      ].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename=safejourney-incidents-${new Date().toISOString().split("T")[0]}.csv`,
        },
      });
    }

    // Return JSON
    return NextResponse.json({
      data: incidents,
      meta: {
        count: incidents.length,
        period: {
          start: dateFilter.toISOString(),
          end: new Date().toISOString(),
          days,
        },
        filters: {
          state: state || "all",
          type: type || "all",
        },
        exportedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Export API error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
