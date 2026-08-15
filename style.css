/* ============================================================
   DESIGN SYSTEM — "Console" identity
   ============================================================ */
:root {
    --bg: #0c0f12;
    --bg-raised: #14181d;
    --bg-sunken: #08090b;
    --surface: #181d23;
    --border: #262c33;
    --border-strong: #3a424c;
    --text: #eef1f4;
    --text-dim: #8b95a1;
    --text-faint: #565f6a;

    --amber: #ff8a1e;
    --amber-dim: #7a4413;
    --teal: #2dd4bf;
    --teal-dim: #0f3d38;
    --red: #ef4444;
    --red-dim: #3d1616;
    --blue: #4f9dff;
    --green: #22c55e;
    --green-dim: #14532d;
    --purple: #a855f7;
    --purple-dim: #4c1d95;

    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 18px;

    --font-display: 'Cairo', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;

    --ease: cubic-bezier(0.16, 1, 0.3, 1);
}
* { margin: 0; padding: 0; box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
    font-family: var(--font-display);
    background: var(--bg);
    background-image:
        linear-gradient(180deg, rgba(255,138,30,0.05), transparent 200px);
    color: var(--text);
    min-height: 100vh;
    padding-bottom: 88px;
    -webkit-font-smoothing: antialiased;
}
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
}
button, input, select, textarea { font-family: inherit; }
button:focus-visible, a:focus-visible, input:focus-visible, select:focus-visible {
    outline: 2px solid var(--amber); outline-offset: 2px;
}
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 10px; }
.mono { font-family: var(--font-mono); font-variant-numeric: tabular-nums; }

/* ---------- screens ---------- */
.screen { display: none; min-height: 100vh; }
.screen.active { display: block; }

.centered-screen { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; text-align: center; }
.brand-mark { font-family: var(--font-mono); font-size: 13px; letter-spacing: 0.2em; color: var(--amber); text-transform: uppercase; margin-bottom: 6px; }
.brand-title { font-size: 26px; font-weight: 800; margin-bottom: 28px; }

.card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px; width: 100%; max-width: 380px; }

.field { margin-bottom: 14px; text-align: right; }
.field label { display: block; font-size: 12.5px; color: var(--text-dim); margin-bottom: 6px; font-weight: 600; }
.field input, .field select {
    width: 100%; padding: 13px 14px; background: var(--bg-sunken); border: 1px solid var(--border);
    border-radius: var(--radius-sm); color: var(--text); font-size: 15px; outline: none; transition: border-color 0.2s var(--ease);
}
.field input:focus, .field select:focus { border-color: var(--amber); }
.field input.mono { letter-spacing: 0.08em; }

