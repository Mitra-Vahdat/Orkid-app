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
const MAX_BODY = 1_700_000;
const MAX_OUTPUT = 3_500_000;
const ENDPOINT = 'https://api.avalai.ir/v1/images/edits';
const OUTPUT_SIZE = '1024x1024';
const STYLE_GUIDE = `Create a square child-friendly AAC flashcard illustration. Preserve the exact visual language of the provided template card: simple clean educational illustration, centered composition, minimal clutter, smooth outlines, soft pastel colors, child-friendly appearance, no text, no watermark.`;
const ACTION_HINTS = Object.freeze({
  "اجازه گرفتن": "The person should politely raise one hand as if asking permission in a simple classroom-like pose.",
  "فوت کردن": "The person should be shown blowing with visible puffed lips, matching the educational action card.",
  "مسواک زدن": "Show the person brushing their teeth with a toothbrush near the mouth.",
  "غذا خوردن": "Show the person eating food clearly with a spoon or food in front of them.",
  "بغل کردن": "Show a clear hugging pose in the same educational-card composition.",
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
function buildPrompt(action,label){
  const normalized=ACTIONS[action]||action;
  const hint=ACTION_HINTS[action]||ACTION_HINTS[normalized]||`Show the person clearly doing the action: ${normalized}.`;
  const title=(typeof label==='string'&&label.trim())?label.trim():normalized;
  return [
    STYLE_GUIDE,
    `Image 1 is the original AAC educational card template. Keep Image 1's composition, pose, framing, background simplicity, prop placement, clothing simplicity, and overall illustration style as unchanged as possible.`,
    `Image 2 is the familiar person's face reference. Use Image 2 only to replace the identity and face of the person in Image 1.`,
    `The output must look extremely close to Image 1, not like a newly invented cartoon.`,
    `Only replace the face and recognizable identity with the familiar person from Image 2, while preserving the same activity, same pose, same body orientation, same layout, and same child-friendly flashcard style from Image 1.`,
    `Keep the result as a flat, clean AAC-style educational card illustration. Avoid photorealism. Avoid turning the whole image into a generic cartoon unrelated to the template.`,
    `The action/card is “${title}” and it must remain exactly that action. ${hint}`,
    `Show only one person. No extra people, no extra faces, no duplicated limbs, no text, no letters, no watermark, no logo.`,
    `The person's clothing, props, and scene should stay close to the template card unless a tiny adjustment is necessary for the face replacement.`,
    `The face should resemble the familiar person from Image 2, but be redrawn in the same illustration style as Image 1.`
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
const model=()=>process.env.AVALAI_IMAGE_MODEL?.trim()||'gpt-image-2.5-sunburst';
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
  if(typeof str!=='string'||str.length>MAX_OUTPUT*1.8||!/^[A-Za-z0-9+/=]+$/.test(str))throw new Error('Invalid base64 image');
  const bytes=Buffer.from(str,'base64');
  if(!validImage(bytes))throw new Error('Invalid image from provider');
  return bytes;
}
function isAllowedImageUrl(uri){
  try{const u=new URL(uri);return u.protocol==='https:'&&!u.username&&!u.password&&u.port==='';}catch{return false;}
}
function parseDataUrlImage(dataUrl, allowed=['image/jpeg','image/png','image/webp']){
  if(typeof dataUrl!=='string') throw new Error('missing data url');
  const match=dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if(!match) throw new Error('invalid data url');
  const [,type,b64]=match;
  if(!allowed.includes(type)) throw new Error('unsupported image type');
  const bytes=Buffer.from(b64,'base64');
  if(bytes.length<100||bytes.length>900_000||!validImage(bytes)) throw new Error('invalid image payload');
  return { type, bytes, dataUrl:`data:${type};base64,${bytes.toString('base64')}` };
}
async function extractImage(result,signal){
  const first=result?.data?.[0];
  if(!first)throw new Error('Empty image result');
  if(typeof first.b64_json==='string')return parseBase64(first.b64_json);
  if(typeof first.url==='string'){
    if(first.url.startsWith('data:image/'))return parseBase64(first.url.split(',')[1]);
    if(!isAllowedImageUrl(first.url))throw new Error('Provider returned unsafe URL');
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
  const {image,templateImage,action,consent,label,category}=body;
  if(consent!==true)return respond(res,400,{error:'رضایت صاحب تصویر را تأیید کنید.'});
  if(typeof action!=='string'||!Object.hasOwn(ACTIONS,action))return respond(res,422,{error:'یک کارت معتبر از «افعال ۱» یا «افعال ۲» انتخاب کنید.'});
  if(typeof category!=='string' || !/^verbs-/i.test(category))return respond(res,422,{error:'برای ساخت تصویر چهره‌محور، فقط دسته‌های «افعال ۱» و «افعال ۲» پشتیبانی می‌شوند.'});
  let face, template;
  try{
    face=parseDataUrlImage(image,['image/jpeg']);
    template=parseDataUrlImage(templateImage,['image/jpeg','image/png','image/webp']);
  }catch{
    return respond(res,422,{error:'تصویر مرجع یا تصویر کارت آموزشی معتبر نیست.'});
  }
  const prompt=buildPrompt(action,label);
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),60000);
  try{
    const payload={
      model:model(),
      prompt,
      size:OUTPUT_SIZE,
      quality:'xhigh',
      output_format:'png',
      images:[
        { image_url: template.dataUrl },
        { image_url: face.dataUrl }
      ]
    };
    const response=await fetch(ENDPOINT,{
      method:'POST',
      headers:{Authorization:`Bearer ${process.env.AVALAI_API_KEY.trim()}`,'Content-Type':'application/json'},
      body:JSON.stringify(payload),
      signal:controller.signal
    });
    if(!response.ok){
      const info=(await response.text()).slice(0,1600);
      console.error('AvalAI image edit failed',response.status,info);
      return respond(res,502,{error:errorForStatus(response.status),providerStatus:response.status,model:model()});
    }
    const data=await response.json();
    const output=await extractImage(data,controller.signal);
    return respond(res,200,{image:`data:${mediaType(output)};base64,${output.toString('base64')}`,model:model()});
  }catch(error){
    console.error('AvalAI image edit error',error?.name,error?.message);
    return respond(res,502,{error:error?.name==='AbortError'?'پاسخ AvalAI دیر رسید؛ دوباره تلاش کنید یا محدودیت زمانی Vercel را بررسی کنید.':'دریافت تصویر از AvalAI انجام نشد؛ لاگ تابع را بررسی کنید.'});
  }finally{clearTimeout(timeout);}
}
