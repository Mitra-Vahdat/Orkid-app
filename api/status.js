// Simple configuration check; never returns environment secrets.
export default function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 const cloudflare=Boolean(process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN);
 const parent=Boolean(process.env.ORKID_PARENT_ACCESS_KEY && process.env.ORKID_PARENT_ACCESS_KEY.length>=16);
 return res.status(200).json({ready:cloudflare&&parent,provider:'cloudflare',cloudflareConfigured:cloudflare,parentAccessConfigured:parent});
}
