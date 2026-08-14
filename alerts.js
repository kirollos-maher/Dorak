// ============================================================
// COUNTDOWN ALERTS - نظام التنبيهات المتقدم مع جرس في الـ Header + صوت متحدث (TTS)
// ============================================================

// تخزين حالة التنبيهات لكل جهاز (لمنع التكرار)
const countdownAlertState = {};

// الحد الأدنى للتنبيه (بالثواني) - 300 ثانية = 5 دقائق
const ALERT_THRESHOLD = 300;

// متغير للمؤقت
let countdownAlertInterval = null;

// متغيرات الصوت
let audioContext = null;
let ringTimeout = null;

// ========================
// التحكم في أيقونة الجرس (مستقل عن حالة التنبيهات)
// ========================
function setBellRinging(active) {
    const bell = document.getElementById('headerBell');
    if (!bell) return;
    if (active) {
        bell.classList.add('bell-ringing');
    } else {
        bell.classList.remove('bell-ringing');
    }
}

// ========================
// 🗣️ التحدث بصوت (Text-to-Speech) بالعربية
// ========================
function speakAlert(message, type = 'warning') {
    try {
        // إيقاف أي كلام سابق
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'ar-EG'; // اللغة العربية المصرية
        utterance.rate = 0.9;     // سرعة مناسبة (ليست سريعة جداً)
        utterance.pitch = 1.0;    // نغمة طبيعية
        utterance.volume = 1;     // أعلى صوت
        
        // اختيار صوت عربي إذا كان متوفراً
        const voices = window.speechSynthesis.getVoices();
        const arabicVoice = voices.find(v => v.lang.startsWith('ar'));
        if (arabicVoice) {
            utterance.voice = arabicVoice;
        }
        
        window.speechSynthesis.speak(utterance);
        console.log('🗣️ Speaking:', message);
    } catch (e) {
        console.warn('⚠️ Speech synthesis not supported:', e);
    }
}

// تحميل الأصوات مسبقاً
if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
    };
}

// ========================
// تهيئة الصوت (النغمات)
// ========================
function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('🎵 Audio initialized for alerts');
    } catch (e) {
        console.warn('⚠️ Audio not supported');
    }
}

// ========================
// تشغيل صوت التنبيه (نغمة)
// ========================
function playRingSound(type = 'warning') {
    try {
        if (!audioContext) {
            initAudio();
        }
        if (!audioContext) return;
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        const now = audioContext.currentTime;

        if (type === 'warning') {
            // نغمة تحذيرية (نغمتين متتاليتين) - هادئة
            const frequencies = [800, 1000];
            const durations = [0.2, 0.2];
            let time = now;

            frequencies.forEach((freq, i) => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.connect(gain);
                gain.connect(audioContext.destination);
                osc.frequency.setValueAtTime(freq, time);
                gain.gain.setValueAtTime(0.3, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + durations[i]);
                osc.start(time);
                osc.stop(time + durations[i]);
                time += durations[i] + 0.1;
            });
        } else if (type === 'ended') {
            // صوت انتهاء الوقت: أعلى وأوضح (3 نغمات 1000-800-1000)
            const frequencies = [1000, 800, 1000];
            const durations = [0.3, 0.25, 0.35];
            let time = now;

            frequencies.forEach((freq, i) => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.connect(gain);
                gain.connect(audioContext.destination);
                osc.frequency.setValueAtTime(freq, time);
                gain.gain.setValueAtTime(0.4, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + durations[i]);
                osc.start(time);
                osc.stop(time + durations[i]);
                time += durations[i] + 0.08;
            });
        }

        // اهتزاز للجوال
        if (navigator.vibrate) {
            navigator.vibrate(type === 'ended' ? [300, 100, 300, 100, 300] : [200, 100, 200]);
        }

    } catch (e) {
        console.warn('⚠️ Could not play sound:', e);
    }
}

