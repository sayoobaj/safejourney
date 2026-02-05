import { NextResponse } from "next/server";
import Parser from "rss-parser";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "SafeJourney/1.0",
  },
});

// Nigerian news sources with RSS feeds
const NEWS_SOURCES = [
  { name: "Punch", url: "https://punchng.com/feed/" },
  { name: "Vanguard", url: "https://www.vanguardngr.com/feed/" },
  { name: "Premium Times", url: "https://www.premiumtimesng.com/feed" },
  { name: "The Guardian", url: "https://guardian.ng/feed/" },
  { name: "Daily Trust", url: "https://dailytrust.com/feed/" },
  { name: "Sahara Reporters", url: "https://saharareporters.com/rss.xml" },
];

// Keywords for detecting security incidents
const SECURITY_KEYWORDS = {
  kidnapping: [
    "kidnap", "kidnapped", "kidnapping", "abduct", "abducted", "abduction",
    "hostage", "ransom", "seized", "captive", "held hostage"
  ],
  banditry: [
    "bandit", "bandits", "banditry", "armed men", "gunmen", "herdsmen",
    "cattle rustl", "rustlers", "maraud"
  ],
  terrorism: [
    "boko haram", "iswap", "terrorist", "terrorism", "insurgent", "insurgency",
    "bomb", "bombing", "explosion", "ied", "suicide attack"
  ],
  armed_robbery: [
    "armed robbery", "robber", "robbery", "armed attack", "highway robbery"
  ],
};

// Nigerian states for location extraction
const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "Federal Capital Territory", "FCT", "Abuja", "Gombe", "Imo", "Jigawa",
  "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

interface NewsItem {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  summary?: string;
  incidentType: string;
  state: string | null;
  casualties: {
    killed?: number;
    kidnapped?: number;
  };
}

function detectIncidentType(text: string): string | null {
  const lowerText = text.toLowerCase();
  
  for (const [type, keywords] of Object.entries(SECURITY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return type.toUpperCase();
      }
    }
  }
  return null;
}

function extractState(text: string): string | null {
  for (const state of NIGERIAN_STATES) {
    if (text.includes(state)) {
      // Normalize FCT/Abuja
      if (state === "FCT" || state === "Abuja") {
        return "Federal Capital Territory";
      }
      return state;
    }
  }
  return null;
}

function extractCasualties(text: string): { killed?: number; kidnapped?: number } {
  const result: { killed?: number; kidnapped?: number } = {};
  const lowerText = text.toLowerCase();
  
  // Match patterns like "killed 5", "5 killed", "killed five"
  const killedPatterns = [
    /(\d+)\s*(?:people\s*)?(?:killed|dead|died|murdered|slain)/i,
    /(?:killed|dead|died|murdered|slain)\s*(\d+)/i,
  ];
  
  const kidnappedPatterns = [
    /(\d+)\s*(?:people\s*)?(?:kidnapped|abducted|seized|taken hostage)/i,
    /(?:kidnapped|abducted|seized|taken hostage)\s*(\d+)/i,
  ];
  
  for (const pattern of killedPatterns) {
    const match = text.match(pattern);
    if (match) {
      result.killed = parseInt(match[1], 10);
      break;
    }
  }
  
  for (const pattern of kidnappedPatterns) {
    const match = text.match(pattern);
    if (match) {
      result.kidnapped = parseInt(match[1], 10);
      break;
    }
  }
  
  return result;
}

async function fetchFromSource(source: { name: string; url: string }): Promise<NewsItem[]> {
  try {
    const feed = await parser.parseURL(source.url);
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const items: NewsItem[] = [];
    
    for (const item of feed.items) {
      const pubDate = item.pubDate ? new Date(item.pubDate) : null;
      if (!pubDate || pubDate < oneDayAgo) continue;
      
      const fullText = `${item.title || ""} ${item.contentSnippet || ""}`;
      const incidentType = detectIncidentType(fullText);
      
      // Only include if it's a security-related article
      if (!incidentType) continue;
      
      items.push({
        title: item.title || "",
        link: item.link || "",
        source: source.name,
        pubDate: item.pubDate || "",
        summary: item.contentSnippet?.slice(0, 200),
        incidentType,
        state: extractState(fullText),
        casualties: extractCasualties(fullText),
      });
    }
    
    return items;
  } catch (error) {
    console.error(`Failed to fetch from ${source.name}:`, error);
    return [];
  }
}

// Cache for news results
let newsCache: { data: NewsItem[]; timestamp: number } | null = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export async function GET() {
  try {
    // Check cache
    if (newsCache && Date.now() - newsCache.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        articles: newsCache.data,
        cached: true,
        lastUpdated: new Date(newsCache.timestamp).toISOString(),
      });
    }
    
    // Fetch from all sources in parallel
    const results = await Promise.allSettled(
      NEWS_SOURCES.map((source) => fetchFromSource(source))
    );
    
    // Combine and sort by date
    const allArticles: NewsItem[] = results
      .filter((r): r is PromiseFulfilledResult<NewsItem[]> => r.status === "fulfilled")
      .flatMap((r) => r.value)
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    
    // Update cache
    newsCache = { data: allArticles, timestamp: Date.now() };
    
    // Summary stats
    const stats = {
      total: allArticles.length,
      byType: {} as Record<string, number>,
      byState: {} as Record<string, number>,
      totalKilled: 0,
      totalKidnapped: 0,
    };
    
    allArticles.forEach((article) => {
      if (article.incidentType) {
        stats.byType[article.incidentType] = (stats.byType[article.incidentType] || 0) + 1;
      }
      if (article.state) {
        stats.byState[article.state] = (stats.byState[article.state] || 0) + 1;
      }
      stats.totalKilled += article.casualties?.killed || 0;
      stats.totalKidnapped += article.casualties?.kidnapped || 0;
    });
    
    return NextResponse.json({
      articles: allArticles,
      stats,
      cached: false,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("News API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
