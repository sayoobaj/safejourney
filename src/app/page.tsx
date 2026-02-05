"use client";

import { useEffect, useState } from "react";
import { IncidentMap } from "@/components/IncidentMap";
import { 
  AlertTriangle, 
  Users, 
  Skull, 
  TrendingUp, 
  Newspaper,
  MapPin,
  Clock,
  ExternalLink,
  RefreshCw
} from "lucide-react";

interface NewsArticle {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  summary?: string;
  incidentType?: string;
  state?: string;
  casualties?: {
    killed?: number;
    kidnapped?: number;
  };
}

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

interface Stats {
  total: number;
  byType: Record<string, number>;
  byState: Record<string, number>;
  totalKilled: number;
  totalKidnapped: number;
}

export default function Home() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/news");
      const data = await res.json();
      setNews(data.articles || []);
      setStats(data.stats || null);
      setLastUpdated(data.lastUpdated);
    } catch (error) {
      console.error("Failed to fetch news:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    // Refresh every 10 minutes
    const interval = setInterval(fetchNews, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Convert news to incidents for map display
  const newsAsIncidents: Incident[] = news
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

  // Filter by selected state
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

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  SafeJourney.ng
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Nigeria Security Incident Tracker
                </p>
              </div>
            </div>
            
            <button
              onClick={fetchNews}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Banner */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.total}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Incidents (24h)
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <Skull className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalKilled}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Killed
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalKidnapped}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Kidnapped
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Object.keys(stats.byState).length}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    States Affected
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
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
            <div className="h-[500px]">
              <IncidentMap
                incidents={newsAsIncidents}
                onStateClick={setSelectedState}
                selectedState={selectedState}
              />
            </div>
          </div>

          {/* News Feed */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Newspaper className="w-5 h-5" />
                Latest Security News
              </h2>
              {lastUpdated && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Updated {formatDate(lastUpdated)}
                </p>
              )}
            </div>
            
            <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
              {loading && news.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
                  Loading news...
                </div>
              ) : filteredNews.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No security incidents reported
                  {selectedState && ` in ${selectedState}`}
                </div>
              ) : (
                filteredNews.map((article, idx) => (
                  <a
                    key={idx}
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                        {article.title}
                      </h3>
                      <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {article.incidentType && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(article.incidentType)}`}>
                          {article.incidentType.toLowerCase().replace("_", " ")}
                        </span>
                      )}
                      {article.state && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {article.state}
                        </span>
                      )}
                      {(article.casualties?.killed || article.casualties?.kidnapped) && (
                        <span className="text-xs text-red-600 dark:text-red-400">
                          {article.casualties.killed ? `${article.casualties.killed} killed` : ""}
                          {article.casualties.killed && article.casualties.kidnapped ? ", " : ""}
                          {article.casualties.kidnapped ? `${article.casualties.kidnapped} kidnapped` : ""}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{article.source}</span>
                      <span>•</span>
                      <span>{formatDate(article.pubDate)}</span>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Hotspot States */}
        {stats && Object.keys(stats.byState).length > 0 && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
              🔥 Hotspot States (Last 24h)
            </h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.byState)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([state, count]) => (
                  <button
                    key={state}
                    onClick={() => setSelectedState(selectedState === state ? null : state)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      selectedState === state
                        ? "bg-red-600 text-white"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800"
                    }`}
                  >
                    {state} ({count})
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>SafeJourney.ng — Tracking security incidents across Nigeria</p>
          <p className="mt-1">Data sourced from Nigerian news outlets. Not affiliated with any government agency.</p>
        </div>
      </footer>
    </main>
  );
}
