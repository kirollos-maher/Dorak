// ============================================================
// security.js – طبقة حماية إضافية للتطبيق
// ============================================================

(function() {
    'use strict';

    // --------------------- DOMAIN LOCK (معطل) ---------------------
    // خلينا نعطل القفل عشان العميل يشتغل على أي نطاق أو IP
    /*
    const ALLOWED_DOMAINS = [
        'yourdomain.com',
        'www.yourdomain.com',
    ];
    const currentDomain = window.location.hostname;
    const isAllowed = ALLOWED_DOMAINS.some(d => currentDomain === d || currentDomain.endsWith('.' + d));
    if (!isAllowed && ALLOWED_DOMAINS.length > 0) {
        document.body.innerHTML = `...`;
        throw new Error('Unauthorized domain');
    }
    */

    // ---------------- ANTI-DEBUGGING (خفيف) ----------------
    // يكشف فتح أدوات المطور عبر console.log مع toString معطل
    let devtoolsDetected = false;
    const checkDevTools = () => {
        const element = new Error();
        const stack = element.stack || '';
        // بعض المتصفحات تترك أثراً في الـ stack عند فتح الأدوات
        if (stack.includes('debugger') || stack.includes('eval')) {
            devtoolsDetected = true;
        }
        // طريقة إضافية: قياس الفرق في الوقت
        const start = performance.now();
        debugger;
        const end = performance.now();
        if (end - start > 100) {
            devtoolsDetected = true;
        }
        if (devtoolsDetected) {
            // إجراءات رد الفعل: تعطيل التطبيق أو إعادة التوجيه
            document.body.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#0c0f12;color:#eef1f4;font-family:sans-serif;text-align:center;padding:20px;">
                    <div>
                        <h1 style="font-size:28px;margin-bottom:10px;">🔒 تم اكتشاف أدوات المطور</h1>
                        <p style="color:#8b95a1;">لا يمكن استخدام التطبيق أثناء فتح أدوات المطور.</p>
                    </div>
                </div>
            `;
            throw new Error('DevTools detected');
        }
    };

    // فحص دوري (كل 3 ثوانٍ) – يمكن تعطيله إذا أثر على الأداء
    setInterval(checkDevTools, 3000);

    // ---------------- TAMPER DETECTION (بسيط) ----------------
    // يتحقق من سلامة الوظائف الأساسية (مثل fetch) – اختياري
    const originalFetch = window.fetch;
    Object.defineProperty(window, 'fetch', {
        get: function() {
            // إذا تم تعديل fetch، نلغي التطبيق
            if (this !== originalFetch) {
                throw new Error('Application integrity compromised');
            }
            return originalFetch;
        },
        configurable: false,
        enumerable: true
    });

    console.log('✅ Security layer loaded successfully.');
})();
