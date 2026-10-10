(() => {
  "use strict";
  const KEY="orkid-card-state-v3";
  const LEGACY_KEY="orkid-card-customizations-v2";
  const DB_NAME="orkid-card-assets";
  const STORE="images";
  const prefix="idb-card:";
  const blobUrls=new Map();
  let dbPromise;

  function read(key){try{return JSON.parse(localStorage.getItem(key))||{};}catch{return {};}}
  function getState(){
    const current=read(KEY);
    if(Object.keys(current).length)return current;
    return read(LEGACY_KEY);
  }
  function setState(state){
    // Store metadata only. Never duplicate multi-megabyte images in two localStorage keys.
    localStorage.setItem(KEY,JSON.stringify(state));
    return state;
  }
  function openDB(){
    if(!('indexedDB' in window))return Promise.reject(new Error('مرورگر از IndexedDB پشتیبانی نمی‌کند.'));
    if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{
      const request=indexedDB.open(DB_NAME,1);
      request.onupgradeneeded=()=>request.result.createObjectStore(STORE);
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error||new Error('IndexedDB unavailable'));
      request.onblocked=()=>reject(new Error('Image database is blocked by another tab'));
    }).catch(error=>{dbPromise=null;throw error;});
    return dbPromise;
  }
  async function putImage(id,blob){
    const db=await openDB();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(STORE,'readwrite');
      tx.objectStore(STORE).put(blob,id);
      tx.oncomplete=()=>resolve();
      tx.onerror=()=>reject(tx.error||new Error('Unable to save image'));
      tx.onabort=()=>reject(tx.error||new Error('Image storage aborted'));
    });
  }
  async function getImage(id){
    const db=await openDB();
    return new Promise((resolve,reject)=>{
      const request=db.transaction(STORE,'readonly').objectStore(STORE).get(id);
      request.onsuccess=()=>resolve(request.result||null);
      request.onerror=()=>reject(request.error||new Error('Unable to read image'));
    });
  }
  async function deleteImage(id){
    const db=await openDB();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(STORE,'readwrite');
      tx.objectStore(STORE).delete(id);
      tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);
    });
  }
  function isStored(src){return typeof src==='string'&&src.startsWith(prefix);}
  async function resolveImage(src){
    if(!isStored(src))return src;
    const id=src.slice(prefix.length);
    if(blobUrls.has(id))return blobUrls.get(id);
    const blob=await getImage(id);
    if(!blob)throw new Error('تصویر ذخیره‌شده در این مرورگر پیدا نشد.');
    const url=URL.createObjectURL(blob);blobUrls.set(id,url);return url;
  }
  function patch(id,changes){
    const state=getState();
    state[id]={...(state[id]||{}),...changes};
    setState(state);
    window.dispatchEvent(new CustomEvent('orkid-card-state-changed',{detail:{id,value:state[id]}}));
    return state[id];
  }
  function dataUrlToBlob(dataUrl){
    const match=/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
    if(!match)throw new Error('قالب تصویر پشتیبانی نمی‌شود.');
    const binary=atob(match[2]);const bytes=new Uint8Array(binary.length);
    for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
    return new Blob([bytes],{type:match[1]});
  }
  async function saveCard(id,changes){
    const current=getState()[id]||{};
    let next={...changes};
    if(typeof next.image==='string'&&next.image.startsWith('data:image/')){
      const imageId='card:'+id;
      const blob=dataUrlToBlob(next.image);
      await putImage(imageId,blob); // image must succeed before metadata is committed
      if(blobUrls.has(imageId)){URL.revokeObjectURL(blobUrls.get(imageId));blobUrls.delete(imageId);}
      next.image=prefix+imageId;
    }
    // Existing IDB image must survive text-only edits.
    if(!next.image&&current.image)next.image=current.image;
    const value=patch(id,next);
    return {...value,image:await resolveImage(value.image)};
  }
  async function imageForCard(card,src,text){
    const box=card.querySelector('.image-placeholder');
    if(!box||!src)return;
    let img=box.querySelector('img');
    if(!img){img=document.createElement('img');box.appendChild(img);}
    const existingId=card.dataset.cardId;
    try{
      const resolved=await resolveImage(src);
      if(card.isConnected&&card.dataset.cardId===existingId){img.src=resolved;img.alt=text||'';}
    }catch(error){console.warn('Orkid image could not be restored',existingId,error);img.alt='تصویر در دسترس نیست';}
  }
  function apply(root=document){
    const state=getState();
    root.querySelectorAll('.word-card.image-card[data-card-id]').forEach(card=>{
      const saved=state[card.dataset.cardId];if(!saved)return;
      if(saved.deleted===true){card.remove();return;}
      const label=card.querySelector('.word-label, :scope > span:not(.card-edit-label):not(.card-edit-button)');
      if(label&&typeof saved.text==='string')label.textContent=saved.text;
      if(typeof saved.text==='string')card.dataset.word=saved.speechText||saved.text;
      if(saved.speechText)card.dataset.speech=saved.speechText;
      if(saved.image)void imageForCard(card,saved.image,saved.text||saved.alt||'');
    });
    return state;
  }
  // Migrate legacy base64 images from localStorage when possible, keeping text/cards safe.
  async function migrateLegacy(){
    const state=getState();let changed=false;
    for(const [id,item] of Object.entries(state)){
      if(typeof item?.image!=='string'||!item.image.startsWith('data:image/'))continue;
      try{
        await putImage('card:'+id,dataUrlToBlob(item.image));
        item.image=prefix+'card:'+id;
        changed=true;
      }catch(error){console.warn('Could not migrate existing image',id,error);}
    }
    if(changed){try{setState(state);localStorage.removeItem(LEGACY_KEY);apply();}catch(error){console.warn('Could not finalize migration',error);}}
  }
  window.OrkidCardState={KEY,getState,setState,patch,saveCard,apply,resolveImage,isStored,deleteImage};
  void migrateLegacy();
})();
