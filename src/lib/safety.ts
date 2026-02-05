// Safety score calculation system
// Converts raw incident data into actionable safety ratings

export type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "SEVERE";

export interface SafetyScore {
  score: number; // 1-10 (10 = safest)
  level: RiskLevel;
  color: string;
  label: string;
  description: string;
}

export interface StateScore extends SafetyScore {
  state: string;
  incidents: number;
  killed: number;
  kidnapped: number;
  trend: "improving" | "stable" | "worsening";
  trendPercent: number;
}

export interface RouteScore extends SafetyScore {
  from: string;
  to: string;
  states: string[];
  incidentsByState: Record<string, number>;
  hotspots: string[];
  recommendations: string[];
  safestTravelTime: string;
}

// Risk thresholds (incidents per week per state)
const THRESHOLDS = {
  LOW: 1,       // 0-1 incidents
  MODERATE: 3,  // 2-3 incidents
  HIGH: 6,      // 4-6 incidents
  SEVERE: 999,  // 7+ incidents
};

// Weights for different incident types
const TYPE_WEIGHTS: Record<string, number> = {
  KIDNAPPING: 1.5,
  TERRORISM: 2.0,
  BANDITRY: 1.3,
  ARMED_ROBBERY: 1.0,
  OTHER: 0.8,
};

// Calculate risk level from incident count
function getRiskLevel(incidents: number, days: number = 7): RiskLevel {
  const weeklyRate = (incidents / days) * 7;
  
  if (weeklyRate <= THRESHOLDS.LOW) return "LOW";
  if (weeklyRate <= THRESHOLDS.MODERATE) return "MODERATE";
  if (weeklyRate <= THRESHOLDS.HIGH) return "HIGH";
  return "SEVERE";
}

// Get risk color
function getRiskColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    LOW: "#22C55E",      // Green
    MODERATE: "#F59E0B", // Amber
    HIGH: "#EF4444",     // Red
    SEVERE: "#7F1D1D",   // Dark red
  };
  return colors[level];
}

// Get risk label
function getRiskLabel(level: RiskLevel): string {
  const labels: Record<RiskLevel, string> = {
    LOW: "Low Risk",
    MODERATE: "Moderate Risk",
    HIGH: "High Risk",
    SEVERE: "Severe Risk",
  };
  return labels[level];
}

// Get risk description
function getRiskDescription(level: RiskLevel): string {
  const descriptions: Record<RiskLevel, string> = {
    LOW: "Generally safe. Exercise normal caution.",
    MODERATE: "Some incidents reported. Stay alert and avoid night travel.",
    HIGH: "Frequent incidents. Travel only if necessary, use secure transport.",
    SEVERE: "Active danger zone. Avoid all non-essential travel.",
  };
  return descriptions[level];
}

// Calculate score (1-10) from incidents
function calculateScore(incidents: number, days: number = 7): number {
  const weeklyRate = (incidents / days) * 7;
  // Inverse logarithmic scale: more incidents = lower score
  const score = Math.max(1, 10 - Math.log2(weeklyRate + 1) * 2);
  return Math.round(score * 10) / 10;
}

// Calculate state safety score
export function calculateStateScore(
  state: string,
  incidents: { type: string; killed: number; kidnapped: number }[],
  days: number = 7,
  previousIncidents?: number
): StateScore {
  // Weight incidents by type
  const weightedCount = incidents.reduce((sum, inc) => {
    const weight = TYPE_WEIGHTS[inc.type] || 1;
    return sum + weight;
  }, 0);

  const totalKilled = incidents.reduce((sum, inc) => sum + inc.killed, 0);
  const totalKidnapped = incidents.reduce((sum, inc) => sum + inc.kidnapped, 0);
  
  // Extra penalty for casualties
  const casualtyPenalty = (totalKilled * 0.3) + (totalKidnapped * 0.2);
  const adjustedCount = weightedCount + casualtyPenalty;

  const score = calculateScore(adjustedCount, days);
  const level = getRiskLevel(adjustedCount, days);

  // Calculate trend
  let trend: "improving" | "stable" | "worsening" = "stable";
  let trendPercent = 0;
  
  if (previousIncidents !== undefined) {
    const change = incidents.length - previousIncidents;
    trendPercent = previousIncidents > 0 
      ? Math.round((change / previousIncidents) * 100) 
      : (change > 0 ? 100 : 0);
    
    if (trendPercent < -10) trend = "improving";
    else if (trendPercent > 10) trend = "worsening";
  }

  return {
    state,
    score,
    level,
    color: getRiskColor(level),
    label: getRiskLabel(level),
    description: getRiskDescription(level),
    incidents: incidents.length,
    killed: totalKilled,
    kidnapped: totalKidnapped,
    trend,
    trendPercent,
  };
}