.btn {
    border: none; border-radius: var(--radius-sm); font-weight: 700; font-size: 14.5px; cursor: pointer;
    padding: 13px 20px; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    transition: transform 0.15s var(--ease), background 0.15s var(--ease), opacity 0.15s var(--ease), box-shadow .15s var(--ease);
    touch-action: manipulation; color: var(--bg);
}
.btn:active { transform: scale(0.97); }
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-block { width: 100%; }
.btn-amber { background: var(--amber); box-shadow: 0 4px 18px rgba(255,138,30,0.25); }
.btn-amber:hover { box-shadow: 0 6px 24px rgba(255,138,30,0.4); }
.btn-teal { background: var(--teal); }
.btn-red { background: var(--red); color: #fff; }
.btn-ghost { background: transparent; border: 1px solid var(--border-strong); color: var(--text); }
.btn-ghost:hover { background: var(--surface); }
.btn-sm { padding: 8px 14px; font-size: 13px; }
.btn-danger-sm { background: var(--red); color: #fff; padding: 6px 12px; font-size: 12px; border-radius: var(--radius-sm); border: none; cursor: pointer; }
.btn-danger-sm:hover { opacity: 0.8; }
.btn-mode-single { background: var(--amber); color: var(--bg); }
.btn-mode-multi { background: var(--teal); color: var(--bg); }
.btn-mode-single:hover { box-shadow: 0 6px 24px rgba(255,138,30,0.4); }
.btn-mode-multi:hover { box-shadow: 0 6px 24px rgba(45,212,191,0.4); }
.btn-cancel { background: var(--red); color: #fff; }
.btn-cancel:hover { opacity: 0.85; }
.btn-transfer { background: var(--blue); color: #fff; }
.btn-transfer:hover { opacity: 0.85; }

.error-text { color: var(--red); font-size: 13px; margin-top: 10px; min-height: 16px; }

/* ---------- app shell ---------- */
.app-header {
    position: sticky; top: 0; z-index: 50; background: rgba(12,15,18,0.92); backdrop-filter: blur(14px);
    border-bottom: 1px solid var(--border); padding: 14px 16px; display: flex; align-items: center; justify-content: space-between;
}
.app-header .biz-name { font-weight: 800; font-size: 16px; }
.app-header .biz-sub { font-size: 11px; color: var(--text-dim); font-family: var(--font-mono); }
.header-actions { display: flex; gap: 8px; align-items: center; }
.icon-btn { width: 38px; height: 38px; border-radius: var(--radius-sm); background: var(--surface); border: 1px solid var(--border); color: var(--text-dim); display: flex; align-items: center; justify-content: center; cursor: pointer; }
.icon-btn:hover { color: var(--text); border-color: var(--border-strong); }

.live-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--teal); box-shadow: 0 0 0 3px var(--teal-dim); animation: pulseLive 1.8s infinite; }
@keyframes pulseLive { 0%,100% { opacity: 1; } 50% { opacity: 0.45; } }

.view { display: none; padding: 16px; max-width: 640px; margin: 0 auto; }
.view.active { display: block; animation: viewIn 0.25s var(--ease); }
@keyframes viewIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

.section-title { font-size: 13px; font-weight: 700; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.05em; margin: 20px 0 10px; }
.section-title:first-child { margin-top: 0; }

/* ---------- dashboard ---------- */
.stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px; }
.stat-card .stat-label { font-size: 11.5px; color: var(--text-dim); font-weight: 600; margin-bottom: 8px; }
.stat-card .stat-value { font-family: var(--font-mono); font-size: 24px; font-weight: 700; }
.stat-card.accent { border-color: var(--amber-dim); background: linear-gradient(160deg, rgba(255,138,30,0.09), transparent); }
.stat-card.accent .stat-value { color: var(--amber); }

/* ---------- station cards ---------- */
.station-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.station-card {
    background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md);
    padding: 14px; cursor: pointer; position: relative; overflow: hidden; transition: transform 0.15s var(--ease), border-color 0.15s var(--ease);
    display: flex; flex-direction: column; gap: 10px; min-height: 108px;
}
.station-card:active { transform: scale(0.97); }
.station-card::before { content: ''; position: absolute; top: 0; right: 0; bottom: 0; width: 3px; background: var(--border-strong); }
.station-card.occupied { border-color: var(--teal-dim); }
.station-card.occupied::before { background: var(--teal); box-shadow: 0 0 12px rgba(45,212,191,0.6); }
.station-num { font-weight: 800; font-size: 15px; }
.station-status { font-size: 11px; color: var(--text-dim); font-weight: 600; }
.station-card.occupied .station-status { color: var(--teal); }
.station-timer { font-family: var(--font-mono); font-size: 20px; font-weight: 700; color: var(--teal); }
.station-timer.countdown { color: var(--amber); }
.station-timer.countdown-warning { color: var(--red); animation: blinkWarning 1s infinite; }
@keyframes blinkWarning { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
.station-rate { font-family: var(--font-mono); font-size: 12px; color: var(--text-faint); margin-top: auto; }
.station-mode-badge { font-size: 10px; padding: 2px 8px; border-radius: 10px; font-weight: 700; display: inline-block; }

/* ---------- lists ---------- */
.list-row { display: flex; align-items: center; justify-content: space-between; padding: 13px 4px; border-bottom: 1px solid var(--border); }
.list-row:last-child { border-bottom: none; }
.list-row .row-title { font-weight: 600; font-size: 14.5px; }
.list-row .row-sub { font-size: 12px; color: var(--text-dim); margin-top: 2px; }
.list-row .row-value { font-family: var(--font-mono); font-weight: 700; }
.list-row .row-actions { display: flex; gap: 6px; align-items: center; }

.panel { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 6px 14px; }

/* ---------- badges ---------- */
.badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 20px; font-size: 11.5px; font-weight: 700; }
.badge-teal { background: var(--teal-dim); color: var(--teal); }
.badge-red { background: var(--red-dim); color: #ff8f8f; }
.badge-amber { background: var(--amber-dim); color: var(--amber); }
.badge-green { background: var(--green-dim); color: var(--green); }
.badge-purple { background: var(--purple-dim); color: var(--purple); }

.badge-mode-single { background: var(--amber-dim); color: var(--amber); }
.badge-mode-multi { background: var(--teal-dim); color: var(--teal); }
.badge-timer-up { background: var(--teal-dim); color: var(--teal); }
.badge-timer-down { background: var(--amber-dim); color: var(--amber); }

/* ---------- FAB ---------- */
.fab { position: fixed; bottom: 96px; left: 16px; width: 52px; height: 52px; border-radius: 50%; background: var(--amber); color: var(--bg); border: none; font-size: 20px; box-shadow: 0 8px 22px rgba(255,138,30,0.4); z-index: 60; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.fab:active { transform: scale(0.92); }

/* ---------- bottom nav ---------- */
.bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; background: rgba(12,15,18,0.95); backdrop-filter: blur(16px); border-top: 1px solid var(--border); display: flex; z-index: 70; padding: 6px 4px calc(6px + env(safe-area-inset-bottom)); max-width: 640px; margin: 0 auto; }
.nav-btn { flex: 1; background: none; border: none; color: var(--text-faint); display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 8px 4px; font-size: 10px; font-weight: 700; border-radius: var(--radius-sm); cursor: pointer; }
.nav-btn i { font-size: 18px; }
.nav-btn.active { color: var(--amber); }

/* ---------- modal ---------- */
.overlay { display: none; position: fixed; inset: 0; background: rgba(5,6,8,0.82); backdrop-filter: blur(6px); z-index: 200; align-items: flex-end; justify-content: center; }
.overlay.show { display: flex; }
.sheet { background: var(--bg-raised); border: 1px solid var(--border); border-top-left-radius: var(--radius-lg); border-top-right-radius: var(--radius-lg); width: 100%; max-width: 480px; max-height: 88vh; overflow-y: auto; padding: 22px 18px calc(22px + env(safe-area-inset-bottom)); animation: sheetUp 0.3s var(--ease); }
@keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
.sheet-handle { width: 36px; height: 4px; background: var(--border-strong); border-radius: 4px; margin: 0 auto 16px; }
.sheet-title { font-size: 17px; font-weight: 800; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; }
.sheet-title .close-x { color: var(--text-dim); background: none; border: none; font-size: 18px; cursor: pointer; }

/* ---------- payment method selector ---------- */
.payment-options {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin: 12px 0;
}
.payment-option {
    background: var(--bg-sunken);
    border: 2px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 14px 8px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s var(--ease);
    font-weight: 600;
    font-size: 13px;
}
.payment-option i { font-size: 22px; display: block; margin-bottom: 4px; }
.payment-option.selected {
    border-color: var(--amber);
    background: var(--amber-dim);
    color: var(--amber);
}
.payment-option:hover { border-color: var(--border-strong); }

/* ---------- mode selection ---------- */
.mode-selector {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin: 12px 0;
}
.mode-option {
    background: var(--bg-sunken);
    border: 2px solid var(--border);
    border-radius: var(--radius-md);
    padding: 16px 12px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s var(--ease);
}
.mode-option:hover { border-color: var(--border-strong); }
.mode-option.selected-single { border-color: var(--amber); background: var(--amber-dim); }
.mode-option.selected-multi { border-color: var(--teal); background: var(--teal-dim); }
.mode-option .mode-icon { font-size: 28px; display: block; margin-bottom: 6px; }
.mode-option .mode-name { font-weight: 700; font-size: 15px; }
.mode-option .mode-rate { font-family: var(--font-mono); font-size: 13px; color: var(--text-dim); margin-top: 4px; }

/* ---------- timer type selection ---------- */
.timer-selector {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin: 12px 0;
}
.timer-option {
    background: var(--bg-sunken);
    border: 2px solid var(--border);
    border-radius: var(--radius-md);
    padding: 14px 12px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s var(--ease);
}
.timer-option:hover { border-color: var(--border-strong); }
.timer-option.selected-up { border-color: var(--teal); background: var(--teal-dim); }
.timer-option.selected-down { border-color: var(--amber); background: var(--amber-dim); }
.timer-option .timer-icon { font-size: 24px; display: block; margin-bottom: 4px; }
.timer-option .timer-name { font-weight: 700; font-size: 14px; }
.timer-option .timer-desc { font-size: 11px; color: var(--text-dim); margin-top: 2px; }

/* ---------- segment breakdown ---------- */
.segment-breakdown {
    background: var(--bg-sunken);
    border-radius: var(--radius-sm);
    padding: 12px;
    margin: 8px 0;
}
.segment-row {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
    font-size: 13px;
}
.segment-row .seg-label { color: var(--text-dim); }
.segment-row .seg-value { font-family: var(--font-mono); font-weight: 600; }
.segment-row .seg-mode-single { color: var(--amber); }
.segment-row .seg-mode-multi { color: var(--teal); }
.segment-divider { border-top: 1px solid var(--border); margin: 6px 0; padding-top: 6px; }
.segment-total { font-size: 15px; font-weight: 700; }

/* ---------- toast ---------- */
.toast { position: fixed; bottom: 100px; left: 16px; right: 16px; max-width: 480px; margin: 0 auto; padding: 14px 18px; border-radius: var(--radius-sm); font-weight: 700; font-size: 13.5px; text-align: center; z-index: 999; display: none; color: #fff; animation: sheetUp 0.25s var(--ease); }
.toast.success { background: #16825a; }
.toast.error { background: #b3261e; }
.toast.warning { background: #9a5a12; }

/* ---------- empty state ---------- */
.empty { text-align: center; padding: 34px 16px; color: var(--text-dim); }
.empty i { font-size: 26px; color: var(--text-faint); margin-bottom: 10px; display: block; }

/* ---------- print ---------- */
@media print {
    body * { visibility: hidden; }
    #printArea, #printArea * { visibility: visible; }
    #printArea { position: absolute; top: 0; left: 0; width: 100%; }
}

@media (min-width: 700px) {
    .stat-grid, .station-grid { grid-template-columns: repeat(3, 1fr); }
    .payment-options { grid-template-columns: repeat(3, 1fr); }
    .mode-selector { grid-template-columns: 1fr 1fr; }
}

/* ---------- language toggle ---------- */
.lang-toggle {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text);
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
}
.lang-toggle:hover {
    border-color: var(--border-strong);
}

/* ---------- shift filter tabs ---------- */
.shift-tabs {
    display: flex;
    gap: 6px;
    margin-bottom: 12px;
    flex-wrap: wrap;
}
.shift-tab {
    background: var(--bg-sunken);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text-dim);
    padding: 8px 16px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s var(--ease);
    flex: 1;
    text-align: center;
    min-width: 60px;
}
.shift-tab:hover {
    border-color: var(--border-strong);
    color: var(--text);
}
.shift-tab.active {
    border-color: var(--amber);
    color: var(--amber);
    background: var(--amber-dim);
}

/* ---------- transfer target selection ---------- */
.transfer-targets {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
    margin: 12px 0;
}
.transfer-option {
    background: var(--bg-sunken);
    border: 2px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 12px 8px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s var(--ease);
    font-weight: 600;
    font-size: 13px;
}
.transfer-option:hover {
    border-color: var(--border-strong);
    background: var(--surface);
}
.transfer-option.selected {
    border-color: var(--blue);
    background: var(--blue);
    color: #fff;
}
.transfer-option .target-name { font-size: 14px; font-weight: 700; }
.transfer-option .target-status { font-size: 10px; color: var(--text-dim); }
.transfer-option.selected .target-status { color: rgba(255,255,255,0.7); }
.transfer-option.occupied-target {
    opacity: 0.4;
    cursor: not-allowed;
    border-color: var(--red-dim);
}
.transfer-option.occupied-target:hover {
    border-color: var(--red-dim);
    background: var(--bg-sunken);
}

/* ---------- menu category grouping ---------- */
.menu-category-group {
    margin-bottom: 8px;
}
.menu-category-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: var(--bg-sunken);
    border-radius: var(--radius-sm);
    cursor: pointer;
    border: 1px solid var(--border);
    transition: border-color 0.2s;
}
.menu-category-toggle:hover {
    border-color: var(--border-strong);
}
.menu-category-toggle .cat-title {
    font-weight: 700;
    font-size: 13px;
    color: var(--teal);
}
.menu-category-toggle .cat-arrow {
    transition: transform 0.25s var(--ease);
    color: var(--text-dim);
}
.menu-category-toggle .cat-arrow.open {
    transform: rotate(180deg);
}
.menu-category-items {
    display: none;
    padding: 6px 8px;
    flex-wrap: wrap;
    gap: 6px;
}
.menu-category-items.open {
    display: flex;
}

/* ---------- Toggle Sections (PIN) ---------- */
.section-title.toggle {
    cursor: pointer;
    user-select: none;
    transition: color 0.2s;
}
.section-title.toggle:hover {
    color: var(--text);
}
.section-title.toggle .fa-chevron-down {
    transition: transform 0.3s ease;
    color: var(--text-dim);
}
.section-title.toggle .fa-chevron-down.open {
    transform: rotate(180deg);
}

/* ✅ أيقونة PIN بجانب العنوان */
.section-title .pin-icon {
    color: var(--amber);
    margin-left: 8px;
}

/* ✅ الجرس الموحد */
#headerBell {
    font-size: 20px;
    color: var(--text-dim);
    transition: all 0.3s ease;
    cursor: default;
    margin-left: 8px;
}
#headerBell.bell-ringing {
    color: var(--amber);
    animation: bellBlink 0.6s infinite alternate, bellShake 0.3s infinite;
}
@keyframes bellBlink {
    0% { opacity: 0.4; transform: scale(0.9); }
    100% { opacity: 1; transform: scale(1.1); }
}
@keyframes bellShake {
    0% { transform: rotate(-15deg); }
    100% { transform: rotate(15deg); }
}

