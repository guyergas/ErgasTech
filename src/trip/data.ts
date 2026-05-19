// Trip data model and seed content

export interface FamilyMember {
  id: string;
  name: string;
  displayName: string;
  role: string;
  glyph: string;
  color: string;
  bio: string;
  profileImageUrl?: string;
  avatarType: 'icon' | 'photo';
}

export interface PhotoPlaceholder {
  grad: string;
  label: string;
}

export type PostLayout = 'hero' | 'standard' | 'voice' | 'gallery';
export type PostType = 'text' | 'photo' | 'video' | 'voice' | 'movement';
export type TextVersion = 'raw' | 'improved';
export type MediaItemType = 'photo' | 'video';

export interface MediaItem {
  url: string;
  type: MediaItemType;
}

export interface TripPost {
  id: string;
  slug: string;
  title: string;
  authorId: string;
  postType: PostType;
  layout: PostLayout;
  rawText: string;
  improvedText?: string;
  selectedTextVersion: TextVersion;
  locationName: string;
  country: string;
  city: string;
  lat?: number;
  lng?: number;
  locationPrecision: 'general' | 'exact';
  photo?: string;
  extras?: string[];
  mediaItems?: MediaItem[];
  audioUrl?: string;
  audioKept?: boolean;
  transcriptRaw?: string;
  transcriptImproved?: string;
  voiceLen?: number;
  day: number;
  date: string;
  publishedAt: string;
  visibility: 'public';
  likes: number;
  comments: number;
  aiImproved?: boolean;
}

export interface RoutePoint {
  id: string;
  name: string;
  en: string;
  x: number;
  y: number;
  day: number;
  posts: number;
  future?: boolean;
}

export interface TravelSegment {
  id: string;
  fromName: string;
  toName: string;
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
  transportType: 'flight' | 'car' | 'boat' | 'train' | 'walk';
  startDate: string;
  endDate: string;
  distance?: number;
  notes?: string;
  linkedPostIds?: string[];
}

export interface JourneyStats {
  days: number;
  places: number;
  posts: number;
  kms: number;
}

// ─── Family Members ───────────────────────────────────────────
export const family: Record<string, FamilyMember> = {
  guyergas: {
    id: 'guyergas', name: 'guyergas', displayName: 'guyergas', role: 'מנהל המסע',
    glyph: '☕', color: '#8B5A3C',
    bio: '״ארבעה ילדים, שני תרמילים, שנה אחת.״',
    avatarType: 'icon',
  },
  mom: {
    id: 'mom', name: 'אמא', displayName: 'אמא', role: 'אמא',
    glyph: '🌿', color: '#6E8A5A',
    bio: '״האטיות של הימים בפאי. זה מה שאני אזכור.״',
    avatarType: 'icon',
  },
  ofir: {
    id: 'ofir', name: 'אופיר', displayName: 'אופיר', role: 'בן 12',
    glyph: '✨', color: '#D4A04A',
    bio: '״הכי טוב היה המקדש שעלינו אליו במדרגות.״',
    avatarType: 'icon',
  },
  ayala: {
    id: 'ayala', name: 'איילה', displayName: 'איילה', role: 'בת 10',
    glyph: '🌸', color: '#D4858F',
    bio: '״אני אוהבת כשהשמיים נהיים ורודים.״',
    avatarType: 'icon',
  },
  omer: {
    id: 'omer', name: 'עומר', displayName: 'עומר', role: 'בן 5',
    glyph: '🚀', color: '#6B95B8',
    bio: '״ראיתי פיל ענק!״',
    avatarType: 'icon',
  },
  ido: {
    id: 'ido', name: 'עידו', displayName: 'עידו', role: 'בן 5',
    glyph: '🦖', color: '#C96F4E',
    bio: '״הצרצרים המטוגנים לא הכי גרועים.״',
    avatarType: 'icon',
  },
};

