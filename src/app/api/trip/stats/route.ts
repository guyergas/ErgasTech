import { getPosts } from "@/trip/store";
import type { JourneyStats } from "@/trip/data";

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(): Promise<Response> {
  const posts = getPosts();

  let days = 0;
  if (posts.length > 0) {
    const dayValues = posts.map(p => p.day);
    days = Math.max(...dayValues) - Math.min(...dayValues) + 1;
  }

  // Count unique locations by city or lat/lng
  const locations = new Set<string>();
  posts.forEach(p => {
    if (p.city) {
      locations.add(p.city);
    } else if (p.lat && p.lng) {
      locations.add(`${p.lat.toFixed(2)},${p.lng.toFixed(2)}`);
    }
  });

  let kms = 0;
  const sortedPosts = [...posts].sort((a, b) => a.day - b.day);
  for (let i = 0; i < sortedPosts.length - 1; i++) {
    const curr = sortedPosts[i];
    const next = sortedPosts[i + 1];
    if (curr.lat && curr.lng && next.lat && next.lng) {
      const currLoc = curr.city || `${curr.lat.toFixed(2)},${curr.lng.toFixed(2)}`;
      const nextLoc = next.city || `${next.lat.toFixed(2)},${next.lng.toFixed(2)}`;
      if (currLoc !== nextLoc) {
        kms += haversineDistance(curr.lat, curr.lng, next.lat, next.lng);
      }
    }
  }

  const stats: JourneyStats = {
    days,
    places: locations.size,
    posts: posts.length,
    kms: Math.round(kms),
  };

  return Response.json(stats);
}
