document.querySelectorAll('.education-card-image img').forEach(img=>{
 const source=img.getAttribute('src');
 const m=source?.match(/^images\/education\/(food|verbs-1)\/cover\.svg$/);
 if(!m)return;
 const stem='images/education/'+m[1]+'/'+(m[1]==='food'?'bread':'eating');
 const list=['.png','.jpg','.jpeg','.webp','.avif','.svg'].map(ext=>stem+ext).concat(source);
 let n=0; img.onerror=()=>{n++;if(n<list.length)img.src=list[n];else img.onerror=null;};img.src=list[0];
});
