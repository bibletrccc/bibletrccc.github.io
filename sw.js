var cacheName = 'bible-0.0.1';
self.addEventListener('install', function(event){
	event.waitUntil(
		caches.open(cacheName).then(function(cache){
			return cache.addAll(['./']);
		})
	);
});

self.addEventListener('activate', function(event){
	event.waitUntil(
		caches.keys().then(function(keyList){
			return Promise.all(
				keyList.filter(function(key){
					return key.startsWith('bible-') && key != cacheName;
				}).map(function(key){
					return caches.delete(key);
				})
			);
		})
	);
	event.waitUntil(
		caches.open(cacheName)
		.then(function(cache){
			//delete the cached default page (/) from the browser's local cache
			cache.delete('/',{ignoreSearch: true});
		})
	);	
});

self.addEventListener("fetch", function(event) {
	//if(event.request.url.match(/.php/i))
	//	return; //do not cache the api calls
	
	event.respondWith(
		caches.match(event.request, {ignoreSearch: true}).then((resp) => {
		  return resp || fetch(event.request).then((response) => {
			  if(response && response.status == 200) {
				return caches.open(cacheName).then((cache) => {
					cache.put(event.request, response.clone());
					return response;
				});
			} else 
				return response;				
		  }).catch(err=>console.log(event.request, err));
		})
	  );	
});

self.addEventListener('message', function(event){
	if(event.data.action === 'skipWaiting') {
		self.skipWaiting();
	}
});

