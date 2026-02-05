"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { INCIDENT_COLORS } from "@/data/states";

interface Incident {
  id: string;
  type: string;
  state: string;
  lga?: string;
  latitude?: number;
  longitude?: number;
  date: string;
  title: string;
  killed: number;
  kidnapped: number;
}

interface IncidentMapProps {
  incidents: Incident[];
  onStateClick?: (state: string) => void;
  selectedState?: string | null;
}

const MAP_FILL_COLOR = "#f8fafc"; // slate-50
const MAP_STROKE_COLOR = "#64748b"; // slate-500
const MAP_HOVER_COLOR = "#e2e8f0"; // slate-200

export const IncidentMap: React.FC<IncidentMapProps> = ({
  incidents,
  onStateClick,
  selectedState,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    x: number;
    y: number;
    content: string;
  }>({ show: false, x: 0, y: 0, content: "" });

  // Load GeoJSON
  useEffect(() => {
    fetch("/data/nigeria_state_boundaries.geojson")
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => console.error("Failed to load map data:", err));
  }, []);

  // Calculate incident counts per state
  const stateIncidentCounts = React.useMemo(() => {
    const counts: Record<string, { total: number; killed: number; kidnapped: number }> = {};
    incidents.forEach((inc) => {
      if (!counts[inc.state]) {
        counts[inc.state] = { total: 0, killed: 0, kidnapped: 0 };
      }
      counts[inc.state].total++;
      counts[inc.state].killed += inc.killed;
      counts[inc.state].kidnapped += inc.kidnapped;
    });
    return counts;
  }, [incidents]);

  // Render map
  useEffect(() => {
    if (!geoData || !svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 500;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Projection
    const projection = d3.geoMercator().fitSize([width, height], geoData);
    const pathGenerator = d3.geoPath().projection(projection);

    // Color scale based on incident count
    const maxIncidents = Math.max(
      1,
      ...Object.values(stateIncidentCounts).map((c) => c.total)
    );
    const colorScale = d3
      .scaleSequential(d3.interpolateReds)
      .domain([0, maxIncidents]);

    // Draw states
    svg
      .selectAll("path")
      .data(geoData.features)
      .enter()
      .append("path")
      .attr("d", pathGenerator as any)
      .attr("fill", (d: any) => {
        const stateName = d.properties.admin1Name;
        const count = stateIncidentCounts[stateName]?.total || 0;
        return count > 0 ? colorScale(count) : MAP_FILL_COLOR;
      })
      .attr("stroke", (d: any) => {
        const stateName = d.properties.admin1Name;
        return stateName === selectedState ? "#1e40af" : MAP_STROKE_COLOR;
      })
      .attr("stroke-width", (d: any) => {
        const stateName = d.properties.admin1Name;
        return stateName === selectedState ? 2.5 : 0.5;
      })
      .attr("cursor", "pointer")
      .on("mouseenter", function (event: any, d: any) {
        const stateName = d.properties.admin1Name;
        const stats = stateIncidentCounts[stateName];
        d3.select(this).attr("fill", MAP_HOVER_COLOR);
        
        const content = stats
          ? `${stateName}\n${stats.total} incidents\n${stats.killed} killed, ${stats.kidnapped} kidnapped`
          : `${stateName}\nNo incidents`;
        
        setTooltip({
          show: true,
          x: event.pageX,
          y: event.pageY,
          content,
        });
      })
      .on("mousemove", (event: any) => {
        setTooltip((prev) => ({ ...prev, x: event.pageX, y: event.pageY }));
      })
      .on("mouseleave", function (event: any, d: any) {
        const stateName = d.properties.admin1Name;
        const count = stateIncidentCounts[stateName]?.total || 0;
        d3.select(this).attr("fill", count > 0 ? colorScale(count) : MAP_FILL_COLOR);
        setTooltip({ show: false, x: 0, y: 0, content: "" });
      })
      .on("click", (event: any, d: any) => {
        const stateName = d.properties.admin1Name;
        onStateClick?.(stateName);
      });

    // Draw incident markers for incidents with coordinates
    const incidentsWithCoords = incidents.filter(
      (inc) => inc.latitude && inc.longitude
    );

    svg
      .selectAll("circle")
      .data(incidentsWithCoords)
      .enter()
      .append("circle")
      .attr("cx", (d) => projection([d.longitude!, d.latitude!])![0])
      .attr("cy", (d) => projection([d.longitude!, d.latitude!])![1])
      .attr("r", 5)
      .attr("fill", (d) => INCIDENT_COLORS[d.type as keyof typeof INCIDENT_COLORS] || INCIDENT_COLORS.OTHER)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .attr("opacity", 0.8)
      .attr("cursor", "pointer");

  }, [geoData, incidents, stateIncidentCounts, selectedState, onStateClick]);

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[400px]">
      <svg ref={svgRef} className="w-full h-full" />
      
      {/* Tooltip */}
      {tooltip.show && (
        <div
          className="fixed z-50 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg pointer-events-none whitespace-pre-line"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y + 10,
          }}
        >
          {tooltip.content}
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 p-3 rounded-lg shadow-md text-xs">
        <div className="font-semibold mb-2">Incident Types</div>
        {Object.entries(INCIDENT_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2 mb-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="capitalize">{type.toLowerCase().replace("_", " ")}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
