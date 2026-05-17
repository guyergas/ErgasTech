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
  audioUrl?: string;
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
  dad: {
    id: 'dad', name: 'אבא', displayName: 'אבא', role: 'אבא',
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
  family.dad, family.mom, family.ofir, family.ayala, family.omer, family.ido,
];

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
export const posts: TripPost[] = [
  {
    id: 'p1', slug: 'matayim-ushmonim-madregot', authorId: 'ofir', day: 47,
    date: 'אתמול · 18:42', publishedAt: '2026-05-16T18:42:00Z',
    postType: 'photo', layout: 'hero',
    title: 'מאתיים ושמונים מדרגות',
    rawText: 'עלינו על הוואט ארון. המדרגות תלולות ועומר התעקש לעלות לבד. עידו ספר את כל המדרגות בקול רם עד שהגענו למעלה. הנוף — נהר, גגות, שמש שוקעת מאחורי בנגקוק.',
    improvedText: 'עלינו על וואט ארון, ועומר התעקש לטפס לבד את המדרגות התלולות. עידו ספר אותן בקול רם כל הדרך. מלמעלה — נהר, גגות, ושמש שוקעת מאחורי בנגקוק.',
    selectedTextVersion: 'improved',
    locationName: 'וואט ארון', country: 'תאילנד', city: 'בנגקוק',
    lat: 13.7437, lng: 100.4888, locationPrecision: 'general',
    photo: 'watArun', likes: 24, comments: 6, visibility: 'public', aiImproved: true,
  },
  {
    id: 'p2', slug: 'pil-rishon-bekhayim', authorId: 'ido', day: 46,
    date: 'אתמול · 11:08', publishedAt: '2026-05-15T11:08:00Z',
    postType: 'voice', layout: 'voice',
    title: 'פיל ראשון בחיים',
    rawText: 'ראיתי פיל ראשון בחיים שלי. הוא ענק וגדול כמו אוטובוס שלם ויש לו אוזניים גדולות ועיניים חומות וטובות. אבא נתן לו בננה. הוא לקח אותה עם החדק וזה היה הכי מצחיק.',
    improvedText: 'ראיתי פיל בפעם הראשונה בחיים. הוא היה ענק כמו אוטובוס, עם אוזניים גדולות ועיניים חומות וטובות. אבא נתן לו בננה — הוא לקח אותה עם החדק וזה היה מצחיק כל כך.',
    selectedTextVersion: 'improved',
    locationName: 'מקלט פילים', country: 'תאילנד', city: 'צ׳יאנג מאי',
    lat: 18.7883, lng: 98.9853, locationPrecision: 'general',
    photo: 'elephant', voiceLen: 28,
    audioUrl: '', transcriptRaw: 'ראיתי פיל ראשון בחיים שלי...',
    likes: 41, comments: 12, visibility: 'public', aiImproved: true,
  },
  {
    id: 'p3', slug: 'arba-manot-pad-thai', authorId: 'mom', day: 45,
    date: 'יום ה׳ · 21:15', publishedAt: '2026-05-14T21:15:00Z',
    postType: 'text', layout: 'standard',
    title: 'ארבע מנות פאד-תאי',
    rawText: 'שוק הלילה מלא ריחות וצבעים. הילדים בחרו ארטיק קוקוס וישבנו על המדרכה. עומר הוריד שלוש שיפודי עוף ועידו ניסה צרצרים מטוגנים והכריז שזה ״לא הכי גרוע״.',
    selectedTextVersion: 'raw',
    locationName: 'שוק הלילה', country: 'תאילנד', city: 'צ׳יאנג מאי',
    lat: 18.7941, lng: 98.9908, locationPrecision: 'general',
    photo: 'market', likes: 18, comments: 4, visibility: 'public',
  },
  {
    id: 'p4', slug: 'hashemesh-nimsah-layam', authorId: 'ayala', day: 42,
    date: 'שני · 19:30', publishedAt: '2026-05-11T19:30:00Z',
    postType: 'photo', layout: 'gallery',
    title: 'השמש נמסה לתוך הים',
    rawText: 'השמש שקעה לתוך הים. הכל היה ורוד וכתום. עומר ועידו רצו לאסוף קונכיות. אופיר צילם ואני שכבתי על החול וסתם הסתכלתי.',
    improvedText: 'השמש שקעה לתוך הים — הכל נצבע ורוד וכתום. עומר ועידו אספו קונכיות, אופיר צילם, ואני פשוט שכבתי על החול והסתכלתי.',
    selectedTextVersion: 'improved',
    locationName: 'אאו נאנג', country: 'תאילנד', city: 'קראבי',
    lat: 8.0348, lng: 98.8464, locationPrecision: 'general',
    photo: 'krabi', extras: ['beach', 'street'],
    likes: 56, comments: 9, visibility: 'public', aiImproved: true,
  },
  {
    id: 'p5', slug: 'halayla-harishon', authorId: 'dad', day: 1,
    date: 'יום 1 · 22:00', publishedAt: '2026-03-31T22:00:00Z',
    postType: 'voice', layout: 'voice',
    title: 'הלילה הראשון',
    rawText: 'הלילה הראשון בבנגקוק. חום, פקקים, ניאון. ארבעה ילדים ישנים במלון בשני חדרים סמוכים. ואני יושב על המרפסת עם בירה ומבין שזה קורה באמת.',
    selectedTextVersion: 'raw',
    locationName: 'סוקומוויט', country: 'תאילנד', city: 'בנגקוק',
    lat: 13.7312, lng: 100.5693, locationPrecision: 'general',
    photo: 'tuktuk', voiceLen: 34,
    likes: 89, comments: 23, visibility: 'public',
  },
];

