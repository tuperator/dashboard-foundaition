export const yearlyTraffic = [
  { month: "Jan", thisYear: 11000, lastYear: 7000 },
  { month: "Feb", thisYear: 9000, lastYear: 13000 },
  { month: "Mar", thisYear: 14500, lastYear: 21000 },
  { month: "Apr", thisYear: 24000, lastYear: 9000 },
  { month: "May", thisYear: 25500, lastYear: 15000 },
  { month: "Jun", thisYear: 19000, lastYear: 14000 },
  { month: "Jul", thisYear: 23500, lastYear: 19500 },
];

export const websiteTraffic = [
  { name: "Google", value: 82 },
  { name: "YouTube", value: 64 },
  { name: "Instagram", value: 58 },
  { name: "Pinterest", value: 49 },
  { name: "Facebook", value: 37 },
  { name: "Twitter", value: 31 },
];

export const deviceTraffic = [
  { device: "Linux", value: 18000, color: "var(--dash-device-linux)" },
  { device: "Mac", value: 31000, color: "var(--dash-device-mac)" },
  { device: "iOS", value: 22000, color: "var(--dash-device-ios)" },
  { device: "Windows", value: 34000, color: "var(--dash-device-windows)" },
  { device: "Android", value: 14000, color: "var(--dash-device-android)" },
  { device: "Other", value: 27000, color: "var(--dash-device-other)" },
];

export const locationTraffic = [
  { location: "United States", value: 52.1, color: "var(--dash-location-us)" },
  { location: "Canada", value: 22.8, color: "var(--dash-location-canada)" },
  { location: "Mexico", value: 13.9, color: "var(--dash-location-mexico)" },
  { location: "Other", value: 11.2, color: "var(--dash-location-other)" },
];

export const marketingSeries = [
  { month: "Jan", seo: 2200, ads: 1700 },
  { month: "Feb", seo: 2600, ads: 1900 },
  { month: "Mar", seo: 2500, ads: 2050 },
  { month: "Apr", seo: 3100, ads: 2450 },
  { month: "May", seo: 3700, ads: 2800 },
  { month: "Jun", seo: 3400, ads: 3000 },
  { month: "Jul", seo: 3900, ads: 3350 },
];

export const kpiBackgrounds = [
  "var(--dash-kpi-1)",
  "var(--dash-kpi-2)",
  "var(--dash-kpi-3)",
  "var(--dash-kpi-4)",
] as const;
