# ErgasTech Project Guide

## Project Overview

**ergastech** is a Next.js web application with two main sections:

### 1. ErgasTech Landing Page
- Premium technology consulting brand landing page
- Located in root components and `/src/app/page.tsx`
- Dark theme with electric blue/cyan accents
- Modern, minimal consulting firm design

### 2. Trip Feature
A family travel journal documenting the Ergas family's 2026 Thailand journey.

---

## Trip Feature - Complete Reference

### What is Trip?
A digital family travel journal where the Ergas family documents their Thailand trip (Bangkok → Ayutthaya → Chiang Mai → Pai → Krabi → Phuket). Fully Hebrew (RTL), with posts, photos, voice recordings, interactive map, and family member profiles.

### Family Members (6 total)
- **Dad** (אבא) - ☕ Brown - "Four kids, two backpacks, one year"
- **Mom** (אמא) - 🌿 Green - "The slowness of Pai days"
- **Ofir** (אופיר) - ✨ Gold - Age 12
- **Ayala** (איילה) - 🌸 Rose - Age 10
- **Omer** (עומר) - 🚀 Blue - Age 5
- **Ido** (עידו) - 🦖 Orange - Age 5

### Tech Stack
- **Framework:** Next.js 15 + React 19 + TypeScript
- **Styling:** Tailwind CSS + custom trip styles (warm palette)
- **Backend:** Node.js API routes in `/src/app/api/trip/`
- **Data Storage:** JSON files (no database) → `/data/trip/posts.json`, `comments.json`, `reactions.json`
- **Deployment:** Docker + Docker Compose + Systemd service
- **External:** Anthropic SDK (AI text improvement), Socket.IO, Leaflet (maps), Sharp (images)

### Directory Structure
```
src/
├── trip/                    # Trip shared logic
│   ├── data.ts             # Types & seed data (FamilyMember, TripPost, RoutePoint, etc)
│   ├── store.ts            # JSON file persistence (getPosts, savePost, getComments, etc)
│   ├── auth.ts             # JWT token & admin email verification
│   ├── TripLayout.tsx      # RTL layout wrapper with nav (Heebo font, Hebrew)
│   └── TripComponents.tsx  # Reusable: PostCard, DaySection, Avatar, StatsBar
│
├── app/trip/               # Trip pages
│   ├── page.tsx            # Timeline/journal home (lists posts by day)
│   ├── layout.tsx          # Trip layout provider
│   ├── admin/page.tsx      # Admin compose & publish memories
│   ├── login/page.tsx      # Email login for admins
│   ├── map/page.tsx        # Interactive Leaflet map
│   ├── replay/page.tsx     # Journey animation/playback
│   ├── profile/[member]/   # Family member profiles
│   └── post/[id]/          # Individual post view + comments/reactions
│
└── app/api/trip/           # API endpoints
    ├── auth/route.ts       # POST login, DELETE logout, GET check admin
    ├── posts/route.ts      # GET all, POST create
    ├── posts/[id]/route.ts # GET, PATCH edit, DELETE
    ├── posts/[id]/comments/route.ts
    ├── posts/[id]/react/route.ts
    ├── improve/route.ts    # AI text enhancement (Anthropic)
    └── upload/route.ts     # Media upload
```

### Key Data Types (in `src/trip/data.ts`)
```ts
interface TripPost {
  id: string
  title: string
  authorId: string              // 'dad', 'mom', 'ofir', 'ayala', 'omer', 'ido'
  postType: 'text' | 'photo' | 'video' | 'voice' | 'movement'
  layout: 'hero' | 'standard' | 'voice' | 'gallery'
  rawText: string
  improvedText?: string
  selectedTextVersion: 'raw' | 'improved'
  locationName: string          // e.g. "วัตอารัณย์"
  country: string               // e.g. "תאילנד"
  city: string                  // e.g. "בנגקוק"
  lat?: number
  lng?: number
  locationPrecision: 'general' | 'exact'
  photo?: string                // key in photos dict
  mediaItems?: MediaItem[]
  audioUrl?: string
  voiceLen?: number
  day: number                   // 1–50+
  date: string                  // "אתמול · 18:42"
  publishedAt: string           // ISO timestamp
  visibility: 'public'
  likes: number
  comments: number
  aiImproved?: boolean
}

interface RoutePoint {
  id: string; name: string; en: string
  x: number; y: number          // canvas coordinates
  day: number; posts: number
  future?: boolean
}

interface TravelSegment {
  fromName: string; toName: string
  fromLat: number; fromLng: number; toLat: number; toLng: number
  transportType: 'flight' | 'car' | 'boat' | 'train' | 'walk'
  startDate: string; endDate: string
}
```

### Styling System
Trip section has dedicated CSS variables (`src/trip/TripLayout.tsx`):
- **Colors:** cream, paper, ivory, ink, ink-2, ink-3, terra, terra-d, ochre, jade, sky, rose, gold
- **Typography:** Frank Ruhl Libre (serif), JetBrains Mono, Caveat (handwriting), Heebo
- **Direction:** RTL (Hebrew)
- **Animations:** trip-float-in, trip-breathe, trip-pulse-ring, trip-wave, trip-shimmer, trip-spin

