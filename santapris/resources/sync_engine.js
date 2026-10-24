
/* ═══════════════════════════════════════════════════════════════
   SANTAPRIS LAN SYNC ENGINE
   - Polls /api/db every 5 s (all tables, all devices stay in sync)
   - On any local save, immediately POSTs full db to /api/db/save
     and broadcasts via SSE so other devices get an instant fullSync
   - Falls back to localStorage cache if server unreachable
   ═══════════════════════════════════════════════════════════════ */
(function(){
'use strict';

/* ── Config ───────────────────────────────────────────────────── */
var POLL_MS       = 5000;   // poll every 5 s (SSE handles instant updates)
var _polling      = false;  // prevents overlapping polls
var _pollTimer    = null;
var _lastServerTs = null;   // last known server update timestamp
var _lastEtag     = null;   // ETag from last /api/db response
var _booted       = false;  // have we done the first load yet?
var _pushTimer    = null;   // debounce handle for pushToServer
var _lastPushAt   = 0;      // wall-clock ts of our most recent local push
var _lastRemoteToast = 0;   // throttle for "new data received" toasts

/* ── Helpers ──────────────────────────────────────────────────── */
function toast(msg, isError){
    var d = document.getElementById('__ss_toast__');
    if(!d){
        d = document.createElement('div');
        d.id = '__ss_toast__';
        d.style.cssText = 'position:fixed;top:70px;right:16px;z-index:2147483647;'
            + 'padding:9px 16px;border-radius:8px;font-size:13px;font-weight:600;'
            + 'color:#fff;box-shadow:0 4px 16px rgba(0,0,0,.4);'
            + 'transition:opacity .6s;pointer-events:none;';
        document.body.appendChild(d);
    }
    d.textContent = msg;
    d.style.background = isError ? '#ef4444' : '#10b981';
    d.style.opacity = '1';
    clearTimeout(d._t);
    d._t = setTimeout(function(){ d.style.opacity='0'; }, 2800);
}

function setStatus(html, color){
    var s = document.getElementById('__ss_status__');
    if(s){ s.innerHTML = html; s.style.color = color||'#f59e0b'; }
}

/* ── Stats handle (live object so external tools can read state) ── */
var _stats = {
    fullSyncs: 0,          // real /api/db fetches that returned data
    noChanges: 0,          // 304 responses (nothing changed)
    refreshes: 0,          // refreshUI() calls
    renders: 0,            // per-page renderer invocations
    pushes: 0,             // successful save POSTs sent
    skippedEchoes: 0,      // db-changed events ignored as our own echo
    lastEtag: null,
    lastTs:   null,
    lastPushAt: 0,
    lastEvent: null
};
window.__syncStats = _stats;

/* Union server rows under LOCAL rows (local wins key conflicts) so an
   in-flight offline submit is never wiped by a snapshot arriving first.
   Server tombstones still win on the next push (the server strips
   tombstoned keys even from full-db upserts), so real deletes can't leak
   back through this merge. */
function _mergeKey(table, it){
    it = it || {};
    if(table === 'students') return 'S|' + (it.admNo || JSON.stringify(it));
    if(table === 'teachers') return 'T|' + (it.id || JSON.stringify(it));
    if(table === 'meanScores') return 'M|' + (it.examId || '') + '|' + (it.grade || '');
    if(table === 'booklist' || table === 'supervisionLists')
        return 'B|' + (it.id || JSON.stringify(it));
    return 'E|' + (it.admNo || '') + '|' + (it.examName || '') + '|' +
        (it.term || '') + '|' + (it.year || '');
}
function _mergeList(table, localArr, serverArr){
    var seen = {}, out = [];
    (localArr || []).forEach(function(it){ seen[_mergeKey(table, it)] = 1; out.push(it); });
    (serverArr || []).forEach(function(it){
        if(!seen[_mergeKey(table, it)]) out.push(it);
    });
    return out;
}
/* ── Apply server data to window.db ──────────────────────────── */
function applyServerData(data){
    if(!data || typeof data !== 'object') return false;
    if(!window.db) window.db = {};
    var _merging = _outboxPending();

    /* Always overwrite from server — server is source of truth.
       NOTE: deletedRecords is server-only metadata (tombstones).
       We intentionally do NOT store it in window.db — it is never
       needed by the UI and including it would bloat localStorage
       (5 MB limit) causing QuotaExceededError / out-of-memory crashes. */
    window.db.students         = _merging
        ? _mergeList('students', window.db.students, data.students)
        : (data.students         || []);
    window.db.teachers         = (_merging
        ? _mergeList('teachers', window.db.teachers, data.teachers)
        : (data.teachers||[])).map(function(t){
        return Object.assign({}, t,
            {assignments: Array.isArray(t.assignments) ? t.assignments : []});
    });
    window.db.exams            = _merging
        ? _mergeList('exams', window.db.exams, data.exams)
        : (data.exams            || []);
    window.db.rawScores        = _merging
        ? _mergeList('rawScores', window.db.rawScores, data.rawScores)
        : (data.rawScores        || []);
    window.db.archivedExams    = _merging
        ? _mergeList('archivedExams', window.db.archivedExams, data.archivedExams)
        : (data.archivedExams    || []);
    window.db.archivedRaw      = _merging
        ? _mergeList('archivedRaw', window.db.archivedRaw, data.archivedRaw)
        : (data.archivedRaw      || []);
    window.db.meanScores       = _merging
        ? _mergeList('meanScores', window.db.meanScores, data.meanScores)
        : (data.meanScores       || []);
    window.db.booklist         = _merging
        ? _mergeList('booklist', window.db.booklist, data.booklist)
        : (data.booklist         || []);
    window.db.supervisionLists = _merging
        ? _mergeList('supervisionLists', window.db.supervisionLists, data.supervisionLists)
        : (data.supervisionLists || []);
    /* counters: take the max per field so IDs never collide or regress */
    (function(){
        var srv = data.counters || {adm:1, tch:1};
        if(!_merging || !window.db.counters){ window.db.counters = srv; return; }
        var out = {}, loc = window.db.counters, seen = {};
        Object.keys(srv).forEach(function(k){ seen[k] = 1; });
        Object.keys(loc).forEach(function(k){ seen[k] = 1; });
        Object.keys(seen).forEach(function(k){
            var a = Number(loc[k]), b = Number(srv[k]);
            out[k] = (isFinite(a) && isFinite(b)) ? Math.max(a, b)
                : (loc[k] !== undefined ? loc[k] : srv[k]);
        });
        window.db.counters = out;
    })();
    /* KV blobs: while unsaved work exists, keep the local copy — it may hold
       edits the server hasn't seen yet (they publish on the next push). */
    function _kv(key, fb){
        if(_merging && window.db[key] !== undefined) return window.db[key];
        return (data[key] !== undefined) ? data[key] : fb;
    }
    window.db.calendarEvents   = _kv('calendarEvents', []);
    window.db.attendance       = _kv('attendance', {});
    window.db.fees             = _kv('fees', {});
    window.db.comms            = _kv('comms', []);
    window.db.dutyRota         = _kv('dutyRota', {});
    window.db.subjects         = _kv('subjects', []);
    window.db.examRegistry     = _kv('examRegistry', []);
    window.db.conversion       = _kv('conversion', {});
    window.db.specialTT        = _kv('specialTT', {});
    window.db.rubrics          = _kv('rubrics', {});
    window.db.publishers       = _kv('publishers', []);
    window.db.bookSubjects     = _kv('bookSubjects', undefined);
    window.db.booklists        = _kv('booklists', []);
    window.db.bookLetterhead   = _kv('bookLetterhead', undefined);
    window.db.tblGrades         = _kv('tblGrades', undefined);
    window.db.tblAllocations    = _kv('tblAllocations', []);
    /* deletedRecords deliberately excluded from window.db */

    /* Warm the localStorage cache — write only UI data, never tombstones */
    try{ localStorage.setItem('santapris_db_v2', JSON.stringify(window.db)); }catch(e){
        /* If localStorage is full, clear stale cache and retry */
        try{ localStorage.removeItem('santapris_db_v2'); }catch(e2){}
    }
    return true;
}

/* ── Refresh ONLY what the user can currently see ──────────────
   Re-rendering every page on every sync is what froze the UI on
   phones: a single save triggered a full re-render of ALL pages.
   We instead re-render the active page (plus the always-visible
   dashboard counters) so a background change is cheap on-device. */
var PAGE_RENDERERS = {
    'students':       ['renderStudentsTable'],
    'teachers':       ['renderTeachersTable'],
    'exams':          ['renderExamsTable'],
    'classLists':     ['renderClassList'],
    'reports':        ['renderReports'],
    'booklist':       ['renderBooklist'],
    'subjectAnalysis':['renderSubjectAnalysis'],
    'timetable':      ['initTimetablePage'],
    'classTeachers':  ['renderClassTeachersPage'],
    'supervision':    ['renderSupervisionPage'],
    'editScores':     ['renderEditScoresTable'],
    'exports':        ['populatePDFDropdowns'],
    'topStudents':    ['renderTopStudentsPage'],
    'hallOfFame':     ['renderHallOfFame'],
    'performanceHeatmap':['renderHeatmap'],
    'gradeTrends':    ['renderGradeTrends'],
    'mostImproved':   ['renderMostImproved'],
    'genderAnalysis': ['renderGenderAnalysis'],
    'rubricDistribution':['renderRubricDist'],
    'academicCalendar':  ['renderCalendar'],
    'attendance':     ['renderAttendance'],
    'feeTracker':     ['renderFeeTracker'],
    'parentComms':    ['renderParentComms'],
    'messageGen':     [],
    /* Form pages must NOT be re-rendered on sync — that clears in-progress
       input. updateCounts (badges) is handled globally above. */
    'addExam':        [],
    'addStudent':     [],
    'addTeacher':     [],
    'studentProgress':[],
    'dutyrota':       [],
    'subjects':       [],
    'teacherWorkload':['renderTeacherWorkload'],
    'dashboard':      ['renderDashboard','renderDashAlerts']
};
function refreshUI(){
    /* Always refresh the shared counters (nav/side badges, dash totals). */
    var pageId = 'dashboard';
    var openPages = document.querySelectorAll('.modal-page.open');
    if(openPages && openPages.length){
        var id = (openPages[0].id || '');
        pageId = id.replace(/^page-/,'');
    }
    if(typeof updateCounts === 'function'){
        try{ updateCounts(); }catch(e){}
    }
    var fns = PAGE_RENDERERS[pageId] || ['renderDashboard'];
    for(var i=0;i<fns.length;i++){
        if(typeof window[fns[i]] === 'function'){
            _stats.renders++;
            try{ window[fns[i]](); }catch(e){}
        }
    }
    _stats.refreshes++;
    _stats.lastTs   = _lastServerTs;
    _stats.lastEvent = 'refreshUI('+pageId+') at '+(new Date()).toISOString();
}

/* ── Full sync: fetch entire DB from server ───────────────────── */
async function fullSync(quiet){
    if(_polling) return;
    _polling = true;
    try{
        /* Outbox first: unsaved local work (offline saves, reload-before-ack)
           is pushed BEFORE reading the server. Applying a server snapshot
           while our submit is still un-acked would wipe just-entered scores
           (and the retry would then push the wiped state). If the push fails
           we keep everything local and try again later. */
        if(_outboxPending()){
            var flushed = await _doPush();
            if(flushed === true){
                _outboxClear();   /* fall through to the poll below */
            } else if(flushed === false){
                setStatus('&#9679; Server unreachable', '#ef4444');
                _schedulePushRetry();
                _polling = false;
                return;
            }
            /* 'noop' (nothing worth sending) → fall through to normal poll */
        }
        var headers = {'cache':'no-store'};
        var fetchOpts = {cache:'no-store', headers:{}};
        /* Send ETag — server returns 304 if nothing changed (zero bandwidth) */
        if(_lastEtag) fetchOpts.headers['If-None-Match'] = _lastEtag;

        var r = await fetch('/api/db', fetchOpts);

        /* 304 = nothing changed — skip everything, just confirm live */
        if(r.status === 304){
            _stats.noChanges++;
            _stats.lastEtag = _lastEtag;
            /* Resilience: if our local window.db is empty (cleared cache /
               quota eviction) a 304 would keep us stuck on empty forever —
               drop the ETag and force one full re-read. */
            if(!(window.db && (window.db.students||[]).length)){
                _lastEtag = null;
                _polling = false;
                setTimeout(function(){ fullSync(true); }, 50);
                return;
            }
            _booted = true;
            window.__syncReady = true;
            setStatus('&#9679; Live', '#10b981');
            _polling = false;
            return;
        }
        if(!r.ok) throw new Error('HTTP '+r.status);

        /* Store new ETag for next poll */
        var newEtag = r.headers.get('ETag');
        if(newEtag) _lastEtag = newEtag;
        _stats.fullSyncs++;
        _stats.lastEtag = _lastEtag;

        var data = await r.json();

        /* Resurrect-guard: local exam/raw rows missing server-side are
           unsent work (saved before the sync hook ran, lost dirty flag,
           ancient client code) — put them back and mark the outbox so they
           push. Runs on first boot and whenever the outbox is dirty, so a
           server-refused row can't loop forever: its push ACKs (skipped
           rows still count as stored) and clears the flag. Server
           tombstones refuse deletes/clears/archives on push, so real
           removals can never leak back through here. */
        var _needGuard = !_booted || _outboxPending();
        var _preKeys = null;
        if(_needGuard && window.db){
            _preKeys = {};
            [['exams', window.db.exams], ['rawScores', window.db.rawScores]].forEach(function(pair){
                var set = {};
                (pair[1] || []).forEach(function(it){
                    set[_mergeKey(pair[0], it)] = it;
                });
                _preKeys[pair[0]] = set;
            });
        }

        /* Check server timestamp to avoid redundant UI refreshes */
        var ts = data._ts || null;
        var changed = (ts === null) || (ts !== _lastServerTs);
        _lastServerTs = ts;

        if(applyServerData(data)){
            if(_needGuard && _preKeys){
                var _revived = 0;
                [['exams', 'exams'], ['rawScores', 'rawScores']].forEach(function(pair){
                    var table = pair[0], key = pair[1];
                    var srv = {};
                    (data[key] || []).forEach(function(it){ srv[_mergeKey(table, it)] = 1; });
                    Object.keys(_preKeys[table]).forEach(function(k){
                        if(!srv[k]){
                            window.db[table].push(_preKeys[table][k]);
                            _revived++;
                        }
                    });
                });
                if(_revived){
                    _outboxSet();
                    try{ localStorage.setItem('santapris_db_v2', JSON.stringify(window.db)); }catch(e){}
                }
            }
            /* Re-bind the app's own `db` variable to window.db. The app's
               loadDB() runs at boot and may have raced this sync (falling
               back to the empty embedded db) — re-running it here re-points
               it at the freshly loaded server data. */
            try { if(typeof loadDB === 'function') loadDB(); } catch(e){}
            if(changed || !_booted){
                refreshUI();
                /* Announce data arriving from other devices (scores or any new
                   data submitted elsewhere). Throttled so a burst of saves
                   shows one notice, and never on first boot. */
                if(changed && _booted && (Date.now() - _lastRemoteToast > 15000)){
                    _lastRemoteToast = Date.now();
                    toast('🔄 New data received — '+
                        (window.db.students||[]).length+' students, '+
                        (window.db.exams||[]).length+' exam records', false);
                }
            }
            _booted = true;
            window.__syncReady = true;
            setStatus('&#9679; Live', '#10b981');
        }
    }catch(e){
        console.warn('[Sync] fullSync error:', e);
        setStatus('&#9679; Server unreachable', '#ef4444');
        if(!_booted){
            try{
                var cached = localStorage.getItem('santapris_db_v2');
                if(cached){ applyServerData(JSON.parse(cached)); try { if(typeof loadDB === 'function') loadDB(); } catch(e){} refreshUI(); _booted=true; }
            }catch(e2){}
        }
    }finally{
        _polling = false;
    }
}

/* ── Save full DB to server (debounced — batches rapid saves) ─── */
/* Retry policy: a failed push (offline moment, busy server, tunnel hiccup)
   is retried with backoff until it lands — a single failed POST must never
   strand submitted data on one device. The user is told once per episode. */
var _pushRetryTimer = null;
var _pushFails = 0;
var _pushNotified = false;
var _RETRY_MS = [2000, 15000, 60000];
window.__syncPending = false;

/* ── Offline outbox ──────────────────────────────────────────────
   Submitted scores must survive bad network AND reloads. Every local save
   marks the outbox dirty (persisted in localStorage so a reload-before-ack
   keeps it); only a server ACK clears it. While dirty, polls never
   overwrite local work, and incoming snapshots merge under local rows. */
var _OUTBOX_KEY = 'santapris_outbox';
function _outboxSet(){
    window.__dirty = true;
    try{ localStorage.setItem(_OUTBOX_KEY, '1'); }catch(e){}
}
function _outboxClear(){
    window.__dirty = false;
    window.__syncPending = false;
    try{ localStorage.removeItem(_OUTBOX_KEY); }catch(e){}
}
function _outboxPending(){
    if(window.__dirty) return true;
    try{ return localStorage.getItem(_OUTBOX_KEY) === '1'; }catch(e){ return false; }
}

function _schedulePushRetry(){
    if(_pushRetryTimer) return;  // one retry chain at a time
    var delay = _RETRY_MS[Math.min(_pushFails, _RETRY_MS.length - 1)];
    window.__syncPending = true;
    _pushRetryTimer = setTimeout(function(){
        _pushRetryTimer = null;
        _doPush();
    }, delay);
}

async function _doPush(){
    if(!window.db) return 'noop';
    var studentCount = (window.db.students||[]).length;
    var teacherCount = (window.db.teachers||[]).length;
    if(studentCount === 0 && teacherCount === 0){ _outboxClear(); return 'noop'; }
    try{
        /* Build payload without deletedRecords — tombstones are server-only.
           Sending them back would hand the client authority over the tombstone
           table, which is unsafe and wastes bandwidth. */
        var payload = {};
        var keys = Object.keys(window.db);
        for(var i=0;i<keys.length;i++){
            if(keys[i] !== 'deletedRecords') payload[keys[i]] = window.db[keys[i]];
        }
        var r = await fetch('/api/db/save',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify(payload),
            cache:'no-store'
        });
        if(r.ok){
            /* Staged re-add intent (_forceSubjects / _clearExamTombs) rides on
               window.db so this push carries it; the server consumes it while
               processing. Drop it NOW on ack — a later retry must never carry
               a STALE copy (its 1500ms+ cleanup may already have fired): a
               retry without it would strip re-added subjects / skip renamed
               merges server-side, silently erasing just-saved scores. */
            try{
                if(window.db){
                    delete window.db._forceSubjects;
                    delete window.db._clearExamTombs;
                }
            }catch(e){}
            /* Fast-path: the server tells us the new ts/etag so the next poll
               can 304 instead of re-downloading + re-rendering what we just
               saved. Fall back to invalidating the ETag if the response lacks
               them (e.g. older server build). */
            var _saveResp = null;
            try{ _saveResp = await r.json(); }catch(e){}
            if(_saveResp && _saveResp.etag && _saveResp.ts){
                _lastEtag     = _saveResp.etag;
                _lastServerTs = _saveResp.ts;
            } else {
                _lastEtag = null;
            }
            /* The server skipped records of archived/renamed exams: tell the
               user once in a while instead of silently dropping them. */
            if(_saveResp && _saveResp.skipped_names > 0 &&
               (Date.now() - _lastRemoteToast > 60000)){
                _lastRemoteToast = Date.now();
                toast('⚠️ ' + _saveResp.skipped_names + ' record(s) not saved — ' +
                      'that exam was archived or renamed. Refresh to reload.', true);
            }
            _stats.pushes++;
            _stats.lastEtag = _lastEtag;
            _stats.lastTs   = _lastServerTs;
            _pushFails = 0;
            _pushNotified = false;
            _outboxClear();   // server holds everything — polls may apply again
            return true;
        }
        throw new Error('HTTP ' + r.status);
    }catch(e){
        console.warn('[Sync] push failed, will retry:', e);
        _pushFails++;
        _stats.pushFails = (_stats.pushFails || 0) + 1;
        if(!_pushNotified){
            _pushNotified = true;
            toast('Saved on this device — syncing… (will retry automatically)', true);
        }
        _schedulePushRetry();
        return false;
    }
}

function pushToServer(){
    /* Debounce: if multiple saves fire within 400 ms, only one POST goes out.
       A new save supersedes any pending retry (its payload includes everything). */
    if(_pushTimer) clearTimeout(_pushTimer);
    if(_pushRetryTimer){ clearTimeout(_pushRetryTimer); _pushRetryTimer = null; }
    _outboxSet();   // local work exists from here until the server ACKs it
    _lastPushAt = Date.now();
    _stats.lastPushAt = _lastPushAt;
    _pushTimer = setTimeout(_doPush, 400);
    return Promise.resolve();
}

/* Flush a pending push when connectivity returns or the tab regains focus. */
function flushPendingPush(){
    if(window.__syncPending && !_pushRetryTimer) _doPush();
    fullSync(true);
}

/* ── Hook window.saveDB so every local save goes to server ───── */
function hookSaveDB(){
    /* Try immediately, then retry every 200ms until the function exists */
    if(typeof window.saveDB === 'function' && !window.saveDB.__srv_hooked){
        var _orig = window.saveDB;
        window.saveDB = async function(){
            var result = _orig.apply(this, arguments);
            await pushToServer();   /* await so callers that await saveDB() get confirmation */
            return result;
        };
        window.saveDB.__srv_hooked = true;
        /* Expose for the frontend's own __serverSaveDB hook */
        window.__serverSaveDB = pushToServer;
        console.log('[Sync] saveDB hooked');
    } else if(!window.saveDB || !window.saveDB.__srv_hooked){
        setTimeout(hookSaveDB, 200);
    }
}

/* ── Polling loop ─────────────────────────────────────────────── */
function startPolling(){
    if(_pollTimer) clearInterval(_pollTimer);
    _pollTimer = setInterval(function(){ fullSync(true); }, POLL_MS);
}

/* ── Update detector: a tab left open through an upgrade keeps running
   stale code (and stale layouts). The server's /health carries a build id
   that changes with any shipped file — when it moves, offer one-tap reload. */
window.__buildSeen = null;
function _showUpdateBanner(){
    if(document.getElementById('__updBanner')) return;
    var b = document.createElement('div');
    b.id = '__updBanner';
    b.style.cssText = 'position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:10001;' +
        'background:linear-gradient(135deg,#1a5fa8,#3a9bff);color:#fff;font-weight:800;font-size:13px;' +
        'padding:11px 18px;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.5);cursor:pointer;white-space:nowrap;';
    b.textContent = '🔄 New version available — tap here to reload';
    b.onclick = function(){ location.reload(); };
    document.body.appendChild(b);
    if(typeof toast === 'function') toast('🔄 App updated — tap the banner to reload');
}
function _checkBuild(){
    fetch('/health', { cache: 'no-store' }).then(function(r){ return r.json(); }).then(function(d){
        if(!d || !d.build) return;
        if(!window.__buildSeen){ window.__buildSeen = d.build; return; }
        if(d.build !== window.__buildSeen) _showUpdateBanner();
    }).catch(function(){});
}
setInterval(_checkBuild, 60000);
setTimeout(_checkBuild, 8000);

/* ── SSE: instant push when another device saves ─────────────── */
var _es = null;
function setupSSE(){
    if(_es){ try{_es.close();}catch(e){} }
    _es = new EventSource('/api/events');
    _es.onopen = function(){ setStatus('&#9679; Live', '#10b981'); };
    _es.addEventListener('db-changed', function(e){
        try{
            var ev = JSON.parse(e.data);
            /* Don't react to our own saves (source === self) */
            if(ev._self) return;
            /* Self-echo guard: the server broadcasts every save to ALL clients
               (it cannot tell who wrote). The device that just saved already
               knows its own state, so ignore echoes that arrive shortly after
               our own push — the 8s poll with the freshly learned ETag will
               304 instead of re-downloading + re-rendering. */
            if(Date.now() - _lastPushAt < 2000){
                _stats.skippedEchoes++;
                return;
            }
            console.log('[Sync] SSE db-changed from another device — syncing');
            fullSync(false);
        }catch(err){}
    });
    _es.onerror = function(){
        setStatus('&#9679; Reconnecting\u2026', '#f59e0b');
        setTimeout(setupSSE, 5000);
        try{_es.close();}catch(e){}
    };
}

/* ── Session cookie → localStorage bridge (auth compatibility) ── */
async function syncSession(){
    try{
        var r = await fetch('/api/session', {cache:'no-store'});
        if(!r.ok) return;
        var s = await r.json();
        if(!s.username) return;
        var users={};
        try{ users=JSON.parse(localStorage.getItem('santapris_users_v1')||'{}'); }catch(e){}
        if(!users[s.username]){
            users[s.username]={username:s.username,passhash:'__srv__',
                isAdmin:s.role==='admin',createdAt:new Date().toISOString().slice(0,10)};
            localStorage.setItem('santapris_users_v1', JSON.stringify(users));
        }
        localStorage.setItem('santapris_session_v1', JSON.stringify({
            username:s.username,isAdmin:s.role==='admin',loginAt:new Date().toISOString()}));
    }catch(e){}
}

/* ── UI Controls ──────────────────────────────────────────────── */
function buildUI(){
    /* Status pill */
    if(!document.getElementById('__ss_status__')){
        var status = document.createElement('div');
        status.id = '__ss_status__';
        status.style.cssText = 'position:fixed;top:16px;right:16px;z-index:2147483646;'
            +'background:#0f172a;color:#f59e0b;border:1px solid #f59e0b;'
            +'padding:4px 10px;border-radius:20px;font-size:10px;font-family:monospace;'
            +'box-shadow:0 2px 8px rgba(0,0,0,.4);cursor:default;';
        status.innerHTML = '&#9679; Connecting';
        document.body.appendChild(status);
    }

    /* ── Sync & System tools — no longer floating buttons.
          Arranged vertically inside the menu drawer (mobile) and the
          persistent sidebar (desktop).  The Activity Log <panel> remains a
          floating overlay, toggled from the drawer items. ── */
    var logPanelCreated = false;
    function ensureLogPanel(){
        if(logPanelCreated) return;
        logPanelCreated = true;
        if(document.getElementById('__ss_logpanel__')) return;
        var lp = document.createElement('div');
        lp.id = '__ss_logpanel__';
        lp.style.cssText = 'display:none;position:fixed;bottom:52px;right:0;width:660px;'
            +'height:360px;background:#0f172a;border:1px solid #334155;'
            +'border-radius:8px 0 0 0;z-index:2147483645;overflow:auto;'
            +'box-shadow:-4px -4px 20px rgba(0,0,0,.5);';
        lp.innerHTML = '<div style="padding:8px 12px;background:#1e293b;border-bottom:1px solid #334155;">'
            +'<span style="color:#38bdf8;font-weight:700;">Activity Log</span>'
            +'<button onclick="document.getElementById(\'__ss_logpanel__\').style.display=\'none\'" '
            +'style="float:right;background:#ef4444;color:#fff;border:none;padding:2px 8px;border-radius:4px;cursor:pointer;">\u2715</button>'
            +'</div>'
            +'<table style="width:100%;font-size:11px;border-collapse:collapse;">'
            +'<thead><tr style="background:#1e293b;">'
            +'<th style="text-align:left;padding:5px;">Time</th>'
            +'<th style="text-align:left;padding:5px;">User</th>'
            +'<th style="text-align:left;padding:5px;">Action</th>'
            +'<th style="text-align:left;padding:5px;">Detail</th>'
            +'</tr></thead>'
            +'<tbody id="__ss_logtbody__"></tbody>'
            +'</table>';
        document.body.appendChild(lp);
    }

    /* Build the vertical tool stack into a sidebar host.  Each host gets its
       own button ids (suffix) so mobile drawer + desktop sidebar coexist. */
    function buildToolStack(host, s){
        var sec = document.createElement('div');
        sec.className = 'sidebar-section';
        sec.style.cssText = 'border-top:1px solid var(--border);padding-top:12px;';
        var label = document.createElement('div');
        label.className = 'sidebar-label';
        label.style.cssText = 'color:rgba(56,189,248,.85)';
        label.textContent = '\u27F3 Sync & System';
        sec.appendChild(label);

        /* Force Sync */
        var btn = document.createElement('div');
        btn.id = '__ss_syncbtn__'+s;
        btn.className = 'nav-item';
        btn.style.cssText = 'cursor:pointer;color:#10b981;';
        btn.innerHTML = '<span class="icon">\u27F3</span><span class="ss-lbl">Force Sync</span>';
        btn.onclick = function(){
            var lab = btn.querySelector('.ss-lbl');
            lab.textContent = 'Syncing\u2026';
            fullSync(false).then(function(){ lab.textContent = 'Force Sync'; });
            if(window.closeMobileMenu) closeMobileMenu();
        };
        sec.appendChild(btn);

        /* Restore Backup */
        var rb = document.createElement('div');
        rb.id = '__ss_restorebtn__'+s;
        rb.className = 'nav-item';
        rb.style.cssText = 'cursor:pointer;color:#f59e0b;';
        rb.innerHTML = '<span class="icon">\u2B06</span>Restore Backup';
        rb.onclick = function(){
            if(window.closeMobileMenu) closeMobileMenu();
            var inp = document.createElement('input');
            inp.type='file'; inp.accept='.json';
            inp.onchange = async function(e){
                var file = e.target.files&&e.target.files[0];
                if(!file) return;
                var text = await file.text();
                try{
                    var backup = JSON.parse(text);
                    toast('Restoring (merging)\u2026', false);
                    var resp = await fetch('/api/restore',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        body:JSON.stringify({data:backup})
                    });
                    var result = await resp.json();
                    if(result.ok){
                        toast(result.message, false);
                        _lastServerTs = null;
                        await fullSync(false);
                    } else {
                        toast('Restore failed: '+(result.error||''), true);
                    }
                }catch(err){
                    toast('Invalid backup file: '+err.message, true);
                }
            };
            inp.click();
        };
        sec.appendChild(rb);

        /* Activity Log */
        var lb = document.createElement('div');
        lb.id = '__ss_logbtn__'+s;
        lb.className = 'nav-item';
        lb.style.cssText = 'cursor:pointer;color:#38bdf8;';
        lb.innerHTML = '<span class="icon">\uD83D\uDCCB</span>Activity Log';
        lb.onclick = async function(){
            if(window.closeMobileMenu) closeMobileMenu();
            ensureLogPanel();
            var p = document.getElementById('__ss_logpanel__');
            if(!p) return;
            var show = p.style.display==='none';
            p.style.display = show?'block':'none';
            if(show){
                try{
                    var r = await fetch('/api/log-history?limit=100');
                    var logs = await r.json();
                    var tbody = document.getElementById('__ss_logtbody__');
                    if(!tbody) return;
                    var html='';
                    logs.forEach(function(ev){
                        var c = ev.action==='save-student'?'#4ade80'
                              : ev.action==='delete-student'?'#f87171'
                              : ev.action==='restore-backup'?'#f59e0b':'#a78bfa';
                        html+='<tr>'
                            +'<td style="padding:2px 6px;font-size:10px;color:#94a3b8">'+(ev.ts||'').slice(11,19)+'</td>'
                            +'<td style="padding:2px 6px;color:#38bdf8">'+(ev.username||'')+'</td>'
                            +'<td style="padding:2px 6px;color:'+c+'">'+(ev.action||'')+'</td>'
                            +'<td style="padding:2px 6px;max-width:200px;overflow:hidden;color:#e2e8f0">'+(ev.detail||'').substring(0,50)+'</td>'
                            +'</tr>';
                    });
                    tbody.innerHTML = html;
                }catch(e){}
            }
        };
        sec.appendChild(lb);

        host.appendChild(sec);
    }

    /* Mobile: menu drawer (#mobileSidebar). Desktop: persistent left sidebar. */
    var mob = document.getElementById('mobileSidebar');
    if(mob && !document.getElementById('__ss_syncbtn__m'))
        buildToolStack(mob, 'm');
    var desk = document.querySelector('aside.sidebar');
    if(desk && !document.getElementById('__ss_syncbtn__dt'))
        buildToolStack(desk, 'dt');
    /* create the shared Activity Log panel once (drawer items above toggle it) */
    ensureLogPanel();
}

