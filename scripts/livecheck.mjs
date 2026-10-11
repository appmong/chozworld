// 배포 후 라이브 확인: node scripts/livecheck.mjs <checks.json>
// checks.json = [["URL(한글은 퍼센트 인코딩)", "페이지에 있어야 할 문구(없으면 200만 확인)"], ...]  — UTF-8로 저장
// 45초 간격으로 최대 8회 재시도(Cloudflare 배포 2~4분, 사이트별 시차).
import { readFileSync } from "node:fs";
const checks = JSON.parse(readFileSync(process.argv[2], "utf8"));
for (let round = 0; round < 8; round++) {
  const fails = [];
  for (const [url, needle] of checks) {
    try {
      const r = await fetch(url, { cache: "no-store" });
      const t = await r.text();
      if (!(r.status === 200 && t.includes(needle))) fails.push(`${r.status} ${decodeURIComponent(url)}`);
    } catch (e) { fails.push(`ERR ${decodeURIComponent(url)}`); }
  }
  console.log(`round ${round}: ok ${checks.length - fails.length}/${checks.length}`);
  if (!fails.length) process.exit(0);
  if (round === 7) { console.log(fails.join("\n")); process.exit(1); }
  await new Promise((r) => setTimeout(r, 45000));
}
