// Orkid private AvalAI adapter for Vercel Functions.
// No AvalAI token or raw reference photo is stored on the server.
import { timingSafeEqual } from 'node:crypto';

const ACTIONS = Object.freeze({
  "اجازه گرفتن": "اجازه گرفتن",
  "فوت کردن": "فوت کردن",
  "مسواک زدن": "مسواک زدن",
  "غذا خوردن": "غذا خوردن",
  "بغل کردن": "بغل کردن",
  "خندیدن": "خندیدن",
  "گوش دادن": "گوش دادن",
  "اشاره کردن": "اشاره کردن",
  "دعا کردن": "دعا کردن",
  "داد زدن": "داد زدن",
  "خوابیدن": "خوابیدن",
  "تاب بازی": "تاب بازی",
  "تلفن زدن": "تلفن زدن",
  "دستشویی رفتن": "دستشویی رفتن",
  "نوشتن": "نوشتن",
  "بازی کن": "بازی کن",
  "بخوان": "بخوان",
  "بنویس": "بنویس",
  "باز کن": "باز کن",
  "ببند": "ببند",
  "نگاه کن": "نگاه کن",
  "گوش کن": "گوش کن",
  "کمک کن": "کمک کن",
  "بخور": "غذا خوردن",
  "بیا": "آمدن",
  "برو": "رفتن",
  "بخواب": "خوابیدن",
  "بنشین": "نشستن",
  "بایست": "ایستادن",
  "بده": "دادن",
  "بگیر": "گرفتن"
});
const MAX_BODY = 800_000;
const MAX_OUTPUT = 2_800_000; // Base64 response must stay below Vercel function response limits.
const ENDPOINT = 'https://api.avalai.ir/v1/images/edits';
const STYLE_GUIDE = `Create a square child-friendly AAC flashcard illustration in the same visual language as an educational card: simple clean cartoon illustration, centered subject, minimal clutter, soft pastel background, clear readable action, smooth outlines, soft colors, tidy composition, no text inside the image, no watermark.`;
const ACTION_HINTS = Object.freeze({
  "اجازه گرفتن": "The person should politely raise one hand as if asking permission in a simple classroom-like pose.",
  "فوت کردن": "The person should be shown blowing with visible puffed lips, matching a simple action-card style.",
  "مسواک زدن": "Show the person brushing their teeth with a toothbrush near the mouth.",
  "غذا خوردن": "Show the person eating food clearly with a spoon or food in front of them.",
  "بغل کردن": "Show a clear hugging pose in a very simple educational-card style.",
  "خندیدن": "Show the person smiling or laughing clearly.",
  "گوش دادن": "Show the person listening attentively with a listening gesture.",
  "اشاره کردن": "Show the person pointing clearly with one finger.",
  "دعا کردن": "Show the person in a simple praying pose.",
  "داد زدن": "Show the person shouting with an expressive open mouth.",
  "خوابیدن": "Show the person lying down asleep on a pillow or bed in the same cute educational-card style.",
  "تاب بازی": "Show the person sitting on a swing in a simple playful pose.",
  "تلفن زدن": "Show the person holding a phone and talking.",
  "دستشویی رفتن": "Show the person in a toilet-related action-card context, child-friendly and simple.",
  "نوشتن": "Show the person writing with a pencil or pen.",
  "بازی کن": "Show the person playing in a simple educational-card style.",
  "بخوان": "Show the person reading a book or reading clearly.",
  "بنویس": "Show the person writing clearly.",
  "باز کن": "Show the person opening something clearly.",
  "ببند": "Show the person closing something clearly.",
  "نگاه کن": "Show the person looking attentively.",
  "گوش کن": "Show the person listening attentively.",
  "کمک کن": "Show the person helping in a simple educational-card style.",
  "بخور": "Show the person eating food clearly with a spoon or food in front of them.",
  "بیا": "Show the person coming toward the viewer in a simple action pose.",
  "برو": "Show the person going or walking away in a simple action pose.",
  "بخواب": "Show the person lying down asleep on a pillow or bed in the same cute educational-card style.",
  "بنشین": "Show the person sitting clearly.",
  "بایست": "Show the person standing clearly.",
  "بده": "Show the person giving an object clearly.",
  "بگیر": "Show the person receiving or taking an object clearly."
});
function buildPrompt(action){
  const normalized=ACTIONS[action]||action;
  const hint=ACTION_HINTS[action]||ACTION_HINTS[normalized]||`Show the person clearly doing the action: ${normalized}.`;
  return [
    STYLE_GUIDE,
    `Use the provided reference photo only to transfer the person's identity and face into the illustration.`,
    `Important: make the result look like an AAC educational flashcard, very close to the original card style for the action “${normalized}”.`,
    `Keep the same kind of pose, framing, clothing simplicity, props, and composition that a typical educational card for this action would have.`,
    `Replace only the face and recognizable identity with the familiar person from the reference photo. Keep the rest of the illustration in the same simple flashcard style.`,
    hint,
    `The face should resemble the reference person, but rendered as a clean illustrated face, not as a realistic photo.`,
    `Show only one person. No extra people, no extra faces, no duplicated limbs, no text, no letters, no watermark, no logo.`,
    `Do not change the action to a different action. Keep the image safe, fully clothed, child-friendly, and simple.`
  ].join(' ');
}
function respond(res,status,body){res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');return res.status(status).json(body);}
function matchKey(incoming,secret){
  if(typeof incoming!=='string'||typeof secret!=='string')return false;
  const a=Buffer.from(incoming),b=Buffer.from(secret);
  return a.length===b.length && timingSafeEqual(a,b);
}
function authorized(req){
  const secret=process.env.ORKID_PARENT_ACCESS_KEY;
  return Boolean(secret&&secret.length>=16&&matchKey(req.headers['x-orkid-parent-key'],secret));
}
function configured(){return Boolean(process.env.AVALAI_API_KEY?.trim());}
const model=()=>process.env.AVALAI_IMAGE_MODEL?.trim()||'qwen-image-edit';
function errorForStatus(status){
  if(status===401||status===403)return 'کلید AvalAI معتبر نیست یا حساب به این مدل دسترسی ندارد.';
  if(status===402)return 'اعتبار حساب AvalAI برای این درخواست کافی نیست.';
  if(status===404)return 'مدل انتخاب‌شده در AvalAI پیدا نشد یا برای حساب شما فعال نیست.';
  if(status===408||status===504)return 'زمان پاسخ‌گویی AvalAI به پایان رسیده است.';
  if(status===413)return 'حجم تصویر برای مدل انتخاب‌شده بیش از حد مجاز است.';
  if(status===422||status===400)return 'پارامترهای درخواست با مدل انتخاب‌شده سازگار نیستند.';
  if(status===429)return 'محدودیت تعداد درخواست یا سهمیه AvalAI فعال شده است.';
  return 'سرویس AvalAI در پردازش تصویر خطا داد.';
}
function validImage(bytes){
  return bytes.length>100&&bytes.length<=MAX_OUTPUT&&(
    (bytes[0]===0x89&&bytes.subarray(1,4).toString('ascii')==='PNG')||
    (bytes[0]===0xff&&bytes[1]===0xd8)||
    (bytes.subarray(0,4).toString('ascii')==='RIFF'&&bytes.subarray(8,12).toString('ascii')==='WEBP')
  );
}
function mediaType(bytes){return bytes[0]===0x89?'image/png':bytes[0]===0xff?'image/jpeg':'image/webp';}
function parseBase64(str){
  if(typeof str!=='string'||str.length>MAX_OUTPUT*1.5||!/^[A-Za-z0-9+/=]+$/.test(str))throw new Error('Invalid base64 image');
  const bytes=Buffer.from(str,'base64');
  if(!validImage(bytes))throw new Error('Invalid image from provider');
  return bytes;
}
function isAllowedImageUrl(uri){
  try{const u=new URL(uri);return u.protocol==='https:'&&!u.username&&!u.password&&u.port==='';}catch{return false;}
}
async function extractImage(result,signal){
  const first=result?.data?.[0];
  if(!first)throw new Error('Empty image result');
  if(typeof first.b64_json==='string')return parseBase64(first.b64_json);
  if(typeof first.url==='string'){
    if(first.url.startsWith('data:image/'))return parseBase64(first.url.split(',')[1]);
    if(!isAllowedImageUrl(first.url))throw new Error('Provider returned unsafe URL');
    // Redirects disabled: never fetch arbitrary redirect destinations from Vercel.
    const response=await fetch(first.url,{signal,redirect:'error'});
    if(!response.ok||!(response.headers.get('content-type')||'').startsWith('image/'))throw new Error('Image download failed');
    const declared=Number(response.headers.get('content-length')||0);
    if(declared>MAX_OUTPUT)throw new Error('Image too large');
    const bytes=Buffer.from(await response.arrayBuffer());
    if(!validImage(bytes))throw new Error('Bad downloaded image');
    return bytes;
  }
  throw new Error('No supported image field');
}
export default async function handler(req,res){
  if(req.method!=='POST')return respond(res,405,{error:'فقط درخواست POST پذیرفته می‌شود.'});
  const origin=req.headers.origin,host=req.headers['x-forwarded-host']||req.headers.host;
  if(origin){try{if(new URL(origin).host!==host)return respond(res,403,{error:'مبدأ درخواست معتبر نیست.'});}catch{return respond(res,403,{error:'مبدأ درخواست نامعتبر است.'});}}
  if(!authorized(req))return respond(res,401,{error:'رمز دسترسی والد صحیح نیست.'});
  if(!configured())return respond(res,503,{error:'متغیر AVALAI_API_KEY روی Vercel تنظیم نشده است.'});
  if(Number(req.headers['content-length']||0)>MAX_BODY)return respond(res,413,{error:'حجم درخواست بیش از حد مجاز است.'});
  const body=req.body&&typeof req.body==='object'?req.body:{};
  const {image,action,consent}=body;
  if(consent!==true)return respond(res,400,{error:'رضایت صاحب تصویر را تأیید کنید.'});
  if(typeof action!=='string'||!Object.hasOwn(ACTIONS,action))return respond(res,422,{error:'یک کارت معتبر از «افعال ۱» یا «افعال ۲» انتخاب کنید.'});
  if(typeof image!=='string'||image.length>650_000||!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(image))return respond(res,413,{error:'عکس JPEG با حجم مجاز انتخاب کنید.'});
  const bytes=Buffer.from(image.split(',')[1],'base64');
  if(bytes.length<100||bytes.length>480_000||bytes[0]!==0xff||bytes[1]!==0xd8)return respond(res,422,{error:'فایل مرجع JPEG معتبر نیست.'});
  const prompt=buildPrompt(action);
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),55000);
  try{
    const payload=new FormData();
    payload.append('model',model());
    payload.append('prompt',prompt);
    payload.append('image',new Blob([bytes],{type:'image/jpeg'}),'reference.jpg');
    const response=await fetch(ENDPOINT,{
      method:'POST',headers:{Authorization:`Bearer ${process.env.AVALAI_API_KEY.trim()}`},body:payload,signal:controller.signal
    });
    if(!response.ok){
      // Keep provider response out of client; it may contain user-related data.
      const info=(await response.text()).slice(0,1200);
      console.error('AvalAI image edit failed',response.status,info);
      return respond(res,502,{error:errorForStatus(response.status),providerStatus:response.status});
    }
    const data=await response.json();
    const output=await extractImage(data,controller.signal);
    return respond(res,200,{image:`data:${mediaType(output)};base64,${output.toString('base64')}`,model:model()});
  }catch(error){
    console.error('AvalAI image edit error',error?.name,error?.message);
    return respond(res,502,{error:error?.name==='AbortError'?'پاسخ AvalAI دیر رسید؛ دوباره تلاش کنید یا محدودیت زمانی Vercel را بررسی کنید.':'دریافت تصویر از AvalAI انجام نشد؛ لاگ تابع را بررسی کنید.'});
  }finally{clearTimeout(timeout);}
}
