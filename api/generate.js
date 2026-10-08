// Vercel Node.js serverless function. Keep provider credentials in Vercel Environment Variables.
const ACTIONS={"بخور":"eating food","بیا":"coming closer","برو":"walking","بخواب":"sleeping","بنشین":"sitting","بایست":"standing","بده":"giving an object","بگیر":"taking an object","بازی کن":"playing with toys","بخوان":"reading a book","بنویس":"writing","باز کن":"opening a door","ببند":"closing a door","نگاه کن":"looking","گوش کن":"listening","کمک کن":"helping someone"};
const MODEL='@cf/runwayml/stable-diffusion-v1-5-img2img';
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 const origin=req.headers.origin;const host=req.headers.host;
 if(origin){try{if(new URL(origin).host!==host)return res.status(403).json({error:'Origin not allowed'});}catch{return res.status(403).json({error:'Invalid origin'});}}
 const {CLOUDFLARE_ACCOUNT_ID,CLOUDFLARE_API_TOKEN}=process.env;
 if(!CLOUDFLARE_ACCOUNT_ID||!CLOUDFLARE_API_TOKEN)return res.status(503).json({error:'Cloudflare AI is not configured in Vercel environment variables.'});
 const {image,action,consent}=req.body||{};
 if(consent!==true)return res.status(400).json({error:'Consent required'});
 if(typeof action!=='string'||!action.trim()||action.length>100)return res.status(400).json({error:'Invalid activity'});
 if(typeof image!=='string'||!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(image)||image.length>750000)return res.status(413).json({error:'Invalid or oversized reference image'});
 const prompt=`Child-friendly AAC educational illustration, an adult person resembling the supplied reference photo clearly ${ACTIONS[action]||'performing this activity: '+action.replace(/[^\p{L}\p{N} ]/gu,'')}, fully clothed, cheerful, simple solid pastel background, single subject, clean composition, no text, no lettering, square image`;
 try{
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),45000);
  let response;
  try{response=await fetch(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(CLOUDFLARE_ACCOUNT_ID)}/ai/run/${MODEL}`,{method:'POST',headers:{Authorization:`Bearer ${CLOUDFLARE_API_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({prompt,negative_prompt:'words, letters, text, watermark, multiple faces, extra limbs, distorted anatomy',image_b64:image.split(',')[1],strength:.55,guidance:7.5,num_steps:20,width:512,height:512}),signal:controller.signal});}finally{clearTimeout(timer);}
  if(!response.ok){console.error('Cloudflare inference error',response.status,(await response.text()).slice(0,500));return res.status(502).json({error:'Cloudflare AI request failed ('+response.status+'). Check model availability and free quota.'});}
  const contentType=response.headers.get('content-type')||'';
  let data;
  if(contentType.includes('image/')){const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length>4e6)return res.status(502).json({error:'Output too large'});data=`data:${contentType.split(';')[0]};base64,${bytes.toString('base64')}`;}
  else {const json=await response.json();const result=json.result;if(typeof result==='string')data='data:image/png;base64,'+result;else if(result?.image)data='data:image/png;base64,'+result.image;else return res.status(502).json({error:'Unexpected provider response'});}
  return res.status(200).json({image:data});
 }catch(e){console.error('Image generation failure',e.message);return res.status(502).json({error:'Image generation timed out or failed.'});}
}