/* ── Boot sequence ────────────────────────────────────────────── */
async function boot(){
    await syncSession();

    /* 1. Get server data BEFORE the frontend's loadDB() reads localStorage */
    await fullSync(true);

    /* 2. Hook saveDB so every future save also goes to server */
    hookSaveDB();

    /* 3. Start polling + SSE */
    startPolling();
    setupSSE();

    /* 4. Tab visibility + connectivity: re-sync and flush any pending
       push when the user switches back or the network returns. */
    document.addEventListener('visibilitychange', function(){
        if(document.visibilityState==='visible') flushPendingPush();
    });
    window.addEventListener('online', function(){ flushPendingPush(); });

    /* 5b. sendBeacon safety net — fires even if the user closes/refreshes the tab
       before the async pushToServer resolves.  navigator.sendBeacon is specifically
       designed for reliable last-moment sends and does not block page unload. */
    window.addEventListener('beforeunload', function(){
        if(window.db && window.__syncReady){
            var studentCount = (window.db.students||[]).length;
            var teacherCount = (window.db.teachers||[]).length;
            if(studentCount > 0 || teacherCount > 0){
                try{
                    navigator.sendBeacon('/api/db/save',
                        new Blob([JSON.stringify(window.db)],
                            {type:'application/json'}));
                }catch(e){}
            }
        }
    });

    /* 5. Build the UI overlay */
    buildUI();

    console.log('[Sync] Santapris LAN sync engine ready '
        + '(polling every '+POLL_MS+'ms + SSE push)');
}

/* Run as early as possible — before DOMContentLoaded if body already exists,
   otherwise wait for it. This ensures window.db is populated before the
   frontend's own boot code calls loadDB(). */
/* Minimal handle for automated checks (dirty flag, push, poll, merge). */
window.__syncApi = {
    push: function(){ return pushToServer(); },
    sync: function(){ return fullSync(true); },
    apply: function(d){ return applyServerData(d); },
    dirty: function(){ return _outboxPending(); },
    clear: function(){ _outboxClear(); }
};

if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', boot, {once:true, capture:true});
} else {
    boot();
}

})();
