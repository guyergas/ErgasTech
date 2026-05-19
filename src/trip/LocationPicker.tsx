"use client";

import { useState, useEffect, useRef } from "react";

interface POI {
  lat: number;
  lng: number;
  name: string;
  type: string;
}

interface LocationPickerProps {
  isOpen: boolean;
  onSelect: (location: string, lat: number, lng: number) => void;
  onClose: () => void;
}

export function LocationPicker({ isOpen, onSelect, onClose }: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [pois, setPois] = useState<POI[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentLat, setCurrentLat] = useState<number | null>(null);
  const [currentLng, setCurrentLng] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const markersRef = useRef<any[]>([]);

  // Fetch nearby POIs using Nominatim reverse search (simpler fallback)
  const fetchNearbyPOIs = async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);

    try {
      // Use Nominatim's reverse geocoding with detailed results
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=15&addressdetails=1&extratags=1&accept-language=he`,
        {
          headers: { "User-Agent": "trip-app" },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!res.ok) throw new Error("Nominatim request failed");

      const data = await res.json();
      const allPois: POI[] = [];

      // Add the main place
      if (data.name && data.lat && data.lon) {
        allPois.push({
          lat: parseFloat(data.lat),
          lng: parseFloat(data.lon),
          name: data.name,
          type: data.type || "location",
        });
      }

      // Try to get nearby places via simple search around current location
      // Search for amenities and attractions in nearby areas
      const searchTerms = ["restaurant", "cafe", "hotel", "temple", "museum", "market", "park", "beach"];

      for (const term of searchTerms) {
        try {
          const searchRes = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${term}&viewbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&bounded=1&format=json&limit=3&accept-language=he`,
            { headers: { "User-Agent": "trip-app" } }
          );

          if (searchRes.ok) {
            const results = await searchRes.json();
            if (Array.isArray(results)) {
              results.forEach((item: any) => {
                if (item.lat && item.lon && item.name) {
                  allPois.push({
                    lat: parseFloat(item.lat),
                    lng: parseFloat(item.lon),
                    name: item.name,
                    type: term,
                  });
                }
              });
            }
          }
        } catch (e) {
          console.warn(`Failed to search for ${term}`, e);
        }
      }

      // Deduplicate by name and limit
      const uniquePois = Array.from(
        new Map(allPois.map(p => [p.name.toLowerCase(), p])).values()
      ).slice(0, 20);

      if (uniquePois.length > 0) {
        setPois(uniquePois);
      } else {
        setError("No nearby places found. You can still type the location manually.");
      }
    } catch (e) {
      console.error("Failed to fetch POIs:", e);
      // Don't show error, just let user type manually
      setPois([]);
    }
    setLoading(false);
  };

  // Initialize map and get location
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    // Get current position
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setCurrentLat(latitude);
          setCurrentLng(longitude);
          await fetchNearbyPOIs(latitude, longitude);
          initializeMap(latitude, longitude);
        },
        () => setError("Could not get your location"),
        { timeout: 8000 }
      );
    } else {
      setError("Geolocation not supported");
    }
  }, [isOpen]);

  const initializeMap = async (lat: number, lng: number) => {
    if (!containerRef.current || mapRef.current) return;

    const L = (await import("leaflet")).default;

    // Fix default marker icon paths
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    const map = L.map(containerRef.current, {
      center: [lat, lng],
      zoom: 15,
      scrollWheelZoom: true,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 18,
    }).addTo(map);

    // Current location marker
    const currentMarker = L.marker([lat, lng], {
      title: "Your location",
    })
      .addTo(map)
      .bindPopup("📍 המיקום שלך");

    // Allow clicking on map to select location
    map.on("click", async (e: any) => {
      const { lat: clickLat, lng: clickLng } = e.latlng;

      // Reverse geocode to get place name with city and country
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${clickLat}&lon=${clickLng}&format=json&accept-language=he`,
          { headers: { "User-Agent": "trip-app" } }
        );
        const data = await res.json();
        const addr = data.address || {};

        const site = data.name || addr.tourism || addr.amenity || addr.village || addr.town || addr.suburb || "";
        const city = addr.city || addr.city_district || addr.town || addr.village || "";
        const country = addr.country || "Thailand";

        // Format as "site, city, country"
        const parts = [site, city, country].filter(p => p && p.length > 0);
        const location = parts.join(", ");

        onSelect(location || `${clickLat.toFixed(4)}, ${clickLng.toFixed(4)}`, clickLat, clickLng);
        onClose();
      } catch (e) {
        // If reverse geocoding fails, use coordinates
        onSelect(`${clickLat.toFixed(4)}, ${clickLng.toFixed(4)}`, clickLat, clickLng);
        onClose();
      }
    });

    mapRef.current = map;
  };

  // Add POI markers to map
  useEffect(() => {
    if (!mapRef.current || pois.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    (async () => {
      const L = (await import("leaflet")).default;

      pois.forEach((poi) => {
        const marker = L.circleMarker([poi.lat, poi.lng], {
          radius: 8,
          fillColor: "#C9954E",
          color: "#fff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8,
        })
          .addTo(mapRef.current)
          .setPopupContent(`<b>${poi.name}</b><br/><small>${poi.type}</small>`);

        // Click marker to select - reverse geocode for full location
        marker.on("click", async () => {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${poi.lat}&lon=${poi.lng}&format=json&accept-language=he`,
              { headers: { "User-Agent": "trip-app" } }
            );
            const data = await res.json();
            const addr = data.address || {};

            const site = poi.name;
            const city = addr.city || addr.city_district || addr.town || addr.village || "";
            const country = addr.country || "Thailand";

            const parts = [site, city, country].filter(p => p && p.length > 0);
            const location = parts.join(", ");

            onSelect(location, poi.lat, poi.lng);
            onClose();
          } catch (e) {
            // Fallback to just the POI name
            onSelect(poi.name, poi.lat, poi.lng);
            onClose();
          }
        });

        markersRef.current.push(marker);
      });
    })();
  }, [pois, onSelect, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={() => onClose()}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          width: "90%",
          maxWidth: 500,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--rule)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "var(--terra)" }}>
            בחרו מיקום
          </h2>
          <button
            onClick={() => onClose()}
            style={{
              background: "none",
              border: "none",
              fontSize: 24,
              cursor: "pointer",
              color: "var(--ink-3)",
            }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div style={{ padding: "12px 16px", background: "rgba(220,60,60,0.15)", color: "#c00", fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}

        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
        <div
          ref={containerRef}
          style={{
            height: 300,
            flex: 1,
            minHeight: 300,
          }}
        />

        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--rule)", background: "var(--ivory)" }}>
          {loading ? (
            <div style={{ textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>
              ⏳ טוען מקומות קרובים...
            </div>
          ) : pois.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--ink-3)", fontSize: 13, lineHeight: 1.5 }}>
              <div>לא נמצאו מקומות בקרבת מקום</div>
              <div style={{ fontSize: 11, marginTop: 6, color: "var(--ink-3)" }}>💡 לחצו על המפה לבחירת מיקום</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 8 }}>
                {pois.length} מקום{pois.length > 1 ? "ות" : ""} בקרבת מקום:
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 150, overflowY: "auto" }}>
                {pois.map((poi, i) => (
                  <button
                    key={i}
                    onClick={async () => {
                      try {
                        const res = await fetch(
                          `https://nominatim.openstreetmap.org/reverse?lat=${poi.lat}&lon=${poi.lng}&format=json&accept-language=he`,
                          { headers: { "User-Agent": "trip-app" } }
                        );
                        const data = await res.json();
                        const addr = data.address || {};

                        const site = poi.name;
                        const city = addr.city || addr.city_district || addr.town || addr.village || "";
                        const country = addr.country || "Thailand";

                        const parts = [site, city, country].filter(p => p && p.length > 0);
                        const location = parts.join(", ");

                        onSelect(location, poi.lat, poi.lng);
                        onClose();
                      } catch (e) {
                        onSelect(poi.name, poi.lat, poi.lng);
                        onClose();
                      }
                    }}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "0.5px solid var(--rule)",
                      background: "var(--ivory)",
                      color: "var(--ink)",
                      fontSize: 13,
                      textAlign: "right",
                      cursor: "pointer",
                      transition: "all .15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--terra)";
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "var(--ivory)";
                      e.currentTarget.style.color = "var(--ink)";
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{poi.name}</div>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>{poi.type}</div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <script>
        {`
          window.poiSelect = function(name, lat, lng) {
            // This is handled via onClick handlers in React
          };
        `}
      </script>
    </div>
  );
}
