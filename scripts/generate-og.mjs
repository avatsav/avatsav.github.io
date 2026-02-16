import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
} from "node:fs";
import matter from "gray-matter";
import toml from "toml";
import { join, basename, dirname } from "node:path";
import { createRequire } from "node:module";

const matterOptions = {
  engines: { toml: toml.parse.bind(toml) },
  language: "toml",
  delimiters: "+++",
};

const require = createRequire(import.meta.url);
const ROOT = join(import.meta.dirname, "..");
const CONTENT_DIR = join(ROOT, "avatsav", "content", "blog");
const OUTPUT_DIR = join(ROOT, "avatsav", "static", "og");
const WIDTH = 1200;
const HEIGHT = 630;

// Load Inter 600 weight (WOFF format, supported by satori)
const fontsourceDir = dirname(
  require.resolve("@fontsource/inter/package.json"),
);
const fontData = readFileSync(
  join(fontsourceDir, "files", "inter-latin-600-normal.woff"),
);

// FNV-1a 32-bit hash
function fnv32a(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

// Seeded PRNG (mulberry32)
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Derive gradient colors from slug, anchored to brand purple (hue ~275)
function deriveColors(slug) {
  const hash = fnv32a(slug);
  const baseHue = 275;
  const offset = (hash % 120) - 60;
  const hue1 = (((baseHue + offset) % 360) + 360) % 360;
  const hue2 = (hue1 + 35 + (Math.floor(hash / 360) % 25)) % 360;
  const sat1 = 55 + (Math.floor(hash / 7200) % 20);
  const sat2 = 60 + (Math.floor(hash / 144000) % 15);
  const light1 = 35 + (Math.floor(hash / 2160000) % 13);
  const light2 = 40 + (Math.floor(hash / 28080000) % 10);
  const angle = hash % 180;
  return { hue1, hue2, sat1, sat2, light1, light2, angle };
}

// Generate deterministic noise pixel buffer
function generateNoise(width, height, seed, intensity = 25) {
  const rng = mulberry32(seed);
  const buf = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const n = Math.floor((rng() - 0.5) * intensity + 128);
    const offset = i * 4;
    buf[offset] = n;
    buf[offset + 1] = n;
    buf[offset + 2] = n;
    buf[offset + 3] = 18;
  }
  return buf;
}

// Build the satori element tree for a post
function buildTemplate(colors) {
  const { hue1, hue2, sat1, sat2, light1, light2, angle } = colors;

  return {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        backgroundImage: `linear-gradient(${angle}deg, hsl(${hue1}, ${sat1}%, ${light1}%) 0%, hsl(${hue2}, ${sat2}%, ${light2}%) 100%)`,
      },
    },
  };
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const files = readdirSync(CONTENT_DIR).filter(
    (f) => f.endsWith(".md") && !f.startsWith("_"),
  );

  console.log(`Generating OG images for ${files.length} posts...`);

  for (const file of files) {
    const raw = readFileSync(join(CONTENT_DIR, file), "utf-8");
    const { data } = matter(raw, matterOptions);

    const slug = data.slug || basename(file, ".md");
    const title = data.title;
    if (!title) {
      console.log(`  Skipping ${file} (no title)`);
      continue;
    }

    const outputPath = join(OUTPUT_DIR, `${slug}.png`);
    if (existsSync(outputPath)) {
      console.log(`  ${slug}.png (exists, skipped)`);
      continue;
    }

    const colors = deriveColors(slug);
    const template = buildTemplate(colors);

    // Render HTML/CSS to SVG
    const svg = await satori(template, {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        { name: "Inter", data: fontData, weight: 600, style: "normal" },
      ],
    });

    // Rasterize SVG to PNG
    const resvg = new Resvg(svg, {
      fitTo: { mode: "width", value: WIDTH },
    });
    const gradientPng = resvg.render().asPng();

    // Generate deterministic noise and composite it
    const hash = fnv32a(slug);
    const noiseBuf = generateNoise(WIDTH, HEIGHT, hash);
    const noisePng = await sharp(noiseBuf, {
      raw: { width: WIDTH, height: HEIGHT, channels: 4 },
    })
      .png()
      .toBuffer();

    const finalPng = await sharp(gradientPng)
      .composite([{ input: noisePng, blend: "overlay" }])
      .png({ compressionLevel: 9 })
      .toBuffer();

    writeFileSync(outputPath, finalPng);

    const sizeKb = (finalPng.length / 1024).toFixed(1);
    console.log(`  ${slug}.png (${sizeKb} KB)`);
  }

  console.log("Done!");
}

main().catch((err) => {
  console.error("Failed to generate OG images:", err);
  process.exit(1);
});
