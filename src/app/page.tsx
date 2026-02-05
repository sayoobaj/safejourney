"use client";

import { useEffect, useState } from "react";
import { IncidentMap } from "@/components/IncidentMap";
import { RouteChecker } from "@/components/RouteChecker";
import { SafetyIndex } from "@/components/SafetyIndex";
import { TimeFilter } from "@/components/TimeFilter";
import { HotspotsList } from "@/components/HotspotsList";
import { TrendChart, BarChart } from "@/components/TrendChart";
import { StateReportCard } from "@/components/StateReportCard";
import { NIGERIAN_STATES } from "@/data/states";
import { 
  AlertTriangle, 
  Users, 
  Skull, 
  Newspaper,
  MapPin,
  Clock,
  ExternalLink,
  RefreshCw,
  Home,
  Navigation,
  Map,
  Bell,
  TrendingUp,
  Shield,
} from "lucide-react";

type Tab = "home" | "routes" | "map" | "alerts" | "trends";

interface NewsArticle {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  summary?: string;
  incidentType?: string;
  state?: string | null;
  casualties?: {
    killed?: number;
    kidnapped?: number;
  };
}

interface SafetyData {
  nationalIndex: {
    score: number;
    level: string;
    color: string;
    label: string;
    statesAffected: number;
    totalIncidents: number;
  };
  hotspots: any[];
  states: any[];
}

interface TrendsData {
  timeline: { label: string; incidents: number; killed: number; kidnapped: number }[];
  byType: { type: string; count: number; color: string }[];
  topStates: { state: string; count: number }[];
  summary: {
    totalIncidents: number;
    totalKilled: number;
    totalKidnapped: number;
    trendPercent: number;
    trendDirection: string;
  };
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [safetyData, setSafetyData] = useState<SafetyData | null>(null);
  const [trendsData, setTrendsData] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [days, setDays] = useState(7);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [newsRes, safetyRes, trendsRes] = await Promise.all([
        fetch("/api/news"),
        fetch(`/api/safety?days=${days}`),
        fetch(`/api/trends?days=${days}`),
      ]);
      
      const newsData = await newsRes.json();
      const safetyDataResult = await safetyRes.json();
      const trendsDataResult = await trendsRes.json();
      
