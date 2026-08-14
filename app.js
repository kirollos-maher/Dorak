// V2 NOTE: Browser code is not a security boundary. Production authorization must be enforced by Supabase Auth + RLS.
// ============================================================
// CONFIG
// ============================================================
const SUPABASE_URL = 'https://hdrvqgicxxgfolozxgjp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_dGNw7eTTempKBdFmAZRjYA_eaeEE2jj';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// V2 safety helpers: never report success when Supabase rejected the operation.
async function dbResult(promise, context = 'Database operation') {
    const result = await promise;
    if (result?.error) {
        console.error(context, result.error);
        throw result.error;
    }
    return result;
}
function assertBusinessContext() {
    if (!business?.id) throw new Error('Business context is missing');
}
function assertPositiveNumber(value, label) {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) throw new Error(`${label} must be a valid non-negative number`);
    return n;
}


// ============================================================
// LANGUAGE STATE
// ============================================================
let currentLang = 'ar';
let shiftFilter = 'all';

function toggleLanguage() {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
    document.getElementById('langToggleLabel').textContent = currentLang === 'ar' ? 'English' : 'العربية';
    updateTexts();
}

function updateTexts() {
    document.querySelectorAll('[data-ar][data-en]').forEach(el => {
        el.textContent = currentLang === 'ar' ? el.dataset.ar : el.dataset.en;
    });
    document.querySelectorAll('select option[data-ar][data-en]').forEach(el => {
        el.textContent = currentLang === 'ar' ? el.dataset.ar : el.dataset.en;
    });
    
    // تحديث أسماء الأشهر
    updateMonthNames();
    
    renderStationsGrid();
    renderSettingsStations();
    renderSettingsPaymentMethods();
    if (document.getElementById('view-shift').classList.contains('active')) renderShiftView();
    if (document.getElementById('view-settings').classList.contains('active')) renderSettings();
}

function updateMonthNames() {
    const monthSelect = document.getElementById('monthSelect');
    if (!monthSelect) return;
    
    const monthNamesAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthNames = currentLang === 'ar' ? monthNamesAr : monthNamesEn;
    
    monthSelect.querySelectorAll('option').forEach((option, index) => {
        option.textContent = monthNames[index];
    });
}

function populateYearSelect() {
    const yearSelect = document.getElementById('yearSelect');
    if (!yearSelect) return;
    
    const currentYear = new Date().getFullYear();
    yearSelect.innerHTML = '';
    for (let year = currentYear; year >= currentYear - 5; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
    yearSelect.value = currentYear;
}

function applyMonthlyFilter() {
    renderShiftView();
}

function setShiftFilter(filter) {
    shiftFilter = filter;
    document.querySelectorAll('.shift-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.filter === filter);
    });
    
    const monthlyFilter = document.getElementById('monthlyFilter');
    if (monthlyFilter) {
        monthlyFilter.style.display = filter === 'monthly' ? 'flex' : 'none';
    }
    
    renderShiftView();
}

// ============================================================
// STATE
// ============================================================
let business = null;
let deviceRecord = null;
let stations = [];
let sessions = {};
let menuItems = [];
let employees = [];
let paymentMethods = [];
let currentShift = null;
let currentUser = null;
let realtimeChannel = null;
let tickInterval = null;
let activeStationId = null;
let activeSessionOrders = [];
let currentOrderSessionId = null;
let selectedPaymentMethod = null;
let endSessionStationId = null;
let sessionSegmentsCache = {};
let activeSegmentCache = {};
let pendingSwitch = false;
let transferSourceStationId = null;
let countdownTimers = {};
let countdownAlerts = {};
// تخزين حالة التوجل لكل تصنيف
let categoryToggleState = {};

// ============================================================
// UTILITIES
// ============================================================
function getDeviceId() {
    let id = localStorage.getItem('psr_device_id');
    if (!id) { id = 'dev_' + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('psr_device_id', id); }
    return id;
}
function money(n) { return (Number(n) || 0).toLocaleString(currentLang === 'ar' ? 'ar-EG' : 'en-US', { maximumFractionDigits: 0 }); }
function moneyDec(n) { return (Number(n) || 0).toLocaleString(currentLang === 'ar' ? 'ar-EG' : 'en-US', { maximumFractionDigits: 2, minimumFractionDigits: 0 }); }
function showToast(msg, type = 'success') {
    const el = document.getElementById('toast');
    el.textContent = msg; el.className = 'toast ' + type; el.style.display = 'block';
    clearTimeout(el._t); el._t = setTimeout(() => { el.style.display = 'none'; }, 2600);
}
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}
function navigateTo(viewId) {
    if (currentUser && currentUser.type !== 'owner') {
        const perms = currentUser.permissions || {};
        if (viewId === 'view-settings' && !perms.settings) viewId = 'view-dashboard';
        if (viewId === 'view-shift' && !perms.shift) viewId = 'view-dashboard';
        if (viewId === 'view-stations' && !perms.stations) viewId = 'view-dashboard';
    }
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === viewId));
    if (viewId === 'view-dashboard') renderDashboard();
    if (viewId === 'view-shift') renderShiftView();
    if (viewId === 'view-settings') { renderSettings(); renderSettingsStations(); renderSettingsPaymentMethods(); }
}
function openSheet(id) { document.getElementById(id).classList.add('show'); }
function closeSheet(id) {
    if (id === 'stationOverlay') currentOrderSessionId = null; 
    document.getElementById(id).classList.remove('show'); 
    if (id === 'stationOverlay') {
        activeStationId = null;
        sessionSegmentsCache = {};
    }
    if (id === 'transferOverlay') {
        transferSourceStationId = null;
    }
}
function t(ar, en) { return currentLang === 'ar' ? ar : en; }

function applyPermissions() {
    const isOwner = currentUser.type === 'owner';
    const perms = currentUser.permissions || {};
    const navSettings = document.querySelector('.bottom-nav .nav-btn[data-view="view-settings"]');
    const navShift = document.querySelector('.bottom-nav .nav-btn[data-view="view-shift"]');
    const navStations = document.querySelector('.bottom-nav .nav-btn[data-view="view-stations"]');
    const fab = document.getElementById('fabAddExpense');
    if (navSettings) navSettings.style.display = (isOwner || perms.settings) ? 'flex' : 'none';
    if (navShift) navShift.style.display = (isOwner || perms.shift) ? 'flex' : 'none';
    if (navStations) navStations.style.display = (isOwner || perms.stations) ? 'flex' : 'none';
    if (fab) fab.style.display = (isOwner || perms.shift) ? 'flex' : 'none';
}

// ============================================================
// SETUP / ACTIVATION / LOCK FLOW
// ============================================================
async function handleSetupContinue() {
    const code = document.getElementById('setupBusinessCode').value.trim().toUpperCase();
    const errEl = document.getElementById('setupError');
    errEl.textContent = '';
    if (!code) { errEl.textContent = t('اكتب كود النشاط.', 'Enter the business code.'); return; }
    const btn = document.getElementById('setupContinueBtn');
    btn.disabled = true;
    try {
        const { data: biz, error } = await supabaseClient.from('businesses').select('*').eq('code', code).single();
        if (error || !biz) { errEl.textContent = t('مفيش نشاط بالكود ده.', 'No business found with this code.'); return; }
        business = biz;
        localStorage.setItem('psr_business_code', code);

        const deviceId = getDeviceId();
        const { data: dev } = await supabaseClient.from('devices').select('*').eq('business_id', biz.id).eq('device_id', deviceId).maybeSingle();
        if (!dev) {
            document.getElementById('activationBizName').textContent = biz.name;
            showScreen('activationScreen');
            return;
        }
        deviceRecord = dev;
        proceedToLock();
    } catch (e) {
        console.error(e);
        errEl.textContent = t('حصل خطأ في الاتصال، حاول تاني.', 'Connection error, please try again.');
    } finally { btn.disabled = false; }
}

