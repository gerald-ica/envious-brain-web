"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ---- City type --------------------------------------------------------------

export interface City {
  name: string;
  lat: number;
  lon: number;
  timezone: string;
}

// ---- Props ------------------------------------------------------------------

interface CitySearchProps {
  label?: string;
  value: string;
  onChange: (city: City) => void;
  placeholder?: string;
}

// ---- City database ----------------------------------------------------------

const CITIES: City[] = [
  // ── North America ──────────────────────────────────────────────────────────
  // USA
  { name: "New York, USA", lat: 40.7128, lon: -74.006, timezone: "America/New_York" },
  { name: "Los Angeles, USA", lat: 34.0522, lon: -118.2437, timezone: "America/Los_Angeles" },
  { name: "Chicago, USA", lat: 41.8781, lon: -87.6298, timezone: "America/Chicago" },
  { name: "Houston, USA", lat: 29.7604, lon: -95.3698, timezone: "America/Chicago" },
  { name: "Phoenix, USA", lat: 33.4484, lon: -112.074, timezone: "America/Phoenix" },
  { name: "Philadelphia, USA", lat: 39.9526, lon: -75.1652, timezone: "America/New_York" },
  { name: "San Antonio, USA", lat: 29.4241, lon: -98.4936, timezone: "America/Chicago" },
  { name: "San Diego, USA", lat: 32.7157, lon: -117.1611, timezone: "America/Los_Angeles" },
  { name: "Dallas, USA", lat: 32.7767, lon: -96.797, timezone: "America/Chicago" },
  { name: "San Jose, USA", lat: 37.3382, lon: -121.8863, timezone: "America/Los_Angeles" },
  { name: "Austin, USA", lat: 30.2672, lon: -97.7431, timezone: "America/Chicago" },
  { name: "Jacksonville, USA", lat: 30.3322, lon: -81.6557, timezone: "America/New_York" },
  { name: "San Francisco, USA", lat: 37.7749, lon: -122.4194, timezone: "America/Los_Angeles" },
  { name: "Columbus, USA", lat: 39.9612, lon: -82.9988, timezone: "America/New_York" },
  { name: "Indianapolis, USA", lat: 39.7684, lon: -86.1581, timezone: "America/Indiana/Indianapolis" },
  { name: "Charlotte, USA", lat: 35.2271, lon: -80.8431, timezone: "America/New_York" },
  { name: "Seattle, USA", lat: 47.6062, lon: -122.3321, timezone: "America/Los_Angeles" },
  { name: "Denver, USA", lat: 39.7392, lon: -104.9903, timezone: "America/Denver" },
  { name: "Washington DC, USA", lat: 38.9072, lon: -77.0369, timezone: "America/New_York" },
  { name: "Nashville, USA", lat: 36.1627, lon: -86.7816, timezone: "America/Chicago" },
  { name: "Miami, USA", lat: 25.7617, lon: -80.1918, timezone: "America/New_York" },
  { name: "Las Vegas, USA", lat: 36.1699, lon: -115.1398, timezone: "America/Los_Angeles" },
  { name: "Portland, USA", lat: 45.5152, lon: -122.6784, timezone: "America/Los_Angeles" },
  { name: "Memphis, USA", lat: 35.1495, lon: -90.049, timezone: "America/Chicago" },
  { name: "Louisville, USA", lat: 38.2527, lon: -85.7585, timezone: "America/Kentucky/Louisville" },
  { name: "Baltimore, USA", lat: 39.2904, lon: -76.6122, timezone: "America/New_York" },
  { name: "Milwaukee, USA", lat: 43.0389, lon: -87.9065, timezone: "America/Chicago" },
  { name: "Albuquerque, USA", lat: 35.0844, lon: -106.6504, timezone: "America/Denver" },
  { name: "Tucson, USA", lat: 32.2226, lon: -110.9747, timezone: "America/Phoenix" },
  { name: "Fresno, USA", lat: 36.7378, lon: -119.7871, timezone: "America/Los_Angeles" },
  { name: "Sacramento, USA", lat: 38.5816, lon: -121.4944, timezone: "America/Los_Angeles" },
  { name: "Kansas City, USA", lat: 39.0997, lon: -94.5786, timezone: "America/Chicago" },
  { name: "Atlanta, USA", lat: 33.749, lon: -84.388, timezone: "America/New_York" },
  { name: "Omaha, USA", lat: 41.2565, lon: -95.9345, timezone: "America/Chicago" },
  { name: "Colorado Springs, USA", lat: 38.8339, lon: -104.8214, timezone: "America/Denver" },
  { name: "Raleigh, USA", lat: 35.7796, lon: -78.6382, timezone: "America/New_York" },
  { name: "Long Beach, USA", lat: 33.7701, lon: -118.1937, timezone: "America/Los_Angeles" },
  { name: "Virginia Beach, USA", lat: 36.8529, lon: -75.978, timezone: "America/New_York" },
  { name: "Oakland, USA", lat: 37.8044, lon: -122.2712, timezone: "America/Los_Angeles" },
  { name: "Minneapolis, USA", lat: 44.9778, lon: -93.265, timezone: "America/Chicago" },
  { name: "Tampa, USA", lat: 27.9506, lon: -82.4572, timezone: "America/New_York" },
  { name: "Honolulu, USA", lat: 21.3069, lon: -157.8583, timezone: "Pacific/Honolulu" },
  { name: "Anchorage, USA", lat: 61.2181, lon: -149.9003, timezone: "America/Anchorage" },
  { name: "Boise, USA", lat: 43.615, lon: -116.2023, timezone: "America/Boise" },
  { name: "Salt Lake City, USA", lat: 40.7608, lon: -111.891, timezone: "America/Denver" },
  { name: "New Orleans, USA", lat: 29.9511, lon: -90.0715, timezone: "America/Chicago" },
  { name: "Detroit, USA", lat: 42.3314, lon: -83.0458, timezone: "America/Detroit" },
  { name: "Boston, USA", lat: 42.3601, lon: -71.0589, timezone: "America/New_York" },
  // Canada
  { name: "Toronto, Canada", lat: 43.6532, lon: -79.3832, timezone: "America/Toronto" },
  { name: "Vancouver, Canada", lat: 49.2827, lon: -123.1207, timezone: "America/Vancouver" },
  { name: "Montreal, Canada", lat: 45.5017, lon: -73.5673, timezone: "America/Montreal" },
  { name: "Calgary, Canada", lat: 51.0447, lon: -114.0719, timezone: "America/Edmonton" },
  { name: "Ottawa, Canada", lat: 45.4215, lon: -75.6972, timezone: "America/Toronto" },
  // Mexico
  { name: "Mexico City, Mexico", lat: 19.4326, lon: -99.1332, timezone: "America/Mexico_City" },
  { name: "Guadalajara, Mexico", lat: 20.6597, lon: -103.3496, timezone: "America/Mexico_City" },
  { name: "Monterrey, Mexico", lat: 25.6866, lon: -100.3161, timezone: "America/Monterrey" },

  // ── Europe ─────────────────────────────────────────────────────────────────
  { name: "London, UK", lat: 51.5074, lon: -0.1278, timezone: "Europe/London" },
  { name: "Paris, France", lat: 48.8566, lon: 2.3522, timezone: "Europe/Paris" },
  { name: "Berlin, Germany", lat: 52.52, lon: 13.405, timezone: "Europe/Berlin" },
  { name: "Madrid, Spain", lat: 40.4168, lon: -3.7038, timezone: "Europe/Madrid" },
  { name: "Rome, Italy", lat: 41.9028, lon: 12.4964, timezone: "Europe/Rome" },
  { name: "Amsterdam, Netherlands", lat: 52.3676, lon: 4.9041, timezone: "Europe/Amsterdam" },
  { name: "Brussels, Belgium", lat: 50.8503, lon: 4.3517, timezone: "Europe/Brussels" },
  { name: "Vienna, Austria", lat: 48.2082, lon: 16.3738, timezone: "Europe/Vienna" },
  { name: "Zurich, Switzerland", lat: 47.3769, lon: 8.5417, timezone: "Europe/Zurich" },
  { name: "Stockholm, Sweden", lat: 59.3293, lon: 18.0686, timezone: "Europe/Stockholm" },
  { name: "Oslo, Norway", lat: 59.9139, lon: 10.7522, timezone: "Europe/Oslo" },
  { name: "Helsinki, Finland", lat: 60.1699, lon: 24.9384, timezone: "Europe/Helsinki" },
  { name: "Copenhagen, Denmark", lat: 55.6761, lon: 12.5683, timezone: "Europe/Copenhagen" },
  { name: "Dublin, Ireland", lat: 53.3498, lon: -6.2603, timezone: "Europe/Dublin" },
  { name: "Lisbon, Portugal", lat: 38.7223, lon: -9.1393, timezone: "Europe/Lisbon" },
  { name: "Prague, Czech Republic", lat: 50.0755, lon: 14.4378, timezone: "Europe/Prague" },
  { name: "Warsaw, Poland", lat: 52.2297, lon: 21.0122, timezone: "Europe/Warsaw" },
  { name: "Budapest, Hungary", lat: 47.4979, lon: 19.0402, timezone: "Europe/Budapest" },
  { name: "Athens, Greece", lat: 37.9838, lon: 23.7275, timezone: "Europe/Athens" },
  { name: "Istanbul, Turkey", lat: 41.0082, lon: 28.9784, timezone: "Europe/Istanbul" },
  { name: "Moscow, Russia", lat: 55.7558, lon: 37.6173, timezone: "Europe/Moscow" },
  { name: "Saint Petersburg, Russia", lat: 59.9343, lon: 30.3351, timezone: "Europe/Moscow" },
  { name: "Barcelona, Spain", lat: 41.3874, lon: 2.1686, timezone: "Europe/Madrid" },
  { name: "Munich, Germany", lat: 48.1351, lon: 11.582, timezone: "Europe/Berlin" },
  { name: "Milan, Italy", lat: 45.4642, lon: 9.19, timezone: "Europe/Rome" },
  { name: "Edinburgh, UK", lat: 55.9533, lon: -3.1883, timezone: "Europe/London" },
  { name: "Bucharest, Romania", lat: 44.4268, lon: 26.1025, timezone: "Europe/Bucharest" },
  { name: "Sofia, Bulgaria", lat: 42.6977, lon: 23.3219, timezone: "Europe/Sofia" },
  { name: "Zagreb, Croatia", lat: 45.815, lon: 15.9819, timezone: "Europe/Zagreb" },
  { name: "Belgrade, Serbia", lat: 44.7866, lon: 20.4489, timezone: "Europe/Belgrade" },
  { name: "Kyiv, Ukraine", lat: 50.4501, lon: 30.5234, timezone: "Europe/Kyiv" },
  { name: "Riga, Latvia", lat: 56.9496, lon: 24.1052, timezone: "Europe/Riga" },
  { name: "Vilnius, Lithuania", lat: 54.6872, lon: 25.2797, timezone: "Europe/Vilnius" },
  { name: "Tallinn, Estonia", lat: 59.437, lon: 24.7536, timezone: "Europe/Tallinn" },
  { name: "Bratislava, Slovakia", lat: 48.1486, lon: 17.1077, timezone: "Europe/Bratislava" },
  { name: "Ljubljana, Slovenia", lat: 46.0569, lon: 14.5058, timezone: "Europe/Ljubljana" },

  // ── Asia ───────────────────────────────────────────────────────────────────
  { name: "Tokyo, Japan", lat: 35.6762, lon: 139.6503, timezone: "Asia/Tokyo" },
  { name: "Beijing, China", lat: 39.9042, lon: 116.4074, timezone: "Asia/Shanghai" },
  { name: "Shanghai, China", lat: 31.2304, lon: 121.4737, timezone: "Asia/Shanghai" },
  { name: "Hong Kong, China", lat: 22.3193, lon: 114.1694, timezone: "Asia/Hong_Kong" },
  { name: "Singapore", lat: 1.3521, lon: 103.8198, timezone: "Asia/Singapore" },
  { name: "Seoul, South Korea", lat: 37.5665, lon: 126.978, timezone: "Asia/Seoul" },
  { name: "Mumbai, India", lat: 19.076, lon: 72.8777, timezone: "Asia/Kolkata" },
  { name: "Delhi, India", lat: 28.7041, lon: 77.1025, timezone: "Asia/Kolkata" },
  { name: "Bangkok, Thailand", lat: 13.7563, lon: 100.5018, timezone: "Asia/Bangkok" },
  { name: "Ho Chi Minh City, Vietnam", lat: 10.8231, lon: 106.6297, timezone: "Asia/Ho_Chi_Minh" },
  { name: "Hanoi, Vietnam", lat: 21.0278, lon: 105.8342, timezone: "Asia/Ho_Chi_Minh" },
  { name: "Manila, Philippines", lat: 14.5995, lon: 120.9842, timezone: "Asia/Manila" },
  { name: "Jakarta, Indonesia", lat: -6.2088, lon: 106.8456, timezone: "Asia/Jakarta" },
  { name: "Kuala Lumpur, Malaysia", lat: 3.139, lon: 101.6869, timezone: "Asia/Kuala_Lumpur" },
  { name: "Taipei, Taiwan", lat: 25.033, lon: 121.5654, timezone: "Asia/Taipei" },
  { name: "Osaka, Japan", lat: 34.6937, lon: 135.5023, timezone: "Asia/Tokyo" },
  { name: "Bangalore, India", lat: 12.9716, lon: 77.5946, timezone: "Asia/Kolkata" },
  { name: "Chennai, India", lat: 13.0827, lon: 80.2707, timezone: "Asia/Kolkata" },
  { name: "Hyderabad, India", lat: 17.385, lon: 78.4867, timezone: "Asia/Kolkata" },
  { name: "Kolkata, India", lat: 22.5726, lon: 88.3639, timezone: "Asia/Kolkata" },
  { name: "Karachi, Pakistan", lat: 24.8607, lon: 67.0011, timezone: "Asia/Karachi" },
  { name: "Lahore, Pakistan", lat: 31.5204, lon: 74.3587, timezone: "Asia/Karachi" },
  { name: "Dhaka, Bangladesh", lat: 23.8103, lon: 90.4125, timezone: "Asia/Dhaka" },
  { name: "Riyadh, Saudi Arabia", lat: 24.7136, lon: 46.6753, timezone: "Asia/Riyadh" },
  { name: "Dubai, UAE", lat: 25.2048, lon: 55.2708, timezone: "Asia/Dubai" },
  { name: "Abu Dhabi, UAE", lat: 24.4539, lon: 54.3773, timezone: "Asia/Dubai" },
  { name: "Doha, Qatar", lat: 25.2854, lon: 51.531, timezone: "Asia/Qatar" },
  { name: "Kuwait City, Kuwait", lat: 29.3759, lon: 47.9774, timezone: "Asia/Kuwait" },
  { name: "Tel Aviv, Israel", lat: 32.0853, lon: 34.7818, timezone: "Asia/Jerusalem" },
  { name: "Jerusalem, Israel", lat: 31.7683, lon: 35.2137, timezone: "Asia/Jerusalem" },
  { name: "Muscat, Oman", lat: 23.588, lon: 58.3829, timezone: "Asia/Muscat" },
  { name: "Amman, Jordan", lat: 31.9454, lon: 35.9284, timezone: "Asia/Amman" },
  { name: "Beirut, Lebanon", lat: 33.8938, lon: 35.5018, timezone: "Asia/Beirut" },
  { name: "Kathmandu, Nepal", lat: 27.7172, lon: 85.324, timezone: "Asia/Kathmandu" },
  { name: "Colombo, Sri Lanka", lat: 6.9271, lon: 79.8612, timezone: "Asia/Colombo" },
  { name: "Yangon, Myanmar", lat: 16.8661, lon: 96.1951, timezone: "Asia/Yangon" },
  { name: "Phnom Penh, Cambodia", lat: 11.5564, lon: 104.9282, timezone: "Asia/Phnom_Penh" },
  { name: "Ulaanbaatar, Mongolia", lat: 47.8864, lon: 106.9057, timezone: "Asia/Ulaanbaatar" },
  { name: "Tashkent, Uzbekistan", lat: 41.2995, lon: 69.2401, timezone: "Asia/Tashkent" },
  { name: "Almaty, Kazakhstan", lat: 43.2551, lon: 76.9126, timezone: "Asia/Almaty" },

  // ── Africa ─────────────────────────────────────────────────────────────────
  { name: "Cairo, Egypt", lat: 30.0444, lon: 31.2357, timezone: "Africa/Cairo" },
  { name: "Lagos, Nigeria", lat: 6.5244, lon: 3.3792, timezone: "Africa/Lagos" },
  { name: "Nairobi, Kenya", lat: -1.2921, lon: 36.8219, timezone: "Africa/Nairobi" },
  { name: "Cape Town, South Africa", lat: -33.9249, lon: 18.4241, timezone: "Africa/Johannesburg" },
  { name: "Johannesburg, South Africa", lat: -26.2041, lon: 28.0473, timezone: "Africa/Johannesburg" },
  { name: "Casablanca, Morocco", lat: 33.5731, lon: -7.5898, timezone: "Africa/Casablanca" },
  { name: "Addis Ababa, Ethiopia", lat: 9.0249, lon: 38.7468, timezone: "Africa/Addis_Ababa" },
  { name: "Accra, Ghana", lat: 5.6037, lon: -0.187, timezone: "Africa/Accra" },
  { name: "Dar es Salaam, Tanzania", lat: -6.7924, lon: 39.2083, timezone: "Africa/Dar_es_Salaam" },
  { name: "Kinshasa, DR Congo", lat: -4.4419, lon: 15.2663, timezone: "Africa/Kinshasa" },
  { name: "Luanda, Angola", lat: -8.839, lon: 13.2894, timezone: "Africa/Luanda" },
  { name: "Algiers, Algeria", lat: 36.7538, lon: 3.0588, timezone: "Africa/Algiers" },
  { name: "Tunis, Tunisia", lat: 36.8065, lon: 10.1815, timezone: "Africa/Tunis" },
  { name: "Kampala, Uganda", lat: 0.3476, lon: 32.5825, timezone: "Africa/Kampala" },
  { name: "Dakar, Senegal", lat: 14.7167, lon: -17.4677, timezone: "Africa/Dakar" },
  { name: "Abidjan, Ivory Coast", lat: 5.3597, lon: -4.0083, timezone: "Africa/Abidjan" },
  { name: "Maputo, Mozambique", lat: -25.9692, lon: 32.5732, timezone: "Africa/Maputo" },

  // ── South America ──────────────────────────────────────────────────────────
  { name: "Sao Paulo, Brazil", lat: -23.5505, lon: -46.6333, timezone: "America/Sao_Paulo" },
  { name: "Buenos Aires, Argentina", lat: -34.6037, lon: -58.3816, timezone: "America/Argentina/Buenos_Aires" },
  { name: "Rio de Janeiro, Brazil", lat: -22.9068, lon: -43.1729, timezone: "America/Sao_Paulo" },
  { name: "Bogota, Colombia", lat: 4.711, lon: -74.0721, timezone: "America/Bogota" },
  { name: "Lima, Peru", lat: -12.0464, lon: -77.0428, timezone: "America/Lima" },
  { name: "Santiago, Chile", lat: -33.4489, lon: -70.6693, timezone: "America/Santiago" },
  { name: "Caracas, Venezuela", lat: 10.4806, lon: -66.9036, timezone: "America/Caracas" },
  { name: "Quito, Ecuador", lat: -0.1807, lon: -78.4678, timezone: "America/Guayaquil" },
  { name: "Montevideo, Uruguay", lat: -34.9011, lon: -56.1645, timezone: "America/Montevideo" },
  { name: "Medellin, Colombia", lat: 6.2442, lon: -75.5812, timezone: "America/Bogota" },
  { name: "Brasilia, Brazil", lat: -15.7975, lon: -47.8919, timezone: "America/Sao_Paulo" },
  { name: "La Paz, Bolivia", lat: -16.4897, lon: -68.1193, timezone: "America/La_Paz" },
  { name: "Asuncion, Paraguay", lat: -25.2637, lon: -57.5759, timezone: "America/Asuncion" },

  // ── Oceania ────────────────────────────────────────────────────────────────
  { name: "Sydney, Australia", lat: -33.8688, lon: 151.2093, timezone: "Australia/Sydney" },
  { name: "Melbourne, Australia", lat: -37.8136, lon: 144.9631, timezone: "Australia/Melbourne" },
  { name: "Brisbane, Australia", lat: -27.4698, lon: 153.0251, timezone: "Australia/Brisbane" },
  { name: "Perth, Australia", lat: -31.9505, lon: 115.8605, timezone: "Australia/Perth" },
  { name: "Auckland, New Zealand", lat: -36.8485, lon: 174.7633, timezone: "Pacific/Auckland" },
  { name: "Wellington, New Zealand", lat: -41.2865, lon: 174.7762, timezone: "Pacific/Auckland" },
  { name: "Adelaide, Australia", lat: -34.9285, lon: 138.6007, timezone: "Australia/Adelaide" },
  { name: "Canberra, Australia", lat: -35.2809, lon: 149.13, timezone: "Australia/Sydney" },

  // ── Caribbean ──────────────────────────────────────────────────────────────
  { name: "Havana, Cuba", lat: 23.1136, lon: -82.3666, timezone: "America/Havana" },
  { name: "San Juan, Puerto Rico", lat: 18.4655, lon: -66.1057, timezone: "America/Puerto_Rico" },
  { name: "Kingston, Jamaica", lat: 18.0179, lon: -76.8099, timezone: "America/Jamaica" },
  { name: "Santo Domingo, Dominican Republic", lat: 18.4861, lon: -69.9312, timezone: "America/Santo_Domingo" },
  { name: "Port-au-Prince, Haiti", lat: 18.5944, lon: -72.3074, timezone: "America/Port-au-Prince" },

  // ── Central America ────────────────────────────────────────────────────────
  { name: "Panama City, Panama", lat: 8.9824, lon: -79.5199, timezone: "America/Panama" },
  { name: "San Jose, Costa Rica", lat: 9.9281, lon: -84.0907, timezone: "America/Costa_Rica" },
  { name: "Guatemala City, Guatemala", lat: 14.6349, lon: -90.5069, timezone: "America/Guatemala" },
];

