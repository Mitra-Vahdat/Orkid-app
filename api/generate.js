// Orkid: private Vercel backend adapter for Cloudflare Workers AI.
// Security: never send provider credentials to client. Parent access key is required.
import { timingSafeEqual } from 'node:crypto';

const MODEL = '@cf/runwayml/stable-diffusion-v1-5-img2img';
const ACTIONS = Object.freeze({
 'بخور':'eating a meal', 'بیا':'walking toward the viewer','برو':'walking away',
 'بخواب':'sleeping peacefully','بنشین':'sitting on a chair','بایست':'standing upright',
 'بده':'handing over an object','بگیر':'receiving an object',
 'بازی کن':'playing with toys','بخوان':'reading a book','بنویس':'writing on paper',
 'باز کن':'opening a door','ببند':'closing a door','نگاه کن':'looking at an object',
 'گوش کن':'listening carefully','کمک کن':'helping a person'
});
const MAX_BODY = 800_000;
function reply(res, status, body){ return res.status(status).json(body); }
function equal(a,b){
 if(typeof a!=='string'||typeof b!=='string')return false;
 const aa=Buffer.from(a),bb=Buffer.from(b);
 return aa.length===bb.length && timingSafeEqual(aa,bb);
}
function authorized(req){
 const key=process.env.ORKID_PARENT_ACCESS_KEY;
 if(!key||key.length<16)return false;
 return equal(req.headers['x-orkid-parent-key'],key);
}
function configured(){return Boolean(process.env.CLOUDFLARE_ACCOUNT_ID&&process.env.CLOUDFLARE_API_TOKEN);}
export default async function handler(req,res){
 res.setHeader('Cache-Control','private, no-store, max-age=0');
 res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method!=='POST')return reply(res,405,{error:'فقط درخواست POST پذیرفته می‌شود.'});
 const origin=req.headers.origin;
 const urlHost=req.headers['x-forwarded-host']||req.headers.host;
 if(origin){try{if(new URL(origin).host!==urlHost)return reply(res,403,{error:'مبدأ درخواست معتبر نیست.'});}catch{return reply(res,403,{error:'مبدأ درخواست نامعتبر است.'});}}
 if(!authorized(req))return reply(res,401,{error:'رمز دسترسی والد نادرست است یا روی Vercel تنظیم نشده.'});
 if(!configured())return reply(res,503,{error:'متغیرهای Cloudflare در تنظیمات Vercel کامل نیستند.'});
 const declared=Number(req.headers['content-length']||0);
 if(declared>MAX_BODY)return reply(res,413,{error:'حجم درخواست زیاد است. عکس کوچک‌تر انتخاب کنید.'});
 const body=req.body && typeof req.body==='object' ? req.body : {};
 const {image,action,consent}=body;
 if(consent!==true)return reply(res,400,{error:'رضایت صاحب عکس باید تأیید شود.'});
 if(typeof action!=='string'||!Object.hasOwn(ACTIONS,action))return reply(res,422,{error:'یک کارت از دسته افعال آموزشی انتخاب کنید.'});
 if(typeof image!=='string'||!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(image)||image.length>650_000)return reply(res,413,{error:'عکس JPEG معتبر با حجم کمتر انتخاب کنید.'});
 const raw=Buffer.from(image.slice(image.indexOf(',')+1),'base64');
 if(raw.length>480_000||raw.length<100||raw[0]!==0xff||raw[1]!==0xd8)return reply(res,422,{error:'داده عکس JPEG معتبر نیست.'});
 const prompt=`Square child-friendly educational AAC picture of the adult in the reference photo clearly ${ACTIONS[action]}. Maintain general facial features and hairstyle where feasible, while keeping the action unmistakable. Single fully clothed adult, age-appropriate, simple pastel background, full scene with visible hands and relevant objects, pleasant illustrated storybook style, no lettering, no text.`;
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),55000);
 try{
  const account=encodeURIComponent(process.env.CLOUDFLARE_ACCOUNT_ID);
  const response=await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${MODEL}`,{
   method:'POST',signal:controller.signal,
   headers:{Authorization:`Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,'Content-Type':'application/json'},
   body:JSON.stringify({prompt,negative_prompt:'text, watermark, duplicate person, extra hands, distorted fingers, blurry, explicit, violent',image_b64:raw.toString('base64'),strength:0.6,guidance:7.5,num_steps:20,width:512,height:512})
  });
  if(!response.ok){
   const providerError=(await response.text()).slice(0,1000);
   console.error('Cloudflare API status',response.status,providerError);
   const explain=response.status===429?'سهمیه یا محدودیت درخواست Cloudflare تمام شده است.':response.status===401||response.status===403?'توکن Cloudflare یا سطح دسترسی آن صحیح نیست.':response.status===404?'مدل انتخاب‌شده روی حساب Cloudflare در دسترس نیست.':'سرویس Cloudflare پاسخ ناموفق داد.';
   return reply(res,502,{error:explain,providerStatus:response.status});
  }
  const ct=(response.headers.get('content-type')||'').toLowerCase();
  let output;
  if(ct.startsWith('image/')){
   const bytes=Buffer.from(await response.arrayBuffer());
   if(bytes.length>5_000_000)return reply(res,502,{error:'اندازه تصویر خروجی بیش از حد مجاز است.'});
   const mime=ct.split(';')[0];output=`data:${mime};base64,${bytes.toString('base64')}`;
  }else{
   const data=await response.json();
   if(data.success===false)throw Error('Provider reported unsuccessful generation');
   const result=data.result;
   const encoded=typeof result==='string'?result:result?.image;
   if(typeof encoded!=='string'||!/^[A-Za-z0-9+/=]+$/.test(encoded)||encoded.length>7_000_000)throw Error('Unexpected provider image format');
   output=`data:image/png;base64,${encoded}`;
  }
  return reply(res,200,{image:output,model:MODEL});
 }catch(error){
  console.error('Cloudflare generation error',error?.message);
  return reply(res,502,{error:error?.name==='AbortError'?'زمان پاسخ‌گویی سرویس به پایان رسید. دوباره تلاش کنید.':'تولید تصویر در سرویس ابری ناموفق بود.'});
 }finally{clearTimeout(timer);}
}
