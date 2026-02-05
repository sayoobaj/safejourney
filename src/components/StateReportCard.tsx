"use client";

import React, { useRef } from "react";
import {
  Share2,
  Download,
  MapPin,
  AlertTriangle,
  Skull,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Shield,
} from "lucide-react";

interface StateReportCardProps {
  state: string;
  zone: string;
  score: number;
  level: string;
  color: string;
  incidents: number;
  killed: number;
  kidnapped: number;
  trend: "improving" | "stable" | "worsening";
  trendPercent: number;
  period: string;
  topIncidentTypes?: { type: string; count: number }[];
}

export const StateReportCard: React.FC<StateReportCardProps> = ({
  state,
  zone,
  score,
  level,
  color,
  incidents,
  killed,
  kidnapped,
  trend,
  trendPercent,
  period,
  topIncidentTypes = [],
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const getTrendIcon = () => {
    if (trend === "worsening") return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (trend === "improving") return <TrendingDown className="w-4 h-4 text-green-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getTrendText = () => {
    if (trend === "worsening") return `↑ ${Math.abs(trendPercent)}% worse`;
    if (trend === "improving") return `↓ ${Math.abs(trendPercent)}% better`;
    return "→ Stable";
  };

  const getTrendColor = () => {
    if (trend === "worsening") return "text-red-600";
    if (trend === "improving") return "text-green-600";
    return "text-gray-600";
  };

  const shareCard = async () => {
    const text = `🛡️ ${state} Safety Report

${level} (${score}/10)

📊 Last ${period}:
• ${incidents} incidents
${killed > 0 ? `• ${killed} killed\n` : ""}${kidnapped > 0 ? `• ${kidnapped} kidnapped\n` : ""}
${getTrendText()} from previous period

Check safety at SafeJourney.ng 🇳🇬`;

    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert("Report copied to clipboard!");
    }
  };

  return (
    <div
      ref={cardRef}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden max-w-sm"
    >
      {/* Header */}
      <div
        className="p-4"
        style={{ backgroundColor: `${color}15` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: color }}
            >
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                {state}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {zone}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div
              className="text-3xl font-bold"
              style={{ color }}
            >
              {score.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">/10</div>
          </div>
        </div>
      </div>

      {/* Risk Level */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span
            className="px-3 py-1 rounded-full text-sm font-medium"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {level}
          </span>
          <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
            {getTrendIcon()}
            {getTrendText()}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          Last {period}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 mb-1">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {incidents}
            </div>
            <div className="text-xs text-gray-500">Incidents</div>
          </div>

          <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 mb-1">
              <Skull className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {killed}
            </div>
            <div className="text-xs text-gray-500">Killed</div>
          </div>

          <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 mb-1">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {kidnapped}
            </div>
            <div className="text-xs text-gray-500">Kidnapped</div>
          </div>
        </div>

        {/* Top incident types */}
        {topIncidentTypes.length > 0 && (
          <div className="pt-2">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Incident Types
            </div>
            <div className="flex flex-wrap gap-2">
              {topIncidentTypes.map((t) => (
                <span
                  key={t.type}
                  className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300"
                >
                  {t.type.toLowerCase().replace("_", " ")} ({t.count})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Shield className="w-3 h-3" />
          SafeJourney.ng
        </div>
        <button
          onClick={shareCard}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-900"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>
    </div>
  );
};
