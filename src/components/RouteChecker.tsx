"use client";

import React, { useState, useEffect } from "react";
import {
  Navigation,
  AlertTriangle,
  Clock,
  MapPin,
  ChevronRight,
  Share2,
  Bell,
  CheckCircle,
  XCircle,
  Loader2,
  Car,
} from "lucide-react";

interface RouteResult {
  route: {
    from: string;
    to: string;
    waypoints: string[];
    distanceKm: number;
    estimatedHours: number;
    description: string;
  };
  safety: {
    score: number;
    level: string;
    color: string;
    label: string;
    description: string;
    hotspots: string[];
    recommendations: string[];
    safestTravelTime: string;
    incidentsByState: Record<string, number>;
  };
  recentIncidents: {
    id: string;
    title: string;
    state: string;
    type: string;
    date: string;
  }[];
}

interface RouteCheckerProps {
  onStateSelect?: (state: string) => void;
}

export const RouteChecker: React.FC<RouteCheckerProps> = ({ onStateSelect }) => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RouteResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [destinations, setDestinations] = useState<string[]>([]);

  // Fetch available destinations
  useEffect(() => {
    fetch("/api/routes/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "list" }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.destinations) {
          setDestinations(data.destinations);
        }
      })
      .catch(console.error);
  }, []);

  const checkRoute = async () => {
    if (!from || !to) {
      setError("Please select both origin and destination");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(
        `/api/routes/check?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&days=7`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to check route");
        return;
      }

      setResult(data);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const shareResult = () => {
    if (!result) return;
    
    const text = `🛣️ ${result.route.from} → ${result.route.to}\n\n${result.safety.label}\nScore: ${result.safety.score}/10\n\n${result.safety.recommendations[0]}\n\nCheck your route at SafeJourney.ng`;
    
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "LOW":
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case "MODERATE":
        return <AlertTriangle className="w-8 h-8 text-amber-500" />;
      case "HIGH":
        return <AlertTriangle className="w-8 h-8 text-red-500" />;
      case "SEVERE":
        return <XCircle className="w-8 h-8 text-red-800" />;
      default:
        return <AlertTriangle className="w-8 h-8 text-gray-500" />;
    }
  };

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-blue-700">
        <h2 className="font-semibold text-white flex items-center gap-2">
          <Navigation className="w-5 h-5" />
          Route Safety Checker
        </h2>
        <p className="text-blue-100 text-sm mt-1">
          Check if your travel route is safe
        </p>
      </div>

      {/* Input Form */}
      <div className="p-4 space-y-4">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              From
            </label>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select origin city</option>
              {destinations.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <ChevronRight className="w-5 h-5 text-gray-400 rotate-90" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              To
            </label>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select destination</option>
              {destinations
                .filter((d) => d !== from)
                .map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <button
          onClick={checkRoute}
          disabled={loading || !from || !to}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <Car className="w-5 h-5" />
              Check Route Safety
            </>
          )}
        </button>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          {/* Risk Level Banner */}
          <div
            className="p-4"
            style={{ backgroundColor: `${result.safety.color}20` }}
          >
            <div className="flex items-center gap-4">
              {getRiskIcon(result.safety.level)}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className="text-2xl font-bold"
                    style={{ color: result.safety.color }}
                  >
                    {result.safety.label}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {result.safety.description}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold" style={{ color: result.safety.color }}>
                  {result.safety.score}
                </div>
                <div className="text-xs text-gray-500">/ 10</div>
              </div>
            </div>
          </div>

          {/* Route Info */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                {result.route.distanceKm} km
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                {formatDuration(result.route.estimatedHours)}
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Navigation className="w-4 h-4" />
                {result.route.waypoints.length + 2} states
              </div>
            </div>
            
            {/* Route path */}
            <div className="mt-3 flex items-center gap-2 flex-wrap text-sm">
              <span className="font-medium text-gray-900 dark:text-white">
                {result.route.from}
              </span>
              {result.route.waypoints.map((wp, i) => (
                <React.Fragment key={wp}>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <button
                    onClick={() => onStateSelect?.(wp)}
                    className={`${
                      result.safety.hotspots.includes(wp)
                        ? "text-red-600 dark:text-red-400 font-medium"
                        : "text-gray-600 dark:text-gray-400"
                    } hover:underline`}
                  >
                    {wp}
                    {result.safety.hotspots.includes(wp) && " ⚠️"}
                  </button>
                </React.Fragment>
              ))}
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-gray-900 dark:text-white">
                {result.route.to}
              </span>
            </div>
          </div>

          {/* Recommendations */}
          <div className="p-4 space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">
              Recommendations
            </h4>
            <ul className="space-y-2">
              {result.safety.recommendations.map((rec, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  <span className="text-blue-500">•</span>
                  {rec}
                </li>
              ))}
            </ul>
            
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  Safest travel time:
                </span>
                <span className="text-sm text-blue-700 dark:text-blue-300 ml-1">
                  {result.safety.safestTravelTime}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Incidents */}
          {result.recentIncidents.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Recent Incidents on Route ({result.recentIncidents.length})
              </h4>
              <div className="space-y-2">
                {result.recentIncidents.slice(0, 3).map((inc) => (
                  <div
                    key={inc.id}
                    className="text-sm p-2 bg-gray-50 dark:bg-gray-900/50 rounded"
                  >
                    <div className="font-medium text-gray-900 dark:text-white line-clamp-1">
                      {inc.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {inc.state} • {new Date(inc.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
            <button
              onClick={shareResult}
              className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button
              className="flex-1 py-2 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-900 rounded-lg text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center justify-center gap-2"
            >
              <Bell className="w-4 h-4" />
              Set Alert
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
