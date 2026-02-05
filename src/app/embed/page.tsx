"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Shield, AlertTriangle, ExternalLink } from "lucide-react";

interface WidgetData {
  nationalIndex?: {
    score: number;
    level: string;
    color: string;
    label: string;
    totalIncidents: number;
  };
  stateData?: {
    state: string;
    score: number;
    level: string;
    color: string;
    incidents: number;
    killed: number;
    kidnapped: number;
  };
}

export default function EmbedPage() {
  const searchParams = useSearchParams();
  const state = searchParams.get("state");
  const theme = searchParams.get("theme") || "light";
  const showBranding = searchParams.get("branding") !== "false";

  const [data, setData] = useState<WidgetData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (state) {
          const res = await fetch(`/api/safety?state=${encodeURIComponent(state)}&days=7`);
          const result = await res.json();
          setData({ stateData: result.state });
        } else {
          const res = await fetch("/api/safety?days=7");
          const result = await res.json();
          setData({ nationalIndex: result.nationalIndex });
        }
      } catch (error) {
        console.error("Failed to fetch widget data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [state]);

  const isDark = theme === "dark";
  const bgClass = isDark ? "bg-gray-900" : "bg-white";
  const textClass = isDark ? "text-white" : "text-gray-900";
  const subtextClass = isDark ? "text-gray-400" : "text-gray-500";

  if (loading) {
    return (
      <div className={`${bgClass} p-4 rounded-lg animate-pulse`}>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`${bgClass} p-4 rounded-lg`}>
        <p className={subtextClass}>Unable to load data</p>
      </div>
    );
  }

  // State-specific widget
  if (data.stateData) {
    const s = data.stateData;
    return (
      <div className={`${bgClass} rounded-lg overflow-hidden shadow-sm border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className={`w-5 h-5 ${subtextClass}`} />
              <span className={`font-medium ${textClass}`}>{s.state}</span>
            </div>
            <div
              className="text-2xl font-bold"
              style={{ color: s.color }}
            >
              {s.score.toFixed(1)}
            </div>
          </div>

          <div
            className="px-3 py-1 rounded-full text-sm font-medium inline-block mb-3"
            style={{ backgroundColor: `${s.color}20`, color: s.color }}
          >
            {s.level}
          </div>

          <div className={`grid grid-cols-3 gap-2 text-center text-sm ${subtextClass}`}>
            <div>
              <div className={`font-bold ${textClass}`}>{s.incidents}</div>
              <div>Incidents</div>
            </div>
            <div>
              <div className={`font-bold ${textClass}`}>{s.killed}</div>
              <div>Killed</div>
            </div>
            <div>
              <div className={`font-bold ${textClass}`}>{s.kidnapped}</div>
              <div>Kidnapped</div>
            </div>
          </div>
        </div>

        {showBranding && (
          <a
            href="https://safejourney.ng"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-1 py-2 text-xs ${subtextClass} hover:text-blue-500 border-t ${isDark ? "border-gray-700" : "border-gray-200"}`}
          >
            <Shield className="w-3 h-3" />
            SafeJourney.ng
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    );
  }

  // National index widget
  if (data.nationalIndex) {
    const n = data.nationalIndex;
    return (
      <div className={`${bgClass} rounded-lg overflow-hidden shadow-sm border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className={`w-5 h-5 ${subtextClass}`} />
            <span className={`font-medium ${textClass}`}>Nigeria Safety Index</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div
                className="text-4xl font-bold"
                style={{ color: n.color }}
              >
                {n.score.toFixed(1)}
              </div>
              <div className={`text-sm ${subtextClass}`}>/10</div>
            </div>
            <div className="text-right">
              <div
                className="px-3 py-1 rounded-full text-sm font-medium inline-block"
                style={{ backgroundColor: `${n.color}20`, color: n.color }}
              >
                {n.label}
              </div>
              <div className={`text-sm ${subtextClass} mt-2`}>
                <AlertTriangle className="w-3 h-3 inline mr-1" />
                {n.totalIncidents} incidents (7d)
              </div>
            </div>
          </div>
        </div>

        {showBranding && (
          <a
            href="https://safejourney.ng"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-1 py-2 text-xs ${subtextClass} hover:text-blue-500 border-t ${isDark ? "border-gray-700" : "border-gray-200"}`}
          >
            <Shield className="w-3 h-3" />
            SafeJourney.ng
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    );
  }

  return null;
}
