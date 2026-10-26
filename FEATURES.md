# 90+: feature list

This is a plan, not code. Only the brand kit in `brand/` existed before the Meta Global AI Developer Hackathon. All product code will be written during the building period, 27 October to 4 November 2026, so it counts as new work.

Product: 90+ by Opesi Mansion. Tagline: "One photo, 90+ listings." The product gets new subdomains (for example `app.9ntyplus.com`).

## The idea in one line

Sellers on eBay and Facebook Marketplace photograph or film the items they want to sell. Meta's models find every item, identify it, and turn each one into a complete, accurate listing. The seller approves everything before it goes live.

## Input modes

- Photo: one photo of a table, shelf or box becomes one draft per item (SAM 3.1 on images). Build this first.
- Video: a walk-through of a garage, closet or stockroom. SAM 3.1 tracks each object across frames, so every item is listed once with its best frame. This is the route to "90+" listings from one capture. Build it after the photo flow works.

## Who it is for

Resellers, thrift and vintage sellers, people clearing out a home, and small shops that sell on eBay and Facebook Marketplace. Listing is their bottleneck: every item needs photos, a title, a description, a price and, on eBay, category-specific details ("item specifics") that affect search ranking.

## What the platforms allow (researched 26 October 2026)

These rules decide the design. Recheck them against the official docs before building.

- eBay
  - Official APIs exist:
    - Browse API: read-only search of public listings, including one seller's items. Needs only an application token.
    - Sell APIs, with the seller's OAuth consent: create, update and publish listings, and read orders.
    - Taxonomy API: returns the item specifics each category requires and recommends.
  - From 20 February 2026, eBay's User Agreement bans unapproved "buy-for-me" agents and any flow that places orders without human review. The product must never buy or place orders on eBay. Buyers always finish the purchase themselves on eBay.
  - Read eBay's API License Agreement before showing eBay listing data to third-party AI agents.
- Facebook Marketplace
  - There is no public API for ordinary sellers to post or read Marketplace listings. Meta's Marketplace Partner Item API is approval-only, for classified-ad services, and tied to the European Economic Area.
  - Scraping Marketplace or automating its website breaks Meta's terms, which also disqualifies a project at a Meta hackathon. Do not do either.
  - Meta already offers AI listing drafts, price suggestions and auto-replies (March 2026). Muse can browse Marketplace, negotiate and arrange pickups for buyers.
  - The allowed route: produce a ready-to-post Marketplace listing (title, price, description, category, condition and photo order) that the seller posts in one step, by copying or sharing to the Facebook app. Business sellers can also sync a product catalog through Meta's official Commerce Catalog API, which feeds Facebook and Instagram Shops. It does not guarantee placement on Marketplace.

## Part 1: Foundation

1. Account sign-up and log-in with email and password.
2. Connect eBay through eBay's official OAuth consent screen. Store the tokens encrypted. Request only the scopes needed to read and publish the seller's own listings.
3. Import existing eBay listings:
   - Listings created through the Inventory API are read through the Sell APIs.
   - Older listings made on eBay's website need either eBay's listing migration call or the Trading API to be read.
   - Fallback: Browse API search filtered to the seller's username (read-only).
4. Create a draft from photos (Part 2 fills it in). Upload images to eBay's picture hosting, because eBay listings need hosted image URLs.
5. Review screen (always required): the seller checks and edits every field before anything is published.
6. Publish:
   - eBay: create the inventory item and offer, then publish it through the Inventory API. Support eBay's sandbox for testing and the demo.
   - Facebook Marketplace: a Marketplace version of the same item with title, price, category, condition, description and photos in the right order. Offer copy buttons, a downloadable photo set and share-to-app on mobile. No automated posting.
7. One item, many channels: track each item's status on eBay and Facebook (draft, live, sold). When it sells on one channel, remind the seller to remove it from the other. Facebook removal stays manual.
8. Buyer-message helper for Facebook: draft replies to common questions ("Is this still available?", "Lowest price?"). Include safe pickup wording: no home address until the seller chooses to share one, and no off-platform payments. The seller sends replies, never the app.
9. Agent endpoint (secondary): a read-only MCP endpoint over the seller's live listings, so AI assistants can find their items. Every "buy" action is a link to the eBay listing or the Marketplace post, and the human buys there. Build it only if eBay's API terms allow showing the data this way.
10. Safety:
    - OAuth tokens encrypted at rest.
    - Owners only see their own items.
    - Photos stay private until published.
    - Rate limits.
    - Production security settings.

## Part 2: Meta model features (the hero of the demo)

Every feature here must call a Meta model through the Meta Model API, or run a Meta open-weight model.

1. One photo, many listings (SAM 3.1 and Muse Spark). The centrepiece.
   - The seller photographs a shelf, a table of thrift finds or a box of items. SAM 3.1 separates each object, crops it cleanly, and creates one draft per item.
   - The demo shot: one photo of 12 items becomes 12 draft listings.
2. Item specifics from photos (Muse Spark, multimodal).
   - The app asks eBay's Taxonomy API for the exact item specifics the item's category requires, for example brand, size, colour, material, era and model number.
   - Muse Spark reads the photos, including labels, tags and serial numbers, and fills in those exact fields.
   - Every value is checked against eBay's allowed values for that field. Anything uncertain is marked "check this" rather than guessed.
   - Complete item specifics make listings easier to find on eBay and give AI agents precise facts.
   - Size compliance for clothing and shoes: Muse Spark reads the size label (for example "W32 L30", "EU 42", "M") and maps it to eBay's standardized size values for that category. If the label is missing or unreadable, the seller is asked rather than given a guess. Since August 2026, eBay says it can block or hide apparel and footwear listings with non-standard, missing or incomplete sizes, so 90+ keeps them visible.
