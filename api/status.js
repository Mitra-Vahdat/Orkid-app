// Configuration check only; never exposes a secret.
export default function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 const apiKey=Boolean(process.env.AVALAI_API_KEY?.trim());
 const parent=Boolean(process.env.ORKID_PARENT_ACCESS_KEY?.length>=16);
 return res.status(200).json({ready:apiKey&&parent,provider:'avalai',apiKeyConfigured:apiKey,parentAccessConfigured:parent,model:process.env.AVALAI_IMAGE_MODEL?.trim()||'gpt-image-2.5-sunburst',note:'ready means only that environment variables exist, not that API access was verified'});
}
