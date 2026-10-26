# 90+: integrations and setup checklist

Everything 90+ needs to call, and what to set up before building starts on 27 October 2026. Items marked "confirm" come from research, not from testing. Check them against the official docs on day one.

Setting up accounts and keys is not product code, so it can be done before the building period.

## 1. Meta Model API (required: the core of the project)

Sign up at dev.meta.ai, create an API key, and claim the $150 hackathon credit when the link is posted.

- The credit needs a card on the account. Set a spend limit on the Billing page.
- Claim it by Wednesday 4 November, 9:00 PM ET. Every team member claims their own.
- Availability varies by country. **On day one, make one test call to each model below from Kenya.** If a model is blocked, use the fallbacks in section 2.
- The API works with the OpenAI SDK by changing the base URL (confirm the exact base URL in the quickstart).
- Contributor mode is cheaper, but Meta may train on what you send. Use Standard mode for sellers' photos.

| Model | ID | What 90+ uses it for |
| --- | --- | --- |
| SAM 3.1 | `sam-3.1` | Find every item in a photo, or track every item across a video. Prompt with a noun phrase (for example "shoe", "item for sale") or with boxes and points. Returns boxes and masks. |
| Muse Spark 1.3 | `muse-spark-1.3` | Identify each item from its crop: brand, model, size, colour, material, flaws. Fill eBay's item specifics with structured output. Write eBay and Marketplace text. |
| Muse Image | `muse-image-1.0` | Edit photos: clean white background for eBay, light correction. Never change the item itself; the listing must show the real item. |
| Muse Voice Transcribe | `muse-voice-transcribe-1.0` | Optional: the seller describes an item out loud. |
| Muse Wonder | `muse-wonder-1.0` | Optional: orchestrate the whole listing run as one long agent task. Never use its computer control on Facebook or eBay websites. |
| Muse Spark 1.2 | `muse-spark-1.2` | Use instead of 1.3 if sending audio directly, since 1.3's audio support is incomplete. |

Secrets: `META_API_KEY`, `META_API_BASE_URL`.

## 2. Open-weight models (bonus prize and fallback)

Needed for Best Build on Meta Open Weight Models ($10K), and as a fallback if the Meta API is not available in Kenya.

- Baseten: request $100 in credits now (limited to 2,000 people, reviewed by use case). Use the model ID `meta-models/muse-spark-open-1026` for the hackathon, not the ID in the docs. Use it for bulk listing writing and checking. Secrets: `BASETEN_API_KEY`.
- Modal: request $100 in credits now (first 1,000 people). Use it to run SAM 3.1 from its open weights (`facebook/sam3.1` on Hugging Face) on a GPU if the hosted SAM is unavailable. Secrets: `MODAL_TOKEN_ID`, `MODAL_TOKEN_SECRET`.
- Hugging Face: create an account and accept the SAM 3.1 licence on the model page if asked. Secrets: `HF_TOKEN`.
- Fireworks: $25 for selected teams only. Optional.

## 3. eBay (required: where listings are published)

Join the eBay Developers Program at developer.ebay.com. Do this today, because account approval may not be instant.

Set up:
- Sandbox and production keysets: App ID (Client ID), Cert ID (Client Secret), Dev ID.
- A redirect URL name (eBay calls it a RuName) for the seller sign-in, pointing to your app's OAuth callback, for example `https://app.9ntyplus.com/ebay/callback`.
- A sandbox test seller account, for publishing during development and the demo.
- Marketplace account deletion notifications: eBay requires production apps to either provide an endpoint for these notifications or apply for an exemption. Confirm the current rule before switching to production.

APIs and what they do in 90+:

| API | Token | Use |
| --- | --- | --- |
| OAuth (authorization code grant) | Seller consent | Seller connects their eBay account. Store tokens encrypted. Refresh tokens last much longer than access tokens. |
| Taxonomy API: `getDefaultCategoryTreeId`, `getCategorySuggestions`, `getItemAspectsForCategory` | Application token | Pick the category, then get the exact item specifics it requires, with allowed values. Muse Spark fills these, and 90+ validates them. |
| Inventory API: `createOrReplaceInventoryItem`, `createOffer`, `publishOffer` | Seller token, scope `sell.inventory` | Create the listing and publish it. Images must be public HTTPS URLs, which is why 90+ needs file storage (section 4). |
| Account API: business policies (payment, return, fulfillment) | Seller token, scope `sell.account` | eBay needs these policy IDs to publish an offer. In the sandbox, the test seller may need to opt in to business policies first. |
| Browse API: `search` | Application token | Comparable active listings for price suggestions. Read-only. |

