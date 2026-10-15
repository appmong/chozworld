// 이미지 생성 공통 스타일 — imgbatch.mjs(썸네일)·bodyimg.mjs(본문)가 함께 씀.
// 2026-10-16: 음식 규칙 때문에 무관한 장면에도 반찬이 끼어들어 "식사 장면일 때만"으로 좁힘.
// 2026-10-14: 국적 미지정 시 서양인이 나오는 문제 → 한국인·한국 배경 규칙을 모든 프롬프트에 붙임.
//   사람이 꼭 필요 없으면 개별 프롬프트에서 손·뒷모습·어깨 너머 구도(얼굴 안 보이게)를 쓰는 걸 우선.
export const PEOPLE =
  "Every person in the image is Korean (South Korean, East Asian features) and the setting is contemporary South Korea " +
  "(Korean apartment, Korean clinic, office or street). Do not show Western or non-Korean-looking people. " +
  "Everyday objects match Korean daily life. Only if the scene itself involves food or a meal, show Korean dishes " +
  "(rice, side dishes, jeon, japchae), never Western holiday food; do not add food to scenes that are not about eating";

export const LOOK =
  "soft natural daylight, shallow depth of field, clean bright interior, cozy realistic mood, high detail, " +
  "no text, no letters, no logo, no watermark";

export const style = (prompt) => `${prompt}. ${PEOPLE}. ${LOOK}`;
