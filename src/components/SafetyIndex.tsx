"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Shield } from "lucide-react";

interface SafetyIndexProps {
  score: number;
  level: string;
  color: string;
  label: string;
  statesAffected: number;
  totalIncidents: number;
  trend?: {
    direction: "up" | "down" | "stable";
    percent: number;
  };
}

export const SafetyIndex: React.FC<SafetyIndexProps> = ({
  score,
  level,
  color,
  label,
  statesAffected,
  totalIncidents,
  trend,
}) => {
  // Calculate gauge rotation (score 1-10 mapped to -90 to 90 degrees)
  const rotation = ((score - 1) / 9) * 180 - 90;

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.direction === "up") {
      return <TrendingUp className="w-4 h-4 text-red-500" />;
    }
    if (trend.direction === "down") {
      return <TrendingDown className="w-4 h-4 text-green-500" />;
    }
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getTrendText = () => {
    if (!trend) return null;
    const direction = trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "→";
    const color = trend.direction === "up" ? "text-red-500" : trend.direction === "down" ? "text-green-500" : "text-gray-500";
    return (
      <span className={`${color} text-sm`}>
        {direction} {Math.abs(trend.percent)}% from last week
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Nigeria Safety Index
        </h3>
      </div>

      <div className="flex items-center justify-between">
        {/* Gauge */}
        <div className="relative w-32 h-20">
          {/* Background arc */}
          <svg viewBox="0 0 100 60" className="w-full h-full">
            {/* Background arc segments */}
            <path
              d="M 10 55 A 40 40 0 0 1 30 20"
              fill="none"
              stroke="#22C55E"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="M 32 18 A 40 40 0 0 1 68 18"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="M 70 20 A 40 40 0 0 1 90 55"
              fill="none"
              stroke="#EF4444"
              strokeWidth="8"
              strokeLinecap="round"
            />
            
            {/* Needle */}
            <line
              x1="50"
              y1="55"
              x2="50"
              y2="20"
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
              transform={`rotate(${rotation}, 50, 55)`}
            />
            
            {/* Center dot */}
            <circle cx="50" cy="55" r="4" fill={color} />
          </svg>
          
          {/* Score display */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
            <div className="text-2xl font-bold" style={{ color }}>
              {score}
            </div>
            <div className="text-xs text-gray-500">/10</div>
          </div>
        </div>

        {/* Stats */}
        <div className="text-right">
          <div
            className="text-lg font-semibold px-3 py-1 rounded-full"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {label}
          </div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center justify-end gap-1">
              <AlertTriangle className="w-3 h-3" />
              {totalIncidents} incidents
            </div>
            <div>{statesAffected} states affected</div>
          </div>
          {trend && (
            <div className="mt-1 flex items-center justify-end gap-1">
              {getTrendIcon()}
              {getTrendText()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
