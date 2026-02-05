// Major Nigerian travel routes with states along the way
// Routes are bidirectional - we store one direction and handle reverse lookups

export interface RouteData {
  id: string;
  from: string;
  to: string;
  waypoints: string[]; // States passed through (excluding from/to)
  distanceKm: number;
  estimatedHours: number;
  description: string;
}

// Major intercity routes in Nigeria
export const MAJOR_ROUTES: RouteData[] = [
  // Lagos to Northern Nigeria
  {
    id: "lagos-abuja",
    from: "Lagos",
    to: "Federal Capital Territory",
    waypoints: ["Ogun", "Oyo", "Kwara", "Niger"],
    distanceKm: 560,
    estimatedHours: 8,
    description: "Lagos-Ibadan-Ilorin-Abuja Expressway",
  },
  {
    id: "lagos-kano",
    from: "Lagos",
    to: "Kano",
    waypoints: ["Ogun", "Oyo", "Kwara", "Niger", "Kaduna"],
    distanceKm: 980,
    estimatedHours: 14,
    description: "Via Abuja-Kaduna-Kano",
  },
  {
    id: "lagos-kaduna",
    from: "Lagos",
    to: "Kaduna",
    waypoints: ["Ogun", "Oyo", "Kwara", "Niger"],
    distanceKm: 750,
    estimatedHours: 11,
    description: "Via Ilorin-Abuja",
  },
  {
    id: "lagos-benin",
    from: "Lagos",
    to: "Edo",
    waypoints: ["Ogun", "Ondo"],
    distanceKm: 310,
    estimatedHours: 5,
    description: "Lagos-Benin Expressway",
  },
  {
    id: "lagos-portharcourt",
    from: "Lagos",
    to: "Rivers",
    waypoints: ["Ogun", "Ondo", "Edo", "Delta", "Bayelsa"],
    distanceKm: 590,
    estimatedHours: 9,
    description: "East-West Road via Benin",
  },

  // Abuja connections
  {
    id: "abuja-kano",
    from: "Federal Capital Territory",
    to: "Kano",
    waypoints: ["Kaduna"],
    distanceKm: 420,
    estimatedHours: 6,
    description: "Abuja-Kaduna-Kano Expressway",
  },
  {
    id: "abuja-kaduna",
    from: "Federal Capital Territory",
    to: "Kaduna",
    waypoints: [],
    distanceKm: 180,
    estimatedHours: 2.5,
    description: "Abuja-Kaduna Expressway",
  },
  {
    id: "abuja-jos",
    from: "Federal Capital Territory",
    to: "Plateau",
    waypoints: ["Nasarawa"],
    distanceKm: 280,
    estimatedHours: 4,
    description: "Via Nasarawa",
  },
  {
    id: "abuja-lokoja",
    from: "Federal Capital Territory",
    to: "Kogi",
    waypoints: [],
    distanceKm: 170,
    estimatedHours: 2.5,
    description: "Abuja-Lokoja Highway",
  },
  {
    id: "abuja-makurdi",
    from: "Federal Capital Territory",
    to: "Benue",
    waypoints: ["Nasarawa"],
    distanceKm: 300,
    estimatedHours: 4.5,
    description: "Via Lafia",
  },

  // Northern routes
  {
    id: "kano-kaduna",
    from: "Kano",
    to: "Kaduna",
    waypoints: [],
    distanceKm: 220,
    estimatedHours: 3,
    description: "Kano-Kaduna Expressway",
  },
  {
    id: "kano-maiduguri",
    from: "Kano",
    to: "Borno",
    waypoints: ["Jigawa", "Bauchi", "Yobe"],
    distanceKm: 600,
    estimatedHours: 9,
    description: "Via Potiskum",
  },
  {
    id: "kaduna-zaria-kano",
    from: "Kaduna",
    to: "Kano",
    waypoints: [],
    distanceKm: 210,
    estimatedHours: 3,
    description: "Kaduna-Zaria-Kano Road",
  },
  {
    id: "sokoto-kano",
    from: "Sokoto",
    to: "Kano",
    waypoints: ["Zamfara", "Katsina"],
    distanceKm: 420,
    estimatedHours: 7,
    description: "Via Gusau-Katsina",
  },

  // Eastern routes  
  {
    id: "enugu-portharcourt",
    from: "Enugu",
    to: "Rivers",
    waypoints: ["Abia"],
    distanceKm: 240,
    estimatedHours: 4,
    description: "Enugu-Port Harcourt Expressway",
  },
  {
    id: "enugu-onitsha",
    from: "Enugu",
    to: "Anambra",
    waypoints: [],
    distanceKm: 100,
    estimatedHours: 1.5,
    description: "Enugu-Onitsha Expressway",
  },
  {
    id: "aba-portharcourt",
    from: "Abia",
    to: "Rivers",
    waypoints: [],
    distanceKm: 60,
    estimatedHours: 1,
    description: "Aba-Port Harcourt Expressway",
  },
  {
    id: "calabar-portharcourt",
    from: "Cross River",
    to: "Rivers",
    waypoints: ["Akwa Ibom"],
    distanceKm: 200,
    estimatedHours: 3.5,
    description: "Calabar-Uyo-PH Road",
  },

  // Western routes
  {
    id: "lagos-ibadan",
    from: "Lagos",
    to: "Oyo",
    waypoints: ["Ogun"],
    distanceKm: 130,
    estimatedHours: 2,
    description: "Lagos-Ibadan Expressway",
  },
  {
    id: "ibadan-ilorin",
    from: "Oyo",
    to: "Kwara",
    waypoints: [],
    distanceKm: 180,
    estimatedHours: 3,
    description: "Ibadan-Ilorin Road",
  },
  {
    id: "benin-onitsha",
    from: "Edo",
    to: "Anambra",
    waypoints: ["Delta"],
    distanceKm: 180,
    estimatedHours: 3,
    description: "Benin-Asaba-Onitsha",
  },

  // Southwest routes
  {
    id: "lagos-abeokuta",
    from: "Lagos",
    to: "Ogun",
    waypoints: [],
    distanceKm: 80,
    estimatedHours: 1.5,
    description: "Lagos-Abeokuta Expressway",
  },
  {
    id: "ibadan-akure",
    from: "Oyo",
    to: "Ondo",
    waypoints: ["Osun"],
    distanceKm: 200,
    estimatedHours: 3,
    description: "Via Ife",
  },
];

