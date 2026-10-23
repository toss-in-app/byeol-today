/**
 * 오늘 카드 이미지 (계약 events.md '공유'): 1080×1350 PNG — 비주얼 '천체도'(steps/3-design/wireframes/byeol-today-visual-v2.md, 2026-10-23 시안 3 채택).
 * 미색 종이 바탕 + 12칸 원형 차트(내 별자리가 꼭대기, 오늘 달이 있는 집에 표시, 가운데 이름) + 이름·날짜 범위·오늘 하늘 한 줄 + 총운·사랑·일·돈 + 워터마크.
 * 차트 기하는 lib/chart(화면 SVG 와 공유). 세리프(Noto Serif KR, 번들 동봉)는 차트 글자·이름에만, 본문은 기기 고딕.
 * 캔버스 없이도 검증할 수 있게 문구·줄바꿈 계산(layoutCard·wrapText)을 그리기(drawCard)와 분리했어요(mandalartplan 과 같은 구조).
 */
import { signInfo, type Content } from '../content';
import { houseOf, readingFor, type SignId, type SkyDay } from '../sky';
import { divisionLines, houseAngle, houseLabelPoints, PAPER, polar, shortName, signAtHouse, ticks } from './chart';

export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1350;
export const WATERMARK = '오늘의 별자리 운세 · 토스에서 검색';
export const DIAGRAM_NOTE = '도식 · 실제 하늘과 다름';
const PAD = 72;
/** 차트 한 변(px) — 글 길이에 따라 이 사이에서 정해요 */
const CHART_MIN = 520;
const CHART_MAX = 680;
const SANS = '-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", Roboto, sans-serif';
const SERIF = '"Noto Serif KR", "Apple SD Gothic Neo", serif';
const SERIF_PROBE = '600 20px "Noto Serif KR"';

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
  moon: SignId;
  /** 오늘 달이 있는 집 1~12 */
  houseNumber: number;
  /** 차트 12칸 글자(1번 집 = 내 별자리부터 시계 방향) */
  ringLabels: string[];
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
    moon: day.moon,
    houseNumber: reading.house,
    ringLabels: Array.from({ length: 12 }, (_, i) => shortName(signInfo(content, signAtHouse(sign, i + 1)).name)),
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

/** 세리프가 준비됐는지(번들 동봉 글꼴이 아직 안 읽혔거나 캔버스 밖 환경이면 고딕으로) */
function serifReady(doc: Document | undefined): boolean {
  try {
    return Boolean(doc?.fonts?.check(SERIF_PROBE));
  } catch {
    return false;
  }
}

/** 카드 글자(이름·차트 12칸)에 쓸 세리프를 미리 읽어요. 1.5초 안에 안 되면 고딕으로 그려요 */
export async function prepareCardFonts(layout: CardLayout, doc: Document | undefined = typeof document === 'undefined' ? undefined : document): Promise<void> {
  try {
    if (!doc?.fonts) return;
    const text = [layout.title, ...layout.ringLabels, '달', String(layout.houseNumber), '번째 집'].join('');
    await Promise.race([doc.fonts.load(SERIF_PROBE, text), new Promise<void>((resolve) => setTimeout(resolve, 1500))]);
  } catch {
    /* 글꼴이 없으면 고딕으로 */
  }
}

function font(ctx: CanvasRenderingContext2D, size: number, weight: 400 | 500 | 600 | 700, family: string = SANS): void {
  ctx.font = `${weight} ${size}px ${family}`;
}

