import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";

// Generates the 90+ favicon set in Route Green: a navy tile with "90" outlined from Reddit Sans ExtraBold
// and a geometric mint plus. Outlined glyphs render identically everywhere, unlike live SVG text.
// Run with: pnpm icons:generate
const require = createRequire(import.meta.url);
const astroRequire = createRequire(require.resolve("astro/package.json"));
const sharp = astroRequire("sharp");
const { create } = await import(createRequire(astroRequire.resolve("fontace")).resolve("fontkitten"));
const root = new URL("../", import.meta.url);

const colors = { navy: "#0f172a", mint: "#34d399", white: "#f8fafc" };
const font = create(await readFile(new URL("public/fonts/reddit-sans/RedditSans-ExtraBold.woff2", root)));

const outline = (text, size) => {
  const scale = size / font.unitsPerEm;
  let advance = 0;
  const paths = font.glyphsForString(text).map((glyph) => {
    const path = `<path transform="translate(${advance.toFixed(2)} 0) scale(${scale.toFixed(5)} ${(-scale).toFixed(5)})" d="${glyph.path.toSVG()}"/>`;
    advance += glyph.advanceWidth * scale;
    return path;
  });
  return { paths: paths.join(""), advance, capHeight: (font.capHeight ?? font.unitsPerEm * 0.7) * scale };
};

// 64-unit artboard. "90" sits low and left; the plus rides high on the right, like an exponent.
const mark = ({ tile = true, radius = 14, scale = 1 } = {}) => {
  const digits = outline("90", 36);
  const plus = { size: 15, bar: 4.6 };
  const gap = 1.5;
  const totalWidth = digits.advance + gap + plus.size;
  const left = (64 - totalWidth) / 2;
  const baseline = 32 + digits.capHeight / 2;
  const plusX = left + digits.advance + gap;
  const plusY = baseline - digits.capHeight - 1;
  const half = (plus.size - plus.bar) / 2;
  return [
    tile ? `<rect width="64" height="64" rx="${radius}" fill="${colors.navy}"/>` : "",
    `<g transform="translate(32 32) scale(${scale}) translate(-32 -32)">`,
    `<g fill="${colors.white}" transform="translate(${left.toFixed(2)} ${baseline.toFixed(2)})">${digits.paths}</g>`,
    `<g fill="${colors.mint}">`,
    `<rect x="${(plusX + half).toFixed(2)}" y="${plusY.toFixed(2)}" width="${plus.bar}" height="${plus.size}" rx="1.4"/>`,
    `<rect x="${plusX.toFixed(2)}" y="${(plusY + half).toFixed(2)}" width="${plus.size}" height="${plus.bar}" rx="1.4"/>`,
    `</g>`,
    `</g>`,
  ].join("");
};

const svg = (content) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${content}</svg>\n`;
const rounded = svg(mark());
// Maskable icons are cropped to a circle covering the middle 80%, so the mark shrinks to stay inside it.
const square = svg(mark({ radius: 0, scale: 0.72 }));
const png = (source, size) => sharp(Buffer.from(source), { density: (72 * size) / 64 }).resize(size, size).png().toBuffer();

await writeFile(new URL("public/favicon.svg", root), rounded);

// ICO entries hold PNG images, which modern browsers and operating systems support.
const entries = await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(rounded, size) })));
const header = Buffer.alloc(6 + entries.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(entries.length, 4);
let offset = header.length;
entries.forEach(({ size, data }, index) => {
  const entry = 6 + index * 16;
  header[entry] = size;
  header[entry + 1] = size;
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(data.length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += data.length;
});
await writeFile(new URL("public/favicon.ico", root), Buffer.concat([header, ...entries.map(({ data }) => data)]));

// Platforms round home-screen icons themselves, so these use the full square tile.
await mkdir(new URL("public/icons/", root), { recursive: true });
await writeFile(new URL("public/apple-touch-icon.png", root), await png(square, 180));
for (const size of [192, 512]) await writeFile(new URL(`public/icons/icon-${size}.png`, root), await png(square, size));

await writeFile(new URL("public/site.webmanifest", root), JSON.stringify({
  name: "90+",
  short_name: "90+",
  icons: [
    { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
    { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
  ],
  theme_color: colors.navy,
  background_color: colors.navy,
  display: "standalone",
  start_url: "/",
}, null, 2) + "\n");

console.log("Generated favicon.svg, favicon.ico (16, 32, 48), apple-touch-icon.png, icons/icon-192.png, icons/icon-512.png, and site.webmanifest.");
