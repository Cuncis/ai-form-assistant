# AI Form Assistant — Architecture (Phase 1)

Status: **draft, pending approval**. Nothing in Phase 2+ starts until this is signed off.

## 1. System Overview

```
┌─────────────────────────┐         ┌──────────────────────────┐        ┌───────────────┐
│   Chrome Extension       │  HTTPS  │   Backend API (Laravel)  │  HTTPS │  Claude API   │
│                          │ ──────► │                          │ ─────► │  (Anthropic)  │
│  content script          │         │  auth · rate limit       │        │               │
│  service worker          │ ◄────── │  usage tracking · cache  │ ◄───── │               │
│  popup / options         │         │  prompt building         │        └───────────────┘
└─────────────────────────┘         │  provider adapter layer  │
                                     └──────────────────────────┘
```

**Hard invariant:** the extension never talks to Claude (or any AI vendor) directly. Only the
Laravel backend holds the API key. Only one place in the extension is allowed to call the
backend: the **service worker**. Popup and content scripts reach it exclusively via
`chrome.runtime.sendMessage`. This keeps the trust boundary at a single, auditable choke point.

**Hard invariant:** no code path ever calls `form.submit()`, clicks a submit/apply button, or
programmatically dispatches a submit event. Autofill writes values into fields only after
explicit per-field (or explicit "accept all") user approval in the Review Panel.

## 2. Chrome Extension Architecture

MV3, TypeScript, Vite + CRXJS, React 19 for all UI surfaces, Tailwind 4, Zustand for
client state, TanStack Query for server-state (profiles/templates/history fetched from backend).

| Component | Responsibility |
|---|---|
| Service worker (`background/`) | Sole network egress point. Owns auth token lifecycle, message routing, batching requests to backend. |
| Content script (`content/`) | Field detection, site adapters, context extraction, DOM writes, Review Panel injection (Shadow DOM). |
| Popup | Quick actions: Generate on current page, live Review Panel shortcut, recent history, profile/template switcher. |
| Options page ("Dashboard") | Profiles CRUD, Templates CRUD, API/backend settings, Usage stats, Logs, Import/Export. |

### 2.1 Field Detection & Site Adapters (Strategy pattern)

One common interface, one implementation per site family, so LinkedIn/Greenhouse/Lever/etc.
quirks stay isolated instead of leaking into a single mega-parser:

```ts
interface SiteAdapter {
  readonly id: string
  matches(url: URL): boolean
  // async + observable: several of these ATS's (Workday, Ashby) render fields
  // via client-side routing after the initial page load, so detection can't
  // be a single synchronous DOM scan — it has to react to DOM mutations and
  // SPA route changes.
  detectFields(): Promise<DetectedField[]>
  onFieldsChanged(cb: (fields: DetectedField[]) => void): () => void // unsubscribe
  fillField(field: DetectedField, value: string): Promise<boolean>
  extractContext(): PageContext
}

abstract class BaseAdapter implements SiteAdapter { /* shared MutationObserver,
  label/aria/placeholder heuristics, debounce — subclasses override only what's
  actually different about the site */ }
```

Adapters: `LinkedInAdapter`, `GreenhouseAdapter`, `LeverAdapter`, `AshbyAdapter`,
`WorkdayAdapter`, `GoogleFormsAdapter`, `TypeformAdapter`, `WordPressAdapter`,
`GenericFormAdapter` (fallback for contact forms / CRMs / anything unrecognized).
An `AdapterRegistry` picks the best match by URL, falling back to generic.

**Known risk, still open after Phase 6:** Workday and some Greenhouse embeds render inside
cross-origin iframes. `content_scripts` need `all_frames: true` (already set) plus matching
`host_permissions` for those iframe origins, and messaging has to be frame-aware
(`chrome.tabs.sendMessage(tabId, msg, { frameId })`), which isn't built yet — today's
`DETECT_FIELDS`/`FILL_FIELD` messaging targets the top frame only. This is why
`detectFields()` is async/observable rather than a one-shot scan, ready for that later.

