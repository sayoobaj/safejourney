"use client";

import React from "react";
import { Flame, TrendingUp, TrendingDown, Skull, Users, MapPin } from "lucide-react";

interface StateScore {
  state: string;
  score: number;
  level: string;
  color: string;
  incidents: number;
  killed: number;
  kidnapped: number;
  trend: "improving" | "stable" | "worsening";
  trendPercent: number;
}

interface HotspotsListProps {
  hotspots: StateScore[];
  onStateClick?: (state: string) => void;
  selectedState?: string | null;
  limit?: number;
}

export const HotspotsList: React.FC<HotspotsListProps> = ({
  hotspots,
  onStateClick,
  selectedState,
  limit = 5,
}) => {
  const displayHotspots = hotspots.slice(0, limit);

  const getTrendIcon = (trend: string, percent: number) => {
    if (trend === "worsening") {
      return <TrendingUp className="w-3 h-3 text-red-500" />;
    }
    if (trend === "improving") {
      return <TrendingDown className="w-3 h-3 text-green-500" />;
    }
    return null;
  };

  if (displayHotspots.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
          <Flame className="w-5 h-5 text-orange-500" />
          Hotspot States
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
          No incidents in selected period
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
        <Flame className="w-5 h-5 text-orange-500" />
        Hotspot States
      </h3>

      <div className="space-y-2">
        {displayHotspots.map((state, idx) => (
          <button
            key={state.state}
            onClick={() => onStateClick?.(state.state)}
            className={`w-full p-3 rounded-lg text-left transition-colors ${
              selectedState === state.state
                ? "bg-red-50 dark:bg-red-900/30 ring-2 ring-red-500"
                : "bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: state.color }}
                >
                  {idx + 1}
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    {state.state}
                    {getTrendIcon(state.trend, state.trendPercent)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <span>{state.incidents} incidents</span>
                    {state.killed > 0 && (
                      <span className="flex items-center gap-0.5 text-red-600 dark:text-red-400">
                        <Skull className="w-3 h-3" />
                        {state.killed}
                      </span>
                    )}
                    {state.kidnapped > 0 && (
                      <span className="flex items-center gap-0.5 text-orange-600 dark:text-orange-400">
                        <Users className="w-3 h-3" />
                        {state.kidnapped}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div
                  className="text-lg font-bold"
                  style={{ color: state.color }}
                >
                  {state.score}
                </div>
                <div className="text-xs text-gray-500">/10</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {hotspots.length > limit && (
        <button className="w-full mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline">
          View all {hotspots.length} affected states
        </button>
      )}
    </div>
  );
};
