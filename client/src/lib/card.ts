/**
 * 오늘 카드 이미지 (계약 events.md '공유'): 1080×1350 PNG — 날짜, 별자리 이름·날짜, 오늘 하늘 한 줄(달의 별자리·모양), 집, 총운·사랑·일·돈, 워터마크.
 * 캔버스 없이도 검증할 수 있게 문구·줄바꿈 계산(layoutCard·wrapText)을 그리기(drawCard)와 분리했어요(mandalartplan 과 같은 구조).
 * 글꼴은 기기 기본 고딕이라 기기마다 조금 다르게 보일 수 있어요. 별자리 기호 SVG 는 아직 없어 글자만 써요.
 */
import { colors } from '@toss/tds-colors';

import config from '../../apps-in-toss.config';
import { signInfo, type Content } from '../content';
import { houseOf, readingFor, type SignId, type SkyDay } from '../sky';

export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1350;
export const WATERMARK = '오늘의 별자리 운세 · 토스에서 검색';
const PAD = 72;
const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", Roboto, sans-serif';
const brandColor = config.brand.primaryColor;

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

/** 레이아웃을 캔버스(CARD_WIDTH × CARD_HEIGHT)에 그려요 */
export function drawCard(ctx: CanvasRenderingContext2D, layout: CardLayout): void {
  const width = layout.width - PAD * 2;
  const measure = (t: string) => ctx.measureText(t).width;
  ctx.save();
  ctx.fillStyle = colors.white;
  ctx.fillRect(0, 0, layout.width, layout.height);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // 머리글: 날짜 · 별자리 이름(브랜드 색) · 날짜 범위
  font(ctx, 28, 500);
  ctx.fillStyle = colors.grey600;
  ctx.fillText(layout.caption, PAD, PAD + 32);
  font(ctx, 88, 700);
  ctx.fillStyle = brandColor;
  ctx.fillText(layout.title, PAD, PAD + 140);
  font(ctx, 30, 500);
  ctx.fillStyle = colors.grey600;
  ctx.fillText(layout.subtitle, PAD, PAD + 190);

  // 오늘 하늘 상자
  const boxY = PAD + 240;
  ctx.fillStyle = colors.grey50;
  ctx.beginPath();
  ctx.roundRect(PAD, boxY, width, 150, 24);
  ctx.fill();
  font(ctx, 32, 700);
  ctx.fillStyle = colors.grey900;
  ctx.fillText(layout.sky, PAD + 36, boxY + 62);
  font(ctx, 30, 500);
  ctx.fillStyle = colors.grey700;
  ctx.fillText(layout.house, PAD + 36, boxY + 112);

  // 영역 4
  let y = boxY + 150 + 72;
  for (const section of layout.sections) {
    font(ctx, 30, 700);
    ctx.fillStyle = colors.grey800;
    ctx.fillText(section.label, PAD, y);
    font(ctx, 34, 500);
    ctx.fillStyle = colors.grey900;
    const lines = wrapText(measure, section.text, width, 2);
    lines.forEach((line, i) => ctx.fillText(line, PAD, y + 50 + i * 46));
    y += 50 + lines.length * 46 + 40;
  }

  // 워터마크
  font(ctx, 26, 500);
  ctx.fillStyle = colors.grey500;
  ctx.textAlign = 'center';
  ctx.fillText(layout.footer, layout.width / 2, layout.height - 64);
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