### Data Persistence
- **Store location:** `process.env.TRIP_DATA_DIR` or `./data/trip/` (default)
- **Functions in `store.ts`:**
  - Posts: `getPosts()`, `getPost(id)`, `savePost()`, `deletePost(id)`
  - Reactions: `getReactions()`, `setReaction()`, `getReactionCounts()`, `getVisitorReaction()`
  - Comments: `getComments()`, `saveComment()`, `deleteComment(id)`
- All data written as formatted JSON (2-space indent)

### Authentication
- **Type:** Email-based, JWT tokens (HS256)
- **Admin list:** `TRIP_ADMIN_EMAILS` env var (comma-separated)
- **Cookie:** `trip_auth` (httpOnly, 30-day maxAge)
- **Login flow:** `/trip/login` → email submission → POST `/api/trip/auth` → cookie set
- **Check:** GET `/api/trip/auth` returns `{ isAdmin: boolean }`

### API Endpoints Summary
| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/trip/auth` | Login with email |
| GET | `/api/trip/auth` | Check if current user is admin |
| DELETE | `/api/trip/auth` | Logout |
| GET | `/api/trip/posts` | List all posts |
| POST | `/api/trip/posts` | Create post |
| GET | `/api/trip/posts/[id]` | Get post details |
| PATCH | `/api/trip/posts/[id]` | Update post |
| DELETE | `/api/trip/posts/[id]` | Delete post |
| POST | `/api/trip/posts/[id]/comments` | Add comment |
| POST | `/api/trip/posts/[id]/react` | Add/update reaction |
| POST | `/api/trip/improve` | AI text improvement |
| POST | `/api/trip/upload` | Upload media |

### Deployment & Running

#### Makefile Commands
```bash
make dev              # Start dev via systemd (ergastech-dev service)
make build            # Build Docker image via docker-compose
make run              # Start Docker containers
make stop             # Stop all services (Docker + systemd)
make logs             # View Docker logs
make status           # Check Docker + systemd status
make clean            # Remove containers & images
make help             # Show all commands
```

#### Docker Configuration
- **Service:** `ergastech-app` (container)
- **Port:** 3002 → 3000 (internal)
- **Volumes:**
  - `./public/ayala` → `/app/public/ayala` (assets)
  - `trip-uploads` → `/app/public/trip/uploads` (media)
  - `trip-data` → `/data/trip` (persistent data)
- **Environment vars passed:**
  - `NODE_ENV=production`
  - `NEXT_TELEMETRY_DISABLED=1`
  - `ANTHROPIC_API_KEY`
  - `TRIP_ADMIN_EMAILS`
  - `TRIP_AUTH_SECRET`
  - `TRIP_DATA_DIR=/data/trip`

#### Next.js Configuration
- **Output:** Standalone (optimized Docker build)
- **Strict mode:** On
- **Dev port:** 3002

#### Systemd Service
The `ergastech-dev` systemd service runs the dev server. Start with `make dev` or `sudo systemctl start ergastech-dev`.

### Environment Variables (Required for Production)
```
ANTHROPIC_API_KEY=sk-ant-...         # Anthropic API key for AI
TRIP_ADMIN_EMAILS=email@domain.com   # Admin emails (comma-separated)
TRIP_AUTH_SECRET=long-random-string  # JWT secret
TRIP_DATA_DIR=/data/trip             # Data directory path
```

### Current Status (as of 2026-05-17)
- **Branch:** main
- **Recent work:** UI/UX improvements, globe icon redesign, PWA support, separate login/signup flow
- **Modified files:** Styling updates, trip pages, admin page, components
- **New files:** UI_UX_IMPROVEMENTS.md, ayala-server/, custom-server.js, public/ayala/

### Common Tasks

#### Adding a Post
1. Login at `/trip/login` with admin email
2. Go to `/trip/admin`
3. Fill compose form (author, title, text, media, location, date)
4. Use AI improvement (via `/api/trip/improve`) if desired
5. Publish → saves to `data/trip/posts.json`

#### Accessing Posts
- Read: `src/trip/store.ts` → `getPosts()`
- Write: `savePost(post)` (auto-saves to JSON)
- API: GET `/api/trip/posts`

#### Map & Route
- Points defined in `data.ts` → `route: RoutePoint[]`
- Segments in `data.ts` → `travelSegments: TravelSegment[]`
- Rendered in `/trip/map/page.tsx` (Leaflet)

#### Admin-Only UI
- Login check via `/api/trip/auth`
- Admin button (+) in nav only shows when `isAdmin=true`
- Admin page requires admin status or shows login prompt

---

## Full Stack Example Flow

1. **User visits `/trip`** → Next.js renders `src/app/trip/page.tsx`
2. **Server reads posts** → `getPosts()` from `store.ts` → JSON file
3. **Render timeline** → Group by day, show PostCards with family colors
4. **User clicks post** → Navigate to `/trip/post/[id]`
5. **Single post page** → Shows details, comments, reactions
6. **User (admin) adds memory** → `/trip/admin` form
7. **Submit** → POST `/api/trip/posts` → `savePost()` → persisted to JSON
8. **Timeline updates** → Page reloads, new post appears

---

## Notes for Future Work
- Data is JSON-file-based (no DB migration needed, but limited scaling)
- Authentication is simple email + JWT (no OAuth/external auth)
- Photos/media stored in Docker volume (persistent across restarts)
- AI improvement via Anthropic Claude (requires API key)
- Hebrew RTL fully integrated (Heebo font, dir="rtl")
- Currently on Next.js 15 + React 19 (latest versions)