/** 12칸 원형 차트를 (x, y)부터 size 크기로 — 화면 SkyChart 와 같은 기하(lib/chart), 단위는 320 기준을 size 로 늘려요 */
export function drawChart(ctx: CanvasRenderingContext2D, layout: CardLayout, x: number, y: number, size: number, serif: boolean): void {
  const k = size / 320;
  const cx = x + size / 2;
  const cy = y + size / 2;
  const rOuter = 140 * k;
  const rInner = 112 * k;
  const rCenter = 60 * k;
  const titleFont = serif ? SERIF : SANS;

  const circle = (r: number, width: number, alpha = 1) => {
    ctx.globalAlpha = alpha;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  };
  ctx.strokeStyle = PAPER.ink;
  circle(rOuter, 2.2);
  circle(rInner, 1.6);
  circle(rCenter, 1.2, 0.6);

  // 꼭대기 칸(내 별자리) 음영
  const start = ((houseAngle(1) - 15) * Math.PI) / 180;
  const end = ((houseAngle(1) + 15) * Math.PI) / 180;
  ctx.fillStyle = PAPER.accentSoft;
  ctx.beginPath();
  ctx.arc(cx, cy, rOuter, start, end);
  ctx.arc(cx, cy, rInner, end, start, true);
  ctx.closePath();
  ctx.fill();

  // 경계선 12 · 눈금 36
  ctx.lineWidth = 1.6;
  for (const [a, b] of divisionLines(cx, cy, rOuter, rInner)) {
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  ctx.lineWidth = 1.4;
  ctx.globalAlpha = 0.7;
  for (const [a, b] of ticks(cx, cy, rOuter - 3 * k, 9 * k)) {
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // 12칸 글자
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  houseLabelPoints(cx, cy, 126 * k).forEach((p) => {
    font(ctx, 11 * k, p.house === 1 ? 600 : 400, titleFont);
    ctx.fillStyle = p.house === 1 ? PAPER.accent : PAPER.ink;
    ctx.fillText(layout.ringLabels[p.house - 1], p.x, p.y);
  });

  // 달: 가운데에서 점선, 붉은 고리 + 잉크 점, '달'
  const moonAt = polar(cx, cy, 86 * k, houseAngle(layout.houseNumber));
  ctx.strokeStyle = PAPER.accent;
  ctx.lineWidth = 1.8;
  ctx.setLineDash([4 * k, 6 * k]);
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(moonAt.x, moonAt.y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(moonAt.x, moonAt.y, 10 * k, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = PAPER.ink;
  ctx.beginPath();
  ctx.arc(moonAt.x, moonAt.y, 5 * k, 0, Math.PI * 2);
  ctx.fill();
  const moonLabel = polar(cx, cy, 106 * k, houseAngle(layout.houseNumber) + 14);
  font(ctx, 9 * k, 500, titleFont);
  ctx.fillStyle = PAPER.accent;
  ctx.fillText('달', moonLabel.x, moonLabel.y);

  // 가운데: 이름 + 오늘 달 한 줄
  font(ctx, 15 * k, 600, titleFont);
  ctx.fillStyle = PAPER.ink;
  ctx.fillText(layout.title, cx, cy - 6 * k);
  font(ctx, 8.5 * k, 500);
  ctx.fillStyle = PAPER.muted;
  ctx.fillText(`오늘 달 · ${layout.ringLabels[layout.houseNumber - 1]}자리 · ${layout.houseNumber}번째 집`, cx, cy + 13 * k);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.strokeStyle = PAPER.ink;
}

/** 레이아웃을 캔버스(CARD_WIDTH × CARD_HEIGHT)에 그려요 */
export function drawCard(ctx: CanvasRenderingContext2D, layout: CardLayout, doc: Document | undefined = typeof document === 'undefined' ? undefined : document): void {
  const width = layout.width - PAD * 2;
  const measure = (t: string) => ctx.measureText(t).width;
  const serif = serifReady(doc);
  ctx.save();
  ctx.fillStyle = PAPER.paper;
  ctx.fillRect(0, 0, layout.width, layout.height);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // 머리글
  font(ctx, 24, 500);
  ctx.fillStyle = PAPER.muted;
  ctx.fillText(layout.caption, PAD, PAD + 24);

  // 글 줄을 먼저 계산해요 — 글이 길면 차트를 줄이고, 짧으면 키워서 빈 데가 남지 않게
  const [total, ...rest] = layout.sections;
  font(ctx, 38, 500);
  const totalLines = wrapText(measure, total.text, width, 2);
  font(ctx, 30, 700);
  const labelWidth = Math.max(...rest.map((s) => Math.ceil(measure(s.label)))) + 24;
  font(ctx, 30, 500);
  const sectionLines = rest.map((s) => ({ label: s.label, lines: wrapText(measure, s.text, width - labelWidth, 2) }));
  const textHeight = 96 + 40 + 38 + 64 + (totalLines.length - 1) * 52 + sectionLines.reduce((h, s) => h + s.lines.length * 44 + 16, 0) - 16 + 10;
  const chartY = PAD + 58;
  const footerTop = layout.height - 60 - 30;
  const chartSize = Math.min(CHART_MAX, Math.max(CHART_MIN, footerTop - 30 - textHeight - chartY));

  // 천체도(가운데, 크게)
  drawChart(ctx, layout, (layout.width - chartSize) / 2, chartY, chartSize, serif);

  // 이름 · 날짜 범위 · 오늘 하늘
  let y = chartY + chartSize + 96;
  font(ctx, 64, 600, serif ? SERIF : SANS);
  ctx.fillStyle = PAPER.ink;
  ctx.fillText(layout.title, PAD, y);
  y += 40;
  font(ctx, 26, 500);
  ctx.fillStyle = PAPER.muted;
  ctx.fillText(layout.subtitle, PAD, y);
  y += 38;
  ctx.fillText(`${layout.sky} · ${layout.house}`, PAD, y);

  // 총운은 머리글처럼 크게, 사랑·일·돈은 붉은 이름표(같은 칸 너비) + 글
  y += 64;
  font(ctx, 38, 500);
  ctx.fillStyle = PAPER.ink;
  totalLines.forEach((line, i) => ctx.fillText(line, PAD, y + i * 52));
  y += (totalLines.length - 1) * 52 + 64;
  for (const section of sectionLines) {
    font(ctx, 30, 700);
    ctx.fillStyle = PAPER.accent;
    ctx.fillText(section.label, PAD, y);
    font(ctx, 30, 500);
    ctx.fillStyle = '#3A3E55';
    section.lines.forEach((line, i) => ctx.fillText(line, PAD + labelWidth, y + i * 44));
    y += section.lines.length * 44 + 16;
  }

  // 바닥: 워터마크(왼쪽) · 도식 표시(오른쪽)
  font(ctx, 22, 500);
  ctx.fillStyle = PAPER.muted;
  ctx.fillText(layout.footer, PAD, layout.height - 60);
  ctx.textAlign = 'right';
  ctx.fillText(DIAGRAM_NOTE, layout.width - PAD, layout.height - 60);
  ctx.restore();
}

export interface RenderedCard {
  /** <img src> 에 바로 쓰는 data URL */
  dataUrl: string;
  /** File.saveBase64 에 넘기는 본문(접두어 없음) */
  base64: string;
}

/** 카드를 PNG 로 그려요. 캔버스를 쓸 수 없는 환경(테스트·구형 웹뷰)이면 null. 세리프는 prepareCardFonts 를 먼저 기다리면 더 확실해요 */
export function renderCard(input: CardInput, doc: Document = document): RenderedCard | null {
  try {
    const canvas = doc.createElement('canvas');
    canvas.width = CARD_WIDTH;
    canvas.height = CARD_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    drawCard(ctx, layoutCard(input), doc);
    const dataUrl = canvas.toDataURL('image/png');
    const comma = dataUrl.indexOf(',');
    if (!dataUrl.startsWith('data:image/png') || comma < 0 || comma === dataUrl.length - 1) return null;
    return { dataUrl, base64: dataUrl.slice(comma + 1) };
  } catch {
    return null;
  }
}