// ─── Route ────────────────────────────────────────────────────
export const route: RoutePoint[] = [
  { id: 'bkk', name: 'בנגקוק',     en: 'Bangkok',    x: 168, y: 270, day: 1,  posts: 8 },
  { id: 'ay',  name: 'אַיוּתָיָה',      en: 'Ayutthaya',  x: 162, y: 248, day: 6,  posts: 3 },
  { id: 'cm',  name: 'צ׳יאנג מאי',  en: 'Chiang Mai', x: 138, y: 158, day: 18, posts: 14 },
  { id: 'pai', name: 'פאי',         en: 'Pai',        x: 122, y: 138, day: 28, posts: 9 },
  { id: 'kbi', name: 'קראבי',      en: 'Krabi',      x: 152, y: 360, day: 42, posts: 11 },
  { id: 'ph',  name: 'פוקט',        en: 'Phuket',     x: 138, y: 348, day: 50, posts: 4, future: true },
];

export const travelSegments: TravelSegment[] = [
  {
    id: 's1', fromName: 'בנגקוק', toName: 'אַיוּתָיָה',
    fromLat: 13.756, fromLng: 100.502, toLat: 14.356, toLng: 100.558,
    transportType: 'car', startDate: '2026-04-05', endDate: '2026-04-05',
    notes: 'נסיעה קצרה צפונה לעיר העתיקה',
  },
  {
    id: 's2', fromName: 'אַיוּתָיָה', toName: 'צ׳יאנג מאי',
    fromLat: 14.356, fromLng: 100.558, toLat: 18.788, toLng: 98.985,
    transportType: 'flight', startDate: '2026-04-17', endDate: '2026-04-17',
    notes: 'טיסה פנים-ארצית קצרה',
  },
  {
    id: 's3', fromName: 'צ׳יאנג מאי', toName: 'פאי',
    fromLat: 18.788, fromLng: 98.985, toLat: 19.356, toLng: 98.441,
    transportType: 'car', startDate: '2026-04-27', endDate: '2026-04-27',
    notes: '762 פניות בהרים',
  },
  {
    id: 's4', fromName: 'פאי', toName: 'קראבי',
    fromLat: 19.356, fromLng: 98.441, toLat: 8.035, toLng: 98.846,
    transportType: 'flight', startDate: '2026-05-10', endDate: '2026-05-10',
    notes: 'חזרה לדרום, טיסה דרך בנגקוק',
  },
];

export const stats: JourneyStats = { days: 47, places: 14, posts: 49, kms: 2840 };
