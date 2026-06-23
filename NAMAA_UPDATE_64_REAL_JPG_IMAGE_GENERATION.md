# Namaa AI Update 64 — Real JPG Image Generation

This update connects the Namaa Design workspace to the live Gemini / Nano Banana image generation route.

## What changed

- Namaa Design now generates text design direction first.
- After the design direction is ready, the frontend calls `/api/namaa/images`.
- The image route uses the Cloudflare secret `GEMINI_API_KEY` and `GEMINI_IMAGE_MODEL` if provided.
- Default image MIME is `image/jpeg` so the visual preview is downloadable as JPG.
- The design workspace now shows the generated visual preview with:
  - Download JPG
  - Regenerate visual
- No API key is exposed in frontend code.

## Cloudflare required secrets

- `GEMINI_API_KEY`

Optional:

- `GEMINI_IMAGE_MODEL` default is handled in code.

## Notes

If text agents work but image generation fails, verify that the Gemini API key supports the image model and redeploy after adding/changing secrets.