export const familyList = [
  family.guyergas, family.mom, family.ofir, family.ayala, family.omer, family.ido,
];

// ─── User System (numeric IDs, 1:1 with emails) ──────────────
export const users: Record<number, { id: number; email: string; familyId: string }> = {
  1: { id: 1, email: 'guyergas@gmail.com', familyId: 'guyergas' },
  2: { id: 2, email: 'yedikla@gmail.com', familyId: 'mom' },
  3: { id: 3, email: 'ofirergas@gmail.com', familyId: 'ofir' },
  4: { id: 4, email: 'ergasayala@gmail.com', familyId: 'ayala' },
  5: { id: 5, email: 'omerergas@gmail.com', familyId: 'omer' },
  6: { id: 6, email: 'idoergas@gmail.com', familyId: 'ido' },
};


// ─── Photo Placeholders ───────────────────────────────────────
export const photos: Record<string, PhotoPlaceholder> = {
  watArun:  { grad: 'linear-gradient(160deg, #E8A867 0%, #C96F4E 45%, #5A4A3A 100%)', label: 'וואט ארון, בנגקוק' },
  pai:      { grad: 'linear-gradient(180deg, #B8C9A8 0%, #7A8B5A 50%, #4A5340 100%)', label: 'הרים בפאי' },
  krabi:    { grad: 'linear-gradient(180deg, #F2C994 0%, #E89B72 40%, #B8627A 100%)', label: 'שקיעה בקראבי' },
  market:   { grad: 'linear-gradient(180deg, #2A1F1A 0%, #6B3F2A 40%, #D4A04A 100%)', label: 'שוק לילה, צ׳יאנג מאי' },
  elephant: { grad: 'linear-gradient(160deg, #B5A584 0%, #7A6B4F 50%, #3A2F22 100%)', label: 'מקלט פילים' },
  beach:    { grad: 'linear-gradient(180deg, #C8DCE8 0%, #6B95B8 50%, #2A4858 100%)', label: 'הים האנדמני' },
  street:   { grad: 'linear-gradient(180deg, #2A1F1A 0%, #8B3F2A 50%, #D4A04A 100%)', label: 'רחוב בבנגקוק' },
  temple:   { grad: 'linear-gradient(180deg, #F2D88A 0%, #C9954E 50%, #6B3F2A 100%)', label: 'מקדש זהוב' },
  tuktuk:   { grad: 'linear-gradient(180deg, #1F2A3A 0%, #C96F4E 60%, #F2C994 100%)', label: 'טוק-טוק בלילה' },
  chiang:   { grad: 'linear-gradient(180deg, #D4C4A8 0%, #A89070 50%, #5A4030 100%)', label: 'צ׳יאנג מאי' },
};

// ─── Posts ────────────────────────────────────────────────────
export const posts: TripPost[] = [];

// ─── Route ────────────────────────────────────────────────────
export const route: RoutePoint[] = [];

export const travelSegments: TravelSegment[] = [];

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

function calculateStats(): JourneyStats {
  const postsCount = posts.length;
  const placesCount = route.length;

  let days = 0;
  if (posts.length > 0) {
    const dayValues = posts.map(p => p.day);
    days = Math.max(...dayValues) - Math.min(...dayValues) + 1;
  }

  let kms = 0;
  const sortedPosts = [...posts].sort((a, b) => a.day - b.day);
  for (let i = 0; i < sortedPosts.length - 1; i++) {
    const curr = sortedPosts[i];
    const next = sortedPosts[i + 1];
    if (curr.lat && curr.lng && next.lat && next.lng && curr.city !== next.city) {
      kms += haversineDistance(curr.lat, curr.lng, next.lat, next.lng);
    }
  }

  travelSegments.forEach(segment => {
    kms += segment.distance || 0;
  });

  return { days, places: placesCount, posts: postsCount, kms: Math.round(kms) };
}

export const stats = calculateStats();
