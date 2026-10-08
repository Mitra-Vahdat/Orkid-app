# Orkid — Vercel + Cloudflare Workers AI (free allowance)

## Deploy

Upload `orkid_clean` as the repository root, or set Vercel Root Directory to `orkid_clean`.
Framework Preset: Other. Do not specify a build command. Vercel deploys `api/generate.js` as a serverless function alongside static HTML files.

## Cloudflare setup

1. Create a Cloudflare account and enable Workers AI (subject to its current free quota).
2. Find your Cloudflare Account ID in the dashboard.
3. Create an API token with **Account > Workers AI > Read** permission.
4. In Vercel Project Settings > Environment Variables, set:
   - `CLOUDFLARE_ACCOUNT_ID` (Cloudflare account ID)
   - `CLOUDFLARE_API_TOKEN` (secret token)
5. Redeploy after saving variables.

Model: `@cf/runwayml/stable-diffusion-v1-5-img2img` (beta). The serverless endpoint accepts an explicitly consented reference photo and an educational action, then returns a generated image. The photo is transmitted to Cloudflare only after pressing **Generate**; no image is stored by the endpoint. The current app saves accepted card images in browser localStorage. This is **not suitable for sensitive family images on shared devices**, and browser storage quotas may be exceeded.

### Important limits

* Image-to-image is **not** guaranteed to preserve identity. Verify model availability, quota, account eligibility and actual response format; no live API generation has been tested here.
* The endpoint is unauthenticated for demo use and can be abused if the Vercel URL is public. Before public release, add parent accounts, authentication, per-user quotas, rate limits, anti-abuse, content moderation, privacy disclosures and a deletion policy. Never expose Cloudflare token in frontend code.
* Browser `file://` mode cannot invoke `/api/generate`; deploy to Vercel for AI generation. Use `vercel dev` for local testing of the API.
* Free quotas can change and may run out. A free Cloudflare account is required; this does not require an OpenAI API key.
