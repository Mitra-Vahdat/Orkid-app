(() => {
'use strict';
const $=id=>document.getElementById(id);
let reference=null,candidate=null,selectedAction='';
const status=s=>{$('aiStatus').textContent=s;};
const setCandidate=(src,note)=>{candidate=src;$('aiPreview').src=src;$('aiPreviewNote').textContent=note;$('aiPreviewArea').hidden=false;};
const reset=()=>{reference=null;candidate=null;selectedAction='';$('aiReference').value='';$('aiConsent').checked=false;$('aiPreviewArea').hidden=true;status('');};
window.addEventListener('orkid-editor-open',reset);
window.addEventListener('orkid-lesson-selected',e=>{
 selectedAction=String(e.detail?.action||'').trim();
 status('فعالیت انتخاب‌شده: '+selectedAction+'. اکنون می‌توانید تصویر را تولید کنید.');
});
const isOnline=()=>location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1';
$('aiCheck').addEventListener('click',async()=>{
 if(!isOnline())return status('برای بررسی اتصال، سایت را روی Vercel باز کنید.');
 try{const r=await fetch('/api/status',{cache:'no-store'});if(!r.ok)throw Error('تابع API در Vercel یافت نشد.');const d=await r.json();status(d.ready?'تنظیمات سرور آماده‌اند. حالا تولید تصویر را امتحان کنید.':'اتصال کامل نیست. Cloudflare و رمز والد را در Environment Variables تنظیم کنید.');}catch{status('امکان بررسی اتصال نیست. پروژه باید همراه پوشه api روی Vercel منتشر شود.');}
});
$('aiPrepare').addEventListener('click',async()=>{
 const file=$('aiReference').files?.[0];
 if(!file)return status('ابتدا عکس فرد آشنا را انتخاب کنید.');
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024)return status('فقط JPEG، PNG یا WEBP تا ۵ مگابایت قابل‌قبول است.');
 try{
  const bmp=await createImageBitmap(file);
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#fff9f4';ctx.fillRect(0,0,512,512);
  const ratio=Math.min(512/bmp.width,512/bmp.height);
  const w=bmp.width*ratio,h=bmp.height*ratio;
  ctx.drawImage(bmp,(512-w)/2,(512-h)/2,w,h);bmp.close();
  let quality=.78,encoded=canvas.toDataURL('image/jpeg',quality);
  while(encoded.length>620000 && quality>.36){quality-=.10;encoded=canvas.toDataURL('image/jpeg',quality);}
  if(encoded.length>620000)throw Error('عکس برای ارسال بیش از حد بزرگ است.');
  reference=encoded;setCandidate(reference,'پیش‌نمایش عکس مرجع؛ هنوز تصویر هوش مصنوعی ساخته نشده است.');status('عکس مرجع آماده شد.');
 }catch(e){status(e.message||'این عکس قابل پردازش نیست.');}
});
$('aiGenerate').addEventListener('click',async()=>{
 if(!isOnline())return status('تولید تصویر فقط روی نسخه منتشرشده در Vercel فعال است.');
 const chosen=window.OrkidAiSelectedLesson;
 const action=String(chosen?.action||selectedAction||'').trim();
 if(!action)return status('ابتدا «انتخاب از کارت‌های آموزشی» را بزنید و یک فعل از دسته افعال ۱ یا ۲ انتخاب کنید.');
 if(!reference)return status('ابتدا عکس مرجع را آماده کنید.');
 if(!$('aiConsent').checked)return status('رضایت صاحب عکس را تأیید کنید.');
 const key=$('aiParentKey').value.trim();if(!key)return status('رمز دسترسی والد را وارد کنید.');
 const button=$('aiGenerate');button.disabled=true;status('در حال ساخت تصویر…');
 try{
  const response=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json','X-Orkid-Parent-Key':key},body:JSON.stringify({image:reference,action,consent:true})});
  const result=await response.json();if(!response.ok)throw Error(result.error||'تولید تصویر ناموفق بود.');
  if(typeof result.image!=='string'||!result.image.startsWith('data:image/'))throw Error('پاسخ تصویر معتبر نیست.');
  setCandidate(result.image,'خروجی هوش مصنوعی؛ ابتدا بررسی کنید، سپس آن را روی کارت اعمال کنید.');
  status('تصویر جدید ساخته شد. پیش‌نمایش را بررسی کنید.');
 }catch(error){status('خطا: '+error.message);}finally{button.disabled=false;}
});
$('aiUseReference').addEventListener('click',()=>{if(!candidate)return;window.dispatchEvent(new CustomEvent('orkid-ai-image-selected',{detail:{image:candidate}}));status('تصویر به کارت منتقل شد؛ دکمه «اعمال تغییر» را بزنید.');});
})();