/* ============================================================
   RING NOTIFICATION - نظام التنبيهات الصوتية والمرئية
   ============================================================ */
.ring-notification {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    background: var(--surface);
    border: 3px solid var(--amber);
    border-radius: var(--radius-md);
    padding: 16px 24px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    max-width: 400px;
    width: 90%;
    animation: ringSlideDown 0.5s var(--ease);
    display: none;
    cursor: pointer;
}

.ring-notification.show {
    display: block;
}

.ring-notification .ring-icon {
    font-size: 32px;
    animation: ringBell 0.3s infinite alternate;
}

@keyframes ringBell {
    0% { transform: rotate(-20deg); }
    100% { transform: rotate(20deg); }
}

@keyframes ringSlideDown {
    from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
    to { transform: translateX(-50%) translateY(0); opacity: 1; }
}

.ring-notification .ring-title {
    font-weight: 700;
    font-size: 18px;
    color: var(--text);
}

.ring-notification .ring-sub {
    font-size: 14px;
    color: var(--text-dim);
}

/* ============================================================
   RESPONSIVE DESIGN - جميع الشاشات
   ============================================================ */

/* ✅ تحسينات عامة للشاشات الصغيرة */
@media (max-width: 480px) {
    .app-header {
        padding: 10px 12px;
        flex-wrap: wrap;
        gap: 8px;
    }
    .app-header .biz-name {
        font-size: 14px;
    }
    .app-header .biz-sub {
        font-size: 10px;
    }
    .header-actions {
        gap: 4px;
    }
    .header-actions .icon-btn {
        width: 32px;
        height: 32px;
    }
    .lang-toggle {
        font-size: 10px;
        padding: 4px 8px;
    }
    .lang-toggle i {
        font-size: 12px;
    }
    
    .view {
        padding: 10px;
    }
    
    .stat-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 6px;
    }
    .stat-card {
        padding: 12px;
    }
    .stat-card .stat-value {
        font-size: 18px;
    }
    .stat-card .stat-label {
        font-size: 10px;
    }
    
    .station-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 6px;
    }
    .station-card {
        padding: 10px;
        min-height: 80px;
    }
    .station-num {
        font-size: 13px;
    }
    .station-timer {
        font-size: 16px;
    }
    .station-status {
        font-size: 10px;
    }
    .station-rate {
        font-size: 10px;
    }
    
    .sheet {
        padding: 16px 12px calc(16px + env(safe-area-inset-bottom));
        max-height: 92vh;
    }
    .sheet-title {
        font-size: 15px;
    }
    
    .mode-selector {
        grid-template-columns: 1fr 1fr;
        gap: 6px;
    }
    .mode-option {
        padding: 12px 8px;
    }
    .mode-option .mode-icon {
        font-size: 22px;
    }
    .mode-option .mode-name {
        font-size: 13px;
    }
    
    .timer-selector {
        grid-template-columns: 1fr 1fr;
        gap: 6px;
    }
    .timer-option {
        padding: 10px 8px;
    }
    .timer-option .timer-icon {
        font-size: 20px;
    }
    .timer-option .timer-name {
        font-size: 12px;
    }
    .timer-option .timer-desc {
        font-size: 10px;
    }
    
    .payment-options {
        grid-template-columns: repeat(2, 1fr);
        gap: 6px;
    }
    .payment-option {
        padding: 10px 6px;
        font-size: 11px;
    }
    .payment-option i {
        font-size: 18px;
    }
    
    .transfer-targets {
        grid-template-columns: repeat(2, 1fr);
        gap: 6px;
    }
    .transfer-option {
        padding: 10px 6px;
        font-size: 11px;
    }
    .transfer-option .target-name {
        font-size: 12px;
    }
    
    .btn {
        font-size: 13px;
        padding: 10px 16px;
    }
    .btn-sm {
        font-size: 11px;
        padding: 6px 10px;
    }
    
    .fab {
        width: 44px;
        height: 44px;
        font-size: 16px;
        bottom: 80px;
        left: 12px;
    }
    
    .bottom-nav {
        padding: 4px 2px calc(4px + env(safe-area-inset-bottom));
    }
    .nav-btn {
        font-size: 8px;
        padding: 6px 2px;
    }
    .nav-btn i {
        font-size: 16px;
    }
    
    .shift-tabs {
        gap: 4px;
    }
    .shift-tab {
        font-size: 10px;
        padding: 6px 8px;
        min-width: 40px;
    }
    
    .list-row {
        padding: 10px 2px;
        font-size: 13px;
    }
    .list-row .row-title {
        font-size: 13px;
    }
    .list-row .row-sub {
        font-size: 11px;
    }
    
    .panel {
        padding: 4px 10px;
    }
    
    .segment-breakdown {
        padding: 8px;
    }
    .segment-row {
        font-size: 11px;
        padding: 3px 0;
    }
    .segment-total {
        font-size: 13px;
    }
    
    .field input, .field select {
        padding: 10px 12px;
        font-size: 13px;
    }
    .field label {
        font-size: 11px;
    }
    
    .toast {
        font-size: 12px;
        padding: 10px 14px;
        bottom: 80px;
        left: 10px;
        right: 10px;
    }
    
    .brand-title {
        font-size: 20px;
    }
    .card {
        padding: 16px;
    }
}

