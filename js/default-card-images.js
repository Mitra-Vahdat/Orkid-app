(() => {
  "use strict";
  // Use original high-quality photos when present, otherwise use bundled SVG fallback.
  for (const img of document.querySelectorAll('img.orkid-default-photo[data-photo-stem]')) {
    const stem=img.dataset.photoStem;
    const fallback=img.dataset.fallback;
    const candidates=['.png','.jpg','.jpeg','.webp','.avif'].map(ext=>stem+ext).concat([fallback]);
    let index=0;
    img.onerror=()=>{
      index++;
      if(index<candidates.length)img.src=candidates[index];
      else { img.onerror=null; img.removeAttribute('src'); }
    };
    img.src=candidates[index];
  }
})();