// ---- Component --------------------------------------------------------------

export function CitySearch({ label, value, onChange, placeholder }: CitySearchProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Sync external value
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = query.trim().length === 0
    ? []
    : CITIES.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase()),
      ).slice(0, 8);

  const selectCity = useCallback(
    (city: City) => {
      setQuery(city.name);
      setOpen(false);
      onChange(city);
    },
    [onChange],
  );

  // Scroll highlighted item into view
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.children[highlightIdx] as HTMLElement | undefined;
    if (el) {
      el.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIdx, open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || filtered.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((prev) => (prev + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      selectCity(filtered[highlightIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const inputId = label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div ref={wrapperRef} className="relative flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <input
        id={inputId}
        type="text"
        autoComplete="off"
        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue/50"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setHighlightIdx(0);
        }}
        onFocus={() => {
          if (query.trim().length > 0) setOpen(true);
        }}
        onKeyDown={handleKeyDown}
      />

      {open && filtered.length > 0 && (
        <ul
          ref={listRef}
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-border bg-card shadow-xl"
        >
          {filtered.map((city, idx) => (
            <li
              key={city.name}
              className={`cursor-pointer px-3 py-2 text-sm transition-colors ${
                idx === highlightIdx
                  ? "bg-accent-blue/15 text-accent-blue"
                  : "text-text-primary hover:bg-white/[0.04]"
              }`}
              onMouseEnter={() => setHighlightIdx(idx)}
              onMouseDown={(e) => {
                e.preventDefault(); // prevent blur before click
                selectCity(city);
              }}
            >
              <span className="font-medium">{city.name}</span>
              <span className="ml-2 text-xs text-text-muted">
                {city.lat.toFixed(2)}, {city.lon.toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
