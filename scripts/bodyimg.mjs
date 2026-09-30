// 본문 이미지 배치 생성: gpt-image-1 1536x1024 → sharp 1200x800 webp → <사이트>/public/shots/<slug>/<file>.webp
// 사용: node scripts/bodyimg.mjs <jobs.json>   (jobs.json = [[site, slug, file, prompt], ...])
// 키는 .secrets/openai.key 에서 읽음(출력 안 함).
import sharp from "sharp";
import { readFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = "D:/ProjectFolder/claude_project";
const KEY = Buffer.from([...readFileSync(`${ROOT}/.secrets/openai.key`)].filter((b) => b >= 0x21 && b <= 0x7e)).toString("ascii");
const TAIL = "soft natural daylight, shallow depth of field, clean bright interior, cozy realistic mood, high detail, no text, no letters, no logo, no watermark";
const JOBS = JSON.parse(readFileSync(process.argv[2], "utf8"));

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

let ok = 0; const fails = [];
for (const [site, slug, file, prompt] of JOBS) {
  const outDir = resolve(ROOT, site, "public/shots", slug);
  const out = resolve(outDir, `${file}.webp`);
  if (existsSync(out)) { console.log(`  = ${site}/${slug}/${file} (exists)`); ok++; continue; }
  try {
    const png = await genPng(prompt);
    mkdirSync(outDir, { recursive: true });
    const info = await sharp(png).resize(1200, 800, { fit: "cover", position: "attention" }).webp({ quality: 80 }).toFile(out);
    console.log(`  ✓ ${site}/${slug}/${file} (${(info.size / 1024).toFixed(0)}KB)`);
    ok++;
  } catch (e) {
    console.log(`  ✗ ${site}/${slug}/${file} — ${e.message}`);
    fails.push(`${site}/${slug}/${file}`);
  }
}
console.log(`\n완료: ${ok}/${JOBS.length}` + (fails.length ? ` | 실패: ${fails.join(", ")}` : ""));