async function handleActivateDevice() {
    const code = document.getElementById('activationCodeInput').value.trim().toUpperCase();
    const errEl = document.getElementById('activationError');
    errEl.textContent = '';
    if (!code) { errEl.textContent = t('اكتب كود التفعيل.', 'Enter the activation code.'); return; }
    try {
        const { data: actCode, error } = await supabaseClient.from('activation_codes').select('*').eq('business_id', business.id).eq('code', code).eq('used', false).single();
        if (error || !actCode) { errEl.textContent = t('الكود غير صحيح أو مستخدم قبل كده.', 'Invalid or already used code.'); return; }

        const deviceId = getDeviceId();
        const expiry = new Date(); expiry.setDate(expiry.getDate() + 30);
        const { data: newDev, error: devErr } = await supabaseClient.from('devices').insert({
            business_id: business.id, device_id: deviceId,
            device_label: t('جهاز بدون اسم', 'Unnamed device'),
            is_active: true, revoked: false, expiry_date: expiry.toISOString()
        }).select().single();
        if (devErr) { errEl.textContent = t('فشل التفعيل، حاول تاني.', 'Activation failed, try again.'); return; }

        await supabaseClient.from('activation_codes').update({ used: true, used_at: new Date().toISOString() }).eq('id', actCode.id);
        deviceRecord = newDev;
        showToast(t('تم تفعيل الجهاز بنجاح', 'Device activated successfully'), 'success');
        proceedToLock();
    } catch (e) { console.error(e); errEl.textContent = t('حصل خطأ، حاول تاني.', 'Error, try again.'); }
}

function proceedToLock() {
    document.getElementById('lockBizCode').textContent = business.code;
    document.getElementById('lockBizName').textContent = business.name;
    const expiry = deviceRecord.expiry_date ? new Date(deviceRecord.expiry_date) : null;
    const subLine = document.getElementById('subStatusLine');
    if (deviceRecord.revoked || !deviceRecord.is_active) { subLine.textContent = t('الجهاز موقوف — تواصل مع الإدارة', 'Device suspended — contact admin'); }
    else if (expiry && expiry < new Date()) { subLine.textContent = t('الاشتراك منتهي — تواصل مع الإدارة', 'Subscription expired — contact admin'); }
    else if (expiry) { const days = Math.ceil((expiry - new Date()) / 86400000); subLine.textContent = t(`متبقي ${days} يوم على الاشتراك`, `${days} days remaining on subscription`); }
    resetLockRole();
    showScreen('lockScreen');
}

function selectLockRole(role) {
    document.getElementById('lockError').textContent = '';
    document.getElementById('lockRoleChoice').style.display = 'none';
    document.getElementById('lockOwnerForm').style.display = role === 'owner' ? 'block' : 'none';
    document.getElementById('lockEmployeeForm').style.display = role === 'employee' ? 'block' : 'none';
}

function resetLockRole() {
    document.getElementById('lockError').textContent = '';
    document.getElementById('lockPinInput').value = '';
    document.getElementById('lockEmpName').value = '';
    document.getElementById('lockEmpPin').value = '';
    document.getElementById('lockOwnerForm').style.display = 'none';
    document.getElementById('lockEmployeeForm').style.display = 'none';
    document.getElementById('lockRoleChoice').style.display = 'block';
}

async function handleEmployeeUnlock() {
    const name = document.getElementById('lockEmpName').value.trim();
    const pin = document.getElementById('lockEmpPin').value.trim();
    const errEl = document.getElementById('lockError');
    errEl.textContent = '';
    if (deviceRecord.revoked || !deviceRecord.is_active) { errEl.textContent = t('الجهاز موقوف.', 'Device suspended.'); return; }
    if (deviceRecord.expiry_date && new Date(deviceRecord.expiry_date) < new Date()) { errEl.textContent = t('الاشتراك منتهي.', 'Subscription expired.'); return; }
    if (!name || !pin) { errEl.textContent = t('اكتب الاسم والـ PIN.', 'Enter your name and PIN.'); return; }

    const { data: emps, error } = await supabaseClient.from('employees').select('*').eq('business_id', business.id).eq('active', true);
    if (error) { errEl.textContent = t('حصل خطأ، حاول تاني.', 'Error, try again.'); console.error('Error loading employees for login:', error); return; }
    const emp = (emps || []).find(e => e.name && e.name.trim().toLowerCase() === name.toLowerCase() && String(e.pin) === pin);
    if (emp) {
        currentUser = { type: 'employee', ...emp };
        document.getElementById('lockEmpName').value = '';
        document.getElementById('lockEmpPin').value = '';
        enterMainApp();
        return;
    }
    errEl.textContent = t('الاسم أو الـ PIN غير صحيح.', 'Incorrect name or PIN.');
}

async function handleUnlock() {
    const pin = document.getElementById('lockPinInput').value.trim();
    const errEl = document.getElementById('lockError');
    errEl.textContent = '';
    if (deviceRecord.revoked || !deviceRecord.is_active) { errEl.textContent = t('الجهاز موقوف.', 'Device suspended.'); return; }
    if (deviceRecord.expiry_date && new Date(deviceRecord.expiry_date) < new Date()) { errEl.textContent = t('الاشتراك منتهي.', 'Subscription expired.'); return; }
    if (!pin) { errEl.textContent = t('اكتب الـ PIN.', 'Enter the PIN.'); return; }

    if (pin === business.owner_pin) {
        currentUser = { type: 'owner', name: t('المالك', 'Owner'), permissions: { stations: true, inventory: true, shift: true, settings: true } };
        document.getElementById('lockPinInput').value = '';
        enterMainApp();
        return;
    }
    const { data: emp } = await supabaseClient.from('employees').select('*').eq('business_id', business.id).eq('pin', pin).eq('active', true).maybeSingle();
    if (emp) {
        currentUser = { type: 'employee', ...emp };
        document.getElementById('lockPinInput').value = '';
        enterMainApp();
        return;
    }
    errEl.textContent = t('PIN غير صحيح.', 'Incorrect PIN.');
}

function lockApp() {
    stopRealtimeAndTimers();
    currentUser = null;
    document.getElementById('lockPinInput').value = '';
    proceedToLock();
}

function switchBusiness() {
    stopRealtimeAndTimers();
    localStorage.removeItem('psr_business_code');
    business = null; deviceRecord = null; currentUser = null;
    document.getElementById('setupBusinessCode').value = '';
    showScreen('setupScreen');
}

async function tryAutoResume() {
    const code = localStorage.getItem('psr_business_code');
    if (!code) return;
    try {
        const { data: biz } = await supabaseClient.from('businesses').select('*').eq('code', code).single();
        if (!biz) return;
        business = biz;
        const { data: dev } = await supabaseClient.from('devices').select('*').eq('business_id', biz.id).eq('device_id', getDeviceId()).maybeSingle();
        if (!dev) return;
        deviceRecord = dev;
        proceedToLock();
    } catch (e) { console.warn('auto-resume failed', e); }
}
window.addEventListener('DOMContentLoaded', () => { tryAutoResume(); });

// ============================================================
// MAIN APP ENTRY
// ============================================================
async function enterMainApp() {
    document.getElementById('headerBizName').textContent = business.name;
    document.getElementById('headerBizCode').textContent = business.code;
    showScreen('mainApp');
    applyPermissions();
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-dashboard').classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === 'view-dashboard'));
    
    populateYearSelect();
    await loadAllData();
    subscribeRealtime();
    startTicker();
    updateTexts();
    await recoverActiveSession();
}

async function loadAllData() {
    // Load each area independently. A problem in one table (for example,
    // duplicate open shifts in an older database) must not prevent the
    // stations and the rest of the app from rendering.
    const results = await Promise.allSettled([
        loadStations(),
        loadMenuItems(),
        loadEmployees(),
        loadPaymentMethods(),
        loadOrOpenShift()
    ]);

    results.forEach((result, index) => {
        if (result.status === 'rejected') {
            const names = ['stations', 'menu_items', 'employees', 'payment_methods', 'shift'];
            console.error(`Failed to load ${names[index]}:`, result.reason);
        }
    });

    renderDashboard();
    renderStationsGrid();
    renderSettingsStations();
    renderSettingsPaymentMethods();
}

