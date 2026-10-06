// 15편 썸네일 배치 생성: OpenAI gpt-image-1 → sharp 1280x720 webp → 각 사이트 public/shots/<slug>/
// 키는 .secrets/openai.key 에서 읽음(출력 안 함). sharp는 chozworld/node_modules 사용.
import sharp from "sharp";
import { readFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = "D:/ProjectFolder/claude_project";
const KEY = Buffer.from([...readFileSync(`${ROOT}/.secrets/openai.key`)].filter((b) => b >= 0x21 && b <= 0x7e)).toString("ascii");
const TAIL = "soft natural daylight, shallow depth of field, clean bright interior, cozy realistic mood, high detail, no text, no letters, no logo, no watermark";

const JOBS = [
  // [사이트폴더, 슬러그, 프롬프트]  — 2026-10-06 회차
  ["cplife", "energy-voucher", `Photorealistic: an elderly Korean woman in a warm cardigan sitting in a cozy small apartment beside a warm floor heating area, holding a plain card without logos, a gas boiler controller on the wall, winter afternoon light`],
  ["ohhappy-health", "covid-shot", `Photorealistic: a nurse giving a vaccine injection in the upper arm of a senior man at a bright Korean local clinic, calm and reassuring atmosphere`],
  ["successguide", "ai-interview", `Photorealistic: a young job candidate in a neat blazer sitting at a desk facing a laptop webcam for an online video interview, ring light, tidy plain wall behind, screen blurred`],
  ["website01", "condensation", `Photorealistic close-up: water droplets of condensation on the inside of a window glass in a winter morning, a frosty cold view outside blurred, white window frame`],
  ["chozworld", "calathea", `Photorealistic: a healthy calathea plant with striking patterned leaves in a ceramic pot on a wooden stand in a bright room with indirect light`],
];

async function genPng(prompt) {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-image-1", prompt: `${prompt}. ${TAIL}`, size: "1536x1024", n: 1 }),
  });
  const j = await res.json();
  if (!res.ok) throw new Error(j?.error?.message || JSON.stringify(j).slice(0, 200));
  return Buffer.from(j.data[0].b64_json, "base64");
}

let ok = 0;
const fails = [];
for (const [site, slug, prompt] of JOBS) {
  try {
    const png = await genPng(prompt);
    const outDir = resolve(ROOT, site, "public/shots", slug);
    mkdirSync(outDir, { recursive: true });
    const info = await sharp(png).resize(1280, 720, { fit: "cover", position: "attention" }).webp({ quality: 82 }).toFile(resolve(outDir, "thumb-wide.webp"));
    console.log(`  ✓ ${site}/${slug} (${(info.size / 1024).toFixed(0)}KB)`);
    ok++;
  } catch (e) {
    console.log(`  ✗ ${site}/${slug} — ${e.message}`);
    fails.push(`${site}/${slug}`);
  }
}
console.log(`\n완료: ${ok}/${JOBS.length}` + (fails.length ? ` | 실패: ${fails.join(", ")}` : ""));
