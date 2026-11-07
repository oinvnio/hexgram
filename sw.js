// 앱 파일은 미리 저장, 구글 폰트는 처음 쓸 때 저장 → 이후 오프라인에서도 실행
const CACHE = "hexgram-v3";
const CORE = ["./", "index.html", "manifest.json", "icons/icon-192.png", "icons/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const isFont = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  const isSame = url.origin === self.location.origin;
  if (!isFont && !isSame) return;

  // 네트워크 먼저 시도하고 실패하면 캐시 (앱을 고치면 바로 반영되도록)
  e.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match("index.html")))
  );
});