      setNews(newsData.articles || []);
      setSafetyData(safetyDataResult);
      setTrendsData(trendsDataResult);
      setLastUpdated(new Date().toISOString());
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [days]);

  // Convert news to incidents for map
  const newsAsIncidents = news
    .filter((n) => n.state)
    .map((n, i) => ({
      id: `news-${i}`,
      type: n.incidentType || "OTHER",
      state: n.state!,
      date: n.pubDate,
      title: n.title,
      killed: n.casualties?.killed || 0,
      kidnapped: n.casualties?.kidnapped || 0,
    }));

  const filteredNews = selectedState
    ? news.filter((n) => n.state === selectedState)
    : news;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      KIDNAPPING: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      BANDITRY: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      TERRORISM: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
      ARMED_ROBBERY: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    };
    return colors[type] || "bg-gray-100 text-gray-600";
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "home", label: "Home", icon: <Home className="w-5 h-5" /> },
    { id: "routes", label: "Routes", icon: <Navigation className="w-5 h-5" /> },
    { id: "map", label: "Map", icon: <Map className="w-5 h-5" /> },
    { id: "alerts", label: "Alerts", icon: <Bell className="w-5 h-5" /> },
    { id: "trends", label: "Trends", icon: <TrendingUp className="w-5 h-5" /> },
  ];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  SafeJourney<span className="text-red-600">.ng</span>
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <TimeFilter value={days} onChange={setDays} />
              <button
                onClick={fetchData}
                disabled={loading}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Home Tab */}
        {activeTab === "home" && (
          <div className="space-y-4">
            {/* Safety Index */}
            {safetyData && (
              <SafetyIndex
                score={safetyData.nationalIndex.score}
                level={safetyData.nationalIndex.level}
                color={safetyData.nationalIndex.color}
                label={safetyData.nationalIndex.label}
                statesAffected={safetyData.nationalIndex.statesAffected}
                totalIncidents={safetyData.nationalIndex.totalIncidents}
              />
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {news.length}
                    </p>
                    <p className="text-xs text-gray-500">Incidents</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <Skull className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {news.reduce((sum, n) => sum + (n.casualties?.killed || 0), 0)}
                    </p>
                    <p className="text-xs text-gray-500">Killed</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {news.reduce((sum, n) => sum + (n.casualties?.kidnapped || 0), 0)}
                    </p>
                    <p className="text-xs text-gray-500">Kidnapped</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hotspots */}
            {safetyData && (
              <HotspotsList
                hotspots={safetyData.hotspots}
                onStateClick={setSelectedState}
                selectedState={selectedState}
              />
            )}

            {/* Latest News */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Newspaper className="w-5 h-5" />
                  Latest Security News
                  {selectedState && (
                    <button
                      onClick={() => setSelectedState(null)}
                      className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
                    >
                      {selectedState} ✕
                    </button>
                  )}
                </h3>
              </div>
              
              <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
                {filteredNews.slice(0, 10).map((article, idx) => (
                  <a
                    key={idx}
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                        {article.title}
                      </h4>
                      <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {article.incidentType && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(article.incidentType)}`}>
                          {article.incidentType.toLowerCase().replace("_", " ")}
                        </span>
                      )}
                      {article.state && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {article.state}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {article.source} • {formatDate(article.pubDate)}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Routes Tab */}
        {activeTab === "routes" && (
          <RouteChecker onStateSelect={setSelectedState} />
        )}

        {/* Map Tab */}
        {activeTab === "map" && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Incident Map
                  {selectedState && (
                    <button
                      onClick={() => setSelectedState(null)}
                      className="ml-2 text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
                    >
                      {selectedState} ✕
                    </button>
                  )}
                </h2>
              </div>
              <div className="h-[60vh]">
                <IncidentMap
                  incidents={newsAsIncidents}
                  onStateClick={setSelectedState}
                  selectedState={selectedState}
                />
              </div>
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === "alerts" && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Alerts Coming Soon
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Subscribe to get notified about incidents in your area
              </p>
              <div className="max-w-xs mx-auto space-y-3">
                <input
                  type="text"
                  placeholder="Enter your state"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
                <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Notify Me (Coming Soon)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === "trends" && (
          <div className="space-y-4">
            {/* Summary Stats */}
            {trendsData && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {trendsData.summary.totalIncidents}
                  </div>
                  <div className="text-sm text-gray-500">Total Incidents</div>
                  <div className={`text-xs mt-1 ${
                    trendsData.summary.trendDirection === "worsening" 
                      ? "text-red-500" 
                      : trendsData.summary.trendDirection === "improving"
                        ? "text-green-500"
                        : "text-gray-500"
                  }`}>
                    {trendsData.summary.trendPercent > 0 ? "+" : ""}
                    {trendsData.summary.trendPercent}% vs previous period
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                  <div className="text-2xl font-bold text-red-600">
                    {trendsData.summary.totalKilled + trendsData.summary.totalKidnapped}
                  </div>
                  <div className="text-sm text-gray-500">Total Casualties</div>
                  <div className="text-xs mt-1 text-gray-400">
                    {trendsData.summary.totalKilled} killed, {trendsData.summary.totalKidnapped} kidnapped
                  </div>
                </div>
              </div>
            )}

            {/* Incidents Timeline */}
            {trendsData && trendsData.timeline.length > 0 && (
              <TrendChart
                data={trendsData.timeline.map(t => ({ label: t.label, value: t.incidents }))}
                title="Incidents Over Time"
                color="#EF4444"
                height={150}
              />
            )}

            {/* By Type */}
            {trendsData && trendsData.byType.length > 0 && (
              <BarChart
                data={trendsData.byType.map(t => ({
                  label: t.type.toLowerCase().replace("_", " "),
                  value: t.count,
                  color: t.color,
                }))}
                title="By Incident Type"
              />
            )}

            {/* Top States */}
            {trendsData && trendsData.topStates.length > 0 && (
              <BarChart
                data={trendsData.topStates.map(s => ({
                  label: s.state,
                  value: s.count,
                  color: "#3B82F6",
                }))}
                title="Most Affected States"
              />
            )}
            
            {/* State Report Card Preview */}
            {selectedState && safetyData && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  State Report Card
                </h3>
                {(() => {
                  const stateData = safetyData.states.find((s: any) => s.state === selectedState);
                  const stateInfo = NIGERIAN_STATES.find(s => s.name === selectedState);
                  if (!stateData || !stateInfo) return null;
                  return (
                    <StateReportCard
                      state={stateData.state}
                      zone={stateInfo.zone}
                      score={stateData.score}
                      level={stateData.level}
                      color={stateData.color}
                      incidents={stateData.incidents}
                      killed={stateData.killed}
                      kidnapped={stateData.kidnapped}
                      trend={stateData.trend}
                      trendPercent={stateData.trendPercent}
                      period={`${days} days`}
                    />
                  );
                })()}
              </div>
            )}

            {/* All States Grid */}
            {safetyData && safetyData.states && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  All State Safety Scores
                </h3>
                <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
                  {safetyData.states
                    .filter((s: any) => s.incidents > 0)
                    .sort((a: any, b: any) => a.score - b.score)
                    .map((state: any) => (
                      <button
                        key={state.state}
                        onClick={() => setSelectedState(state.state)}
                        className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                          selectedState === state.state
                            ? "bg-blue-100 dark:bg-blue-900/50"
                            : "bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                          {state.state}
                        </span>
                        <span
                          className="text-sm font-bold"
                          style={{ color: state.color }}
                        >
                          {state.score}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-around">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-2 px-4 ${
                  activeTab === tab.id
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {tab.icon}
                <span className="text-xs mt-1">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </main>
  );
}
