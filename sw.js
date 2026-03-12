// ไฟล์นี้เป็นตัวหลอกให้ Chrome รู้ว่าแอปรองรับการทำงานแบบ Offline
const CACHE_NAME = 'uti-guide-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // บังคับให้โหลดข้อมูลผ่านเน็ตตามปกติ แต่ถ้าเน็ตหลุดจะไม่ทำเว็บพัง
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response('ท่านกำลังใช้งานแบบออฟไลน์');
    })
  );
});
