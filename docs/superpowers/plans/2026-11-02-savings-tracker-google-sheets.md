# Google Sheets Savings Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the website with Google Sheets to allow members to track their weekly savings for "MCG 出游 Tabung 梦想基金" directly from the homepage, including progress checking and one-click savings recording.

**Architecture:** Next.js client component (`SavingsTrackerSection.tsx`) communicates with an internal API route (`/api/savings`), which securely forwards GET/POST requests to a Google Apps Script Webhook. The Google Apps Script interacts with the user's Google Sheet, locating the member's row in Column A (`团员名字 (Name)`), toggling checkboxes in week columns (e.g. `W11`), and reading cumulative savings.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide icons, next-intl, Vitest, Google Apps Script.

**Spec:** `docs/superpowers/specs/2026-11-02-savings-tracker-google-sheets-design.md`

## Global Constraints

- **Placement**: Directly below `LatestYouTubeVideo` in `src/app/[locale]/page.tsx`.
- **Styling**: Minimalist, clean card using Lucide icons; zero emoji spam.
- **Languages**: Both `messages/en.json` and `messages/zh-TW.json` must be fully translated under `"SavingsTracker"`.
- **Environment**: Webhook URL configured via `GOOGLE_SHEETS_SAVINGS_WEBHOOK_URL` in `.env.local`.
- **Sheet Target**: Column A header `团员名字 (Name)`, week headers matching prefix `W\d+` (e.g. `W11`), boolean checkbox cells (`true`/`false`).

## Review Focus

- Empty or single-character names: rejected by API with 400 Bad Request.
- Malformed week code: rejected by API with 400 Bad Request.
- Missing `GOOGLE_SHEETS_SAVINGS_WEBHOOK_URL` configuration: returns 500 with helpful error message.
- Upstream Google Webhook failure/timeout: caught cleanly and returns 502 with friendly error.
- Rapid successive submissions: rate-limited cleanly with 429 status.

---

### Task 1: Google Apps Script Artifacts

**Files:**
- Create: `google-apps-script/Code.gs`
- Create: `google-apps-script/README.md`

**Interfaces:**
- Produces: Complete, copy-paste ready Google Apps Script with `doGet(e)` and `doPost(e)` handlers to deploy as a Web App.

- [ ] **Step 1: Create `google-apps-script/Code.gs`**
  Implement `doGet(e)` for progress queries and `doPost(e)` for recording weekly savings with row/column lookups and lock protection as specified in the design doc.

- [ ] **Step 2: Create `google-apps-script/README.md`**
  Provide step-by-step setup instructions: opening Extensions > Apps Script, pasting code, deploying as Web App (Execute as: Me, Access: Anyone), and copying the deployment URL into `.env.local`.

- [ ] **Step 3: Commit**
  ```bash
  git add google-apps-script/
  git commit -m "feat(savings): add google apps script webhook template and documentation"
  ```

---

### Task 2: Internationalization Translations

**Files:**
- Modify: `messages/en.json`
- Modify: `messages/zh-TW.json`

**Interfaces:**
- Produces: `"SavingsTracker"` namespace in both locale dictionaries with keys:
  - `title`, `subtitle`, `nameLabel`, `namePlaceholder`, `weekLabel`, `progressTitle`, `totalSaved`, `weeksCount`, `statusSaved`, `statusPending`, `submitButton`, `submitting`, `savedForWeek`, `successMessage`, `errorMessage`, `memberNotRegistered`

- [ ] **Step 1: Add `"SavingsTracker"` namespace to `messages/en.json`**
  Add all English text strings ensuring consistent tone with existing UI.

- [ ] **Step 2: Add `"SavingsTracker"` namespace to `messages/zh-TW.json`**
  Add traditional Chinese text strings matching MCG naming conventions ("MCG 出游 Tabung 梦想基金", "团员名字", etc.).

