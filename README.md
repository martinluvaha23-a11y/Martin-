# Santapris School System — Modernized

Same system, same features, same data — faster, cleaner and more robust.
This folder is a complete, self-contained replacement for the original
`school_system.py` + `frontend.html` setup. **Your data was migrated with zero
changes**: the same `school.db` file, the same database schema, the same login
accounts, the same API.

## Run it

```
pip install -r requirements.txt      # once (fastapi + uvicorn, nothing else)
python school_system.py              # same as before → http://localhost:8000
```

or just double-click **`start.bat`**.

Useful options:

```
python school_system.py --port 8000            # change port
python school_system.py --db C:\path\school.db # use a specific database file
```

Logins are unchanged:
- Admin: `Martinsmarta` / `Luvahama1995!`
- Teacher: `Teacher` / `Teacher123`

> You can also point `--db` at your original `..\school.db` to run against it
> directly. The bundled `school.db` is a byte-for-byte copy of your data taken
> at modernization time.

## What changed

### Performance
| Area | Before | Now |
|---|---|---|
| Page load | 4.4 MB HTML re-sent and re-parsed every load | 1.9 MB of vendor/app JS + CSS served as cached static files; first-party assets revalidate with cheap 304s, third-party libs cached for a year |
| Network | Plain text everything | GZip on all JSON/HTML/JS (the 1.1 MB `/api/db` payload travels as ~77 KB) |
| Polling | Server re-serialized the whole DB on every 8-second poll and re-sent it after any save — even no-op ones | Content-hash ETag: unchanged data = instant `304 Not Modified` with zero body; snapshot cached in memory |
| Saving | Every save rewrote **every** row (598 students + 1,435 exams + …), bumped the sync clock and forced every device to re-download everything | Row-level diffing: only rows that actually changed are written; a no-op save writes nothing and notifies nobody |
| SSE | Per-client busy-poll thread queues | True async event hub with heartbeats |
| SQLite | New connection (and `PRAGMA optimize`) on every request | Persistent per-thread connections |

### Correctness / robustness
- The cache is versioned by content, so same-second updates can no longer be missed (the old timestamp-keyed cache had that race).
- `activity_log` now rolls over at 10,000 rows instead of growing forever.
- `/api/restore` now invalidates the cache immediately (the old build could briefly serve stale data after a restore).
- Server structure is a real package: `santapris/` with `config`, `database`, `records` (diff engine), `cache`, `events` (SSE), `audit`, `security`, `api`, `web`.

### Security (hardening, no behavior change for real users)
- Delete endpoints and user management no longer trust the browser's `role` cookie — the role is verified server-side against the login session, so a teacher can't become admin by editing cookies.
- Passwords of registered accounts are upgraded transparently from the legacy salted-SHA256 scheme to PBKDF2-HMAC-SHA256 (200k iterations, per-user salt) on first login.
- Session cookies are now `HttpOnly` (the frontend never read them from JavaScript).

### One real bug fixed
The 640 KB inlined SheetJS (Excel) library was silently dead in the original
build — a pasted CSS block broke a string literal, so the entire script failed
to parse and every Excel import/export silently fell back to the CDN (needing
internet). The string is repaired; the inlined library now works **offline**,
as originally intended. Everything else in the frontend is byte-identical to
the original, just loaded from cacheable files.

### New feature: Teacher Duty Rota Generator
Sidebar → **🗓️ Duty Rota**. Generates the weekly teacher-on-duty rotation for
**Upper Primary (Gr 4–6) and Junior School (Gr 7–9)** teachers:

- Opening / closing date pickers; optional **mid-term break** (start + end) —
  weeks overlapping it get no allocations
- **3 teachers on duty per week**, with a fairness guarantee: after generation
  no teacher differs from another by more than one duty
- Multi-select dropdown to **exempt** teachers from the rota
- Every generation **reshuffles** the groups (plus a swap pass that avoids
  back-to-back weeks for the same teacher), so the same teachers are not
  always on duty together
- Allocation-count table (times on duty per teacher + share bars)
- Export as **A4 PDF, Word (.docx) or Excel (.xlsx)** in **portrait or
  landscape** — both selectable from dropdowns (Excel gets A4 page setup +
  a second "Allocation Summary" sheet)
- The rota persists with the school data (server-side `dutyRota`) and syncs to
  every connected device in real time; per-device it also caches in
  localStorage. *(Server-side sync activates after the first server restart
  following the feature install — the page itself works immediately.)*

### New feature: Timetable Generator constraints
The Timetable Generator's solver now supports three editable constraint sets
(timetable page → Settings):

- **Lessons per subject per week** — the "Weekly Lesson Targets" panel is now
  live-editable with a running total against the 47 weekly slots per class, so
  you can fill every period (the old defaults summed to 38–41 and left empty
  periods). Targets of 0 are honoured.
- **Subject ↔ period restrictions** — tick periods where a subject must never
  appear (e.g. the periods right before/after break, lunch or assembly).
- **Sequencing rules** — pick two subjects that must never follow each other
  in consecutive periods on the same day.

All three are enforced during generation, persist per device, and a warning
toast appears if the lesson totals don't match the 47 slots before generating.

### New feature: Timetable advanced controls
A new "⚙️ Advanced" panel on the timetable page adds:

- **Period structure editor** — set the number of periods per day (4–12),
  each period's start–end time, where break columns appear, and each break's
  time. The whole solver, all views and exports adapt to the new structure.
