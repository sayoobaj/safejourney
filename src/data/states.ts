// Nigerian states with their geopolitical zones
export const NIGERIAN_STATES = [
  { name: "Abia", zone: "South East" },
  { name: "Adamawa", zone: "North East" },
  { name: "Akwa Ibom", zone: "South South" },
  { name: "Anambra", zone: "South East" },
  { name: "Bauchi", zone: "North East" },
  { name: "Bayelsa", zone: "South South" },
  { name: "Benue", zone: "North Central" },
  { name: "Borno", zone: "North East" },
  { name: "Cross River", zone: "South South" },
  { name: "Delta", zone: "South South" },
  { name: "Ebonyi", zone: "South East" },
  { name: "Edo", zone: "South South" },
  { name: "Ekiti", zone: "South West" },
  { name: "Enugu", zone: "South East" },
  { name: "Federal Capital Territory", zone: "North Central" },
  { name: "Gombe", zone: "North East" },
  { name: "Imo", zone: "South East" },
  { name: "Jigawa", zone: "North West" },
  { name: "Kaduna", zone: "North West" },
  { name: "Kano", zone: "North West" },
  { name: "Katsina", zone: "North West" },
  { name: "Kebbi", zone: "North West" },
  { name: "Kogi", zone: "North Central" },
  { name: "Kwara", zone: "North Central" },
  { name: "Lagos", zone: "South West" },
  { name: "Nasarawa", zone: "North Central" },
  { name: "Niger", zone: "North Central" },
  { name: "Ogun", zone: "South West" },
  { name: "Ondo", zone: "South West" },
  { name: "Osun", zone: "South West" },
  { name: "Oyo", zone: "South West" },
  { name: "Plateau", zone: "North Central" },
  { name: "Rivers", zone: "South South" },
  { name: "Sokoto", zone: "North West" },
  { name: "Taraba", zone: "North East" },
  { name: "Yobe", zone: "North East" },
  { name: "Zamfara", zone: "North West" },
] as const;

export const ZONES = [
  "North Central",
  "North East", 
  "North West",
  "South East",
  "South South",
  "South West",
] as const;

export type NigerianState = typeof NIGERIAN_STATES[number]["name"];
export type GeopoliticalZone = typeof ZONES[number];

// Colors for incident types
export const INCIDENT_COLORS = {
  KIDNAPPING: "#DC2626",    // Red
  BANDITRY: "#F97316",      // Orange  
  TERRORISM: "#1F2937",     // Dark gray/black
  ARMED_ROBBERY: "#7C3AED", // Purple
  OTHER: "#6B7280",         // Gray
} as const;

// Zone colors for map visualization
export const ZONE_COLORS: Record<GeopoliticalZone, string> = {
  "North Central": "#3B82F6",
  "North East": "#EF4444",
  "North West": "#F59E0B",
  "South East": "#10B981",
  "South South": "#8B5CF6",
  "South West": "#EC4899",
};
