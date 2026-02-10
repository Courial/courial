import { useState, useCallback, useMemo, memo } from "react";
import { motion } from "framer-motion";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

const US_TOPO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";
const WORLD_TOPO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// State volume data from actual market partner counts
const stateData: Record<
  string,
  { volume: "high" | "medium" | "growing"; cities: string[] }
> = {
  California: {
    volume: "high",
    cities: [
      "Los Angeles", "Beverly Hills", "Agoura Hills", "Burbank", "Glendale",
      "Inglewood", "Long Beach", "Manhattan Beach", "Pasadena", "Santa Fe Springs",
      "Santa Monica", "Torrance", "Ontario", "Orange County", "Santa Ana",
      "Sacramento", "San Diego", "San Francisco", "San Jose", "Oakland",
      "Berkeley", "Burlingame", "East Bay", "Marin County", "Menlo Park",
      "Mountain View", "Palo Alto", "Redwood City", "Richmond", "San Carlos",
      "San Mateo", "Scotts Valley", "Silicon Valley", "South San Francisco",
    ],
  },
  "New York": {
    volume: "high",
    cities: ["New York City", "Brooklyn", "Bronx", "Queens", "White Plains", "Yonkers"],
  },
  Texas: {
    volume: "high",
    cities: ["Dallas-Fort Worth", "Houston", "Austin", "Arlington", "Del Valle", "Westlake"],
  },
  Florida: {
    volume: "high",
    cities: ["Miami", "Tampa", "Clearwater"],
  },
  Illinois: {
    volume: "high",
    cities: ["Chicago", "Deerfield", "Hoffman Estates"],
  },
  Pennsylvania: {
    volume: "high",
    cities: ["Philadelphia"],
  },
  Georgia: {
    volume: "high",
    cities: ["Atlanta", "Forest Park", "Kennesaw"],
  },
  Massachusetts: {
    volume: "high",
    cities: ["Boston", "Bedford", "Framingham", "Maynard", "Burlington", "Wilmington", "Woburn"],
  },
  "North Carolina": {
    volume: "medium",
    cities: ["Raleigh-Durham"],
  },
  Nevada: {
    volume: "medium",
    cities: ["Las Vegas"],
  },
  Arizona: {
    volume: "medium",
    cities: ["Phoenix", "Mesa", "Tucson"],
  },
  Maryland: {
    volume: "medium",
    cities: ["Baltimore", "Frederick", "Montgomery County"],
  },
  Virginia: {
    volume: "medium",
    cities: ["Fairfax County"],
  },
  Washington: {
    volume: "medium",
    cities: ["Seattle"],
  },
  "New Jersey": {
    volume: "growing",
    cities: ["Essex County", "Hoboken"],
  },
  Michigan: {
    volume: "growing",
    cities: ["Detroit", "Novi"],
  },
  Colorado: {
    volume: "growing",
    cities: ["Denver"],
  },
  Oregon: {
    volume: "growing",
    cities: ["Portland"],
  },
  Ohio: {
    volume: "growing",
    cities: ["Columbus"],
  },
  "District of Columbia": {
    volume: "medium",
    cities: ["Washington, D.C."],
  },
  Alaska: {
    volume: "growing",
    cities: ["Coming Soon"],
  },
  Hawaii: {
    volume: "growing",
    cities: ["Coming Soon"],
  },
};

const volumeColors = {
  high: "hsl(24, 100%, 30%)",
  medium: "hsl(24, 100%, 50%)",
  growing: "hsl(24, 50%, 72%)",
};

const internationalMarkets: {
  name: string;
  city: string;
  flag: string;
  coordinates: [number, number];
  status: "active" | "coming";
}[] = [
  { name: "Tokyo, Japan", city: "Tokyo", flag: "🇯🇵", coordinates: [139.6917, 35.6895], status: "active" },
  { name: "Bangkok, Thailand", city: "Bangkok", flag: "🇹🇭", coordinates: [100.5018, 13.7563], status: "active" },
  { name: "Singapore", city: "Singapore", flag: "🇸🇬", coordinates: [103.8198, 1.3521], status: "coming" },
  { name: "Seoul, South Korea", city: "Seoul", flag: "🇰🇷", coordinates: [126.978, 37.5665], status: "coming" },
  { name: "Dubai, UAE", city: "Dubai", flag: "🇦🇪", coordinates: [55.2708, 25.2048], status: "coming" },
  { name: "Toronto, Canada", city: "Toronto", flag: "🇨🇦", coordinates: [-79.3832, 43.6532], status: "coming" },
];