/* ✅ تحسينات للشاشات المتوسطة (تابلت) */
@media (min-width: 481px) and (max-width: 768px) {
    .stat-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    .station-grid {
        grid-template-columns: repeat(3, 1fr);
    }
    .payment-options {
        grid-template-columns: repeat(3, 1fr);
    }
    .transfer-targets {
        grid-template-columns: repeat(3, 1fr);
    }
    .view {
        padding: 14px;
        max-width: 100%;
    }
    .sheet {
        max-width: 520px;
    }
}

/* ✅ تحسينات للشاشات الكبيرة (لابتوب / كمبيوتر) */
@media (min-width: 769px) {
    .view {
        max-width: 800px;
        padding: 20px;
    }
    .stat-grid {
        grid-template-columns: repeat(4, 1fr);
    }
    .station-grid {
        grid-template-columns: repeat(4, 1fr);
    }
    .payment-options {
        grid-template-columns: repeat(4, 1fr);
    }
    .transfer-targets {
        grid-template-columns: repeat(4, 1fr);
    }
    .mode-selector {
        grid-template-columns: 1fr 1fr;
    }
    .timer-selector {
        grid-template-columns: 1fr 1fr;
    }
    .sheet {
        max-width: 640px;
    }
    .bottom-nav {
        max-width: 800px;
    }
    .fab {
        left: calc(50% - 400px - 30px);
    }
}

