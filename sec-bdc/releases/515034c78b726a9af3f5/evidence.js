 'use strict';
(()=>{
let manifestPromise;
async function checked(file,expected,packed){
 const response=await fetch('./'+file);if(!response.ok)throw new Error('Evidence request failed');
 const bytes=await response.arrayBuffer();const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
 if(hash!==expected)throw new Error('Evidence integrity mismatch');
 return packed?new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).json():JSON.parse(new TextDecoder().decode(bytes));
}
window.loadRowEvidence=async index=>{
 if(!Number.isInteger(index)||index<0)throw new Error('Invalid evidence reference');
 if(!manifestPromise)manifestPromise=checked('evidence-manifest.json','2ad26f2c1ca8dcd3293bca0e15ab338ffe3800990adfbb44104878f4af3804ff',false).catch(e=>{manifestPromise=null;throw e});
 const m=await manifestPromise;if(index>=m.count)throw new Error('Invalid evidence reference');
 const shard=m.shards[Math.floor(index/m.shardSize)];
 // Deliberately no shard cache: only the selected row's raw evidence remains in the detail DOM.
 const rows=await checked(shard.file,shard.sha256,true);return rows[index%m.shardSize];
};
})();