const getStateColor = (stateName: string) => {
  const data = stateData[stateName];
  if (!data) return "hsl(0, 0%, 92%)";
  return volumeColors[data.volume];
};

const USAMap = memo(({ onHover, onLeave }: { onHover: (name: string, e: React.MouseEvent) => void; onLeave: () => void }) => (
  <ComposableMap
    projection="geoAlbersUsa"
    projectionConfig={{ scale: 1000 }}
    style={{ width: "100%", height: "auto" }}
  >
    <Geographies geography={US_TOPO_URL}>
      {({ geographies }) =>
        geographies.map((geo) => {
          const stateName = geo.properties.name;
          const data = stateData[stateName];
          return (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              fill={getStateColor(stateName)}
              stroke="hsl(0, 0%, 100%)"
              strokeWidth={0.75}
              style={{
                default: { outline: "none" },
                hover: {
                  outline: "none",
                  fill: data
                    ? "hsl(24, 100%, 40%)"
                    : "hsl(0, 0%, 88%)",
                },
                pressed: { outline: "none" },
              }}
              onMouseEnter={(e) => {
                if (data) onHover(stateName, e);
              }}
              onMouseLeave={onLeave}
            />
          );
        })
      }
    </Geographies>
    <Marker coordinates={[-77.0369, 38.9072]}>
      <circle
        r={5}
        fill={volumeColors.medium}
        stroke="hsl(0, 0%, 100%)"
        strokeWidth={0.75}
        className="cursor-pointer"
        onMouseEnter={(e) => onHover("District of Columbia", e)}
        onMouseLeave={onLeave}
      />
    </Marker>
  </ComposableMap>
));

USAMap.displayName = "USAMap";

