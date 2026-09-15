// 15편 썸네일 배치 생성: OpenAI gpt-image-1 → sharp 1280x720 webp → 각 사이트 public/shots/<slug>/
// 키는 .secrets/openai.key 에서 읽음(출력 안 함). sharp는 chozworld/node_modules 사용.
import sharp from "sharp";
import { readFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = "D:/ProjectFolder/claude_project";
const KEY = Buffer.from([...readFileSync(`${ROOT}/.secrets/openai.key`)].filter((b) => b >= 0x21 && b <= 0x7e)).toString("ascii");
const TAIL = "soft natural daylight, shallow depth of field, clean bright interior, cozy realistic mood, high detail, no text, no letters, no logo, no watermark";

const JOBS = [
  // [사이트폴더, 슬러그, 프롬프트]
  ["cplife", "naeil-card", `Photorealistic: an adult studying at a vocational training class, laptop and notebook on a bright modern classroom desk, hands and desk in focus, warm encouraging atmosphere, Korean`],
  ["cplife", "jeonse-check", `Photorealistic: a person carefully reviewing a housing lease contract document with a pen, small house model and keys on a clean bright desk`],
  ["cplife", "child-benefit", `Photorealistic: warm family finance concept, a calculator, documents and a piggy bank with a small baby's shoe on a bright desk`],
  ["website01", "season-clothes", `Photorealistic: neatly folded seasonal knit sweaters and clothes organized in an open drawer, hands folding clothes, bright clean home closet`],
  ["website01", "sink-drain", `Photorealistic: a clean stainless kitchen sink drain, a box of baking soda and a small cleaning brush beside it, bright tidy kitchen`],
  ["website01", "wifi", `Photorealistic: a white home wifi router on a wooden shelf, a smartphone showing signal bars nearby, modern bright living room, blurred background`],
  ["ohhappy-health", "flu-shot", `Photorealistic: a nurse's gloved hands applying a small round bandage to a patient's upper arm after a vaccination, bright clean clinic, gentle and safe atmosphere`],
  ["ohhappy-health", "seasonal-health", `Photorealistic: a person wearing a cozy scarf holding a warm cup of tea by a window in autumn, healthy relaxed mood, soft light`],
  ["ohhappy-health", "checkup-skip", `Photorealistic: a health check-up notice paper and a calendar with a red circle mark, a stethoscope on a bright clean desk`],
  ["successguide", "info-processing", `Photorealistic: a young person studying for an IT certification, laptop with abstract code on screen (no readable text), notebook and coffee on a focused study desk`],
  ["successguide", "career-desc", `Photorealistic: hands reviewing a printed resume document with a pen, glasses and coffee on a bright modern office desk, top-down view`],
  ["successguide", "fall-hiring", `Photorealistic: a job seeker preparing applications on a laptop with a planner and calendar, warm autumn window light, determined focused mood`],
  ["chozworld", "sansevieria", `Photorealistic close-up of a snake plant (Sansevieria) in a modern minimalist ceramic pot on a bright windowsill, tall upright leaves, fresh green interior`],
  ["chozworld", "fertilizer", `Photorealistic: a hand adding liquid fertilizer into a watering can beside a healthy monstera houseplant, bright green plant-filled interior`],
  ["chozworld", "season-move", `Photorealistic: two hands holding a potted green houseplant, placing it near a bright window in autumn, cozy warm home interior with plants`],
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