Rules to respect:
- Clothing and shoe sizes must be standardized. From August 2026, eBay may block or hide apparel and footwear listings with non-standard, missing or incomplete sizes. 90+ must map what Muse Spark reads from a label to eBay's allowed size values, and ask the seller when unsure. (Banner on the eBay developer portal, seen 26 October 2026.)
- Some coin categories need standardized condition details on create and update. Leave coins out of the hackathon scope.
- From 20 February 2026, eBay's User Agreement bans unapproved agents that place orders. 90+ never buys.
- Read the eBay API License Agreement, especially on storing eBay data and showing it to third parties.

Secrets: `EBAY_CLIENT_ID`, `EBAY_CLIENT_SECRET`, `EBAY_DEV_ID`, `EBAY_RUNAME`, `EBAY_ENV` (`sandbox` or `production`), `EBAY_DELETION_VERIFICATION_TOKEN`.

## 4. Facebook Marketplace (no API to set up)

There is no public API for ordinary sellers to post to Marketplace. Meta's Marketplace partner API is approval-only, for classified-ad businesses in the European Economic Area.

90+ produces a ready-to-post Marketplace listing instead: title, price, category, condition, description and photos in order, with copy buttons, a photo download and share-to-app on mobile. The seller posts it.

Do not scrape Marketplace or automate the Facebook website. It breaks Meta's terms and would disqualify the project.

## 5. Infrastructure

| Need | Suggested service | Notes |
| --- | --- | --- |
| Backend | Django (Python 3.12, uv) | Matches the earlier plan. |
| Database | Neon Postgres | You already use Neon. Create a new project for 90+. Secret: `DATABASE_URL`. |
| File storage for photos, videos and crops | Cloudflare R2 or AWS S3 | eBay needs public HTTPS image URLs. Keep originals private and make only published images public. Secrets: `STORAGE_BUCKET`, `STORAGE_ACCESS_KEY_ID`, `STORAGE_SECRET_ACCESS_KEY`, `STORAGE_ENDPOINT_URL`, `STORAGE_PUBLIC_BASE_URL`. |
| Background jobs | A worker queue (django-q2 on Postgres, or Celery with Redis) | Video processing and many model calls take longer than a web request. |
| Video frames | ffmpeg | Extract frames and thumbnails. Include it in the Docker image. |
| Hosting | Fly.io (`flyctl` is already installed) | One web process and one worker process. |
| Domain | `app.9ntyplus.com` | You need DNS access to 9ntyplus.com to point the subdomain at Fly. |

Django secrets: `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, `DJANGO_CSRF_TRUSTED_ORIGINS`, `PUBLIC_BASE_URL`, `FIELD_ENCRYPTION_KEY` (for eBay tokens).

## 6. Hackathon accounts

- Cerebral Valley platform: for the submission.
- Discord: join #office-hours (weekdays 10 to 11 AM ET) and #announcements.
- GitHub: the repository must be public at submission.
  - This repository (`Opesi-Dots/9ntyplus`) holds the old fleet website in its history.
  - Either keep the history and mark the last pre-hackathon commit (`b29e4d0`) in the submission, or start a new public repository and copy `brand/` into it.
- X account: post the demo video for the Most Viral prize, and submit the post link.
- Screen recorder and good demo footage for the 3-minute video. Shoot test photos and a video of real items: a cluttered table, a shelf, a box of mixed items.

## 7. Day one test (27 October)

Run these before writing product code. Each should take minutes, and together they show what is possible from your location.

1. Muse Spark 1.3: send one product photo and ask for brand, colour and condition as JSON.
2. SAM 3.1: send a photo of several items with the prompt "item" and count the masks returned.
3. SAM 3.1 video: send a 10-second clip and check that object IDs stay the same across frames.
4. Muse Image: remove the background from one product photo.
5. Baseten: one chat call to `meta-models/muse-spark-open-1026`.
6. eBay sandbox: get an application token and call `getItemAspectsForCategory` for one category.

## Secrets file

Keep all of the above in a local `.env` (already ignored by git) and in the hosting provider's secret store. Never commit them, since the repository will be public.