const Markets = () => {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [hoveredMarket, setHoveredMarket] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const handleStateHover = useCallback((name: string, e: React.MouseEvent) => {
    setHoveredState(name);
    setTooltipPos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleStateLeave = useCallback(() => {
    setHoveredState(null);
  }, []);

  const handleMailto = () => {
    const subject = encodeURIComponent("We Need Courial in {city}");
    const body = encodeURIComponent("You should come to {city} because...");
    window.location.href = `mailto:support@courial.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-0 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="absolute inset-0 radial-gradient" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-4 block">
              Coverage
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 gradient-text-black-orange">
              Delivering Across America
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're rapidly expanding across the nation, bringing premium
              delivery and concierge services to major metropolitan areas.
            </p>
          </motion.div>
        </div>
      </section>

      {/* USA Map */}
      <section className="relative -mt-[100px]">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="relative w-full">
              <div className="relative">
                <USAMap onHover={handleStateHover} onLeave={handleStateLeave} />

                <div className="absolute top-[14%] left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                  <p className="text-base text-muted-foreground italic">
                    Hover over a state to see details
                  </p>
                </div>

                {/* State tooltip */}
                {hoveredState && stateData[hoveredState] && (
                  <div
                    className="fixed z-50 glass-card rounded-xl px-4 py-3 shadow-lg pointer-events-none"
                    style={{
                      left: tooltipPos.x + 12,
                      top: tooltipPos.y - 40,
                      width: 180,
                    }}
                  >
                    <p className="font-semibold text-foreground text-sm">
                      {hoveredState}
                    </p>
                    {stateData[hoveredState].cities.length > 0 && (
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {stateData[hoveredState].cities.join(", ")}
                      </p>
                    )}
                    <p className="text-xs text-primary capitalize mt-1">
                      {stateData[hoveredState].volume} volume
                    </p>
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-center gap-6 -mt-[5%]">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-sm"
                    style={{ background: volumeColors.high }}
                  />
                  <span className="text-sm text-muted-foreground">
                    High Volume
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-sm"
                    style={{ background: volumeColors.medium }}
                  />
                  <span className="text-sm text-muted-foreground">
                    Medium Volume
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-sm"
                    style={{ background: volumeColors.growing }}
                  />
                  <span className="text-sm text-muted-foreground">
                    Growing
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* International Map */}
      <section className="py-12 relative -mt-[100px]">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-4 block">
              Global Reach
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text-black-orange">
              Outside the USA
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Courial is expanding internationally, bringing our premium
              services to key global markets.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="relative w-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <ComposableMap
                  projectionConfig={{ scale: 140, center: [30, 20] }}
                  style={{ width: "100%", height: "auto" }}
                  viewBox="0 0 800 450"
                >
                  <Geographies geography={WORLD_TOPO_URL}>
                    {({ geographies }) =>
                      geographies.map((geo) => (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={
                            [
                              "Japan",
                              "Thailand",
                              "Singapore",
                              "South Korea",
                              "United Arab Emirates",
                              "Canada",
                              "China",
                            ].includes(geo.properties.name)
                              ? "hsl(24, 50%, 72%)"
                              : "hsl(0, 0%, 92%)"
                          }
                          stroke="hsl(0, 0%, 100%)"
                          strokeWidth={0.5}
                          style={{
                            default: { outline: "none" },
                            hover: { outline: "none" },
                            pressed: { outline: "none" },
                          }}
                        />
                      ))
                    }
                  </Geographies>

                  {internationalMarkets.map((market) => (
                    <Marker key={market.name} coordinates={market.coordinates}>
                      <circle
                        r={6}
                        fill={
                          market.status === "active"
                            ? "hsl(24, 100%, 30%)"
                            : "hsl(24, 50%, 50%)"
                        }
                        opacity={0.2}
                      />
                      <circle
                        r={3}
                        fill={
                          market.status === "active"
                            ? "hsl(24, 100%, 30%)"
                            : "hsl(24, 50%, 50%)"
                        }
                        stroke="hsl(0, 0%, 100%)"
                        strokeWidth={1.5}
                        className="cursor-pointer"
                        onMouseEnter={(e) => {
                          setHoveredMarket(market.name);
                          setTooltipPos({ x: e.clientX, y: e.clientY });
                        }}
                        onMouseLeave={() => setHoveredMarket(null)}
                      />
                    </Marker>
                  ))}
                </ComposableMap>

                <div className="absolute top-[5%] left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                  <p className="text-sm text-muted-foreground italic">
                    Hover over a market to see details
                  </p>
                </div>

                {/* International market tooltip */}
                {hoveredMarket && (() => {
                  const market = internationalMarkets.find(m => m.name === hoveredMarket);
                  if (!market) return null;
                  return (
                    <div
                      className="fixed z-50 glass-card rounded-xl px-4 py-3 shadow-lg pointer-events-none"
                      style={{
                        left: tooltipPos.x + 12,
                        top: tooltipPos.y - 40,
                        width: 180,
                      }}
                    >
                      <p className="font-semibold text-foreground text-sm flex items-center gap-2">
                        <span className="text-lg">{market.flag}</span>
                        {market.city}
                      </p>
                      <p className="text-xs text-primary capitalize mt-1">
                        {market.status === "active" ? "Active" : "Coming Soon"}
                      </p>
                    </div>
                  );
                })()}
              </motion.div>

              {/* International Legend */}
              <div className="flex items-center justify-center gap-8 mt-8">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-sm"
                    style={{ background: "hsl(24, 100%, 50%)" }}
                  />
                  <span className="text-sm text-muted-foreground">
                    Active Markets
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-sm"
                    style={{ background: "hsl(24, 50%, 72%)" }}
                  />
                  <span className="text-sm text-muted-foreground">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-xl mx-auto text-center glass-card rounded-3xl p-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text-black-orange">
              Don't See Your City?
            </h2>
            <p className="text-muted-foreground mb-8">
              We're expanding fast. Let us know where you'd like to see Courial
              next and be the first to know when we launch.
            </p>
            <Button variant="hero" size="lg" onClick={handleMailto}>
              Request Your City
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Markets;
