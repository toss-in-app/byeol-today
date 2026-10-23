/**
 * 오늘 카드 이미지 (계약 events.md '공유'): 1080×1350 PNG — 밤하늘 바탕에 별자리 선 그림을 크게, 이름·날짜 범위, 오늘 하늘 두 줄(달의 별자리·모양, 집),
 * 총운(머리글처럼 크게)·사랑·일·돈, 워터마크. 비주얼 '밤 별자리'(steps/3-design/wireframes/byeol-today-visual-v2.md), 선 그림 자료는 lib/constellations(화면 SVG 와 같은 것).
 * 캔버스 없이도 검증할 수 있게 문구·줄바꿈 계산(layoutCard·wrapText)을 그리기(drawCard)와 분리했어요(mandalartplan 과 같은 구조).
 * 글꼴은 기기 기본 고딕이라 기기마다 조금 다르게 보일 수 있어요.
 */
import { signInfo, type Content } from '../content';
import { houseOf, readingFor, signIndex, type SignId, type SkyDay } from '../sky';
import { CONSTELLATIONS, NIGHT, type StarMag } from './constellations';

export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1350;
export const WATERMARK = '오늘의 별자리 운세 · 토스에서 검색';
const PAD = 72;
/** 선 그림 한 변(px) — 카드 위쪽 가운데. 글 길이에 따라 이 사이에서 정해요 */
const GLYPH_MIN = 380;
const GLYPH_MAX = 560;
const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", Roboto, sans-serif';
/** 밝기별 별 반지름(px, 카드 크기 기준) */
const STAR_RADIUS: Record<StarMag, number> = { 0: 2.4, 1: 5, 2: 7, 3: 11 };

export interface CardInput {
  content: Content;
  sign: SignId;
  /** 'YYYY-MM-DD' */
  today: string;
  day: SkyDay;
}

export interface CardLayout {
  width: number;
  height: number;
  sign: SignId;
  caption: string;
  title: string;
  subtitle: string;
  sky: string;
  house: string;
  sections: { label: string; text: string }[];
  footer: string;
}

/** '2026-10-23' → '2026년 10월 23일' */
export function formatCardDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return `${y}년 ${m}월 ${d}일`;
}

/** 저장 파일 이름. 확장자를 포함해야 해요(File.saveBase64 규칙). */
export function cardFileName(sign: SignId, date: string): string {
  return `byeol-today-${sign}-${date}.png`;
}

/** 캔버스와 무관한 문구 계산 */
export function layoutCard({ content, sign, today, day }: CardInput): CardLayout {
  const info = signInfo(content, sign);
  const reading = readingFor(content, sign, day);
  const house = content.houses[houseOf(sign, day.moon) - 1];
  const phase = content.phases.find((p) => p.id === day.phase);
  return {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    sign,
    caption: `오늘의 별자리 운세 · ${formatCardDate(today)}`,
    title: info.name,
    subtitle: info.dates,
    sky: `오늘 달은 ${signInfo(content, day.moon).name}에 있어요 · ${phase?.name ?? ''}`,
    house: `나의 ${reading.house}번째 집 '${house.theme}'`,
    sections: [
      { label: '총운', text: reading.total },
      { label: '사랑', text: reading.love },
      { label: '일', text: reading.work },
      { label: '돈', text: reading.money },
    ],
    footer: WATERMARK,
  };
}

/**
 * 글을 maxWidth 안에 들어가는 줄로 나눠요. 띄어쓰기가 있으면 거기서, 없으면 글자 단위로 끊어요.
 * maxLines 를 넘으면 마지막 줄 끝을 … 로 줄여요. measure 는 글 너비를 돌려주는 함수(캔버스 measureText).
 */
export function wrapText(measure: (text: string) => number, text: string, maxWidth: number, maxLines: number): string[] {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean || maxLines < 1) return [];
  const lines: string[] = [];
  let rest = clean;
  while (rest.length > 0) {
    if (lines.length === maxLines) {
      let last = lines[maxLines - 1];
      while (last.length > 0 && measure(`${last}…`) > maxWidth) last = last.slice(0, -1).trimEnd();
      lines[maxLines - 1] = `${last}…`;
      return lines;
    }
    let n = rest.length;
    while (n > 1 && measure(rest.slice(0, n)) > maxWidth) n -= 1;
    if (n < rest.length) {
      const space = rest.lastIndexOf(' ', n);
      if (space > 0) n = space;
    }
    lines.push(rest.slice(0, n).trim());
    rest = rest.slice(n).trim();
  }
  return lines;
}

function font(ctx: CanvasRenderingContext2D, size: number, weight: 400 | 500 | 600 | 700): void {
  ctx.font = `${weight} ${size}px ${FONT_FAMILY}`;
}

