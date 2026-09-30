// 글 공유 미리보기(og:image) 생성: 각 사이트 public/shots/<thumb>/thumb-wide.webp → public/og/<thumb>.jpg (1200x630)
// 사용: node scripts/ogimg.mjs   (5개 사이트 전부, 이미 있으면 건너뜀. 새 글 추가 후 다시 실행하면 됨)
import sharp from "sharp";
import { readdirSync, readFileSync, existsSync, mkdirSync } from "node:fs";

const ROOT = "D:/ProjectFolder/claude_project";
const SITES = ["chozworld", "website01", "successguide", "ohhappy-health", "cplife"];

let made = 0, skipped = 0;
const missing = [];
for (const site of SITES) {
  const postsDir = `${ROOT}/${site}/src/content/posts`;
  const ogDir = `${ROOT}/${site}/public/og`;
  mkdirSync(ogDir, { recursive: true });
  for (const f of readdirSync(postsDir).filter((n) => n.endsWith(".md"))) {
    const m = readFileSync(`${postsDir}/${f}`, "utf8").match(/^thumb:\s*"?([^"\r\n]+?)"?\s*$/m);
    if (!m) continue;
    const thumb = m[1];
    const src = `${ROOT}/${site}/public/shots/${thumb}/thumb-wide.webp`;
    const out = `${ogDir}/${thumb}.jpg`;
    if (!existsSync(src)) { missing.push(`${site}/${thumb}`); continue; }
    if (existsSync(out)) { skipped++; continue; }
    await sharp(src).resize(1200, 630, { fit: "cover", position: "attention" }).jpeg({ quality: 82, mozjpeg: true }).toFile(out);
    made++;
  }
}
console.log(`생성 ${made}, 건너뜀 ${skipped}` + (missing.length ? ` | 썸네일 없음: ${missing.join(", ")}` : ""));
