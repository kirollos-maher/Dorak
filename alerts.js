// ============================================================
// COUNTDOWN ALERTS - إضافة منفصلة بدون تعديل الكود الموجود
// ============================================================

// تخزين حالة التنبيهات لكل جهاز
const countdownAlertState = {};

// الحد الأدنى للتنبيه (بالثواني) - 300 ثانية = 5 دقائق
const ALERT_THRESHOLD = 300;

// متغير للمؤقت
let countdownAlertInterval = null;

// دالة لإرسال تنبيه (صوت + رسالة)
function sendCountdownAlert(message, type = 'warning') {
    // استخدام الـ toast الموجود (من app.js)
    if (typeof showToast === 'function') {
        showToast(message, type);
    } else {
        // في حالة عدم وجود showToast (للأمان)
        alert(message);
    }
    // إصدار صوت
    playBeep();
}

// دالة لتشغيل صوت تنبيه (beep)
function playBeep() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.3;
        oscillator.start();
        setTimeout(() => {
            oscillator.stop();
        }, 500);
    } catch (e) {
        console.warn('Web Audio API not supported, falling back to console beep.');
        // يمكن استخدام console.log كبديل
        console.log('🔔 BEEP!');
    }
}

// دالة مراقبة الأجهزة التنازلية
function checkCountdownAlerts() {
    // التأكد من وجود البيانات الأساسية
    if (typeof business === 'undefined' || !business || typeof stations === 'undefined' || !stations || typeof sessions === 'undefined') {
        // إذا لم تكن البيانات جاهزة، نوقف المراقبة مؤقتاً
        return;
    }

    // إذا لم توجد جلسات نشطة، نوقف المراقبة (اختياري)
    if (Object.keys(sessions).length === 0) {
        // نعيد ضبط حالة التنبيهات
        for (const key in countdownAlertState) {
            delete countdownAlertState[key];
        }
        return;
    }

    Object.keys(sessions).forEach(stationId => {
        const session = sessions[stationId];
        if (!session) return;
        
        // التحقق من وجود دالة getActiveSegmentFast (من app.js)
        if (typeof getActiveSegmentFast !== 'function') {
            console.warn('getActiveSegmentFast not available');
            return;
        }
        
        const activeSeg = getActiveSegmentFast(session.id);
        if (!activeSeg || activeSeg.timer_type !== 'countdown') return;
        
        // حساب الوقت المتبقي
        const remaining = getRemainingSeconds(activeSeg);
        const station = stations.find(s => s.id === stationId);
        const deviceName = station ? (station.name || t('جهاز', 'Device') + ' ' + station.number) : t('جهاز', 'Device');
        
        if (remaining <= 0) {
            // انتهى الوقت
            if (countdownAlertState[stationId] !== 'ended') {
                countdownAlertState[stationId] = 'ended';
                const msg = t(`⏰ انتهى وقت جهاز ${deviceName}`, `⏰ Time's up for device ${deviceName}`);
                sendCountdownAlert(msg, 'error');
            }
        } else if (remaining <= ALERT_THRESHOLD) {
            // باقي وقت قليل (أقل من أو يساوي الحد المحدد)
            if (countdownAlertState[stationId] !== 'warning') {
                countdownAlertState[stationId] = 'warning';
                const minutes = Math.floor(remaining / 60);
                const seconds = Math.round(remaining % 60);
                let timeStr = '';
                if (minutes > 0) {
                    timeStr = `${minutes} ${t('دقيقة', 'minute')}`;
                    if (seconds > 0) timeStr += ` ${seconds} ${t('ثانية', 'second')}`;
                } else {
                    timeStr = `${seconds} ${t('ثانية', 'second')}`;
                }
                const msg = t(`⚠️ جهاز ${deviceName}: متبقي ${timeStr}`, `⚠️ Device ${deviceName}: ${timeStr} remaining`);
                sendCountdownAlert(msg, 'warning');
            }
        } else {
            // أكثر من الحد، نعيد ضبط الحالة إذا كانت تنبيه سابق
            if (countdownAlertState[stationId]) {
                delete countdownAlertState[stationId];
            }
        }
    });
}

// بدء المراقبة
function startCountdownAlerts() {
    if (countdownAlertInterval) {
        clearInterval(countdownAlertInterval);
        countdownAlertInterval = null;
    }
    countdownAlertInterval = setInterval(checkCountdownAlerts, 1000);
    console.log('🔔 Countdown alerts started');
}

// إيقاف المراقبة
function stopCountdownAlerts() {
    if (countdownAlertInterval) {
        clearInterval(countdownAlertInterval);
        countdownAlertInterval = null;
        console.log('🔕 Countdown alerts stopped');
    }
}

// محاولة تهيئة المراقبة عند تحميل الصفحة
function initAlerts() {
    // ننتظر حتى تتوفر البيانات الأساسية (business, stations)
    if (typeof business !== 'undefined' && business && typeof stations !== 'undefined' && stations && stations.length > 0) {
        startCountdownAlerts();
    } else {
        // نعيد المحاولة بعد 500 مللي ثانية
        setTimeout(initAlerts, 500);
    }
}

// ربط بدء المراقبة عند تحميل الصفحة
window.addEventListener('load', initAlerts);

// إيقاف المراقبة عند إغلاق الصفحة أو مغادرتها
window.addEventListener('beforeunload', function() {
    stopCountdownAlerts();
});

// إذا تم قفل التطبيق (lockApp) نوقف المراقبة (نستخدم حدث مخصص)
// ولكن لا نريد تعديل lockApp، لذا سنستمع لتغيير الشاشة
// بدلاً من ذلك، سنقوم بمراقبة وجود screen 'lockScreen' أو 'setupScreen'
// ويمكننا أيضاً إيقاف المراقبة عند switchBusiness (لكننا لا نعدله)
// سنقوم بفحص دوري إذا كان business لا يزال موجوداً، وإلا نوقف.
// نضيف هذا الفحص في checkCountdownAlerts نفسها.

// تعديل checkCountdownAlerts ليشمل إيقاف المراقبة إذا فقدنا business
const originalCheck = checkCountdownAlerts;
checkCountdownAlerts = function() {
    if (!business) {
        stopCountdownAlerts();
        return;
    }
    originalCheck();
};

// تصدير الدوال للاستخدام الخارجي (اختياري)
window.startCountdownAlerts = startCountdownAlerts;
window.stopCountdownAlerts = stopCountdownAlerts;
