'use strict';
const VERSION='3.1.1';
const CACHE='panel-walk-offline-'+VERSION;
const ROOT=new URL('./',self.location.href).pathname;
const FILES=['index.html','offline.html','manifest.webmanifest','icon-192.png','icon-512.png'];
const keys=FILES.map(file=>ROOT+file);
async function complete(){const cache=await caches.open(CACHE);const matches=await Promise.all(keys.map(key=>cache.match(key)));return matches.every(Boolean);}
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 try{await Promise.all(FILES.map(async file=>{const url=new URL(ROOT+file,self.location.origin);url.searchParams.set('pw-release',VERSION);const response=await fetch(new Request(url,{cache:'reload',credentials:'same-origin'}));if(!response.ok)throw Error('Offline asset unavailable: '+file);if(file==='offline.html'&&!(await response.clone().text()).includes("OFFLINE_BUILD='"+VERSION+"'"))throw Error('Offline release not published yet');await cache.put(ROOT+file,response);}));if(!(await complete()))throw Error('Incomplete offline cache');await self.skipWaiting();}catch(error){await caches.delete(CACHE);throw error;}
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{await self.clients.claim();const names=await caches.keys();await Promise.all(names.filter(name=>name==='panel-walk-v3.0.0'||(name.startsWith('panel-walk-offline-')&&name!==CACHE)).map(name=>caches.delete(name)));})()));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith(ROOT))return;
 if(url.pathname===ROOT+'_offline-proof'){
  event.respondWith((async()=>new Response(JSON.stringify({version:VERSION,complete:await complete()}),{headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Panel-Walk-Offline':VERSION}}))());return;
 }
 const path=url.pathname===ROOT?ROOT+'index.html':url.pathname;
 if(!keys.includes(path))return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE);const saved=await cache.match(path);if(saved)return saved;try{const response=await fetch(event.request);if(response.ok)await cache.put(path,response.clone());return response;}catch(e){return new Response('Offline copy incomplete. Reconnect and open Offline setup before leaving.',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}});}})());
});
