import { colors } from '@toss/tds-colors';
import { BottomSheet, Button, Text, TextButton, useDialog, useToast } from '@toss/tds-mobile';
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';

import config from '../../apps-in-toss.config.ts';
import { AdBanner } from '../components/AdBanner';
import { AdMark } from '../components/AdMark';
import { ChartSheet } from '../components/ChartSheet';
import { LabelPicker } from '../components/LabelPicker';
import { PaperBlock } from '../components/PaperBlock';
import { SignGlyph, SignTile } from '../components/SignGlyph';
import { SkyChart } from '../components/SkyChart';
import { signInfo, type Content } from '../content';
import { logEvent } from '../lib/analytics';
import { PAPER } from '../lib/chart';
import { formatDateLabel } from '../lib/date';
import { eulReul } from '../lib/josa';
import { defaultLabel, labelOf, type LabelChoice } from '../lib/label';
import { luckyFor } from '../lib/lucky';
import { dismissSignCta, isSignCtaDismissed } from '../lib/signCta';
import { MAX_MINE, type AddMineResult } from '../lib/state';
import { tomorrowReading } from '../lib/tomorrow';
import { houseOf, readingFor, skyDay, type Reading, type SignId } from '../sky';
import { FULL_DESCRIPTION, FULL_TITLE } from './FindScreen';

const brandColor = config.brand.primaryColor;
const CARD: CSSProperties = { background: '#ffffff', borderRadius: 16, padding: '18px 18px 12px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)' };

export interface SignScreenProps {
  content: Content;
  today: string;
  sign: SignId;
  /** 이 별자리가 이미 내 별자리에 있는지(있으면 등록 CTA 대신 배지) */
  inMine: boolean;
  mineCount: number;
  onRegister: (sign: SignId, label: string | null) => Promise<AddMineResult>;
  /** 이 별자리를 첫 자리에 넣고 궁합으로 */
  onOpenMatch: () => void;
  /** 내일 운세(리워드 rewarded-tomorrow): 오늘 이 별자리가 열렸는지 · 열기(광고 → 보상이면 열림) · 광고 없이 여는 중인지(AD 표시·안내 생략) */
  tomorrowUnlocked: boolean;
  onUnlockTomorrow: () => Promise<void>;
  adsFree: boolean;
  /** 맨 아래 배너(banner-sign). null 이면 자리 없음 */
  bannerAdGroupId: string | null;
  /** 공유: 링크 보내기 · 오늘 카드 이미지 저장(토스앱이 저장을 지원할 때만 버튼) */
  onShareLink: () => Promise<void>;
  onSaveCard: (() => Promise<void>) | null;
  /** 분석 sign_view 의 from: list(홈 목록)/mine(내 별자리)/link(딥링크)/match */
  from: 'list' | 'mine' | 'link' | 'match';
}

/** 사랑·일·돈·달 모양 글머리표 — 글 자체는 따로 묶어 두어 검색·복사가 쉬워요 */
function ReadingBullets({ reading }: { reading: Reading }) {
  const rows: [string, string][] = [
    ['사랑', reading.love],
    ['일', reading.work],
    ['돈', reading.money],
    ['달 모양', reading.phaseLine],
  ];
  return (
    <ul style={{ margin: '10px 0 0', paddingLeft: 18 }}>
      {rows.map(([label, text]) => (
        <li key={label} style={{ marginTop: 4, color: colors.grey400, lineHeight: 1.6 }}>
          <Text display="inline" typography="t6" fontWeight="bold" color={colors.grey800}>
            {label}
          </Text>
          <Text display="inline" typography="t6" color={colors.grey700} style={{ marginLeft: 6 }}>
            {text}
          </Text>
        </li>
      ))}
    </ul>
  );
}

/** 카드 바닥의 작은 아이콘 버튼(카드 저장·링크 공유) */
function IconAction({ label, onClick, busy, children }: { label: string; onClick: () => void; busy?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={busy}
      onClick={onClick}
      style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box', width: 36, height: 36, borderRadius: 10, background: colors.grey100, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', opacity: busy ? 0.5 : 1 }}
    >
      {children}
    </button>
  );
}

