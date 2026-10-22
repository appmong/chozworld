// 이미지 생성 공통 스타일 — imgbatch.mjs(썸네일)·bodyimg.mjs(본문)가 함께 씀.
// 2026-10-16: 문구 원본을 promptstyle.json 으로 옮김 (제미나이 일감 등록 imgqueue.py 도 같은 파일을 읽는다).
//   이력: 10-14 한국인·한국 배경 규칙 / 10-16 음식은 식사 장면일 때만.
//   사람이 꼭 필요 없으면 개별 프롬프트에서 손·뒷모습·어깨 너머 구도(얼굴 안 보이게)를 쓰는 걸 우선.
import { readFileSync } from "node:fs";

const S = JSON.parse(readFileSync(new URL("./promptstyle.json", import.meta.url), "utf8"));
export const PEOPLE = S.people;
export const LOOK = S.look;
export const style = (prompt) => `${prompt}. ${PEOPLE}. ${LOOK}`;
