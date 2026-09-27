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
  ["cplife", "unemployment-benefit", `Photorealistic: a person filling out employment support paperwork at a bright public employment center counter, laptop and documents, calm hopeful mood`],
  ["cplife", "rent-tax", `Photorealistic: a desk with a lease contract, a calculator and bank transfer statements, a person organizing receipts for tax filing, bright tidy home office`],
  ["website01", "boiler-check", `Photorealistic: a hand adjusting a wall-mounted home heating control panel with blank display (no readable text), clean bright utility corner of a Korean apartment`],
  ["website01", "autumn-produce", `Photorealistic: autumn Korean produce on a wooden kitchen counter, sweet potatoes, apples, pears, napa cabbage and mushrooms, fresh and colorful, bright kitchen`],
  ["ohhappy-health", "blood-pressure", `Photorealistic: an older adult sitting at a table measuring blood pressure with a home upper-arm monitor, arm resting properly on the table, bright calm living room`],
  ["ohhappy-health", "second-checkup", `Photorealistic: a doctor and patient reviewing a health screening result paper together at a bright clinic desk, stethoscope nearby, reassuring atmosphere`],
  ["successguide", "cert-types", `Photorealistic: a person comparing several certificate documents and a laptop on a bright study desk, magnifying glass and notebook, careful examining mood`],
  ["successguide", "career-gap", `Photorealistic: a person writing in a notebook beside a laptop and a printed resume, thoughtful expression, warm window light, quiet determined mood`],
  ["chozworld", "rubber-plant", `Photorealistic: a large rubber plant (Ficus elastica) with glossy dark green leaves in a woven basket pot beside a bright window, cozy minimal interior`],
  ["chozworld", "air-circulation", `Photorealistic: a small white air circulator fan on the floor near a group of green houseplants by an open window, light curtain moving, fresh airy room`],
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