**Built in Phase 6 — generic-site injection.** The manifest's `content_scripts.matches` only
covers the known ATS domains; a generic contact form, WordPress site, or CRM never gets the
content script auto-injected. Per §7's permission model, those sites work instead via
`activeTab` + on-demand `chrome.scripting.executeScript`
(`background/content-script-injector.ts`), triggered only by a genuine user gesture (popup
button click or keyboard command) — no broad host-permission prompt at install, and Chrome
enforces the gesture requirement itself (verified live: `executeScript` on an arbitrary origin
fails outright without one).

**CRXJS gotcha, found by testing this live:** once the content script started importing React
(Phase 7's Widget), CRXJS switched it from a plain classic script to a small loader that
dynamically `import()`s the real bundled chunk. That dynamic import is blocked by Chrome on any
origin not listed in the manifest's auto-generated `web_accessible_resources.matches` — which
CRXJS derives from `content_scripts.matches`, i.e. the known ATS list only. This doesn't affect
those ATS domains, but it's why a raw `executeScript` on a generic site works with no visible
error yet the script silently fails to actually run — worth remembering if this ever regresses.

### 2.2 Autofill Pipeline (sequence)

1. User triggers Generate (floating in-page button, keyboard shortcut, or the popup's "Generate
   answers for this page" button, which just relays the same trigger to the content script).
2. **Built in Phase 7, refined from the original sketch:** the content script does its own
   detection and its own backend call — it has direct DOM access, so there's no reason to round
   -trip through the service worker just to ask itself to detect fields. It calls
   `adapter.detectFields()` + `adapter.extractContext()` locally, then `generateBatch()` (which
   still goes through the service worker for the actual `fetch`, preserving the single-egress
   -point rule — content scripts never call `fetch` directly).
3. Backend resolves cache → prompt → provider → **structured output** (see 3.3) → usage log →
   history row; returns `{ fieldId, answer, confidence, cached }[]`.
4. Content script renders the **Review Panel** (Shadow DOM overlay — Tailwind compiled via a
   `?inline` CSS import and injected as a `<style>` inside the shadow root, so host-page CSS
   never leaks in and the panel's CSS never leaks out): question, generated answer, confidence
   badge, editable answer, Accept / Reject per field, plus "accept all high-confidence".
5. Only on explicit Accept does the Autofill Engine write the value into the real DOM node,
   dispatching proper `input`/`change` events via the *native property setter* (required for
   React-controlled pages like Workday/Ashby/LinkedIn's modal — assigning `.value` directly is
   invisible to React, which tracks its own overridden setter) — submit is never touched. The
   UI reports the fill's real outcome, not just "user clicked Accept" — a `<select>` whose
   options don't match the generated value legitimately can't be filled, and the panel says so
   (`fill-failed` status) rather than falsely claiming success.

**Known gap:** review outcomes (accepted/edited/rejected) aren't reported back to the backend
yet, so `generations` history always shows `pending`. Deferred — needs the backend to return a
generation id per field first, and isn't required for the review flow itself to work.

### 2.3 Extension Folder Structure

```
extension/
├── manifest.json
├── vite.config.ts
├── tsconfig.json
└── src/
    ├── background/
    │   ├── background.ts       (note: named background.ts, not index.ts — CRXJS mismapped
    │   │                        the service worker to the content script bundle when both
    │   │                        entry files were named index.ts; unique basenames fixed it)
    │   └── handlers/          api.handler.ts (generic backend bridge), auth.handler.ts
    ├── content/
    │   ├── content.ts
    │   ├── field-detection/   detector.ts, field-types.ts
    │   ├── site-adapters/     base-adapter.ts, linkedin.adapter.ts, greenhouse.adapter.ts,
    │   │                      lever.adapter.ts, ashby.adapter.ts, workday.adapter.ts,
    │   │                      google-forms.adapter.ts, typeform.adapter.ts,
    │   │                      wordpress.adapter.ts, generic.adapter.ts, registry.ts
    │   ├── context-extraction/ page-context.ts
    │   ├── autofill/          autofill-engine.ts, confidence.ts
    │   └── ui/                review-panel/ (ReviewPanel.tsx, FieldReviewCard.tsx),
    │                          floating-trigger/ (FloatingButton.tsx)
    ├── popup/                 Popup.tsx, main.tsx, popup.html, views/*
    ├── options/               Options.tsx, main.tsx, options.html, views/*
    │                          (ProfilesManager, TemplatesManager, ApiSettings,
    │                           UsageDashboard, LogsViewer, ImportExport)
    └── shared/
        ├── ai/                ai-client.ts, request-builder.ts (builds the *structured
        │                      request DTO*, not the literal AI prompt — prompt text is
        │                      owned by the backend, see 3.2)
        ├── storage/           chrome-storage.ts, profile-store.ts, settings-store.ts,
        │                      cache-store.ts (offline read-only cache of profiles/templates)
        ├── messages/          message-types.ts, message-bus.ts
        ├── api/                http-client.ts, endpoints.ts
        ├── auth/              auth-service.ts (token storage + refresh)
        ├── types/             field.types.ts, profile.types.ts, template.types.ts,
        │                      generation.types.ts, api.types.ts
        ├── constants/         site-patterns.ts, storage-keys.ts
        ├── config/            env.ts
        ├── utils/             dom-utils.ts, debounce.ts, text-utils.ts, language-detect.ts
        └── hooks/             use-generate.ts, use-profiles.ts, use-templates.ts, use-settings.ts
```

## 3. AI Layer — Adapter Pattern (lives in the backend, not the extension)

Because the key must never leave the server, `AIProvider` is a **backend** abstraction. The
extension never picks a vendor — it just sends a structured generation request; the backend
decides which provider fulfills it (by config, or per-user plan later).

### 3.1 Interface (PHP)

```php
interface AIProviderInterface
{
    /** @param GenerateFieldRequestDTO[] $fields */
    public function generate(array $fields, string $systemPrompt): AIGenerationResultDTO;
    public function name(): string;
}

// app/Services/AI/Providers/ClaudeProvider.php   implements AIProviderInterface — real, Phase 5
// app/Services/AI/Providers/OpenAIProvider.php   implements AIProviderInterface (stub)
// app/Services/AI/Providers/GeminiProvider.php   implements AIProviderInterface (stub)
// app/Services/AI/AIProviderFactory.php          resolves the right one from config/ai.php
```

Refined during Phase 5 implementation: `$systemPrompt` already has the page context folded in by
`PromptBuilder`, so the provider only ever needs the field questions and the finished prompt — no
separate `pageContext` parameter. `generate()` returns an `AIGenerationResultDTO` (the per-field
`GenerateResultDTO[]` plus the call's real prompt/completion token counts) rather than a bare
array, so `UsageTracker` logs actual billed tokens instead of an evenly-divided estimate.

Adding a vendor later is: implement the interface, register it in the factory/config — nothing
else in the request pipeline changes.

### 3.2 Prompt ownership

Prompt templates (system prompt, tone, max words, writing style) live in the `templates` table
and are assembled server-side by `PromptBuilder`, not shipped inside the extension bundle. This
means prompt quality/safety fixes ship instantly without a Chrome Web Store review cycle, and
the extension can't be inspected (view-source) to extract your prompt engineering.

### 3.3 Confidence — real signal, not a guess

Claude doesn't emit a confidence score by default, and "only fill when confidence is high" needs
an actual number to threshold on. Solution: force structured output (Claude tool-use /
JSON-schema response) so every generation returns:

```json
{ "answer": "...", "confidence": "high" | "medium" | "low", "assumptions": ["..."] }
```

`confidence` (plus a length/constraint sanity check in `GenerationService`) is what the
Autofill Engine and Review Panel actually threshold and display on — not a heuristic guess.

## 4. Backend Architecture (Laravel 12)

```
backend/
├── app/
│   ├── Http/Controllers/Api/V1/   AuthController, ProfileController, TemplateController,
│   │                              GenerateController, HistoryController, UsageController,
│   │                              SettingsController
│   ├── Http/Requests/             per-endpoint Form Request validation
│   ├── Http/Resources/            JSON shaping
│   ├── Services/AI/               Contracts/, Providers/, AIProviderFactory.php,
│   │                              PromptBuilder.php, GenerationService.php
│   ├── Services/Cache/            ResponseCacheService.php (Redis, hash(question+profile+
│   │                              template+context) → answer, TTL configurable)
│   ├── Services/Usage/            UsageTracker.php
│   ├── Repositories/               Contracts/ + Eloquent/ for Profile, Template, Generation
│   ├── Models/                    User, Profile, Template, Generation, UsageLog
│   ├── DTOs/                      GenerateRequestDTO, GenerateResultDTO
│   ├── Jobs/                      LogUsageJob (queued, keeps the request/response path fast)
│   └── Exceptions/                AIProviderException, RateLimitExceededException
├── database/migrations/
└── routes/api.php
```

Repository pattern between controllers and Eloquent so `GenerationService` doesn't know or
care whether history is stored in MySQL vs something else later. Redis backs both cache and
queue. Rate limiting via Laravel's `RateLimiter` facade, tiered per user plan, applied as
`throttle:` middleware.

### 4.1 Database schema (MVP)

| Table | Key columns |
|---|---|
| `users` | id, name, email, password, plan, timestamps |
| `profiles` | id, user_id, name, slug, headline, summary, skills(json), experience(json), is_default |
| `templates` | id, user_id (nullable = system template), name, system_prompt, tone, max_words, writing_style, is_system |
| `generations` | id, user_id, profile_id, template_id, provider, model, site_domain, page_url, question_text, answer_text, confidence, tokens_used, cached, status(`accepted`/`edited`/`rejected`/`pending`), timestamps |
| `usage_logs` | id, user_id, provider, model, prompt_tokens, completion_tokens, cost_usd, endpoint, created_at |

`generations` doubles as both the **History** feature and the analytics source — no separate
duplicate log table.

### 4.2 REST API (v1)

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
GET    /api/v1/me

GET    /api/v1/profiles            POST /api/v1/profiles
PUT    /api/v1/profiles/{id}       DELETE /api/v1/profiles/{id}

GET    /api/v1/templates           POST /api/v1/templates
PUT    /api/v1/templates/{id}      DELETE /api/v1/templates/{id}

POST   /api/v1/generate            single field
POST   /api/v1/generate/batch      whole-page batch (primary path used by the extension)

GET    /api/v1/history             DELETE /api/v1/history/{id}
GET    /api/v1/history/export

GET    /api/v1/usage
GET    /api/v1/settings            PUT /api/v1/settings
```

## 5. Security Model

- API keys (Claude, later OpenAI/Gemini) exist only in backend `.env` — never in the bundle,
  never logged.
- Single network egress point in the extension: the service worker. Popup/content scripts
  never `fetch()` the backend directly.
- Auth: Laravel Sanctum personal access token, stored in `chrome.storage.local` — deliberately
  *not* `.sync`, so tokens don't propagate across the user's devices; each install re-auths.
- CORS on the backend restricted to `chrome-extension://<EXTENSION_ID>`.
- Rate limiting per user and per IP (defense in depth) via Redis-backed `RateLimiter`.
- Every endpoint validated via Form Requests; no raw request data touches the DB or the prompt.
- Submit is never automated — see the hard invariant in §1.

## 6. Tech Stack Decisions

| Layer | Choice | Why |
|---|---|---|
| Extension core | TypeScript 5, Vite + CRXJS | MV3 boilerplate handled for you, HMR in dev |
| Extension UI | React 19 + Tailwind 4 | Complex multi-view popup/options/review panel |
| Extension state | Zustand + TanStack Query | Local UI state vs. server-backed data (profiles/history) cleanly separated |
| Backend | Laravel 12 | Matches your existing stack strengths (per your profile: Laravel/PHP), first-class queue/cache/auth |
| Cache/Queue | Redis | Both response caching and async usage logging |
| AI | Claude (Anthropic) via adapter, structured output for confidence | Only vendor wired in Phase 5; OpenAI/Gemini are stubs behind the same interface |

## 7. Decisions (locked in for Phase 2+)

1. **Auth:** Laravel Sanctum personal access tokens (not JWT) — simplest correct fit for a
   single long-lived extension client; no refresh-rotation machinery to build. Revisit only if
   a second client type (mobile/web dashboard) shows up later.
2. **Repo layout:** monorepo — `extension/` and `backend/` as siblings under
   `ai-form-assistant/`. Split into separate repos later only if backend deploy needs diverge
   enough to justify it.
3. **Profiles/Templates source of truth:** backend DB, with a local `chrome.storage` read-through
   cache in the extension for offline/fast popup rendering. Enables cross-device profile sync
   and server-side analytics on template performance.
4. **Generation transport:** `POST /v1/generate/batch` as plain request/response for now.
   Revisit SSE streaming in Phase 6 if 20+-question Workday-style forms make progressive
   fill-in worth the complexity.
5. **Package manager:** npm (matches the Node/npm versions already on this machine).

Phase 1 approved — proceeding to **Phase 2: Scaffold**.

## 8. Testing (Phase 8)

**Backend** — `php artisan test` (35 tests): auth, Profile/Template CRUD with cross-tenant
isolation (a second user gets 404, not 403 — doesn't leak existence), system-template
visibility, history, usage aggregation, and the `Http::fake()`-driven generate/batch suite from
Phase 5. Factories (`ProfileFactory`, `TemplateFactory::system()`, `GenerationFactory`) exist for
all three models — needed `user_id` added to each model's `Fillable` list to support them, safe
because controllers never pass `user_id` from request-derived data regardless of column
fillability. One real gotcha: testing "logout revokes the token" via two sequential
`$this->postJson()`/`getJson()` calls in one test method doesn't work — Sanctum's guard caches
the resolved user for the test process's lifetime, so a second simulated request "succeeds" even
with a real revocation bug. Assert the token row is gone from the DB instead.

**Extension unit tests** — `npm run test` (Vitest + jsdom, 42 tests) covering pure logic:
`detector.ts`'s label-resolution heuristics, all 9 adapters' `matches()` routing, request
building, field/result merging, confidence gating, language detection, and the storage
wrappers. jsdom needs two polyfills added in `src/test/setup.ts`: `CSS.escape` (unimplemented in
jsdom) and a non-zero `getBoundingClientRect` (jsdom always reports 0×0, which would make
`isVisible()` filter out every element).

**Extension E2E** — `npm run test:e2e` (`@playwright/test`, 10 tests): real popup/options
rendering, and the full detect → generate → review → accept/reject/edit → fill flow against a
committed local test-fixture form (`e2e/fixtures/test-form.html`) and a lightweight in-repo fake
backend (`e2e/fixtures/fake-backend.ts`) — no PHP/Redis/Anthropic key needed to run it. Since the
fixture domain isn't a real ATS, `vite.config.ts` conditionally adds it to
`content_scripts.matches` only when `E2E_TEST=true` (`npm run build:e2e`), so the content script
auto-injects there without needing to fight Chrome's `activeTab` gesture-gating in an automated
test — that mechanism is already verified separately (§2.1). Two non-obvious fixes were needed to
get this suite to actually pass, not just start:
- `node:http`'s `Server.close()` waits for existing connections to end before its callback
  fires; Chrome keeps HTTP/1.1 keep-alive connections open, so naive teardown hangs for the
  full test timeout on every test after the first. Fix: track sockets via the server's
  `'connection'` event and `destroy()` them before closing (`e2e/fixtures/close-server.ts`).
- Playwright's fixture system inspects each fixture function's parameter list as literal source
  (to know which other fixtures it depends on) — an unused fixture argument must still be an
  empty destructuring pattern (`async ({}, use) => …`), not a renamed/ignored parameter, or
  fixture resolution breaks at runtime despite type-checking fine.