async function loadStations() {
    assertBusinessContext();
    const { data, error } = await supabaseClient.from('stations').select('*').eq('business_id', business.id).order('number');
    if (error) {
        console.error('Error loading stations:', error);
        throw error;
    }
    if (Array.isArray(data) && data.length === 0) {
        const seed = Array.from({ length: business.total_stations || 4 }, (_, i) => ({ 
            business_id: business.id, number: i + 1, single_rate: 20, multi_rate: 30, name: `جهاز ${i + 1}`
        }));
        const createdResult = await dbResult(supabaseClient.from('stations').insert(seed).select(), 'Seeding stations');
        stations = createdResult.data || [];
    } else {
        stations = data || [];
    }
    const activeResult = await dbResult(
        supabaseClient.from('sessions').select('*').eq('business_id', business.id).eq('status', 'active'),
        'Loading active sessions'
    );
    sessions = {};
    (activeResult.data || []).forEach(s => { sessions[s.station_id] = s; });
}

// ============================================================
// MENU ITEMS - with localStorage fallback
// ============================================================
async function loadMenuItems() {
    try {
        const { data, error } = await supabaseClient.from('menu_items').select('*').eq('business_id', business.id).eq('active', true).order('created_at');
        if (error) {
            console.warn('Error loading menu items from DB:', error);
            const localData = localStorage.getItem('psr_menu_items_' + business.id);
            if (localData) {
                menuItems = JSON.parse(localData);
                return;
            }
            menuItems = [];
            return;
        }
        if (data) {
            menuItems = data;
            localStorage.setItem('psr_menu_items_' + business.id, JSON.stringify(data));
        }
    } catch (e) {
        console.warn('Error loading menu items:', e);
        const localData = localStorage.getItem('psr_menu_items_' + business.id);
        if (localData) {
            menuItems = JSON.parse(localData);
        } else {
            menuItems = [];
        }
    }
}

async function saveMenuItemToDB(item) {
    assertBusinessContext();
    const { data, error } = await supabaseClient.from('menu_items').insert(item).select().single();
    if (error) {
        console.error('Error saving menu item to DB:', error);
        throw error;
    }
    return data;
}

async function updateMenuItemInDB(id, updates) {
    const { data, error } = await supabaseClient.from('menu_items').update(updates).eq('id', id).eq('business_id', business.id).select().single();
    if (error) {
        console.error('Error updating menu item in DB:', error);
        throw error;
    }
    return data;
}

async function deleteMenuItemFromDB(id) {
    const { error } = await supabaseClient.from('menu_items').delete().eq('id', id).eq('business_id', business.id);
    if (error) {
        console.error('Error deleting menu item from DB:', error);
        throw error;
    }
    return true;
}

async function loadEmployees() {
    const { data } = await supabaseClient.from('employees').select('*').eq('business_id', business.id).order('created_at');
    employees = data || [];
}

async function loadPaymentMethods() {
    try {
        const { data, error } = await supabaseClient.from('payment_methods').select('*').eq('business_id', business.id).order('created_at');
        if (error) throw error;
        if (data && data.length > 0) {
            paymentMethods = data;
            return;
        }
    } catch (e) {
        console.warn('Error loading payment methods:', e);
    }
    
    const defaults = [
        { business_id: business.id, name: 'كاش', icon: 'fa-money-bill-wave', color: 'badge-green', active: true },
        { business_id: business.id, name: 'إنستا باي', icon: 'fa-mobile-screen-button', color: 'badge-purple', active: true },
        { business_id: business.id, name: 'محفظة إلكترونية', icon: 'fa-wallet', color: 'badge-teal', active: true },
        { business_id: business.id, name: 'بطاقة ائتمان', icon: 'fa-credit-card', color: 'badge-amber', active: true }
    ];
    
    try {
        const { data: created, error } = await supabaseClient.from('payment_methods').insert(defaults).select();
        if (!error && created) {
            paymentMethods = created;
            return;
        }
    } catch (e) {
        console.warn('Could not create default payment methods:', e);
    }
    
    paymentMethods = defaults.map((pm, i) => ({
        ...pm,
        id: 'temp_' + Date.now() + '_' + i,
        created_at: new Date().toISOString()
    }));
}

async function loadOrOpenShift() {
    assertBusinessContext();

    // Do not use maybeSingle() here. The current database contains multiple
    // open shifts for this business (the console reports 19 rows), so
    // maybeSingle() throws PGRST116 and used to stop the whole app from rendering.
    const { data: openShifts, error } = await supabaseClient
        .from('shifts')
        .select('*')
        .eq('business_id', business.id)
        .eq('status', 'open')
        .order('opened_at', { ascending: false });

    if (error) throw error;

    if (openShifts && openShifts.length > 0) {
        // Use the newest open shift for now. Do NOT automatically delete or
        // close the other financial records; they need manual review.
        currentShift = openShifts[0];

        if (openShifts.length > 1) {
            console.warn(
                `PS Rental: ${openShifts.length} open shifts found for business ${business.id}. ` +
                'Using the newest one. Review duplicate open shifts in Supabase.'
            );
        }
        return;
    }

    const createdResult = await dbResult(
        supabaseClient
            .from('shifts')
            .insert({ business_id: business.id, opened_at: new Date().toISOString(), status: 'open' })
            .select()
            .single(),
        'Opening shift'
    );
    currentShift = createdResult.data;
}

// ============================================================
// SESSION SEGMENTS HELPERS
// ============================================================
async function getSessionSegments(sessionId) {
    if (sessionSegmentsCache[sessionId]) return sessionSegmentsCache[sessionId];
    try {
        const { data } = await supabaseClient
            .from('session_segments')
            .select('*')
            .eq('session_id', sessionId)
            .order('started_at', { ascending: true });
        sessionSegmentsCache[sessionId] = data || [];
        return data || [];
    } catch (e) {
        console.warn('Error loading segments:', e);
        return [];
    }
}

async function createSegment(sessionId, mode, startedAt, rate, timerType, durationSeconds) {
    const { data: existingList } = await supabaseClient
        .from('session_segments')
        .select('*')
        .eq('session_id', sessionId)
        .is('ended_at', null)
        .order('started_at', { ascending: false })
        .limit(1);
    const existing = (existingList && existingList[0]) || null;
    if (existing) {
        activeSegmentCache[sessionId] = existing;
        return existing;
    }

    const { data, error } = await supabaseClient.from('session_segments').insert({
        session_id: sessionId,
        business_id: business.id,
        mode: mode,
        started_at: startedAt,
        rate: assertPositiveNumber(rate, 'Rate'),
        timer_type: timerType || 'countup',
        duration_seconds: Math.max(0, Math.round(Number(durationSeconds) || 0))
    }).select().single();
    if (error) throw error;
    sessionSegmentsCache[sessionId] = null;
    activeSegmentCache[sessionId] = data;
    return data;
}

async function closeSegment(segmentId, endedAt, amount) {
    const { error } = await supabaseClient.from('session_segments')
        .update({ ended_at: endedAt, amount: amount })
        .eq('id', segmentId);
    if (error) throw error;
    sessionSegmentsCache = {};
    for (const sid in activeSegmentCache) {
        if (activeSegmentCache[sid] && activeSegmentCache[sid].id === segmentId) {
            activeSegmentCache[sid] = null;
        }
    }
}

async function getActiveSegment(sessionId) {
    try {
        const { data } = await supabaseClient
            .from('session_segments')
            .select('*')
            .eq('session_id', sessionId)
            .is('ended_at', null)
            .order('started_at', { ascending: false })
            .limit(1);
        const seg = (data && data[0]) || null;
        activeSegmentCache[sessionId] = seg;
        return seg;
    } catch (e) {
        console.warn('Error getting active segment:', e);
        return activeSegmentCache[sessionId] || null;
    }
}

function getActiveSegmentFast(sessionId) {
    return activeSegmentCache[sessionId] || null;
}

