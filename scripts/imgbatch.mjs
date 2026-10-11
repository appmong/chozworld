// 15편 썸네일 배치 생성: OpenAI gpt-image-1 → sharp 1280x720 webp → 각 사이트 public/shots/<slug>/
// 키는 .secrets/openai.key 에서 읽음(출력 안 함). sharp는 chozworld/node_modules 사용.
import sharp from "sharp";
import { readFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = "D:/ProjectFolder/claude_project";
const KEY = Buffer.from([...readFileSync(`${ROOT}/.secrets/openai.key`)].filter((b) => b >= 0x21 && b <= 0x7e)).toString("ascii");
const TAIL = "soft natural daylight, shallow depth of field, clean bright interior, cozy realistic mood, high detail, no text, no letters, no logo, no watermark";

const JOBS = [
  // [사이트폴더, 슬러그, 프롬프트]  — 2026-10-11 회차
  ["cplife", "youth-dream-account", `Photorealistic: a young Korean office worker in their late twenties sitting by a window in a small apartment, looking hopefully at a bank savings passbook, a small house-shaped piggy bank on the desk, city apartment buildings outside`],
  ["cplife", "postpartum-care", `Photorealistic: a kind middle-aged postpartum caregiver gently holding a newborn baby wrapped in a white swaddle in a bright Korean apartment living room, the new mother resting on a sofa smiling`],
  ["ohhappy-health", "medical-tax", `Photorealistic: a person at a desk sorting pharmacy and hospital receipts next to a calculator and a pair of eyeglasses, papers blurred and unreadable, warm evening light`],
  ["ohhappy-health", "shingles", `Photorealistic: a doctor consulting with a woman in her late fifties at a clinic desk, discussing a vaccination plan, a vaccine vial and syringe tray on the side, calm reassuring mood`],
  ["successguide", "sqld", `Photorealistic: a laptop showing a blurred database query editor with table grid results, an open study book and sticky notes on a tidy desk, focused evening study session`],
  ["successguide", "reference-check", `Photorealistic: a professional woman in an office having a friendly phone call while looking at a laptop, notebook on the desk, bright modern workspace`],
  ["website01", "kimjang", `Photorealistic: a Korean home kitchen floor prepared for kimchi making, a large basin of salted napa cabbage halves, bowls of red pepper paste seasoning, radish and green onions, rubber gloves, autumn daylight`],
  ["website01", "two-factor", `Photorealistic: a person holding a smartphone showing a blurred verification code screen beside a laptop login page with a padlock icon, cozy desk, no readable text`],
  ["chozworld", "hoya", `Photorealistic: a lush hoya plant with thick glossy waxy leaves trailing from a hanging pot by a bright window, clusters of pink star-shaped flowers`],
  ["chozworld", "fungus-gnats", `Photorealistic close-up: a potted houseplant on a windowsill with a yellow sticky trap inserted in the soil, a few tiny black gnats caught on it, soil surface dry`],
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