// Calculate route safety score
export function calculateRouteScore(
  from: string,
  to: string,
  states: string[],
  incidentsByState: Record<string, { type: string; killed: number; kidnapped: number }[]>,
  days: number = 7
): RouteScore {
  // Combine all incidents along the route
  const allIncidents: { type: string; killed: number; kidnapped: number }[] = [];
  const incidentCounts: Record<string, number> = {};
  
  states.forEach((state) => {
    const stateIncidents = incidentsByState[state] || [];
    allIncidents.push(...stateIncidents);
    incidentCounts[state] = stateIncidents.length;
  });

  // Weight by number of states (longer routes naturally have more risk)
  const routeLengthFactor = Math.max(1, states.length / 3);
  
  const weightedCount = allIncidents.reduce((sum, inc) => {
    const weight = TYPE_WEIGHTS[inc.type] || 1;
    return sum + weight;
  }, 0) / routeLengthFactor;

  const score = calculateScore(weightedCount, days);
  const level = getRiskLevel(weightedCount, days);

  // Find hotspots (states with incidents)
  const hotspots = states
    .filter((s) => incidentCounts[s] > 0)
    .sort((a, b) => incidentCounts[b] - incidentCounts[a]);

  // Generate recommendations
  const recommendations: string[] = [];
  
  if (level === "LOW") {
    recommendations.push("Route is generally safe");
    recommendations.push("Normal precautions advised");
  } else if (level === "MODERATE") {
    recommendations.push("Travel during daylight hours (6 AM - 6 PM)");
    recommendations.push("Avoid stopping in isolated areas");
    if (hotspots.length > 0) {
      recommendations.push(`Exercise extra caution in ${hotspots[0]}`);
    }
  } else if (level === "HIGH") {
    recommendations.push("Consider postponing non-essential travel");
    recommendations.push("Use reputable transport services only");
    recommendations.push("Share your itinerary with family");
    recommendations.push("Avoid night travel completely");
  } else {
    recommendations.push("Avoid this route if possible");
    recommendations.push("Seek alternative transportation (air travel)");
    recommendations.push("If travel is essential, use security escort");
  }

  // Safest travel time
  const safestTravelTime = level === "SEVERE" 
    ? "Not recommended" 
    : level === "HIGH"
      ? "Early morning only (6-9 AM)"
      : "Daytime (6 AM - 6 PM)";

  return {
    from,
    to,
    states,
    score,
    level,
    color: getRiskColor(level),
    label: getRiskLabel(level),
    description: getRiskDescription(level),
    incidentsByState: incidentCounts,
    hotspots,
    recommendations,
    safestTravelTime,
  };
}

// Calculate national safety index (weighted average of all states)
export function calculateNationalIndex(
  stateScores: StateScore[]
): SafetyScore & { statesAffected: number; totalIncidents: number } {
  if (stateScores.length === 0) {
    return {
      score: 7.5,
      level: "MODERATE",
      color: getRiskColor("MODERATE"),
      label: "No Data",
      description: "Insufficient data for analysis",
      statesAffected: 0,
      totalIncidents: 0,
    };
  }

  // Weighted average: states with more incidents have more weight
  const totalIncidents = stateScores.reduce((sum, s) => sum + s.incidents, 0);
  const statesAffected = stateScores.filter((s) => s.incidents > 0).length;

  let weightedSum = 0;
  let totalWeight = 0;

  stateScores.forEach((s) => {
    // Weight by incident count (minimum weight of 1)
    const weight = Math.max(1, s.incidents);
    weightedSum += s.score * weight;
    totalWeight += weight;
  });

  const avgScore = totalWeight > 0 ? weightedSum / totalWeight : 7.5;
  const level = avgScore >= 7 ? "LOW" : avgScore >= 5 ? "MODERATE" : avgScore >= 3 ? "HIGH" : "SEVERE";

  return {
    score: Math.round(avgScore * 10) / 10,
    level,
    color: getRiskColor(level),
    label: getRiskLabel(level),
    description: getRiskDescription(level),
    statesAffected,
    totalIncidents,
  };
}
