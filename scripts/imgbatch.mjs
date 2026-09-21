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
  ["cplife", "student-loan", `Photorealistic: a university student reviewing student loan repayment documents at a bright desk, laptop and calculator nearby, calm focused mood`],
  ["cplife", "move-in-report", `Photorealistic: a person handing over a lease contract and house keys at a bright public office counter, moving boxes blurred in background`],
  ["cplife", "happy-card", `Photorealistic: a pregnant woman holding a payment card and a hospital appointment paper in a bright clean clinic waiting area, warm hopeful mood`],
  ["website01", "chuseok-food", `Photorealistic: Korean holiday food leftovers being packed into clear glass containers for the refrigerator, savory pancakes and seasoned vegetables, bright clean kitchen counter`],
  ["website01", "bedding-care", `Photorealistic: fresh white bedding and pillows being folded on a bed, sunlight through the window, clean airy bedroom`],
  ["website01", "phone-reset", `Photorealistic: hands holding a smartphone showing a blank settings-like screen (no readable text), a SIM tray tool and memory card on a clean desk`],
  ["ohhappy-health", "holiday-digest", `Photorealistic: a person resting a hand on the stomach while sitting at a dining table after a heavy meal, warm cup of tea nearby, soft comfortable home mood`],
  ["ohhappy-health", "infant-checkup", `Photorealistic: a pediatrician measuring a smiling baby's height on an examination table while a parent holds the baby, bright friendly clinic`],
  ["ohhappy-health", "holiday-clinic", `Photorealistic: a lit hospital emergency entrance at night with a glowing red cross sign area (no readable text), calm clean exterior, blurred city lights`],
  ["successguide", "exam-eligibility", `Photorealistic: a person checking certification application requirements on a laptop with a printed checklist and diploma folder on a bright study desk`],
  ["successguide", "salary-nego", `Photorealistic: two people across a bright modern office table during a calm professional discussion, a contract document and pen between them, hands visible`],
  ["successguide", "career-pivot", `Photorealistic: a person at a desk with two open notebooks and sticky notes planning a career change, laptop and coffee, warm determined mood`],
  ["chozworld", "pothos", `Photorealistic close-up of a variegated pothos plant with trailing vines cascading from a shelf, bright green and cream leaves, cozy plant-filled interior`],
  ["chozworld", "pruning", `Photorealistic: hands using small pruning scissors to trim a houseplant stem, cut cuttings on a table, bright botanical home interior`],
  ["chozworld", "grow-light", `Photorealistic: a modern clip-on plant grow light shining softly over green houseplants on a shelf in a dim winter room, cozy indoor gardening mood`],
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