/* ✅ تحسينات للشاشات العرضية (Landscape) على الموبايل */
@media (max-height: 500px) and (orientation: landscape) {
    .app-header {
        padding: 6px 12px;
    }
    .app-header .biz-name {
        font-size: 13px;
    }
    .app-header .biz-sub {
        font-size: 9px;
    }
    .view {
        padding: 6px 10px;
    }
    .stat-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 4px;
    }
    .stat-card {
        padding: 6px 8px;
    }
    .stat-card .stat-value {
        font-size: 14px;
    }
    .stat-card .stat-label {
        font-size: 8px;
    }
    .station-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 4px;
    }
    .station-card {
        padding: 6px;
        min-height: 60px;
    }
    .station-num {
        font-size: 11px;
    }
    .station-timer {
        font-size: 12px;
    }
    .station-status {
        font-size: 8px;
    }
    .sheet {
        max-height: 90vh;
        padding: 10px 12px;
    }
    .sheet-title {
        font-size: 14px;
        margin-bottom: 8px;
    }
    .btn {
        font-size: 11px;
        padding: 6px 12px;
    }
    .bottom-nav {
        padding: 2px 4px;
    }
    .nav-btn {
        font-size: 7px;
        padding: 4px 2px;
    }
    .nav-btn i {
        font-size: 13px;
    }
    .fab {
        width: 36px;
        height: 36px;
        font-size: 14px;
        bottom: 60px;
        left: 8px;
    }
    .toast {
        font-size: 10px;
        padding: 6px 12px;
        bottom: 56px;
    }
    .shift-tab {
        font-size: 9px;
        padding: 4px 8px;
    }
    .list-row {
        padding: 4px 2px;
        font-size: 11px;
    }
    .list-row .row-title {
        font-size: 11px;
    }
    .list-row .row-sub {
        font-size: 9px;
    }
    .field input, .field select {
        padding: 6px 8px;
        font-size: 11px;
    }
    .field label {
        font-size: 9px;
        margin-bottom: 2px;
    }
    .mode-option {
        padding: 6px 4px;
    }
    .mode-option .mode-icon {
        font-size: 16px;
    }
    .mode-option .mode-name {
        font-size: 10px;
    }
    .mode-option .mode-rate {
        font-size: 10px;
    }
    .timer-option {
        padding: 6px 4px;
    }
    .timer-option .timer-icon {
        font-size: 16px;
    }
    .timer-option .timer-name {
        font-size: 10px;
    }
    .payment-options {
        grid-template-columns: repeat(4, 1fr);
        gap: 4px;
    }
    .payment-option {
        padding: 6px 4px;
        font-size: 10px;
    }
    .payment-option i {
        font-size: 14px;
    }
    .transfer-targets {
        grid-template-columns: repeat(4, 1fr);
        gap: 4px;
    }
    .transfer-option {
        padding: 6px 4px;
        font-size: 10px;
    }
    .centered-screen {
        padding: 12px;
    }
    .brand-title {
        font-size: 18px;
        margin-bottom: 12px;
    }
    .card {
        padding: 12px;
    }
}

