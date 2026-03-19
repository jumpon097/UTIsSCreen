const CACHE_NAME = 'uti-guide-offline-v1';

// ไฟล์หลักที่ต้องการเก็บลงเครื่องทันทีที่ติดตั้ง
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  // เก็บสคริปต์สร้างรูปภาพไว้ในเครื่องด้วย จะได้แชร์รูปตอนออฟไลน์ได้
  'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'
];

// 1. ติดตั้ง Service Worker และโหลดไฟล์ลง Cache
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache and saving core assets');
      return cache.addAll(CORE_ASSETS);
    })
  );
});

// 2. ลบ Cache เก่าทิ้งเมื่อมีการอัปเดตเวอร์ชัน
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('Deleting old cache:', name);
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. ดักจับการโหลดหน้าเว็บ (ถ้าไม่มีเน็ต ให้ดึงจากที่ Cache ไว้มาแสดง)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // ถ้าเจอไฟล์ใน Cache ให้เอามาใช้เลย (ทำงานออฟไลน์ได้)
      if (cachedResponse) {
        return cachedResponse;
      }

      // ถ้าไม่เจอ ให้ไปโหลดจากเน็ตปกติ แล้วแอบเก็บลง Cache ไว้ใช้รอบหน้า
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // กรณีออฟไลน์และไฟล์นั้นไม่เคยถูก Cache
        console.log('Offline: cannot fetch request', event.request.url);
      });
    })
  );
});
