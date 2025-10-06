// --- DATA & CONSTANTS ---

// Define the global API key variable (required by the environment)
const apiKey = "";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=\${apiKey}`;

const challenges = [
  {
    id: 'air_water',
    title: 'Air Quality & Water Pollution Hotspots',
    icon: 'Droplet',
    color: 'bg-red-500',
    hoverColor: 'hover:border-red-500',
    glowColor: 'shadow-red-500/50',
    description: "EO data, specifically from satellites monitoring aerosol optical depth (AOD) and water spectral signatures, pinpoints areas with elevated particulate matter (PM2.5) and chemical runoff. This is critical for prioritizing air filtration projects and water treatment upgrades. Data shows 3 major industrial zones contributing 70% of pollutants.",
    actionPlan: "Immediate deployment of low-cost air quality sensors in high-risk residential areas and planning for green infrastructure buffers along polluted waterways. Establishing mandatory reporting for major industrial emitters.",
    dataSources: [
      { name: "NASA Worldview", link: "https://www.earthdata.nasa.gov/data/tools/worldview" },
      { name: "Earth Observatory", link: "http://earthobservatory.nasa.gov/" },
    ],
    nodeCoords: { x: 30, y: 50 },
    mockTimeData: [
        { quarter: 'Q1 2024', value: 85, metric: 'PM2.5 Index', status: 'CRITICAL', trend: 0 },
        { quarter: 'Q2 2024', value: 82, metric: 'PM2.5 Index', status: 'CRITICAL', trend: -3 },
        { quarter: 'Q3 2024', value: 75, metric: 'PM2.5 Index', status: 'HIGH', trend: -7 },
        { quarter: 'Q4 2024', value: 78, metric: 'PM2.5 Index', status: 'HIGH', trend: 3 },
        { quarter: 'Q1 2025', value: 72, metric: 'PM2.5 Index', status: 'HIGH', trend: -6 },
    ],
    predictedData: { quarter: 'Q2 2025', value: 60, metric: 'PM2.5 Index', status: 'IMPROVED', trend: -12 }
  },
  {
    id: 'ecosystem_impact',
    title: 'Ecosystem & Habitat Vulnerability',
    icon: 'Factory',
    color: 'bg-yellow-500',
    hoverColor: 'hover:border-yellow-500',
    glowColor: 'shadow-yellow-500/50',
    description: "Satellite-based Land Use and Land Cover (LULC) maps track urban encroachment on vital habitats. Monitoring changes in Normalized Difference Vegetation Index (NDVI) and water body extent helps quantify habitat loss due to industrial and urban sprawl. Critical zones: The Western Forest and Coastal Marshlands are at a 40% risk of degradation.",
    actionPlan: "Establish protective green corridors, enforce buffer zones around key freshwater sources, and incentivize vertical farming to reduce agricultural land demand (referencing WorldPop/Copernicus data for population pressure).",
    dataSources: [
      { name: "CIESIN ESDIS (via Earthdata Search)", link: "https://search.earthdata.nasa.gov/search?q=CIESIN%20ESDIS" },
      { name: "WorldPop Data", link: "https://www.worldpop.org/" },
    ],
    nodeCoords: { x: 75, y: 75 },
    mockTimeData: [
        { quarter: 'Q1 2024', value: -4.2, metric: 'Forest Cover Change', status: 'ALERT', trend: 0 },
        { quarter: 'Q2 2024', value: -3.8, metric: 'Forest Cover Change', status: 'IMPROVED', trend: 0.4 },
        { quarter: 'Q3 2024', value: -4.5, metric: 'Forest Cover Change', status: 'ALERT', trend: -0.7 },
        { quarter: 'Q4 2024', value: -4.0, metric: 'Forest Cover Change', status: 'ALERT', trend: 0.5 },
        { quarter: 'Q1 2025', value: -3.5, metric: 'Forest Cover Change', status: 'IMPROVED', trend: 0.5 },
    ],
    predictedData: { quarter: 'Q2 2025', value: -1.5, metric: 'Forest Cover Change', status: 'RECOVERY', trend: 2.0 }
  },
  {
    id: 'greenspace_access',
    title: 'Greenspace Access & Health Equity',
    icon: 'Trees',
    color: 'bg-green-500',
    hoverColor: 'hover:border-green-500',
    glowColor: 'shadow-green-500/50',
    description: "Analyzing population density (WorldPop) overlayed with existing park and tree canopy data (Copernicus) reveals 'Greenspace Deserts'. 65% of children in the Central and Southern districts live more than 10 minutes from a public park. This directly impacts mental and physical health metrics.",
    actionPlan: "Repurposing unused municipal land for new micro-parks and initiating a city-wide urban tree planting program focused on underserved neighborhoods. Establishing new healthcare facilities in the newly identified high-growth zones.",
    dataSources: [
      { name: "Copernicus Services Catalogue", link: "https://www.copernicus.eu/en/accessing-data-where-and-how/copernicus-services-catalogue" },
    ],
    nodeCoords: { x: 60, y: 25 },
    mockTimeData: [
        { quarter: 'Q1 2024', value: 4, metric: 'Access Score (1-10)', status: 'PRIORITY', trend: 0 },
        { quarter: 'Q2 2024', value: 4.5, metric: 'Access Score (1-10)', status: 'PRIORITY', trend: 0.5 },
        { quarter: 'Q3 2024', value: 5, metric: 'Access Score (1-10)', status: 'IMPROVING', trend: 0.5 },
        { quarter: 'Q4 2024', value: 5.2, metric: 'Access Score (1-10)', status: 'IMPROVING', trend: 0.2 },
        { quarter: 'Q1 2025', value: 5.5, metric: 'Access Score (1-10)', status: 'IMPROVING', trend: 0.3 },
    ],
    predictedData: { quarter: 'Q2 2025', value: 7.0, metric: 'Access Score (1-10)', status: 'SUCCESS', trend: 1.5 }
  },
];

// Exporting items for use in App.jsx
export { apiKey, GEMINI_API_URL, challenges };
