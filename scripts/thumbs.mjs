// images/chozworld/*.JPEG (생성 시각순 = 1~15) → public/shots/<slug>/thumb-wide.webp (1280x720)
import sharp from "sharp";
import { readdirSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const SRC = resolve(root, "..", "images", "chozworld");

const SLUGS = [
  "monstera",     // 1 몬스테라-알보-키우기
  "alocasia",     // 2 알로카시아-키우기
  "anthurium",    // 3 안스리움-키우기
  "philodendron", // 4 필로덴드론-종류-키우기
  "beginner",     // 5 초보-관엽식물-추천
  "watering",     // 6 관엽식물-물주기-기본
  "light",        // 7 실내-빛-광량-이해
  "repotting",    // 8 분갈이-방법-시기
  "leafcolor",    // 9 잎이-노랗게-갈색-변할때
  "pest",         // 10 관엽식물-병충해-대처
  "cutting",      // 11 삽목-꺾꽂이-번식
  "waterprop",    // 12 물꽂이-수경-발근
  "soil",         // 13 관엽식물-흙-화분-고르기
  "humidity",     // 14 관엽식물-습도-관리
  "winter",       // 15 겨울철-관엽식물-월동
];

const files = readdirSync(SRC).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort();
if (files.length !== SLUGS.length) console.log(`⚠ 이미지 ${files.length} / 슬러그 ${SLUGS.length} 불일치`);

let ok = 0;
for (let i = 0; i < SLUGS.length && i < files.length; i++) {
  const outDir = resolve(root, "public/shots", SLUGS[i]);
  mkdirSync(outDir, { recursive: true });
  const info = await sharp(resolve(SRC, files[i]))
    .resize(1280, 720, { fit: "cover", position: "attention" })
    .webp({ quality: 82 })
    .toFile(resolve(outDir, "thumb-wide.webp"));
  console.log(`  ✓ ${i + 1} ${files[i]} → shots/${SLUGS[i]}/ (${(info.size / 1024).toFixed(0)}KB)`);
  ok++;
}
console.log(`\n완료: ${ok}/${SLUGS.length}`);
