// 15편 썸네일 배치 생성: OpenAI gpt-image-1 → sharp 1280x720 webp → 각 사이트 public/shots/<slug>/
// 키는 .secrets/openai.key 에서 읽음(출력 안 함). sharp는 chozworld/node_modules 사용.
import sharp from "sharp";
import { style } from "./promptstyle.mjs";
import { readFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = "D:/ProjectFolder/claude_project";
const KEY = Buffer.from([...readFileSync(`${ROOT}/.secrets/openai.key`)].filter((b) => b >= 0x21 && b <= 0x7e)).toString("ascii");

const JOBS = [
  // [사이트폴더, 슬러그, 프롬프트]  — 2026-10-16 회차(한국인 규칙은 promptstyle.mjs가 자동으로 붙임)
  ["cplife", "newborn-loan", `Photorealistic: a young couple seen from behind standing in an empty bright new apartment living room, the father holding a baby in a carrier, looking out the large window at the apartment complex, faces not visible`],
  ["cplife", "work-reduction", `Photorealistic: a parent in office clothes holding hands with an elementary school child walking home together on a quiet apartment complex path in the late afternoon, seen from behind`],
  ["cplife", "kpass", `Photorealistic: a commuter's hand tapping a plain transit card without logos on a bus card reader inside a city bus in the morning, other passengers blurred`],
  ["ohhappy-health", "bone-density", `Photorealistic: a woman in her fifties lying on a bone density scanner table in a bright clinic room while a radiographer adjusts the machine, calm and clean`],
  ["ohhappy-health", "special-copay", `Photorealistic: a hospital billing counter where a family member receives a printed receipt from staff, papers blurred, calm hospital lobby`],
  ["ohhappy-health", "stroke-signs", `Photorealistic: an older man at a breakfast table holding his arm with a worried expression while his wife beside him is calling on a phone, warm kitchen`],
  ["successguide", "adsp", `Photorealistic: a study desk with an open statistics textbook, a notebook with hand-drawn charts without letters, a laptop with blurred graphs, evening lamp light`],
  ["successguide", "public-jobs", `Photorealistic: a job seeker at a library desk browsing job postings on a laptop with a blurred screen, a planner with highlighted dates beside it`],
  ["successguide", "resignation", `Photorealistic: an office worker packing a small cardboard box with a plant, mug and notebooks at a tidy desk on their last day, seen from the side, face mostly turned away`],
  ["website01", "humidifier", `Photorealistic: a small white ultrasonic humidifier emitting gentle mist on a wooden shelf in a cozy bedroom in winter, a small hygrometer beside it`],
  ["website01", "air-fryer", `Photorealistic: an air fryer with its basket pulled out on a clean kitchen counter, golden roasted sweet potatoes and dumplings inside, warm kitchen light`],
  ["website01", "kids-phone", `Photorealistic: a parent and an elementary school child sitting together on a sofa looking at a smartphone screen, seen from behind over the shoulder, screen blurred`],
  ["chozworld", "peace-lily", `Photorealistic: a lush peace lily plant with glossy dark green leaves and several white flowers in a ceramic pot in a bright living room corner`],
  ["chozworld", "leaf-cleaning", `Photorealistic: close-up of hands gently wiping a large monstera leaf with a soft damp cloth, a small bowl of water nearby, bright room`],
  ["chozworld", "succulent-winter", `Photorealistic: various small succulents in clay pots lined up on a sunny windowsill in winter, frost on the glass outside, warm indoor light`],
];

async function genPng(prompt) {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-image-1", prompt: style(prompt), size: "1536x1024", n: 1 }),
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
