"use client";

import { useEffect, useRef } from "react";
import type { TripPost, TravelSegment, RoutePoint } from "@/trip/data";

interface Props {
  posts: TripPost[];
  segments: TravelSegment[];
  route: RoutePoint[];
}

export default function TripMap({ posts, segments, route }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let L: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let map: any;

    (async () => {
      L = (await import("leaflet")).default;

      // Fix default marker icon paths broken by webpack
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      map = L.map(containerRef.current!, {
        center: [14.5, 100.5],
        zoom: 6,
        scrollWheelZoom: false,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 18,
      }).addTo(map);

      // Draw route segments
      for (const seg of segments) {
        const color = seg.transportType === "flight" ? "#8B5A3C" : "#C9954E";
        const dash = seg.transportType === "flight" ? "8 5" : undefined;
        const line = L.polyline(
          [
            [seg.fromLat, seg.fromLng],
            [seg.toLat, seg.toLng],
          ],
          { color, weight: 2.5, opacity: 0.7, dashArray: dash }
        ).addTo(map);
        line.bindPopup(`<b>${seg.fromName} → ${seg.toName}</b><br/>${seg.notes ?? ""}`);
      }

      // Route city markers
      const cityIcon = (future: boolean) =>
        L.divIcon({
          className: "",
          html: `<div style="width:12px;height:12px;border-radius:50%;background:${future ? "#c0b9ad" : "#8B5A3C"};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.3)"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

      // Map route lat/lng from segment endpoints
      const cityCoords: Record<string, [number, number]> = {
        bkk: [13.756, 100.502],
        ay: [14.356, 100.558],
        cm: [18.788, 98.985],
        pai: [19.356, 98.441],
        kbi: [8.035, 98.846],
        ph: [7.878, 98.398],
      };

      for (const r of route) {
        const coords = cityCoords[r.id];
        if (!coords) continue;
        L.marker(coords, { icon: cityIcon(!!r.future) })
          .addTo(map)
          .bindPopup(`<b>${r.name}</b><br/>יום ${r.day} · ${r.posts} זיכרונות${r.future ? " · עוד לא הגענו" : ""}`);
      }

      // Post pins — use author glyph inside a div icon
      const authorGlyphs: Record<string, string> = {
        dad: "☕", mom: "🌿", ofir: "✨", ayala: "🌸", omer: "🚀", ido: "🦖",
      };

      for (const post of posts) {
        if (!post.lat || !post.lng) continue;
        const glyph = authorGlyphs[post.authorId] ?? "✦";
        const icon = L.divIcon({
          className: "",
          html: `<div style="background:#fff;border:1.5px solid #C9954E;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 6px rgba(0,0,0,.2);cursor:pointer">${glyph}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        L.marker([post.lat, post.lng], { icon })
          .addTo(map)
          .bindPopup(
            `<a href="/trip/post/${post.id}" style="font-weight:700;color:#8B5A3C;text-decoration:none">${post.title}</a><br/><small>${post.locationName}</small>`
          );
      }

      mapRef.current = map;
    })();

    return () => {
      if (map) map.remove();
      mapRef.current = null;
    };
  }, [posts, segments, route]);

  return (
    <div style={{ position: "relative" }}>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div
        ref={containerRef}
        style={{ height: 400, width: "100%", borderRadius: 20, overflow: "hidden" }}
      />
    </div>
  );
}
