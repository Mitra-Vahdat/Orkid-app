(() => {
"use strict";
const $=id=>document.getElementById(id);
let photo=null, candidate=null, selectedAction="";
const say=s=>{$("aiStatus").textContent=s;};
window.addEventListener("orkid-editor-open",()=>{selectedAction="";candidate=null;photo=null;$("aiReference").value="";$("aiConsent").checked=false;$("aiPreviewArea").hidden=true;say("");});
window.addEventListener("orkid-lesson-selected",e=>{selectedAction=e.detail.action;say("فعالیت انتخاب‌شده: "+selectedAction);});
function preview(src,note){candidate=src;$("aiPreview").src=src;$("aiPreviewNote").textContent=note;$("aiPreviewArea").hidden=false;}
$("aiPrepare").addEventListener("click",async()=>{
 const file=$("aiReference").files?.[0];
 if(!file)return say("ابتدا یک عکس انتخاب کنید.");
 if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>5*1024*1024)return say("فقط عکس JPG، PNG یا WEBP تا ۵ مگابایت پذیرفته می‌شود.");
 try{const bmp=await createImageBitmap(file);const cv=document.createElement("canvas");const scale=Math.min(1,512/Math.max(bmp.width,bmp.height));cv.width=Math.round(bmp.width*scale);cv.height=Math.round(bmp.height*scale);cv.getContext("2d").drawImage(bmp,0,0,cv.width,cv.height);bmp.close();photo=cv.toDataURL("image/jpeg",.78);preview(photo,"این فقط عکس مرجع است، نه خروجی هوش مصنوعی.");say("عکس آماده است.");}catch{say("عکس قابل خواندن نیست.");}
});
$("aiGenerate").addEventListener("click",async()=>{
 if(!selectedAction)return say("ابتدا یک کارت آموزشی از فهرست انتخاب کنید.");
 if(!photo)return say("ابتدا عکس را آماده کنید.");
 if(!$("aiConsent").checked)return say("رضایت صاحب عکس را تأیید کنید.");
 const button=$("aiGenerate");button.disabled=true;say("در حال ساخت تصویر... ممکن است کمی طول بکشد.");
 try{const response=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({image:photo,action:selectedAction,consent:true})});const body=await response.json();if(!response.ok)throw Error(body.error||"سرویس تصویر پاسخ نداد.");preview(body.image,"تصویر تولیدشده؛ لطفاً پیش از استفاده بررسی کنید.");say("تصویر آماده است. برای جایگزینی آن را تأیید کنید.");}
 catch(e){say("تولید تصویر انجام نشد: "+e.message);}
 finally{button.disabled=false;}
});
$("aiUseReference").addEventListener("click",()=>{if(!candidate)return;window.dispatchEvent(new CustomEvent("orkid-ai-image-selected",{detail:{image:candidate}}));say("تصویر انتخاب شد؛ برای ثبت نهایی «اعمال تغییر» را بزنید.");});
})();