async function preloadActiveSegments(sessionIds) {
    if (!sessionIds || sessionIds.length === 0) return;
    try {
        const { data } = await supabaseClient
            .from('session_segments')
            .select('*')
            .in('session_id', sessionIds)
            .is('ended_at', null);
        (data || []).forEach(seg => { activeSegmentCache[seg.session_id] = seg; });
    } catch (e) {
        console.warn('Error preloading active segments:', e);
    }
}

function calculateSegmentAmountFromTimes(startedAt, endedAt, rate) {
    const start = new Date(startedAt);
    const end = new Date(endedAt);
    const hours = Math.max(0, (end - start) / 3600000);
    return Math.round((hours * Number(rate)) * 100) / 100;
}

async function calculateTotalAmounts(sessionId) {
    const segments = await getSessionSegments(sessionId);
    let singleTotal = 0, multiTotal = 0, singleDuration = 0, multiDuration = 0;
    
    for (const seg of segments) {
        if (seg.ended_at) {
            const hours = (new Date(seg.ended_at) - new Date(seg.started_at)) / 3600000;
            const amount = (seg.amount !== null && seg.amount !== undefined)
                ? Number(seg.amount)
                : Math.round((hours * Number(seg.rate)) * 100) / 100;
            if (seg.mode === 'single') {
                singleTotal += amount;
                singleDuration += hours;
            } else {
                multiTotal += amount;
                multiDuration += hours;
            }
        }
    }
    
    const { data: orders } = await supabaseClient
        .from('session_orders')
        .select('quantity, unit_price')
        .eq('session_id', sessionId);
    const ordersTotal = (orders || []).reduce((sum, o) => sum + (Number(o.quantity) * Number(o.unit_price)), 0);
    
    return {
        singleTotal: Math.round(singleTotal * 100) / 100,
        multiTotal: Math.round(multiTotal * 100) / 100,
        singleDuration: singleDuration,
        multiDuration: multiDuration,
        ordersTotal: ordersTotal,
        grandTotal: Math.round((singleTotal + multiTotal + ordersTotal) * 100) / 100
    };
}

async function getCurrentSegmentEstimate(sessionId) {
    const activeSeg = await getActiveSegment(sessionId);
    if (!activeSeg) return { amount: 0, hours: 0, segment: null };
    
    const start = new Date(activeSeg.started_at);
    const now = new Date();
    let hours = Math.max(0, (now - start) / 3600000);
    let amount = Math.round((hours * Number(activeSeg.rate)) * 100) / 100;
    
    if (activeSeg.timer_type === 'countdown' && activeSeg.duration_seconds) {
        const elapsedSeconds = (now - start) / 1000;
        const remainingSeconds = Math.max(0, activeSeg.duration_seconds - elapsedSeconds);
        hours = remainingSeconds / 3600;
        amount = Math.round((hours * Number(activeSeg.rate)) * 100) / 100;
    }
    
    return { amount, hours, segment: activeSeg };
}

function getCurrentSegmentEstimateFast(sessionId) {
    const activeSeg = getActiveSegmentFast(sessionId);
    if (!activeSeg) return { amount: 0, hours: 0, segment: null };

    const start = new Date(activeSeg.started_at);
    const now = new Date();
    let hours = Math.max(0, (now - start) / 3600000);
    let amount = Math.round((hours * Number(activeSeg.rate)) * 100) / 100;

    if (activeSeg.timer_type === 'countdown' && activeSeg.duration_seconds) {
        const elapsedSeconds = (now - start) / 1000;
        const remainingSeconds = Math.max(0, activeSeg.duration_seconds - elapsedSeconds);
        hours = remainingSeconds / 3600;
        amount = Math.round((hours * Number(activeSeg.rate)) * 100) / 100;
    }

    return { amount, hours, segment: activeSeg };
}

function getRemainingSeconds(segment) {
    if (!segment || segment.timer_type !== 'countdown' || !segment.duration_seconds) return 0;
    const start = new Date(segment.started_at);
    const now = new Date();
    const elapsed = (now - start) / 1000;
    return Math.max(0, segment.duration_seconds - elapsed);
}