3. Condition notes from photos (Muse Spark).
   - Spots visible flaws such as scratches, stains or missing parts, and writes honest condition notes linked to the photo that shows each one. Honest notes mean fewer returns and disputes.
4. Channel-specific writing (Muse Spark).
   - eBay gets a keyword-rich title within eBay's 80-character limit plus structured details. Facebook Marketplace gets a short, local, conversational listing.
5. Pricing evidence (Browse API and Muse Spark).
   - Looks up comparable active eBay listings and suggests a price range, showing the listings it used. This uses active listings only, so it is labelled as an estimate.
6. Verifiable listing agent (aim for Best Agentic Use-Case).
   - An agent runs the whole flow: segment, identify, fill item specifics, price, write for each channel, check, and hand off for approval.
   - It checks its own output against hard rules: required eBay fields present, values in eBay's allowed lists, title length, no banned words, price inside the evidence range.
   - A report shows what it checked and why. (See the "Verifiable Agents" session on 28 October.)
7. Open-weight model (Muse Spark Open or Muse Glimmer on Baseten or Modal).
   - Run the bulk work on it, such as writing listings or checking item specifics, for eligibility for Best Build on Meta Open Weight Models. On Baseten, use `meta-models/muse-spark-open-1026`.
8. Voice listing (Muse Voice Transcribe), optional.
   - The seller holds up an item and talks ("Levi's 501, size 32, small tear on the left knee"), and the spoken details are merged with what the model sees.
   - Opesi Charm is a natural fit for this if a working prototype exists.

## Demo video (3 minutes)

1. The problem: listing one item properly on eBay takes many minutes, and sellers have dozens.
2. One photo of a full table becomes separate drafts with SAM 3.1.
3. Muse Spark fills eBay's required item specifics and condition notes, with "check this" flags. Show a jacket whose size label becomes eBay's standard size, with the line: "eBay can now hide listings like this. 90+ fixes it from the photo."
4. The seller approves. The item is published to the eBay sandbox, and a ready-to-post Facebook Marketplace version appears.
5. Show the agent's checks report, and the before and after time per listing.

Show only what was built during the hackathon.

## How sellers benefit

- Time: the slowest part of reselling, writing listings, drops from minutes per item to a quick review.
- Visibility: complete eBay item specifics help eBay search and AI agents match the item to the right buyers.
- No hidden listings: since August 2026, eBay can block or hide clothing and shoe listings with non-standard or missing sizes. 90+ reads the size label and fills in eBay's standard size, so listings stay visible. The rule is new, and many sellers may not have caught up with it, which makes it a timely reason to try 90+.
- Fewer returns: honest, photo-linked condition notes.
- Reach: the same item becomes ready for both eBay and Facebook Marketplace without retyping.
- Safety and compliance: the seller approves every listing and every message. No bots buy, post or message for them.

## Competition to beat

- eBay's own AI listing tool, and Meta's Marketplace AI listing drafts (March 2026).
- Cross-listing tools such as Vendoo, List Perfectly and Crosslist. Verify their current features before the demo.
- The edge: multi-item segmentation from one photo, item specifics validated against eBay's schema, photo-linked condition evidence, and one review for both channels.

## Prizes to target

- Startups track (Opesi Mansion Ltd), top 5.
- Best Agentic Use-Case, $5K: the verifiable listing agent.
- Best Build on Meta Open Weight Models, $10K.
- Most Viral, $20K: the "one photo, 12 listings" clip is made for X. Post it before 8 November.
- Community Vote, $10K.

## Avoid

- Scraping Facebook Marketplace or automating its website.
- Placing orders on eBay, or any automated buying.
- Auto-sending buyer messages.
- Anything that looks like basic RAG or a simple image analyzer (both on the hackathon's anti-project list). The value is the end-to-end listing agent with verification.
- Presenting any code written before 27 October.

## Checklist

- [ ] Create an eBay developer account. Get sandbox and production keys, and set up the OAuth redirect URL.
- [ ] Read eBay's API License Agreement and the January 2026 User Agreement changes on agents.
- [ ] Claim the $150 Meta Model API credit by 4 November, 9:00 PM ET. A card is required, so set a spend limit.
- [ ] Apply for Baseten ($100, limited to 2,000 people) and Modal ($100, first 1,000) credits early.
- [ ] Choose the project name and subdomains.
- [ ] Make the repository public.
- [ ] Keep secrets and eBay tokens out of git.
- [ ] List every team member on the submission (maximum 4).
- [ ] Submit the repo, the 3-minute video and the live product link by Wednesday 4 November, 9:00 PM ET.
- [ ] Post the demo on X and submit the post link.

## Key dates (Eastern Time)

- Mon 26 Oct, 12:00 PM: kickoff.
- Tue 27 Oct, 12:00 PM: Agents 101, multimodal agents.
- Wed 28 Oct, 12:00 PM: Agents 102, verifiable agents.
- Fri 30 Oct, 12:00 PM: Fireworks session on Muse open models.
- Office hours in Discord on weekdays, 10 to 11 AM.
- Wed 4 Nov, 9:00 PM: submissions due.
- Mon 9 Nov, 12:00 PM: closing ceremony.