/** 바탕에 흩어진 작은 별 — 별자리마다 같은 하늘이 나오게 정해진 의사난수 */
function drawStarField(ctx: CanvasRenderingContext2D, layout: CardLayout): void {
  let seed = (signIndex(layout.sign) + 1) * 7919;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  ctx.fillStyle = NIGHT.star;
  for (let i = 0; i < 80; i += 1) {
    const x = rand() * layout.width;
    const y = rand() * layout.height;
    const r = 0.8 + rand() * 1.8;
    ctx.globalAlpha = 0.2 + rand() * 0.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** 별자리 선 그림을 (x, y)부터 size 크기로 — 선은 금색, 별은 흰색, 가장 밝은 별은 금색에 빛 번짐 */
export function drawConstellation(ctx: CanvasRenderingContext2D, sign: SignId, x: number, y: number, size: number): void {
  const { stars, lines } = CONSTELLATIONS[sign];
  const k = size / 100;
  ctx.strokeStyle = 'rgba(232, 197, 106, 0.85)';
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  for (const [a, b] of lines) {
    ctx.beginPath();
    ctx.moveTo(x + stars[a][0] * k, y + stars[a][1] * k);
    ctx.lineTo(x + stars[b][0] * k, y + stars[b][1] * k);
    ctx.stroke();
  }
  for (const [sx, sy, mag] of stars) {
    const cx = x + sx * k;
    const cy = y + sy * k;
    const r = STAR_RADIUS[mag];
    if (mag === 3) {
      ctx.fillStyle = 'rgba(232, 197, 106, 0.25)';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = NIGHT.gold;
    } else {
      ctx.fillStyle = NIGHT.star;
    }
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** 레이아웃을 캔버스(CARD_WIDTH × CARD_HEIGHT)에 그려요 */
export function drawCard(ctx: CanvasRenderingContext2D, layout: CardLayout): void {
  const width = layout.width - PAD * 2;
  const measure = (t: string) => ctx.measureText(t).width;
  ctx.save();
  ctx.fillStyle = NIGHT.sky;
  ctx.fillRect(0, 0, layout.width, layout.height);
  drawStarField(ctx, layout);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // 머리글
  font(ctx, 26, 500);
  ctx.fillStyle = NIGHT.muted;
  ctx.fillText(layout.caption, PAD, PAD + 26);

  // 글 줄을 먼저 계산해요 — 글이 길면 선 그림을 줄이고, 짧으면 키워서 빈 데가 남지 않게
  const [total, ...rest] = layout.sections;
  font(ctx, 40, 500);
  const totalLines = wrapText(measure, total.text, width, 2);
  font(ctx, 30, 700);
  const labelWidth = Math.max(...rest.map((s) => Math.ceil(measure(s.label)))) + 24;
  font(ctx, 30, 500);
  const sectionLines = rest.map((s) => ({ label: s.label, lines: wrapText(measure, s.text, width - labelWidth, 2) }));
  const textHeight = 96 + 46 + 52 + 42 + 70 + (totalLines.length - 1) * 54 + 64 + sectionLines.reduce((h, s) => h + s.lines.length * 44 + 16, 0) - 16 + 10;
  const glyphY = PAD + 64;
  const footerTop = layout.height - 60 - 30;
  const glyphSize = Math.min(GLYPH_MAX, Math.max(GLYPH_MIN, footerTop - 30 - textHeight - glyphY));

  // 별자리 선 그림(가운데, 크게)
  drawConstellation(ctx, layout.sign, (layout.width - glyphSize) / 2, glyphY, glyphSize);

  // 이름 · 날짜 범위
  let y = glyphY + glyphSize + 96;
  font(ctx, 96, 700);
  ctx.fillStyle = NIGHT.star;
  ctx.fillText(layout.title, PAD, y);
  y += 46;
  font(ctx, 26, 500);
  ctx.fillStyle = NIGHT.muted;
  ctx.fillText(layout.subtitle, PAD, y);

  // 오늘 하늘 두 줄
  y += 52;
  font(ctx, 30, 500);
  ctx.fillStyle = NIGHT.muted;
  ctx.fillText(layout.sky, PAD, y);
  y += 42;
  ctx.fillText(layout.house, PAD, y);

  // 총운은 머리글처럼 크게, 사랑·일·돈은 금색 이름표(같은 칸 너비) + 글
  y += 70;
  font(ctx, 40, 500);
  ctx.fillStyle = NIGHT.star;
  totalLines.forEach((line, i) => ctx.fillText(line, PAD, y + i * 54));
  y += (totalLines.length - 1) * 54 + 64;
  for (const section of sectionLines) {
    font(ctx, 30, 700);
    ctx.fillStyle = NIGHT.gold;
    ctx.fillText(section.label, PAD, y);
    font(ctx, 30, 500);
    ctx.fillStyle = NIGHT.dim;
    section.lines.forEach((line, i) => ctx.fillText(line, PAD + labelWidth, y + i * 44));
    y += section.lines.length * 44 + 16;
  }

  // 워터마크
  font(ctx, 24, 500);
  ctx.fillStyle = NIGHT.muted;
  ctx.textAlign = 'center';
  ctx.fillText(layout.footer, layout.width / 2, layout.height - 60);
  ctx.restore();
}

export interface RenderedCard {
  /** <img src> 에 바로 쓰는 data URL */
  dataUrl: string;
  /** File.saveBase64 에 넘기는 본문(접두어 없음) */
  base64: string;
}

/** 카드를 PNG 로 그려요. 캔버스를 쓸 수 없는 환경(테스트·구형 웹뷰)이면 null. */
export function renderCard(input: CardInput, doc: Document = document): RenderedCard | null {
  try {
    const canvas = doc.createElement('canvas');
    canvas.width = CARD_WIDTH;
    canvas.height = CARD_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    drawCard(ctx, layoutCard(input));
    const dataUrl = canvas.toDataURL('image/png');
    const comma = dataUrl.indexOf(',');
    if (!dataUrl.startsWith('data:image/png') || comma < 0 || comma === dataUrl.length - 1) return null;
    return { dataUrl, base64: dataUrl.slice(comma + 1) };
  } catch {
    return null;
  }
}