// ========================
// عرض إشعار مرئي + صوت + كلام مسموع
// ========================
function showRingNotification(title, message, type = 'warning') {
    // 🗣️ التحدث بصوت (قبل أي شيء)
    speakAlert(message, type);
    
    // تشغيل النغمة
    playRingSound(type);

    // 🔔 تفعيل الجرس (يظهر ويتحرك)
    setBellRinging(true);

    // إلغاء أي تايمر سابق لإيقاف الجرس
    clearTimeout(ringTimeout);

    // جدولة إيقاف الجرس بعد 5 ثواني
    ringTimeout = setTimeout(() => {
        setBellRinging(false);
    }, 5000);

    // البحث عن عنصر الإشعار المنبثق
    const el = document.getElementById('ringNotification');
    if (!el) {
        // إذا لم يوجد عنصر الإشعار، استخدم Toast مع نص الكلام
        if (typeof showToast === 'function') {
            showToast(`🔊 ${title}: ${message}`, type === 'ended' ? 'error' : 'warning');
        }
        return;
    }

    // تحديث محتوى الإشعار
    document.getElementById('ringTitle').textContent = title;
    document.getElementById('ringSub').textContent = message;

    // إظهار الإشعار
    el.classList.add('show');

    // إخفاء الإشعار بعد 5 ثواني (مع إيقاف الجرس)
    clearTimeout(el._hideTimeout);
    el._hideTimeout = setTimeout(() => {
        el.classList.remove('show');
        // الجرس سيتوقف بواسطة الـ timeout أعلاه
    }, 5000);

    // النقر على الإشعار لإخفائه فوراً وإيقاف الجرس
    el.onclick = function() {
        el.classList.remove('show');
        clearTimeout(el._hideTimeout);
        clearTimeout(ringTimeout);
        setBellRinging(false);
        // إيقاف الكلام إذا كان لسه شغال
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    };
}

// ========================
// وظيفة المراقبة الأساسية
// ========================
function checkCountdownAlerts() {
    // التأكد من وجود البيانات الأساسية
    if (typeof business === 'undefined' || !business ||
        typeof stations === 'undefined' || !stations ||
        typeof sessions === 'undefined') {
        return;
    }

    if (Object.keys(sessions).length === 0) {
        // مسح حالة التنبيهات عند عدم وجود جلسات
        for (const key in countdownAlertState) {
            delete countdownAlertState[key];
        }
        // إذا لم توجد جلسات، نطفئ الجرس (احتياطي)
        setBellRinging(false);
        return;
    }

    if (typeof getActiveSegmentFast !== 'function' || typeof getRemainingSeconds !== 'function') {
        console.warn('⚠️ Alert functions not available yet');
        return;
    }

    Object.keys(sessions).forEach(stationId => {
        const session = sessions[stationId];
        if (!session) return;

        const activeSeg = getActiveSegmentFast(session.id);
        if (!activeSeg || activeSeg.timer_type !== 'countdown') return;

        const remaining = getRemainingSeconds(activeSeg);
        const station = stations.find(s => s.id === stationId);
        const deviceName = station ? (station.name || t('جهاز', 'Device') + ' ' + station.number) : t('جهاز', 'Device');

        if (remaining <= 0) {
            if (countdownAlertState[stationId] !== 'ended') {
                countdownAlertState[stationId] = 'ended';
                const msg = t(`⏰ انتهى وقت جهاز ${deviceName}`, `⏰ Time's up for device ${deviceName}`);
                showRingNotification(
                    t('⏰ انتهى الوقت!', '⏰ Time\'s up!'),
                    msg,
                    'ended'
                );
                if (typeof showToast === 'function') {
                    showToast(msg, 'error');
                }
            }
        } else if (remaining <= ALERT_THRESHOLD) {
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
                showRingNotification(
                    t('⏳ وقت شبه خلص', '⏳ Time almost up'),
                    msg,
                    'warning'
                );
                if (typeof showToast === 'function') {
                    showToast(msg, 'warning');
                }
            }
        } else {
            if (countdownAlertState[stationId]) {
                delete countdownAlertState[stationId];
            }
        }
    });
}

// ========================
// تشغيل / إيقاف المراقبة
// ========================
function startCountdownAlerts() {
    if (countdownAlertInterval) {
        clearInterval(countdownAlertInterval);
        countdownAlertInterval = null;
    }
    countdownAlertInterval = setInterval(checkCountdownAlerts, 1000);
    console.log('🔔 Countdown alerts started (Ring + Speech)');
}

function stopCountdownAlerts() {
    if (countdownAlertInterval) {
        clearInterval(countdownAlertInterval);
        countdownAlertInterval = null;
        console.log('🔕 Countdown alerts stopped');
    }
    setBellRinging(false);
    clearTimeout(ringTimeout);
    // إيقاف الكلام
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
}

// ========================
// التهيئة التلقائية عند تحميل الصفحة
// ========================
function initAlerts() {
    if (typeof business !== 'undefined' && business &&
        typeof stations !== 'undefined' && stations && stations.length > 0) {
        startCountdownAlerts();
    } else {
        setTimeout(initAlerts, 500);
    }
}

window.addEventListener('load', initAlerts);

window.addEventListener('beforeunload', function() {
    stopCountdownAlerts();
});

window.startCountdownAlerts = startCountdownAlerts;
window.stopCountdownAlerts = stopCountdownAlerts;
