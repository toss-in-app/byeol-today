/**
 * 세리프(Noto Serif KR 600, OFL) 등록 — 비주얼 '천체도'의 차트 글자·카드 이름에만 써요. 본문은 TDS 고딕 그대로.
 * @fontsource 의 CSS 를 그대로 쓰면 woff2 + woff 가 둘 다 번들에 실려(4.6MB) 여기서 woff2 만 FontFace 로 등록해요(약 1MB).
 * 실제 내려받기는 처음 쓸 때(display: swap). 카드는 lib/card prepareCardFonts 가 먼저 기다려요.
 */
import korean from '@fontsource/noto-serif-kr/files/noto-serif-kr-korean-600-normal.woff2?url';

export const SERIF_FAMILY = 'Noto Serif KR';

export function registerSerif(doc: Document = document): void {
  try {
    if (typeof FontFace === 'undefined' || !doc.fonts) return;
    doc.fonts.add(new FontFace(SERIF_FAMILY, `url(${korean}) format('woff2')`, { weight: '600', style: 'normal', display: 'swap' }));
  } catch {
    /* 글꼴이 없으면 고딕으로 */
  }
}
