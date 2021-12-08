const APP_PREFIX = 'BudgetTracker-';     
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

//files cached from the '/public' dir
const FILES_TO_CACHE = [
    "./css/styles.css",
    "./js/idb.js",
    "./js/index.js",
    "./index.html"
  ];

//install the cache and store the files to the cache
self.addEventListener('install', function (e) {
    e.waitUntil(
      caches.open(CACHE_NAME).then(function (cache) {
        console.log('installing cache : ' + CACHE_NAME)
        return cache.addAll(FILES_TO_CACHE)
      })
    )
  });

//manage existing cache information, and save new cache information with the app prefix
self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(function (keylist) {
            let cacheKeeplist = keylist.filter(function (key) {
                return key.indexOf(APP_PREFIX);
            });
            cacheKeeplist.push(CACHE_NAME);

            return Promise.all(
                keylist.map(function (key, i) {
                    if(cacheKeeplist.indexOf(key) === -1) {
                        console.log('deleting cache: ' + keylist[i]);
                        return caches.delete(keylist[i]);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', function (e) {
    console.log('fetch request: ' + e.request.url);
    e.respondWith(
        caches.match(e.request).then(function (request) {
            return request || fetch(e.request);
        })
    );
});