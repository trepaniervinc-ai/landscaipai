# Landscaip — Technical Architecture

> AI-powered landscaping visualization. Upload a photo of your house, get professional landscaping designs in seconds.

**Version:** 1.0
**Date:** June 16, 2026
**Status:** Draft

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Primary Data Flow](#2-primary-data-flow)
3. [Database Schema](#3-database-schema)
4. [API Routes](#4-api-routes)
5. [File Storage Structure](#5-file-storage-structure)
6. [Auth Flow](#6-auth-flow)
7. [Payment Flow](#7-payment-flow)
8. [AI Integration](#8-ai-integration)
9. [Key Architectural Decisions](#9-key-architectural-decisions)

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser / PWA)                  │
│                                                                   │
│  ┌──────────────┐   ┌───────────────┐   ┌────────────────────┐  │
│  │  Next.js     │   │  In-Painting  │   │  Service Worker    │  │
│  │  App Router  │   │  Canvas       │   │  (PWA / Offline)   │  │
│  │  (RSC + CC)  │   │  (client-only)│   │                    │  │
│  └──────┬───────┘   └───────┬───────┘   └────────────────────┘  │
│         │                   │                                     │
└─────────┼───────────────────┼─────────────────────────────────────┘
          │  HTTP / fetch      │  mask → prompt text (no upload)
          ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                     NEXT.JS SERVER (Vercel)                      │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Middleware (src/middleware.ts)         │    │
│  │   Auth gate · Route group enforcement · Redirect logic   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │  Server      │  │  API Routes  │  │  Stripe Webhook       │  │
│  │  Components  │  │              │  │  Handler              │  │
│  │  (RSC)       │  │  /api/       │  │  /api/webhooks/stripe │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬────────────┘  │
│         │                 │                       │               │
└─────────┼─────────────────┼───────────────────────┼───────────────┘
          │                 │                        │
     ┌────▼────┐      ┌─────▼──────┐          ┌─────▼──────┐
     │Supabase │      │  Gemini    │          │   Stripe   │
     │         │      │  Flash     │          │   API      │
     │ Postgres│      │  Image API │          │            │
     │ Auth    │      │ (Nano      │          │            │
     │ Storage │      │  Banana 2) │          │            │
     └─────────┘      └────────────┘          └────────────┘
```

### Component Responsibilities

| Layer | Technology | Responsibility |
|-------|-----------|----------------|
| Frontend | Next.js App Router (RSC + Client Components) | UI rendering, routing, form handling |
| Middleware | Next.js middleware | Auth enforcement, route protection |
| API Routes | Next.js route handlers | AI calls, credit management, file upload |
| Database | Supabase Postgres + RLS | Data persistence, access control |
| Auth | Supabase Auth | Session management, OAuth |
| Storage | Supabase Storage (S3-compatible) | Image uploads, generated results |
| AI | Gemini 3.1 Flash Image (Nano Banana 2) | Landscape generation and editing |
| Payments | Stripe | Subscriptions, credit pack purchases |
| Deployment | Vercel | Hosting, edge functions, env vars |
| PWA | Service Worker + Web Manifest | Mobile install, camera capture |

---

## 2. Primary Data Flow

### Generation Flow (Happy Path)

```
User                  Next.js              Supabase            Gemini API
 │                      │                     │                     │
 │  Submit generation   │                     │                     │
 ├─────────────────────►│                     │                     │
 │                      │  deduct_credit()    │                     │
 │                      ├────────────────────►│                     │
 │                      │  {success: true,    │                     │
 │                      │   new_balance: N}   │                     │
 │                      │◄────────────────────┤                     │
 │                      │                     │                     │
 │                      │  Build compound     │                     │
 │                      │  prompt             │                     │
 │                      │                     │                     │
 │                      │  POST /v1/models/   │                     │
 │                      │  gemini-flash-image │                     │
 │                      ├─────────────────────┼────────────────────►│
 │                      │                     │                     │
 │                      │                     │     Generated image  │
 │                      │◄────────────────────┼─────────────────────┤
 │                      │                     │                     │
 │                      │  Store image        │                     │
 │                      │  in Storage         │                     │
 │                      ├────────────────────►│                     │
 │                      │                     │                     │
 │                      │  INSERT generation  │                     │
 │                      │  row (status:done)  │                     │
 │                      ├────────────────────►│                     │
 │                      │                     │                     │
 │  Return image URL    │                     │                     │
 │◄─────────────────────┤                     │                     │
```

### Generation Flow (Failure Path)

```
 │  [AI call fails / content policy rejection]
 │                      │
 │                      │  refund_credit()
 │                      ├────────────────────►│
 │                      │  {success: true}    │
 │                      │◄────────────────────┤
 │                      │                     │
 │                      │  UPDATE generation  │
 │                      │  row (status:failed)│
 │                      ├────────────────────►│
 │                      │                     │
 │  Return error msg    │                     │
 │◄─────────────────────┤                     │
```

---

## 3. Database Schema

### Tables

#### `profiles`
Extends `auth.users`. Created automatically via `handle_new_user()` trigger.

```sql
profiles (
  id                uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email             text NOT NULL,
  full_name         text,
  avatar_url        text,
  user_type         text CHECK (user_type IN ('landscaper', 'homeowner', 'admin')),
  credits_balance   integer NOT NULL DEFAULT 0,
  stripe_customer_id text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
)
```

RLS: Users can only read/update their own row.

---

#### `projects`
Named containers for organizing images. Shareable via public URL.

```sql
projects (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        text NOT NULL,
  share_slug  text UNIQUE,            -- null = not shared
  is_shared   boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
)
```

RLS: Owners can CRUD. Public can SELECT where `is_shared = true`.

---

#### `images`
User-uploaded photos of their property.

```sql
images (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  storage_path text NOT NULL,          -- path in Supabase Storage
  thumb_path   text,                   -- thumbnail path
  file_name    text NOT NULL,
  file_size    integer,
  mime_type    text,
  width        integer,
  height       integer,
  created_at   timestamptz NOT NULL DEFAULT now()
)
```

RLS: Owners can CRUD. Public can SELECT images belonging to shared projects.

---

#### `generations`
AI-generated output images. Each has a parent image and records full prompt context.

```sql
generations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id        uuid NOT NULL REFERENCES images(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_gen_id   uuid REFERENCES generations(id),  -- for iterative chains
  storage_path    text,                              -- null until complete
  status          text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  -- Prompt components stored separately for display in shared views
  style_preset    text,
  time_of_day     text,
  season          text,
  weather         text,
  custom_prompt   text,
  is_inpainting   boolean NOT NULL DEFAULT false,
  full_prompt     text,                -- final compound prompt sent to Gemini
  error_message   text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  completed_at    timestamptz
)
```

RLS: Owners can CRUD. Public can SELECT generations belonging to shared projects.

---

#### `credit_transactions`
Full audit ledger for all credit movements.

```sql
credit_transactions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount          integer NOT NULL,    -- positive = credit, negative = debit
  type            text NOT NULL
                    CHECK (type IN ('signup', 'subscription', 'purchase', 'generation', 'refund')),
  description     text,
  generation_id   uuid REFERENCES generations(id),
  stripe_payment_intent_id text,
  created_at      timestamptz NOT NULL DEFAULT now()
)
```

RLS: Users can only SELECT their own transactions. No direct INSERT/UPDATE/DELETE (all via functions).

---

#### `subscriptions`
Stripe subscription state, synced via webhooks.

```sql
subscriptions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_subscription_id text UNIQUE NOT NULL,
  stripe_price_id       text NOT NULL,
  plan                  text NOT NULL CHECK (plan IN ('starter', 'pro', 'business')),
  status                text NOT NULL,   -- active, canceled, past_due, etc.
  current_period_start  timestamptz,
  current_period_end    timestamptz,
  cancel_at_period_end  boolean NOT NULL DEFAULT false,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
)
```

RLS: Users can only SELECT their own subscription.

---

#### `processed_stripe_events`
Idempotency table for Stripe webhook deduplication.

```sql
processed_stripe_events (
  stripe_event_id  text PRIMARY KEY,
  event_type       text NOT NULL,
  processed_at     timestamptz NOT NULL DEFAULT now()
)
```

No RLS needed — accessed only via service role in webhook handler.

---

#### `admin_settings`
Key-value store for admin-configurable platform settings.

```sql
admin_settings (
  key         text PRIMARY KEY,
  value       text NOT NULL,
  description text,
  updated_at  timestamptz NOT NULL DEFAULT now()
)
```

Default rows:
- `free_signup_credits` → `"3"`
- `max_image_upload_size_mb` → `"10"`

RLS: Public SELECT. Admin-only UPDATE.

---

#### `gallery_items`
Admin-curated public gallery entries.

```sql
gallery_items (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_id  uuid REFERENCES generations(id),
  storage_path   text,            -- standalone image if not from a generation
  caption        text,
  style_preset   text,
  display_order  integer NOT NULL DEFAULT 0,
  is_active      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now()
)
```

RLS: Public SELECT where `is_active = true`. Admin-only INSERT/UPDATE/DELETE.

---

### Postgres Functions

All are `SECURITY DEFINER` — run with elevated privileges, bypassing RLS.

#### `deduct_credit(p_user_id uuid, p_generation_id uuid)`
```
BEGIN
  SELECT credits_balance FROM profiles
    WHERE id = p_user_id
    FOR UPDATE;                          -- row-level lock

  IF balance < 1 THEN
    RETURN json {success: false, reason: 'insufficient_credits'};
  END IF;

  UPDATE profiles SET credits_balance = credits_balance - 1
    WHERE id = p_user_id;

  INSERT INTO credit_transactions (user_id, amount, type, generation_id)
    VALUES (p_user_id, -1, 'generation', p_generation_id);

  RETURN json {success: true, new_balance: balance - 1};
END;
```

#### `refund_credit(p_user_id uuid, p_generation_id uuid)`
Compensating transaction — adds 1 credit back and logs a 'refund' transaction.

#### `add_credits(p_user_id uuid, p_amount integer, p_type text, p_description text)`
Used by webhook handler for subscription renewals and credit pack purchases.

---

### Trigger

#### `handle_new_user()`
Fires on `INSERT` to `auth.users`. Creates a `profiles` row and calls `add_credits()` with the value from `admin_settings.free_signup_credits`.

---

### Entity Relationships

```
auth.users (1) ──── (1) profiles
profiles (1) ──── (many) projects
projects (1) ──── (many) images
images (1) ──── (many) generations
generations (0..1) ──── (many) generations   [parent_gen_id chain]
profiles (1) ──── (many) credit_transactions
profiles (1) ──── (0..1) subscriptions
generations (0..1) ──── (many) gallery_items
```

---

## 4. API Routes

All routes under `/api/` are Next.js Route Handlers. Server-side only. Never expose API keys to client.

### Generation

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/api/generate` | Required | Deduct credit, build prompt, call Gemini, store result |
| `POST` | `/api/inpaint` | Required | In-painting flow — same as generate but with mask context injected into prompt |

**Request body (`/api/generate`):**
```json
{
  "image_id": "uuid",
  "style_preset": "japanese-zen",
  "time_of_day": "golden-hour",
  "season": "spring",
  "weather": "sunny",
  "custom_prompt": "Add a small koi pond near the front path"
}
```

**Request body (`/api/inpaint`):**
Same as above, plus:
```json
{
  "parent_generation_id": "uuid",
  "mask_description": "the left side of the yard near the fence"
}
```

---

### File Upload

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/api/upload` | Required | Validate file, upload to Supabase Storage, create `images` row, return image metadata |

**Constraints enforced server-side:**
- Max size: from `admin_settings.max_image_upload_size_mb`
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/heic`
- Path: `uploads/{user_id}/{project_id}/{image_id}.{ext}`

---

### Projects

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/api/projects` | Required | Create project |
| `PATCH` | `/api/projects/[id]` | Required (owner) | Rename, toggle sharing |
| `DELETE` | `/api/projects/[id]` | Required (owner) | Delete project + cascade |

---

### Billing

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/api/billing/checkout` | Required | Create Stripe Checkout session (subscription or credit pack) |
| `POST` | `/api/billing/portal` | Required | Create Stripe Customer Portal session |
| `POST` | `/api/webhooks/stripe` | None (Stripe sig) | Handle `checkout.session.completed`, `invoice.paid`, `customer.subscription.*` |

---

### Admin

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/admin/users` | Admin | List users with usage stats |
| `PATCH` | `/api/admin/settings` | Admin | Update `admin_settings` values |
| `POST` | `/api/admin/gallery` | Admin | Add gallery item |
| `DELETE` | `/api/admin/gallery/[id]` | Admin | Remove gallery item |
| `POST` | `/api/admin/credits` | Admin | Manually adjust user credits |

---

### Route Groups (Page Routes)

```
app/
├── (public)/
│   ├── page.tsx                  # Landing page with drop zone
│   ├── gallery/page.tsx          # Public gallery
│   ├── pricing/page.tsx          # Pricing page
│   ├── faq/page.tsx
│   ├── contact/page.tsx
│   ├── terms/page.tsx
│   ├── privacy/page.tsx
│   └── share/[slug]/page.tsx     # Shared project view (read-only)
├── (auth)/
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   └── auth/callback/route.ts    # OAuth callback handler
├── (protected)/
│   ├── dashboard/page.tsx        # Projects list
│   ├── project/[id]/page.tsx     # Project view (images grid)
│   ├── generate/page.tsx         # Generation UI
│   └── account/page.tsx          # Account settings
└── (admin)/
    └── admin/
        ├── page.tsx              # Admin dashboard
        ├── users/page.tsx
        ├── gallery/page.tsx
        └── settings/page.tsx
```

---

## 5. File Storage Structure

Supabase Storage buckets (S3-compatible):

```
bucket: landscaip-uploads        (private — RLS via Supabase policies)
├── uploads/
│   └── {user_id}/
│       └── {project_id}/
│           └── {image_id}.{ext}         # Original uploaded photo
└── thumbnails/
    └── {user_id}/
        └── {project_id}/
            └── {image_id}_thumb.webp    # Auto-generated 400px thumbnail

bucket: landscaip-generations    (private — RLS via Supabase policies)
└── {user_id}/
    └── {project_id}/
        └── {generation_id}.webp         # AI-generated result

bucket: landscaip-gallery        (public — no auth required)
└── {gallery_item_id}.webp               # Admin-curated gallery images
```

**Access patterns:**
- Authenticated users fetch signed URLs for their own uploads and generations
- Shared project views use signed URLs generated server-side for public access
- Gallery images are served from the public bucket directly (CDN-friendly)
- Masks are never stored — client generates mask, translates to text, sends text only

---

## 6. Auth Flow

### Email/Password Signup

```
User submits signup form
  → POST /auth/v1/signup (Supabase Auth)
  → Supabase creates auth.users row
  → handle_new_user() trigger fires
      → Creates profiles row
      → Calls add_credits(user_id, 3, 'signup', 'Welcome credits')
  → Confirmation email sent (not required to proceed)
  → Session cookie set
  → Redirect to /dashboard (or back to pending generation)
```

### Google OAuth

```
User clicks "Sign in with Google"
  → GET /auth/v1/authorize?provider=google
  → Redirect to Google consent screen
  → Google redirects to /auth/callback?code=...
  → src/app/(auth)/auth/callback/route.ts
      → exchangeCodeForSession(code)
      → Validates redirect URL (open-redirect protection)
      → If new user: handle_new_user() trigger fires (same as above)
  → Session cookie set
  → Redirect to /dashboard
```

### Session Management

- Sessions stored in HTTP-only cookies via `@supabase/ssr`
- Middleware reads session on every request — no client-side token exposure
- `src/lib/supabase/server.ts` — cookie-based server client
- `src/lib/supabase/client.ts` — browser client for client components
- `useUser()` hook (`src/hooks/use-user.ts`) — client-side `{ user, profile, loading }`
- `getAuthenticatedProfile()` (`src/lib/supabase/queries.ts`) — server-side, wrapped in React `cache()` to deduplicate across RSCs in a single request

### Middleware Logic (`src/middleware.ts`)

```
Request arrives
  → Skip if Supabase env vars not set (dev without config)
  → Read session from cookies
  → If route is (protected) or (admin):
      → No session → redirect to /login
  → If route is (auth):
      → Has session → redirect to /dashboard
  → If route is (admin):
      → Check profile.user_type === 'admin'
      → Not admin → redirect to /dashboard
  → Continue
```

---

## 7. Payment Flow

### Subscription Purchase

```
User selects plan on /pricing
  → POST /api/billing/checkout {plan: 'pro', mode: 'subscription'}
  → Server creates Stripe Customer if not exists
  → Creates Stripe Checkout Session (subscription mode)
  → Returns {url: checkout_url}
  → Client redirects to Stripe Checkout

User completes Stripe Checkout
  → Stripe fires webhook: checkout.session.completed
  → POST /api/webhooks/stripe
      → Verify Stripe signature (reject if invalid)
      → Check processed_stripe_events — skip if duplicate
      → INSERT into processed_stripe_events
      → Lookup user by stripe_customer_id
      → Upsert subscriptions row
      → Call add_credits(user_id, plan_credits, 'subscription', plan_name)
      → Return 200

  → Stripe also fires: invoice.paid (on renewal)
      → Same idempotency check
      → add_credits() for monthly credit refresh
```

### Credit Pack Purchase

```
User selects pack on /pricing
  → POST /api/billing/checkout {pack: 'project-pack', mode: 'payment'}
  → Creates Stripe Checkout Session (payment mode, one-time)
  → Returns {url: checkout_url}
  → Client redirects to Stripe Checkout

User completes payment
  → Stripe fires webhook: checkout.session.completed
  → Same idempotency check
  → add_credits(user_id, pack_credits, 'purchase', pack_name)
```

### Subscription Cancellation

```
User goes to Account → Billing → Cancel
  → POST /api/billing/portal
  → Server creates Stripe Customer Portal session
  → Client redirects to Stripe-hosted portal

User cancels in portal
  → Stripe fires: customer.subscription.updated {cancel_at_period_end: true}
  → UPDATE subscriptions SET cancel_at_period_end = true
  → Credits remain active until current_period_end
  → No credit deduction on cancellation

At period end:
  → Stripe fires: customer.subscription.deleted
  → UPDATE subscriptions SET status = 'canceled'
  → Subscription credits that haven't rolled over are forfeited
  → Purchased pack credits are unaffected
```

---

## 8. AI Integration

### Prompt Construction

Server-side only, in `src/lib/gemini/prompts.ts`:

```typescript
function buildPrompt(params: GenerationParams): string {
  const parts = [
    SYSTEM_CONTEXT,                          // preserve architecture
    params.stylePreset                       // preset description or ""
      ? PRESETS[params.stylePreset]
      : "",
    buildEnvironmentContext(params),         // time of day, season, weather
    params.customPrompt ?? "",
    params.isInpainting
      ? buildInpaintingContext(params.maskDescription, params.customPrompt)
      : "",
  ];
  return parts.filter(Boolean).join("\n\n");
}
```

**System context (always included):**
> "You are a professional landscape designer. Transform the landscaping in this photo while preserving the existing architecture, structures, driveway, fencing, and all non-landscape elements exactly as they appear."

### Gemini API Call

```typescript
// src/app/api/generate/route.ts (server only)
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-3.1-flash-image",  // Nano Banana 2
});

const result = await model.generateContent([
  { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
  { text: prompt },
]);
```

### Error Handling

| Error Type | Action |
|-----------|--------|
| API timeout | Refund credit, return error to user |
| Content policy rejection | Refund credit, show friendly message + prompt guidance |
| Rate limit (429) | Retry with exponential backoff (2 attempts), then refund |
| Invalid response | Refund credit, log error, return generic error |

---

## 9. Key Architectural Decisions

### 1. Server-Side AI Calls Only
All Gemini API interactions happen in Next.js API routes. The API key never reaches the browser. This is non-negotiable — in-browser AI calls would expose the key to any user inspecting network traffic.

### 2. Deduct-Before-Generate, Refund-on-Failure
Credit is deducted atomically before dispatching the AI call. If the call fails, a compensating `refund_credit()` call re-credits. This prevents users from generating without paying, while ensuring no one is charged for a failed generation. The alternative (charge-after-success) risks double-generating if the client retries after a network timeout.

### 3. Postgres Functions with Row Locking
`deduct_credit()`, `refund_credit()`, and `add_credits()` are `SECURITY DEFINER` Postgres functions that use `SELECT ... FOR UPDATE` to lock the profile row before modifying `credits_balance`. This prevents race conditions where two concurrent requests could both see a balance of 1 and both proceed, resulting in a -1 balance.

### 4. Supabase RLS as Defense-in-Depth
Row Level Security policies enforce data ownership at the database level — even if application code has a bug, the database won't return another user's data. The `(SELECT auth.uid())` pattern (rather than `auth.uid()`) avoids per-row function calls and is required for performance at scale.

### 5. Client-Side Masking
In-painting masks are drawn by the user on a canvas, but the pixel data is never uploaded. Instead, the client translates the mask into a text description of the region (e.g., "the left side of the yard near the fence"), which is injected into the prompt. This avoids storing mask data, simplifies the API call, and works regardless of whether Gemini supports pixel-level mask inputs.

### 6. Stripe Webhook Idempotency
Stripe can deliver the same webhook event more than once. The `processed_stripe_events` table stores processed event IDs. Before processing any webhook, we check this table and skip duplicates. The insert and processing happen in a single transaction to prevent TOCTOU races.

### 7. React `cache()` for Profile Deduplication
`getAuthenticatedProfile()` in `src/lib/supabase/queries.ts` is wrapped in React's `cache()`. Multiple Server Components in a single request that each call this function share the same result — only one database query is made per request, regardless of how many components need the user's profile.

### 8. Route Groups for Access Control
Next.js route groups — `(public)`, `(auth)`, `(protected)`, `(admin)` — provide a structural, code-level representation of access requirements. Middleware enforces these boundaries at runtime. The grouping makes it impossible to accidentally add a page to the wrong access tier without consciously moving it.

---

*See [docs/prd.md](./prd.md) for full product requirements and feature specifications.*