- **Teacher time-off** — pick a teacher + day + period where they must have
  no lesson at all.
- **Double lessons per subject** — set how many doubles a subject gets per
  week; doubles are scheduled as two consecutive periods inside one block
  (never split by a break, never thrown to different times).
- **Max consecutive lessons per teacher** — after N back-to-back lessons a
  teacher must get a free period to rest.
- **Manual editing** — after generating, click one lesson card then another
  to swap them, or drag & drop cards between periods. Teacher-clash checks
  still apply; fixed slots (assembly/games) can't be moved.
- **Printable Word export** — A4 .docx with a dropdown for scope
  (By Teachers / By Class / By Day / Whole Block) and orientation.

Two sync-engine hardening fixes came out of testing this: the page now
recovers if its local cache is cleared while the server data is unchanged
(304 loop), and the app re-binds to fresh server data if the boot sync
raced page load. *(The engine fix applies after the next server restart;
all timetable features are frontend-only and live immediately.)*

### New feature: Teachers hub (restructured Teachers page)
The **👩‍🏫 Teachers** page is now a drill-down browser:

- **List of all teachers** with their total weekly lessons (and double count)
  — the old full register table is still available behind "📋 Full register
  (table view)", and Add/Edit/Delete keep working.
- **Click a teacher** → their subject & class allocations as clickable chips
  (e.g. `MATHS 8R · 4/week · 2×double`), contact info, edit/delete, and a
  **time-off grid**: days × periods, ticked = lesson CAN be placed, crossed =
  cannot. The generator honours every crossed period.
- **Click a subject-class chip** → editor for that exact class: weekly
  lessons, how many are doubles, how many are singles — all manually
  editable with live validation (singles + 2×doubles = lessons; ≤10/week).
- These per-class allocations **drive the Timetable Generator directly**
  (per class & subject, overriding the global defaults), and the allocation
  meter on the generator page reflects them per grade.

### Timetable generator now generates from the Teachers hub
The generator's "Weekly Lesson Targets" panel is a **per-class editor for the
same data**: for every ticked grade it lists the class's subjects with
editable lessons + doubles, a per-grade slot meter (matches the 47/37/etc.
teachable slots), add/remove subject controls, and a warning if a class
doesn't match its slot total. A class's subject list comes from the Teachers
hub store (union of the default band subjects and anything added, minus
subjects set to 0), so the hub and the generator can never drift apart.
A **quick break editor** sits directly on the generator settings: tick where
breaks go and how many, with times editable in the Advanced panel.

### New feature: Subjects page (📚 Subjects in the side menu)
The school's subject registry with a full drill-down:

- **All saved subjects** (synced with the server) — add new ones, rename
  (updates every teacher assignment, class allocation and generator rule that
  references them), or delete (removes them everywhere, with a click-again
  confirmation).
- **Click a subject** → every grade it's taught in, the subject teacher per
  grade, and the weekly lessons per grade.
- **Click a grade** → the subject teacher as a **dropdown of all teachers**
  (changing it moves the class to the new teacher everywhere), plus editable
  **singles & doubles** counts — the exact allocation the Timetable Generator
  uses for that class, and removable from the grade entirely.

### Grouped navigation
The long sidebar is collapsed into **six group buttons**: 📊 Overview &
Dashboard, 📝 Exams & Scores, 👥 Students & Staff, 📅 Timetabling & Duty,
📈 Analysis & Reports, 🏫 School Management. Clicking a group opens its
functions as clickable cards in the dashboard area; clicking a card runs the
original menu action (pages, modals, init hooks — all unchanged, and
teacher-mode restrictions still apply). The old full register and the
Save/Export buttons remain in the sidebar as before.

## What did NOT change
- **Database**: same `school.db`, same schema — no migration needed; old and new builds can even read each other's file.
- **API**: every endpoint, parameter, payload and error message is wire-compatible (`/api/db`, `/api/db/save`, `/api/students`, `/api/teachers`, `/api/exams`, `/api/restore`, `/api/login`, `/api/logout`, `/api/register`, `/api/users`, `/api/session`, `/api/log`, `/api/log-history`, `/api/events`). `/api/db/save` responses now additionally carry `"changed": true|false`.
- **Frontend**: all app code is the original, byte for byte — only relocated into `static/js`, `static/css` with the sync engine still injected into `/app`.
- **Offline/LAN use**: bind to all interfaces, works with no internet (Excel export now included).
- Browser-side localStorage keys are the same, so devices upgrade seamlessly.

## Folder layout
```
school_system.py            entry point (run this)
start.bat                   double-click launcher
requirements.txt            fastapi + uvicorn
school.db                   your data (pristine copy)
frontend.html               lean HTML shell (app markup + embedded template)
santapris/                  the server package
  api.py  web.py  records.py  database.py  cache.py
  events.py  audit.py  security.py  config.py
  resources/sync_engine.js  the LAN sync engine injected into /app
static/js, static/css       the frontend code, split for caching
```

## Verified
- Old vs. new servers returned byte-for-byte identical `/api/db`, `/api/students`, `/api/teachers` payloads on the same data.
- 48-check endpoint suite passed (auth, roles, CRUD, restore merge, tombstones, SSE push, concurrency).
- Loaded in a real browser: login, dashboard (598 students / 32 teachers / 1,435 exams), student registers, exam-result cards, live sync — all working.
