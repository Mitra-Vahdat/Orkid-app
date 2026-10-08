# AI image personalization integration contract

Current version: educational card replacement is functional. AI image generation is NOT enabled.

## Planned backend

- POST /api/people: authenticated parent uploads a consenting adult reference photo. Validate MIME, size, authorization and consent. Store encrypted, short-lived, return opaque personId.
- POST /api/image-jobs: {personId, category, lessonIndex, style}; enforce allowlisted actions and moderation. Return jobId.
- GET /api/image-jobs/{jobId}: {status, previewUrl, error}. Preview must be approved by parent before saving.
- POST /api/image-jobs/{jobId}/approve: returns a safe hosted image assetId/url.
- DELETE /api/people/{personId}: delete source and related personal assets according to retention policy.

Never embed AI provider keys in browser JS. Avoid claiming perfect identity preservation. Ensure explicit consent, privacy controls, access limits, and manual approval.

## Card state

Card overrides are stored in localStorage under orkid-card-state-v3, keyed by slot id. Saved fields: text, speechText, image, source, deleted. Educational image paths are from js/education.js. `speechText` is independent of visible text. Large personal images should move to IndexedDB or a secure backend, not localStorage.

## Future UI

Add an optional AI personalization action to the picker only after backend deployment. The image-generation action should never be a stub that implies a completed AI result.