- [ ] **Step 3: Commit**
  ```bash
  git add messages/en.json messages/zh-TW.json
  git commit -m "feat(savings): add localization strings for savings tracker"
  ```

---

### Task 3: Backend API Route (`/api/savings`) & Vitest Tests

**Files:**
- Create: `src/app/api/savings/route.ts`
- Test: `tests/savings-api.test.ts`

**Interfaces:**
- Produces:
  - `POST /api/savings`: `{ name: string, week: string }` -> `{ success: boolean, message: string }`
  - `GET /api/savings?name=string`: -> `{ success: boolean, exists: boolean, totalSaved: number, totalWeeksSaved: number, savedWeeks: string[] }`

- [ ] **Step 1: Write failing test `tests/savings-api.test.ts`**
  Test validation rules:
  - Reject empty name with 400.
  - Reject invalid week format with 400.
  - Handle missing environment variable with 500.
  - Forward valid POST/GET requests to webhook mock.

- [ ] **Step 2: Run test to verify it fails**
  Run: `npm test -- tests/savings-api.test.ts`
  Expected: FAIL (route module does not exist yet).

- [ ] **Step 3: Implement `src/app/api/savings/route.ts`**
  Implement `GET` and `POST` handlers using `NextRequest` and `NextResponse`, validating input and calling `fetch(process.env.GOOGLE_SHEETS_SAVINGS_WEBHOOK_URL, ...)`.

- [ ] **Step 4: Run test to verify it passes**
  Run: `npm test -- tests/savings-api.test.ts`
  Expected: PASS.

- [ ] **Step 5: Commit**
  ```bash
  git add src/app/api/savings/route.ts tests/savings-api.test.ts
  git commit -m "feat(savings): add savings tracker api route with tests"
  ```

---

### Task 4: Client Component (`SavingsTrackerSection.tsx`)

**Files:**
- Create: `src/components/SavingsTrackerSection.tsx`

**Interfaces:**
- Consumes:
  - `useTranslations("SavingsTracker")`
  - `createClient()` from `@/lib/supabase` for auto-detecting logged-in user
  - `GET /api/savings?name=...` and `POST /api/savings`
- Produces:
  - Client component exported as `export function SavingsTrackerSection()`

- [ ] **Step 1: Implement `SavingsTrackerSection.tsx`**
  - Autodetects user from Supabase (`supabase.auth.getUser()`).
  - Datalist with known active members (`Brandon Chan`, `Gregory Hong`, `Jacelyn Wai`, `Martin Lau`, `Elwin Ee`, `Leon`, `Siaw Wei`, `Janet Ling`, `John Tan`).
  - Fetches progress for entered name (debounced or on select/blur).
  - Displays progress stats: total saved (RM), total weeks count, and status badge for current week.
  - Week selector defaulting to `W11 (6月第1周)`.
  - Action button: *"Yes, I have saved RM10 for this week"* with loading spinner and disabled state if already recorded.
  - Success banner with feedback and re-check capability.

- [ ] **Step 2: Commit**
  ```bash
  git add src/components/SavingsTrackerSection.tsx
  git commit -m "feat(savings): create savings tracker client component"
  ```

---

### Task 5: Homepage Integration & Final Verification

**Files:**
- Modify: `src/app/[locale]/page.tsx`

**Interfaces:**
- Consumes: `<SavingsTrackerSection />`
- Produces: Homepage rendered with savings section directly below `<LatestYouTubeVideo />`.

- [ ] **Step 1: Integrate component into `src/app/[locale]/page.tsx`**
  Import `SavingsTrackerSection` and place `<SavingsTrackerSection />` directly below `<LatestYouTubeVideo />`.

- [ ] **Step 2: Run linter and tests**
  Run: `npm run lint` and `npm test`
  Expected: All checks and tests pass with zero errors.

- [ ] **Step 3: Commit**
  ```bash
  git add src/app/[locale]/page.tsx
  git commit -m "feat(savings): integrate savings tracker section on homepage"
  ```