function formatCountdown(seconds) {
    if (seconds < 0) seconds = 0;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return (h > 0 ? String(h).padStart(2, '0') + ':' : '') + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

// ============================================================
// REALTIME
// ============================================================
function subscribeRealtime() {
    if (realtimeChannel) supabaseClient.removeChannel(realtimeChannel);
    realtimeChannel = supabaseClient.channel('biz-' + business.id)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions', filter: 'business_id=eq.' + business.id }, handleSessionChange)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'session_orders', filter: 'business_id=eq.' + business.id }, handleOrderChange)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'stations', filter: 'business_id=eq.' + business.id }, handleStationChange)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'session_segments', filter: 'business_id=eq.' + business.id }, handleSegmentChange)
        .subscribe();
}

function stopRealtimeAndTimers() {
    if (realtimeChannel) { supabaseClient.removeChannel(realtimeChannel); realtimeChannel = null; }
    if (tickInterval) { clearInterval(tickInterval); tickInterval = null; }
    Object.keys(countdownTimers).forEach(key => {
        if (countdownTimers[key]) clearInterval(countdownTimers[key]);
        delete countdownTimers[key];
    });
}

function handleSessionChange(payload) {
    const row = payload.new && Object.keys(payload.new).length ? payload.new : payload.old;
    if (!row) return;
    if (payload.eventType === 'DELETE' || (payload.new && payload.new.status === 'completed')) {
        delete sessions[row.station_id];
        if (countdownTimers[row.station_id]) {
            clearInterval(countdownTimers[row.station_id]);
            delete countdownTimers[row.station_id];
        }
        renderDashboard();
        if (document.getElementById('view-shift').classList.contains('active')) {
            renderShiftView();
        }
    } else if (row.status === 'active') {
        sessions[row.station_id] = payload.new;
    }
    renderStationsGrid();
    if (document.getElementById('view-dashboard').classList.contains('active')) renderDashboard();
    if (document.getElementById('view-shift').classList.contains('active')) renderShiftView();
    if (activeStationId === row.station_id && !pendingSwitch) openStationSheet(activeStationId);
}

function handleOrderChange(payload) {
    const row = payload.new && Object.keys(payload.new).length ? payload.new : payload.old;
    if (activeStationId && row && row.session_id === (sessions[activeStationId] || {}).id) renderStationOrdersSection();
}

function handleStationChange() {
    loadStations().then(() => {
        renderStationsGrid();
        renderSettingsStations();
    });
}

function handleSegmentChange(payload) {
    if (payload.new && payload.new.session_id) {
        const row = payload.new;
        sessionSegmentsCache[row.session_id] = null;
        activeSegmentCache[row.session_id] = row.ended_at ? null : row;
        if (activeStationId && !pendingSwitch) {
            const session = sessions[activeStationId];
            if (session && session.id === row.session_id) {
                openStationSheet(activeStationId);
            }
        }
    }
}

// ============================================================
// التيكر
// ============================================================
function startTicker() {
    if (tickInterval) clearInterval(tickInterval);
    tickInterval = setInterval(() => {
        document.querySelectorAll('.station-timer[data-start]').forEach(el => {
            const stationId = el.dataset.stationId;
            const session = sessions[stationId];
            if (!session) return;
            const activeSeg = getActiveSegmentFast(session.id);
            if (activeSeg && activeSeg.timer_type === 'countdown' && activeSeg.duration_seconds) {
                const remaining = getRemainingSeconds(activeSeg);
                el.textContent = formatCountdown(remaining);
                if (remaining < 300) {
                    el.classList.add('countdown-warning');
                } else {
                    el.classList.remove('countdown-warning');
                }
                el.classList.add('countdown');
            } else {
                el.textContent = formatElapsed(new Date(el.dataset.start));
                el.classList.remove('countdown', 'countdown-warning');
            }
        });

        const timerEl = document.getElementById('activeSessionTimer');
        if (timerEl && timerEl.dataset.start && activeStationId) {
            const session = sessions[activeStationId];
            if (session) {
                const activeSeg = getActiveSegmentFast(session.id);
                if (activeSeg && activeSeg.timer_type === 'countdown' && activeSeg.duration_seconds) {
                    const remaining = getRemainingSeconds(activeSeg);
                    timerEl.textContent = formatCountdown(remaining);
                    if (remaining < 300) {
                        timerEl.classList.add('countdown-warning');
                    } else {
                        timerEl.classList.remove('countdown-warning');
                    }
                    timerEl.classList.add('countdown');
                } else {
                    timerEl.textContent = formatElapsed(new Date(timerEl.dataset.start));
                    timerEl.classList.remove('countdown', 'countdown-warning');
                }
            }
        }

        const currentSegTimer = document.getElementById('currentSegTimer');
        if (currentSegTimer && currentSegTimer.dataset.start && activeStationId) {
            const session = sessions[activeStationId];
            if (session) {
                const activeSeg = getActiveSegmentFast(session.id);
                if (activeSeg && activeSeg.timer_type === 'countdown' && activeSeg.duration_seconds) {
                    const remaining = getRemainingSeconds(activeSeg);
                    currentSegTimer.textContent = formatCountdown(remaining);
                } else {
                    currentSegTimer.textContent = formatElapsed(new Date(currentSegTimer.dataset.start));
                }
            }
        }

        const amountEl = document.getElementById('currentSegAmount');
        if (amountEl && activeStationId) {
            const session = sessions[activeStationId];
            if (session) {
                const { amount } = getCurrentSegmentEstimateFast(session.id);
                amountEl.textContent = moneyDec(amount);
            }
        }
    }, 1000);
}

function formatElapsed(start) {
    const secs = Math.max(0, Math.floor((Date.now() - start.getTime()) / 1000));
    const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
    return (h > 0 ? String(h).padStart(2, '0') + ':' : '') + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

// ============================================================
// DASHBOARD
// ============================================================
async function renderDashboard() {
    if (!currentShift) {
        try {
            const { data: created } = await supabaseClient.from('shifts').insert({ 
                business_id: business.id,
                opened_at: new Date().toISOString(),
                status: 'open'
            }).select().single();
            if (created) {
                currentShift = created;
                showToast(t('تم فتح شيفت جديد تلقائياً', 'New shift opened automatically'), 'success');
            }
        } catch (e) {
            console.error('Error auto-opening shift:', e);
            document.getElementById('dashRevenue').textContent = '0';
            document.getElementById('dashExpenses').textContent = '0';
            document.getElementById('dashActive').textContent = Object.keys(sessions).length;
            document.getElementById('dashAvailable').textContent = stations.length - Object.keys(sessions).length;
            return;
        }
    }
    
    if (!currentShift) {
        document.getElementById('dashRevenue').textContent = '0';
        document.getElementById('dashExpenses').textContent = '0';
        document.getElementById('dashActive').textContent = Object.keys(sessions).length;
        document.getElementById('dashAvailable').textContent = stations.length - Object.keys(sessions).length;
        return;
    }
    
    try {
        const { data: completedSessions } = await supabaseClient
            .from('sessions')
            .select('id, amount')
            .eq('business_id', business.id)
            .eq('status', 'completed')
            .gte('ended_at', currentShift.opened_at)
            .lte('ended_at', currentShift.closed_at || new Date().toISOString());
        
        let totalRevenue = 0;
        const sessionIds = (completedSessions || []).map(s => s.id);
        
        if (sessionIds.length > 0) {
            const { data: segments } = await supabaseClient
                .from('session_segments')
                .select('session_id, amount')
                .in('session_id', sessionIds);
            
            const { data: orders } = await supabaseClient
                .from('session_orders')
                .select('session_id, quantity, unit_price')
                .in('session_id', sessionIds);
            
            for (const session of completedSessions) {
                let sessionRevenue = Number(session.amount) || 0;
                
                if (sessionRevenue === 0) {
                    const segAmount = (segments || [])
                        .filter(s => s.session_id === session.id)
                        .reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
                    
                    const orderAmount = (orders || [])
                        .filter(o => o.session_id === session.id)
                        .reduce((sum, o) => sum + (Number(o.quantity) * Number(o.unit_price)), 0);
                    
                    sessionRevenue = segAmount + orderAmount;
                }
                
                totalRevenue += sessionRevenue;
            }
        }
        
        const { data: expensesData } = await supabaseClient
            .from('expenses')
            .select('amount')
            .eq('shift_id', currentShift.id);
        const totalExpenses = (expensesData || []).reduce((sum, e) => sum + Number(e.amount), 0);
        
        document.getElementById('dashRevenue').textContent = money(Math.round(totalRevenue * 100) / 100);
        document.getElementById('dashExpenses').textContent = money(Math.round(totalExpenses * 100) / 100);
        document.getElementById('dashActive').textContent = Object.keys(sessions).length;
        document.getElementById('dashAvailable').textContent = stations.length - Object.keys(sessions).length;
    } catch (e) {
        console.error('Error rendering dashboard:', e);
        document.getElementById('dashRevenue').textContent = '0';
        document.getElementById('dashExpenses').textContent = '0';
        document.getElementById('dashActive').textContent = Object.keys(sessions).length;
        document.getElementById('dashAvailable').textContent = stations.length - Object.keys(sessions).length;
    }
}

// ============================================================
// STATIONS
// ============================================================
function renderStationsGrid() {
    const grid = document.getElementById('stationsGrid');
    grid.innerHTML = stations.map(st => {
        const s = sessions[st.id];
        const occupied = !!s;
        const statusText = occupied ? t('شغال', 'Active') : t('متاح', 'Available');
        const displayName = st.name ? st.name : t('جهاز', 'Device') + ' ' + st.number;
        let modeBadge = '';
        let timerBadge = '';
        let timerDisplay = '';
        
        if (occupied) {
            const mode = s.current_mode || 'single';
            const modeLabel = mode === 'single' ? t('Single', 'Single') : t('Multi', 'Multi');
            const badgeClass = mode === 'single' ? 'badge-mode-single' : 'badge-mode-multi';
            modeBadge = `<span class="badge ${badgeClass}" style="font-size:9px;padding:1px 8px;">${modeLabel}</span>`;
            
            const timerType = s.timer_type || 'countup';
            const timerLabel = timerType === 'countdown' ? t('تنازلي', 'Countdown') : t('تصاعدي', 'Count Up');
            const timerBadgeClass = timerType === 'countdown' ? 'badge-timer-down' : 'badge-timer-up';
            timerBadge = `<span class="badge ${timerBadgeClass}" style="font-size:8px;padding:1px 6px;">${timerLabel}</span>`;
            
            timerDisplay = `<div class="station-timer mono" data-start="${s.started_at}" data-station-id="${st.id}" data-timer-type="${timerType}">${formatElapsed(new Date(s.started_at))}</div>`;
        } else {
            timerDisplay = `<div class="station-rate">${t('Single', 'Single')} ${money(st.single_rate || 20)} / ${t('Multi', 'Multi')} ${money(st.multi_rate || 30)} ${t('ج/ساعة', 'EGP/hr')}</div>`;
        }
        
        return `<div class="station-card ${occupied ? 'occupied' : ''}" onclick="openStationSheet('${st.id}')">
            <div><div class="station-num">${displayName}</div><div class="station-status">${statusText} ${modeBadge} ${timerBadge}</div></div>
            ${timerDisplay}
        </div>`;
    }).join('');
}

// ============================================================
// STATION MANAGEMENT (Settings)
// ============================================================
let settingsStationsExpanded = false;

function toggleSettingsStations() {
    settingsStationsExpanded = !settingsStationsExpanded;
    document.getElementById('settingsStations').style.display = settingsStationsExpanded ? 'block' : 'none';
    document.getElementById('settingsStationsChevron').style.transform = settingsStationsExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
}

// ============================================================
// BULK RATE
// ============================================================
async function applyBulkRate(type) {
    const singleInput = document.getElementById('bulkSingleRateInput');
    const multiInput = document.getElementById('bulkMultiRateInput');
    
    let rate, fieldName, typeLabel;
    if (type === 'single') {
        rate = parseFloat(singleInput.value);
        fieldName = 'single_rate';
        typeLabel = 'Single';
        if (isNaN(rate) || rate < 0) {
            showToast(t('اكتب سعر Single صحيح', 'Enter a valid Single price'), 'error');
            return;
        }
    } else {
        rate = parseFloat(multiInput.value);
        fieldName = 'multi_rate';
        typeLabel = 'Multi';
        if (isNaN(rate) || rate < 0) {
            showToast(t('اكتب سعر Multi صحيح', 'Enter a valid Multi price'), 'error');
            return;
        }
    }
    
    if (!stations || stations.length === 0) {
        showToast(t('مفيش أجهزة عشان تتحدث', 'No devices to update'), 'error');
        return;
    }
    
    if (!confirm(t(`هل أنت متأكد من تثبيت سعر ${rate} ج/ساعة لـ ${typeLabel} لكل الأجهزة (${stations.length})؟`, `Set ${rate} EGP/hr for ${typeLabel} on all ${stations.length} devices?`))) return;

    try {
        const updateData = {};
        updateData[fieldName] = rate;
        
        const { data, error } = await supabaseClient
            .from('stations')
            .update(updateData)
            .eq('business_id', business.id)
            .select();

        if (error) {
            showToast(t('فشل تحديث السعر: ' + error.message, 'Failed to update price: ' + error.message), 'error');
            console.error('Error bulk-updating rates:', error);
            return;
        }
        if (!data || data.length === 0) {
            console.error('Bulk rate update affected 0 rows — check RLS UPDATE policy on "stations" table.');
            showToast(t('فشل تحديث السعر: قاعدة البيانات رفضت الحفظ (تحقق من صلاحيات RLS على جدول stations)', 'Failed to update price: database rejected the save (check RLS permissions on the stations table)'), 'error');
            return;
        }

        if (type === 'single') {
            singleInput.value = '';
        } else {
            multiInput.value = '';
        }
        
        showToast(t(`اتحدث سعر ${typeLabel} لكل الأجهزة`, `${typeLabel} price updated for all devices`), 'success');
        await loadStations();
        renderSettingsStations();
        renderStationsGrid();
    } catch (e) {
        console.error('Error applying bulk rate:', e);
        showToast(t('حصل خطأ، حاول تاني.', 'Error, try again.'), 'error');
    }
}

function renderSettingsStations() {
    const el = document.getElementById('settingsStations');
    const countEl = document.getElementById('settingsStationsCount');
    if (countEl) countEl.textContent = stations && stations.length ? `(${stations.length})` : '';
    if (!stations || stations.length === 0) {
        el.innerHTML = `<div class="empty"><i class="fa-solid fa-gamepad"></i>${t('مفيش أجهزة — ضيف أول جهاز', 'No devices — add your first device')}</div>`;
        return;
    }
    el.innerHTML = stations.map(st => {
        const displayName = st.name ? st.name : t('جهاز', 'Device') + ' ' + st.number;
        return `<div class="list-row">
            <div><div class="row-title">${escapeHtml(displayName)}</div><div class="row-sub">${t('رقم', 'No.')} ${st.number} — ${t('Single', 'Single')} ${money(st.single_rate || 20)} / ${t('Multi', 'Multi')} ${money(st.multi_rate || 30)} ${t('ج/ساعة', 'EGP/hr')}</div></div>
            <div class="row-actions">
                <button class="btn btn-ghost btn-sm" onclick="editStation('${st.id}')"><i class="fa-solid fa-pen"></i></button>
                <button class="btn btn-danger-sm" onclick="deleteStationById('${st.id}')"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>`;
    }).join('');
}

function openStationManagementSheet() {
    document.getElementById('stationManageId').value = '';
    document.getElementById('stationManageNumber').value = stations.length + 1;
    document.getElementById('stationManageName').value = '';
    document.getElementById('stationManageSingleRate').value = '20';
    document.getElementById('stationManageMultiRate').value = '30';
    document.getElementById('stationDeleteBtn').style.display = 'none';
    document.getElementById('stationManageError').textContent = '';
    document.getElementById('stationManagementTitle').textContent = t('إضافة جهاز', 'Add Device');
    openSheet('stationManagementOverlay');
}

function editStation(stationId) {
    const st = stations.find(s => s.id === stationId);
    if (!st) return;
    document.getElementById('stationManageId').value = st.id;
    document.getElementById('stationManageNumber').value = st.number;
    document.getElementById('stationManageName').value = st.name || '';
    document.getElementById('stationManageSingleRate').value = st.single_rate || 20;
    document.getElementById('stationManageMultiRate').value = st.multi_rate || 30;
    document.getElementById('stationDeleteBtn').style.display = 'flex';
    document.getElementById('stationManageError').textContent = '';
    document.getElementById('stationManagementTitle').textContent = t('تعديل جهاز', 'Edit Device');
    openSheet('stationManagementOverlay');
}

async function submitStationManagement() {
    const id = document.getElementById('stationManageId').value;
    const number = parseInt(document.getElementById('stationManageNumber').value);
    const name = document.getElementById('stationManageName').value.trim();
    const singleRate = parseFloat(document.getElementById('stationManageSingleRate').value);
    const multiRate = parseFloat(document.getElementById('stationManageMultiRate').value);
    const errEl = document.getElementById('stationManageError');
    errEl.textContent = '';

    if (!number || number < 1) { errEl.textContent = t('رقم الجهاز مطلوب.', 'Device number is required.'); return; }
    if (isNaN(singleRate) || singleRate < 0) { errEl.textContent = t('سعر Single مطلوب.', 'Single rate is required.'); return; }
    if (isNaN(multiRate) || multiRate < 0) { errEl.textContent = t('سعر Multi مطلوب.', 'Multi rate is required.'); return; }

    if (!id && stations.some(s => s.number === number)) {
        errEl.textContent = t('رقم الجهاز مستخدم بالفعل.', 'Device number already exists.');
        return;
    }

    try {
        if (id) {
            const { error } = await supabaseClient.from('stations').update({ number, name, single_rate: singleRate, multi_rate: multiRate }).eq('id', id).eq('business_id', business.id);
            if (error) throw error;
            showToast(t('تم تحديث الجهاز', 'Device updated'), 'success');
        } else {
            const { error } = await supabaseClient.from('stations').insert({ business_id: business.id, number, name, single_rate: singleRate, multi_rate: multiRate });
            if (error) throw error;
            showToast(t('تم إضافة الجهاز', 'Device added'), 'success');
        }
        closeSheet('stationManagementOverlay');
        await loadStations();
        renderStationsGrid();
        renderSettingsStations();
        renderDashboard();
    } catch (e) {
        errEl.textContent = t('حصل خطأ، حاول تاني.', 'Error, try again.');
        console.error(e);
    }
}

async function deleteStationById(stationId) {
    if (!confirm(t('هل أنت متأكد من حذف هذا الجهاز؟', 'Are you sure you want to delete this device?'))) return;

    if (sessions[stationId]) {
        showToast(t('لا يمكن حذف جهاز عليه جلسة شغالة.', 'Cannot delete a device with an active session.'), 'error');
        return;
    }

    try {
        const { error } = await supabaseClient.from('stations').delete().eq('id', stationId).eq('business_id', business.id);
        if (error) throw error;
        showToast(t('تم حذف الجهاز', 'Device deleted'), 'success');
        await loadStations();
        renderStationsGrid();
        renderSettingsStations();
        renderDashboard();
    } catch (e) {
        showToast(t('فشل الحذف، حاول تاني.', 'Delete failed, try again.'), 'error');
        console.error(e);
    }
}

async function deleteStation() {
    const id = document.getElementById('stationManageId').value;
    if (!id) return;
    closeSheet('stationManagementOverlay');
    await deleteStationById(id);
}

// ============================================================
// PAYMENT METHODS (Settings)
// ============================================================
function renderSettingsPaymentMethods() {
    const el = document.getElementById('settingsPaymentMethods');
    if (!paymentMethods || paymentMethods.length === 0) {
        el.innerHTML = `<div class="empty"><i class="fa-solid fa-credit-card"></i>${t('مفيش طرق دفع — ضيف أول طريقة', 'No payment methods — add your first method')}</div>`;
        return;
    }
    el.innerHTML = paymentMethods.map(pm => {
        const colorMap = {
            'badge-teal': 'var(--teal)',
            'badge-amber': 'var(--amber)',
            'badge-green': 'var(--green)',
            'badge-purple': 'var(--purple)',
            'badge-red': 'var(--red)'
        };
        const color = colorMap[pm.color] || 'var(--text)';
        return `<div class="list-row">
            <div><div class="row-title"><i class="fa-solid ${pm.icon}" style="color:${color};width:20px;"></i> ${escapeHtml(pm.name)}</div>
            <div class="row-sub">${pm.active ? t('مفعل', 'Active') : t('غير مفعل', 'Inactive')}</div></div>
            <div class="row-actions">
                <button class="btn btn-ghost btn-sm" onclick="editPaymentMethod('${pm.id}')"><i class="fa-solid fa-pen"></i></button>
                <button class="btn btn-danger-sm" onclick="deletePaymentMethodById('${pm.id}')"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>`;
    }).join('');
}

function openPaymentMethodSheet() {
    document.getElementById('paymentMethodId').value = '';
    document.getElementById('paymentMethodName').value = '';
    document.getElementById('paymentMethodIcon').value = 'fa-money-bill-wave';
    document.getElementById('paymentMethodColor').value = 'badge-green';
    document.getElementById('paymentMethodActive').checked = true;
    document.getElementById('paymentDeleteBtn').style.display = 'none';
    document.getElementById('paymentMethodError').textContent = '';
    document.getElementById('paymentMethodTitle').textContent = t('إضافة طريقة دفع', 'Add Payment Method');
    openSheet('paymentMethodOverlay');
}

function editPaymentMethod(pmId) {
    const pm = paymentMethods.find(p => p.id === pmId);
    if (!pm) return;
    document.getElementById('paymentMethodId').value = pm.id;
    document.getElementById('paymentMethodName').value = pm.name;
    document.getElementById('paymentMethodIcon').value = pm.icon || 'fa-money-bill-wave';
    document.getElementById('paymentMethodColor').value = pm.color || 'badge-green';
    document.getElementById('paymentMethodActive').checked = pm.active !== false;
    document.getElementById('paymentDeleteBtn').style.display = 'flex';
    document.getElementById('paymentMethodError').textContent = '';
    document.getElementById('paymentMethodTitle').textContent = t('تعديل طريقة دفع', 'Edit Payment Method');
    openSheet('paymentMethodOverlay');
}

async function submitPaymentMethod() {
    const id = document.getElementById('paymentMethodId').value;
    const name = document.getElementById('paymentMethodName').value.trim();
    const icon = document.getElementById('paymentMethodIcon').value;
    const color = document.getElementById('paymentMethodColor').value;
    const active = document.getElementById('paymentMethodActive').checked;
    const errEl = document.getElementById('paymentMethodError');
    errEl.textContent = '';

    if (!name) { errEl.textContent = t('اسم طريقة الدفع مطلوب.', 'Payment method name is required.'); return; }

    try {
        if (id) {
            await supabaseClient.from('payment_methods').update({ name, icon, color, active }).eq('id', id);
            showToast(t('تم تحديث طريقة الدفع', 'Payment method updated'), 'success');
        } else {
            await supabaseClient.from('payment_methods').insert({ business_id: business.id, name, icon, color, active });
            showToast(t('تم إضافة طريقة الدفع', 'Payment method added'), 'success');
        }
        closeSheet('paymentMethodOverlay');
        await loadPaymentMethods();
        renderSettingsPaymentMethods();
    } catch (e) {
        errEl.textContent = t('حصل خطأ، حاول تاني.', 'Error, try again.');
        console.error(e);
    }
}

async function deletePaymentMethodById(pmId) {
    if (!confirm(t('هل أنت متأكد من حذف طريقة الدفع هذه؟', 'Are you sure you want to delete this payment method?'))) return;
    try {
        await supabaseClient.from('payment_methods').delete().eq('id', pmId);
        showToast(t('تم حذف طريقة الدفع', 'Payment method deleted'), 'success');
        await loadPaymentMethods();
        renderSettingsPaymentMethods();
    } catch (e) {
        showToast(t('فشل الحذف، حاول تاني.', 'Delete failed, try again.'), 'error');
        console.error(e);
    }
}

async function deletePaymentMethod() {
    const id = document.getElementById('paymentMethodId').value;
    if (!id) return;
    closeSheet('paymentMethodOverlay');
    await deletePaymentMethodById(id);
}

// ============================================================
// ORDER FUNCTIONS
// ============================================================
async function addOrderItem(sessionId, menuItemId) {
    const item = menuItems.find(m => String(m.id) === String(menuItemId));
    if (!item) {
        showToast(t('الصنف غير موجود', 'Item not found'), 'error');
        return;
    }

    sessionId = sessionId ||
        currentOrderSessionId ||
        (activeStationId && sessions[activeStationId] ? sessions[activeStationId].id : '');

    if (!sessionId) {
        console.error('No active session ID', {
            activeStationId,
            currentOrderSessionId,
            stationSession: activeStationId ? sessions[activeStationId] : null
        });
        showToast(t('الجلسة غير موجودة', 'Session not found'), 'error');
        return;
    }

    try {
        const existing = activeSessionOrders.find(
            o => String(o.menu_item_id) === String(menuItemId)
        );

        if (existing) {
            const { error } = await supabaseClient
                .from('session_orders')
                .update({ quantity: Number(existing.quantity || 0) + 1 })
                .eq('id', existing.id);

            if (error) throw error;
        } else {
            // IMPORTANT:
            // Do NOT use .select().single() here.
            // If INSERT is allowed by RLS but SELECT is not,
            // .insert().select().single() reports a false failure.
            //
            // We also send business_id when the column exists in the
            // current V2 schema. If an older database does not have it,
            // retry once without business_id.
            let insertPayload = {
                business_id: business.id,
                session_id: sessionId,
                menu_item_id: item.id,
                item_name: item.name,
                unit_price: Number(item.price),
                quantity: 1
            };

            let { error } = await supabaseClient
                .from('session_orders')
                .insert(insertPayload);

            if (error && (
                error.code === '42703' ||
                /business_id/i.test(error.message || '') &&
                /column/i.test(error.message || '')
            )) {
                delete insertPayload.business_id;

                ({ error } = await supabaseClient
                    .from('session_orders')
                    .insert(insertPayload));
            }

            if (error) throw error;
        }

        // Reload from DB so the UI has the real row/id.
        const { data: refreshedOrders, error: reloadError } = await supabaseClient
            .from('session_orders')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at');

        if (reloadError) {
            // The insert succeeded, but the current RLS SELECT policy
            // may prevent reading the row back. Do not claim INSERT failed.
            console.error('Order was inserted, but reload failed:', reloadError);
            showToast(
                t('تم حفظ الطلب، لكن صلاحية قراءة الطلبات تحتاج مراجعة في Supabase.', 'Order was saved, but the SELECT permission for orders needs review in Supabase.'),
                'warning'
            );
        } else {
            activeSessionOrders = refreshedOrders || [];
        }

        renderStationOrdersSection();

        const totals = await calculateTotalAmounts(sessionId);
        const totalEl = document.getElementById('overallTotalAmount');
        if (totalEl) {
            totalEl.textContent = moneyDec(totals.grandTotal);
        }

        if (!reloadError) {
            showToast(t('تم إضافة الطلب', 'Order added'), 'success');
        }

    } catch (e) {
        console.error('Error adding order:', e);

        const code = e?.code || '';
        const message = e?.message || String(e);

        let userMessage = t('فشل إضافة الطلب', 'Failed to add order');

        if (code === '23503') {
            userMessage = t(
                'فشل الطلب: الصنف أو الجلسة غير موجودة في قاعدة البيانات.',
                'Order failed: the item or session does not exist in the database.'
            );
        } else if (code === '42501') {
            userMessage = t(
                'فشل الطلب: صلاحيات قاعدة البيانات (RLS) تمنع إضافة الطلب.',
                'Order failed: database permissions (RLS) are blocking the insert.'
            );
        } else if (code === '23502') {
            userMessage = t(
                'فشل الطلب: يوجد عمود مطلوب في session_orders لم يتم إرساله.',
                'Order failed: a required column in session_orders was not provided.'
            );
        } else if (code === '23514') {
            userMessage = t(
                'فشل الطلب: يوجد شرط CHECK في جدول session_orders يمنع هذه القيمة.',
                'Order failed: a CHECK constraint in session_orders rejected the value.'
            );
        }

        console.error('Supabase order error details:', {
            code,
            message,
            details: e?.details,
            hint: e?.hint
        });

        showToast(userMessage, 'error');
    }
}

async function removeOrderItem(orderId) {
    const order = activeSessionOrders.find(o => o.id === orderId);
    if (!order) return;
    if (order.quantity > 1) {
        await supabaseClient.from('session_orders').update({ quantity: order.quantity - 1 }).eq('id', orderId);
        order.quantity -= 1;
    } else {
        await supabaseClient.from('session_orders').delete().eq('id', orderId);
        activeSessionOrders = activeSessionOrders.filter(o => o.id !== orderId);
    }
    renderStationOrdersSection();
}

// ============================================================
// TRANSFER SESSION FUNCTIONS
// ============================================================
function openTransferSheet(stationId) {
    transferSourceStationId = stationId;
    const session = sessions[stationId];
    if (!session) {
        showToast(t('الجلسة غير موجودة', 'Session not found'), 'error');
        return;
    }
    
    const body = document.getElementById('transferSheetBody');
    const sourceStation = stations.find(s => s.id === stationId);
    const sourceName = sourceStation ? (sourceStation.name || t('جهاز', 'Device') + ' ' + sourceStation.number) : t('جهاز', 'Device');
    
    const availableStations = stations.filter(s => s.id !== stationId && !sessions[s.id]);
    
    if (availableStations.length === 0) {
        body.innerHTML = `
            <div class="empty" style="padding:20px;">
                <i class="fa-solid fa-exchange" style="font-size:32px;"></i>
                <div style="font-size:16px;font-weight:700;margin:10px 0;">${t('لا يوجد أجهزة متاحة', 'No available devices')}</div>
                <div style="font-size:13px;color:var(--text-dim);">${t('كل الأجهزة مشغولة حالياً', 'All devices are currently occupied')}</div>
                <button class="btn btn-ghost btn-block" style="margin-top:16px;" onclick="closeSheet('transferOverlay')">${t('رجوع', 'Back')}</button>
            </div>
        `;
        openSheet('transferOverlay');
        return;
    }
    
    body.innerHTML = `
        <div style="margin-bottom:12px;text-align:center;">
            <div style="font-size:13px;color:var(--text-dim);">${t('نقل الجلسة من', 'Transfer session from')}</div>
            <div style="font-size:18px;font-weight:700;color:var(--amber);">${escapeHtml(sourceName)}</div>
            <div style="font-size:12px;color:var(--text-dim);margin-top:4px;">${t('اختر الجهاز المستهدف', 'Select target device')}</div>
        </div>
        <div class="transfer-targets" id="transferTargets">
            ${availableStations.map(st => {
                const targetName = st.name ? st.name : t('جهاز', 'Device') + ' ' + st.number;
                return `<div class="transfer-option" data-id="${st.id}" onclick="selectTransferTarget('${st.id}')">
                    <div class="target-name">${escapeHtml(targetName)}</div>
                    <div class="target-status">${t('متاح', 'Available')}</div>
                </div>`;
            }).join('')}
        </div>
        <input type="hidden" id="selectedTransferTarget" value="">
        <button class="btn btn-transfer btn-block" id="confirmTransferBtn" onclick="confirmTransfer()" disabled>
            <i class="fa-solid fa-exchange"></i> ${t('تأكيد النقل', 'Confirm Transfer')}
        </button>
        <button class="btn btn-ghost btn-block" style="margin-top:8px;" onclick="closeSheet('transferOverlay')">${t('إلغاء', 'Cancel')}</button>
        <div class="error-text" id="transferError"></div>
    `;
    openSheet('transferOverlay');
}

function selectTransferTarget(stationId) {
    document.querySelectorAll('.transfer-option').forEach(el => {
        el.classList.toggle('selected', el.dataset.id === stationId);
    });
    document.getElementById('selectedTransferTarget').value = stationId;
    document.getElementById('confirmTransferBtn').disabled = false;
}

async function confirmTransfer() {
    const targetStationId = document.getElementById('selectedTransferTarget').value;
    const sourceStationId = transferSourceStationId;
    const errEl = document.getElementById('transferError');
    errEl.textContent = '';
    
    if (!targetStationId) {
        errEl.textContent = t('اختر جهازاً مستهدفاً أولاً.', 'Select a target device first.');
        return;
    }
    
    if (sessions[targetStationId]) {
        errEl.textContent = t('الجهاز المستهدف أصبح مشغولاً.', 'Target device is now occupied.');
        return;
    }
    
    const sourceSession = sessions[sourceStationId];
    if (!sourceSession) {
        errEl.textContent = t('الجلسة المصدر غير موجودة.', 'Source session not found.');
        return;
    }
    
    const sourceStation = stations.find(s => s.id === sourceStationId);
    const targetStation = stations.find(s => s.id === targetStationId);
    const sourceName = sourceStation ? (sourceStation.name || t('جهاز', 'Device') + ' ' + sourceStation.number) : t('جهاز', 'Device');
    const targetName = targetStation ? (targetStation.name || t('جهاز', 'Device') + ' ' + targetStation.number) : t('جهاز', 'Device');
    
    const confirmMsg = t(
        `هل أنت متأكد من نقل الجلسة من "${sourceName}" إلى "${targetName}"؟\n\nسيتم نقل كل البيانات (الوقت، الأجزاء، الطلبات) مع الجلسة.`,
        `Are you sure you want to transfer the session from "${sourceName}" to "${targetName}"?\n\nAll data (time, segments, orders) will be transferred with the session.`
    );
    
    if (!confirm(confirmMsg)) return;
    
    try {
        const currentMode = sourceSession.current_mode || 'single';
        const currentRate = Number(sourceSession.rate) || (currentMode === 'multi' ? Number(targetStation.multi_rate) : Number(targetStation.single_rate));
        const { error: updateError } = await supabaseClient.from('sessions')
            .update({ station_id: targetStationId, rate: currentRate })
            .eq('id', sourceSession.id)
            .eq('business_id', business.id)
            .eq('status', 'active');
        if (updateError) throw updateError;

        delete sessions[sourceStationId];
        sessions[targetStationId] = { ...sourceSession, station_id: targetStationId, rate: currentRate };
        
        closeSheet('transferOverlay');
        closeSheet('stationOverlay');
        renderStationsGrid();
        renderDashboard();
        
        showToast(t(`تم نقل الجلسة إلى ${targetName}`, `Session transferred to ${targetName}`), 'success');
        
        setTimeout(() => openStationSheet(targetStationId), 300);
    } catch (e) {
        console.error('Error transferring session:', e);
        errEl.textContent = t('فشل نقل الجلسة: ' + e.message, 'Transfer failed: ' + e.message);
        showToast(t('فشل نقل الجلسة', 'Transfer failed'), 'error');
    }
}

// ============================================================
// CANCEL SESSION
// ============================================================
function confirmCancelSession(stationId) {
    const session = sessions[stationId];
    if (!session) return;
    
    const totalTime = formatElapsed(new Date(session.started_at));
    const hasOrders = activeSessionOrders && activeSessionOrders.length > 0;
    const ordersCount = hasOrders ? activeSessionOrders.length : 0;
    
    let confirmMsg = t(
        `⚠️ هل أنت متأكد من إلغاء الجلسة؟\n\nالمدة: ${totalTime}\nالطلبات: ${ordersCount} صنف\n\nملاحظة: لن يتم تسجيل أي إ
