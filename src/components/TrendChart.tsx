"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface DataPoint {
  label: string;
  value: number;
}

interface TrendChartProps {
  data: DataPoint[];
  title: string;
  color?: string;
  height?: number;
  showLabels?: boolean;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  title,
  color = "#3B82F6",
  height = 120,
  showLabels = true,
}) => {
  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">{title}</h4>
        <p className="text-gray-500 text-sm">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const minValue = Math.min(...data.map((d) => d.value));
  const padding = 20;
  const chartWidth = 100;
  const chartHeight = height - 40;

  // Calculate points for the line
  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1 || 1)) * (chartWidth - padding * 2);
    const y = chartHeight - ((d.value - minValue) / (maxValue - minValue || 1)) * (chartHeight - padding);
    return { x, y, ...d };
  });

  // Create SVG path
  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  // Create area path
  const areaPath = `${linePath} L ${points[points.length - 1]?.x || 0} ${chartHeight} L ${padding} ${chartHeight} Z`;

  // Calculate trend
  const firstValue = data[0]?.value || 0;
  const lastValue = data[data.length - 1]?.value || 0;
  const trendPercent = firstValue > 0 
    ? Math.round(((lastValue - firstValue) / firstValue) * 100)
    : 0;
  const isUp = trendPercent > 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-900 dark:text-white">{title}</h4>
        <div className={`flex items-center gap-1 text-sm ${isUp ? "text-red-500" : "text-green-500"}`}>
          {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {Math.abs(trendPercent)}%
        </div>
      </div>

      <svg
        viewBox={`0 0 ${chartWidth} ${height}`}
        className="w-full"
        style={{ height }}
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
          <line
            key={pct}
            x1={padding}
            y1={chartHeight - pct * (chartHeight - padding)}
            x2={chartWidth - padding}
            y2={chartHeight - pct * (chartHeight - padding)}
            stroke="#E5E7EB"
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />
        ))}

        {/* Area */}
        <path
          d={areaPath}
          fill={`${color}20`}
        />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r="3"
              fill={color}
            />
            {showLabels && i % Math.ceil(data.length / 4) === 0 && (
              <text
                x={p.x}
                y={chartHeight + 12}
                textAnchor="middle"
                className="text-[8px] fill-gray-500"
              >
                {p.label}
              </text>
            )}
          </g>
        ))}

        {/* Y-axis labels */}
        <text
          x={padding - 5}
          y={padding}
          textAnchor="end"
          className="text-[8px] fill-gray-500"
        >
          {maxValue}
        </text>
        <text
          x={padding - 5}
          y={chartHeight}
          textAnchor="end"
          className="text-[8px] fill-gray-500"
        >
          {minValue}
        </text>
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
};

// Simplified bar chart for comparisons
interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  title: string;
  height?: number;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  height = 200,
}) => {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
      <h4 className="font-medium text-gray-900 dark:text-white mb-4">{title}</h4>
      
      <div className="space-y-3">
        {data.map((item, i) => (
          <div key={item.label}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
              <span className="font-medium text-gray-900 dark:text-white">{item.value}</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color || "#3B82F6",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