/* ✅ تحسينات للشاشات الكبيرة جداً (4K) */
@media (min-width: 1400px) {
    .view {
        max-width: 1000px;
        padding: 24px;
    }
    .bottom-nav {
        max-width: 1000px;
    }
    .fab {
        left: calc(50% - 500px - 40px);
    }
    .station-grid {
        grid-template-columns: repeat(5, 1fr);
    }
    .stat-grid {
        grid-template-columns: repeat(4, 1fr);
    }
    .payment-options {
        grid-template-columns: repeat(5, 1fr);
    }
    .transfer-targets {
        grid-template-columns: repeat(5, 1fr);
    }
    .sheet {
        max-width: 720px;
    }
}

/* ✅ إصلاح مشكلة overflow على الشاشات الصغيرة */
@media (max-width: 360px) {
    .stat-grid {
        grid-template-columns: 1fr 1fr;
        gap: 4px;
    }
    .station-grid {
        grid-template-columns: 1fr 1fr;
        gap: 4px;
    }
    .station-card {
        min-height: 70px;
        padding: 8px;
    }
    .station-num {
        font-size: 12px;
    }
    .station-timer {
        font-size: 14px;
    }
    .header-actions .icon-btn {
        width: 28px;
        height: 28px;
    }
    .header-actions .icon-btn i {
        font-size: 12px;
    }
    .lang-toggle {
        font-size: 9px;
        padding: 3px 6px;
    }
    .lang-toggle i {
        font-size: 10px;
    }
    .app-header .biz-name {
        font-size: 12px;
    }
    .app-header .biz-sub {
        font-size: 9px;
    }
    .view {
        padding: 6px;
    }
    .sheet {
        padding: 12px 8px;
    }
    .btn {
        font-size: 11px;
        padding: 8px 12px;
    }
    .btn-sm {
        font-size: 10px;
        padding: 4px 8px;
    }
    .section-title {
        font-size: 11px;
        margin: 12px 0 6px;
    }
}