// Get all states involved in a route (including endpoints)
export function getRouteStates(route: RouteData): string[] {
  return [route.from, ...route.waypoints, route.to];
}

// Find route between two states
export function findRoute(from: string, to: string): RouteData | null {
  // Normalize FCT names
  const normalizeState = (s: string) => {
    if (s.toLowerCase() === "abuja" || s.toLowerCase() === "fct") {
      return "Federal Capital Territory";
    }
    return s;
  };

  const fromNorm = normalizeState(from);
  const toNorm = normalizeState(to);

  // Direct match
  let route = MAJOR_ROUTES.find(
    (r) =>
      (r.from === fromNorm && r.to === toNorm) ||
      (r.from === toNorm && r.to === fromNorm)
  );

  if (route) {
    // Return in correct direction
    if (route.from === toNorm) {
      return {
        ...route,
        from: route.to,
        to: route.from,
        waypoints: [...route.waypoints].reverse(),
      };
    }
    return route;
  }

  return null;
}

// Get all unique states from all routes
export function getAllRouteStates(): string[] {
  const states = new Set<string>();
  MAJOR_ROUTES.forEach((route) => {
    states.add(route.from);
    states.add(route.to);
    route.waypoints.forEach((w) => states.add(w));
  });
  return Array.from(states).sort();
}
