'use strict';
(()=>{
const status=document.getElementById('loadStatus');
function busy(on,message){
 status.hidden=false; status.textContent=message;
 for(const selector of ['.toolbar','#nav','#content']){const el=document.querySelector(selector);el.inert=on;el.setAttribute('aria-busy',String(on))}
}
async function json(name){const packed=name==='reviewed.json';const response=await fetch('./'+name+(packed?'.gz':''));if(!response.ok)throw new Error('Dataset request failed');if(!packed)return response.json();const bytes=await response.arrayBuffer();const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');if(digest!=='8317ae25c47c3fa31168c5c7c5478c54579d2a37fe4b60c1f42c030848e21a28')throw new Error('Dataset integrity mismatch');const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));return new Response(stream).json()}
function script(name){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='./'+name;s.onload=resolve;s.onerror=reject;document.body.append(s)})}
function error(message,retry){busy(false,message);const b=document.createElement('button');b.id='retryLoad';b.textContent='Retry';b.onclick=retry;status.append(b)}
let historyPromise;
window.loadHistory=async()=>{
 if(Array.isArray(window.HISTORICAL_DATA.positions))return;
 if(historyPromise)return historyPromise;
 busy(true,'Loading historical reference holdings…');
 historyPromise=(async()=>{try{
 const data=await json('historical.json');
 if(!Array.isArray(data.positions)||data.positions.length!==window.HISTORICAL_DATA.positions.length)throw new Error('Invalid archive');
 Object.assign(window.HISTORICAL_DATA,data);
 busy(false,'Historical reference loaded.');status.hidden=true;
 }catch(e){historyPromise=null;error('Historical holdings could not be loaded. Reviewed holdings remain available.',()=>{document.getElementById('mode').value='history';document.getElementById('mode').dispatchEvent(new Event('change'))});throw e}})();
 return historyPromise;
};
(async()=>{busy(true,'Loading reviewed holdings…');try{
 [window.BDC_DASHBOARD_DATA,window.HISTORICAL_DATA]=await Promise.all([json('reviewed.json'),json('history-catalog.json')]);
 await script('evidence.js');await script('engine.js');await script('app.js');
 if(!window.UNIFIED_READY)throw new Error('Dashboard initialization failed');
 busy(false,'Reviewed holdings loaded.');status.hidden=true;
 }catch(e){error('The dashboard could not be loaded. Check your connection and retry.',()=>location.reload());for(const selector of ['.toolbar','#nav','#content'])document.querySelector(selector).inert=true}
})();
})();