const ICON = { stroke: PAPER.ink, strokeWidth: 1.6, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const CardIcon = () => (
  <svg aria-hidden viewBox="0 0 24 24" width={20} height={20}>
    <rect x={5} y={3} width={14} height={18} rx={2} {...ICON} />
    <circle cx={12} cy={10} r={3.2} {...ICON} />
    <path d="M8 17h8" {...ICON} />
  </svg>
);
const LinkIcon = () => (
  <svg aria-hidden viewBox="0 0 24 24" width={20} height={20}>
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.5 1.5M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5" {...ICON} />
  </svg>
);

/**
 * 별자리 자세히 — 참고 사이트식 '한 장 카드'(시안 11) + 하단 등록 알약(시안 12), 2026-10-23 사용자 "추천대로".
 * 카드: 타일 + 이름 + 배지/＋내 별자리 + 날짜 → 성향 → 종이 하늘 블록(천체도) → 총운 한 줄 → 사랑·일·돈·달 모양 글머리표 → 오늘의 행운 → 바닥(궁합 보기 · 카드 저장 · 링크 공유).
 * 알약: 등록 전에만, ✕로 닫으면 세션 동안 안 뜸(진입 즉시 시트 금지 규칙과 무관한 고정 CTA). 광고 버튼엔 AD 표시와 '광고를 보면 …' 안내가 항상 같이(mandalartplan 3.0.1 반려 교훈).
 */
export function SignScreen({
  content,
  today,
  sign,
  inMine,
  mineCount,
  onRegister,
  onOpenMatch,
  tomorrowUnlocked,
  onUnlockTomorrow,
  adsFree,
  bannerAdGroupId,
  onShareLink,
  onSaveCard,
  from,
}: SignScreenProps) {
  const info = signInfo(content, sign);
  const day = skyDay(today);
  const reading = day ? readingFor(content, sign, day) : null;
  const house = reading ? content.houses[reading.house - 1] : null;
  const phase = day ? content.phases.find((p) => p.id === day.phase) : undefined;
  const lucky = day ? luckyFor(content, sign, today) : null;
  const tomorrow = tomorrowReading(content, sign, today);
  useEffect(() => {
    logEvent('sign_view', { sign, house: day ? houseOf(sign, day.moon) : null, from });
  }, [sign, day, from]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [chartOpen, setChartOpen] = useState(false);
  const [ctaDismissed, setCtaDismissed] = useState(isSignCtaDismissed);
  const [label, setLabel] = useState<LabelChoice>(() => defaultLabel(mineCount));
  const [saving, setSaving] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [sharing, setSharing] = useState<'link' | 'card' | null>(null);
  const { openAlert } = useDialog();
  const toast = useToast();
  const showCta = !inMine && !ctaDismissed;

  const share = async (kind: 'link' | 'card') => {
    if (sharing) return;
    setSharing(kind);
    try {
      if (kind === 'link') await onShareLink();
      else if (onSaveCard) await onSaveCard();
    } finally {
      setSharing(null);
    }
  };

  const openSheet = async () => {
    if (mineCount >= MAX_MINE) {
      await openAlert({ title: FULL_TITLE, description: FULL_DESCRIPTION });
      return;
    }
    setSheetOpen(true);
  };

  const register = async () => {
    if (saving) return;
    setSaving(true);
    const result = await onRegister(sign, labelOf(label));
    setSaving(false);
    setSheetOpen(false);
    if (!result.ok) {
      await openAlert({ title: FULL_TITLE, description: FULL_DESCRIPTION });
      return;
    }
    toast.openToast(`${info.name}를 내 별자리로 등록했어요`);
  };

  const unlockTomorrow = async () => {
    if (unlocking) return;
    setUnlocking(true);
    try {
      await onUnlockTomorrow();
    } finally {
      setUnlocking(false);
    }
  };

  const dismissCta = () => {
    dismissSignCta();
    setCtaDismissed(true);
  };

  return (
    <div style={{ background: colors.grey50, minHeight: '100vh', boxSizing: 'border-box', padding: '12px 16px', paddingBottom: showCta ? 96 : 16 }}>
      <section aria-label={`${info.name} 오늘 운세`} className="byeol-rise" style={CARD}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <SignTile sign={sign} />
          <Text typography="t4" fontWeight="bold" color={colors.grey900}>
            {info.name}
          </Text>
          {inMine ? (
            <span style={{ fontSize: 11, fontWeight: 700, color: brandColor, background: '#EEF0FB', borderRadius: 8, padding: '3px 7px', whiteSpace: 'nowrap' }}>내 별자리</span>
          ) : (
            <TextButton size="small" color={brandColor} onClick={() => void openSheet()}>
              ＋ 내 별자리
            </TextButton>
          )}
          <Text typography="t7" color={colors.grey600} style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>
            {info.dates}
          </Text>
        </div>
        <Text display="block" typography="t7" color={colors.grey600} style={{ marginTop: 8 }}>
          {info.trait}
        </Text>

        {/* 종이 하늘 블록(비주얼 '천체도'): 내 별자리가 꼭대기인 12칸 고리에 오늘 달의 집 + 근거 한 줄. 차트·'천체도 보기'를 누르면 크게 */}
        <PaperBlock aria-label="오늘 하늘" style={{ margin: '14px 0 0', padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {day && reading ? (
              <button type="button" aria-label="천체도 크게 보기" onClick={() => setChartOpen(true)} style={{ all: 'unset', cursor: 'pointer', display: 'block', flex: 'none' }}>
                <SkyChart top={sign} moon={day.moon} nameOf={(id) => signInfo(content, id).name} size={92} center={{ title: String(reading.house) }} />
              </button>
            ) : (
              <SignGlyph sign={sign} size={80} label={`${info.name} 별자리 그림`} />
            )}
            <div style={{ minWidth: 0 }}>
              {day && reading && house ? (
                <>
                  <Text display="block" typography="t6" color={PAPER.ink}>
                    오늘 달은 {signInfo(content, day.moon).name}에 있어요. 나의 {reading.house}번째 집 {eulReul(`'${house.theme}'`)} 지나요.
                  </Text>
                  <Text display="block" typography="t7" color={PAPER.muted} style={{ marginTop: 4 }}>
                    {phase?.name ?? ''} · 밝기 {day.illumination}%
                  </Text>
                  <div style={{ marginTop: 2 }}>
                    <TextButton size="small" color={PAPER.accent} onClick={() => setChartOpen(true)}>
                      천체도 보기 ›
                    </TextButton>
                  </div>
                </>
              ) : (
                <Text display="block" typography="t6" color={PAPER.ink}>
                  오늘 하늘 정보가 아직 없어요. 앱을 업데이트해 주세요.
                </Text>
              )}
            </div>
          </div>
        </PaperBlock>

        {reading && lucky ? (
          <>
            <Text display="block" typography="t5" fontWeight="bold" color={colors.grey900} style={{ marginTop: 16, lineHeight: 1.5 }}>
              {reading.total}
            </Text>
            <ReadingBullets reading={reading} />
            <div style={{ background: colors.grey50, borderRadius: 12, padding: '12px 14px', marginTop: 12 }}>
              <Text display="block" typography="t7" color={colors.grey600}>
                오늘의 행운
              </Text>
              <Text display="block" typography="t6" fontWeight="bold" color={colors.grey900} style={{ marginTop: 2 }}>
                {lucky.color} · {lucky.item} · 숫자 {lucky.number}
              </Text>
            </div>
          </>
        ) : null}

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 14, paddingTop: 10, borderTop: `1px solid ${colors.grey100}` }}>
          <TextButton size="small" color={brandColor} onClick={onOpenMatch}>
            궁합 보기
          </TextButton>
          {day ? (
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              {onSaveCard ? (
                <IconAction label="카드 저장" busy={sharing !== null} onClick={() => void share('card')}>
                  <CardIcon />
                </IconAction>
              ) : null}
              <IconAction label="링크 공유" busy={sharing !== null} onClick={() => void share('link')}>
                <LinkIcon />
              </IconAction>
            </div>
          ) : null}
        </div>
      </section>
      {day ? <ChartSheet content={content} sign={sign} day={day} open={chartOpen} onClose={() => setChartOpen(false)} /> : null}

      {tomorrow ? (
        <section aria-label="내일 운세" className="byeol-rise" style={{ ...CARD, marginTop: 12, animationDelay: '120ms' }}>
          <Text display="block" typography="t5" fontWeight="bold" color={colors.grey800}>
            내일 운세 미리 보기
          </Text>
          {tomorrowUnlocked ? (
            <>
              <Text display="block" typography="t7" color={colors.grey600} style={{ marginTop: 4 }}>
                {formatDateLabel(tomorrow.day.date)} · 달은 {signInfo(content, tomorrow.day.moon).name}에 있어요
              </Text>
              <Text display="block" typography="t6" fontWeight="bold" color={colors.grey900} style={{ marginTop: 10, lineHeight: 1.5 }}>
                {tomorrow.reading.total}
              </Text>
              <ReadingBullets reading={tomorrow.reading} />
            </>
          ) : (
            <div style={{ marginTop: 10 }}>
              <Button display="block" size="large" color="dark" variant="weak" loading={unlocking} onClick={() => void unlockTomorrow()} aria-label={adsFree ? '내일 운세 미리 보기' : '광고 보고 내일 운세 미리 보기'}>
                {adsFree ? null : <AdMark />}
                내일 운세 미리 보기
              </Button>
              <Text display="block" typography="t7" color={colors.grey600} style={{ marginTop: 6 }}>
                {adsFree ? `${info.name}의 내일 운세를 오늘 하루 볼 수 있어요.` : `광고를 한 번 보면 ${info.name}의 내일 운세가 오늘 하루 열려요.`}
              </Text>
            </div>
          )}
        </section>
      ) : null}

      {bannerAdGroupId ? (
        <div style={{ margin: '24px -16px 8px' }}>
          <AdBanner adGroupId={bannerAdGroupId} />
        </div>
      ) : null}

      {/* 하단 등록 알약(시안 12): 등록 전에만, ✕로 닫으면 이 세션 동안 안 뜸. ＋내 별자리 글자 버튼이 카드 머리에 남아 있어요 */}
      {showCta ? (
        <div
          role="region"
          aria-label="내 별자리 등록 안내"
          className="byeol-rise"
          style={{
            position: 'fixed',
            left: 16,
            right: 16,
            bottom: 'calc(16px + env(safe-area-inset-bottom))',
            zIndex: 20,
            height: 52,
            boxSizing: 'border-box',
            borderRadius: 26,
            border: '2px solid transparent',
            backgroundImage: 'linear-gradient(#ffffff, #ffffff), linear-gradient(90deg, #B5453A, #E8C56A, #4C5FD5)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
            boxShadow: '0 6px 18px rgba(0, 0, 0, 0.10)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px 0 4px',
          }}
        >
          <button type="button" aria-label="등록 안내 닫기" onClick={dismissCta} style={{ all: 'unset', cursor: 'pointer', width: 40, height: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: colors.grey600, fontSize: 17 }}>
            ✕
          </button>
          <button type="button" aria-label="내 별자리로 등록" onClick={() => void openSheet()} style={{ all: 'unset', cursor: 'pointer', flex: 1, height: 40, display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, color: PAPER.ink }}>
            <span aria-hidden style={{ color: PAPER.accent }}>
              ✦
            </span>
            내 별자리로 등록
          </button>
        </div>
      ) : null}

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        hasTextField
        header={<BottomSheet.Header>{info.name}를 내 별자리로 등록해요</BottomSheet.Header>}
        cta={
          <BottomSheet.CTA loading={saving} onClick={() => void register()}>
            등록
          </BottomSheet.CTA>
        }
      >
        <div style={{ padding: '4px 0 8px' }}>
          <LabelPicker value={label} onChange={setLabel} />
        </div>
      </BottomSheet>
    </div>
  );
}
