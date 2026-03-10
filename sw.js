self.addEventListener('install', (e) => {
    // บังคับให้ Service Worker ตัวใหม่ทำงานทันที
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    // ควบคุมหน้าเว็บทั้งหมดที่อยู่ภายใต้ Scope ทันที
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    // เบราว์เซอร์รุ่นใหม่บังคับให้ต้องมีการตอบสนอง (respondWith) จึงจะให้ผ่านเกณฑ์ PWA
    e.respondWith(
        fetch(e.request).catch(() => {
            // ดักจับกรณีที่ผู้ใช้ออฟไลน์ (เน็ตหลุด)
            return new Response('กรุณาเชื่อมต่ออินเทอร์เน็ตเพื่อใช้งานระบบประเมินผล', {
                headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            });
        })
    );
});
