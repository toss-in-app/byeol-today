import { colors } from '@toss/tds-colors';
import { BottomSheet, Button, List, ListRow, Text, Top, useDialog, useToast } from '@toss/tds-mobile';
import { useEffect, useState } from 'react';

import { AdBanner } from '../components/AdBanner';
import { AdMark } from '../components/AdMark';
import { LabelPicker } from '../components/LabelPicker';
import { PaperBlock } from '../components/PaperBlock';
import { SignGlyph } from '../components/SignGlyph';
import { SkyChart } from '../components/SkyChart';
import { signInfo, type Content } from '../content';
import { logEvent } from '../lib/analytics';
import { PAPER } from '../lib/chart';
import { formatDateLabel } from '../lib/date';
import { eulReul } from '../lib/josa';
import { defaultLabel, labelOf, type LabelChoice } from '../lib/label';
import { MAX_MINE, type AddMineResult } from '../lib/state';
import { tomorrowReading } from '../lib/tomorrow';
import { houseOf, readingFor, skyDay, type Reading, type SignId } from '../sky';
import { FULL_DESCRIPTION, FULL_TITLE } from './FindScreen';

export interface SignScreenProps {
  content: Content;
  today: string;
  sign: SignId;
  /** 이 별자리가 이미 내 별자리에 있는지(있으면 등록 버튼 대신 표시) */
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

function ReadingRows({ reading }: { reading: Reading }) {
  return (
    <List>
      <ListRow contents={<ListRow.Texts type="2RowTypeA" top="총운" bottom={reading.total} />} />
      <ListRow contents={<ListRow.Texts type="2RowTypeA" top="사랑" bottom={reading.love} />} />
      <ListRow contents={<ListRow.Texts type="2RowTypeA" top="일" bottom={reading.work} />} />
      <ListRow contents={<ListRow.Texts type="2RowTypeA" top="돈" bottom={reading.money} />} />
      <ListRow contents={<ListRow.Texts type="2RowTypeA" top="달 모양" bottom={reading.phaseLine} />} />
    </List>
  );
}

/**
 * 별자리 자세히 — 오늘 하늘 근거·영역 4·달 모양 + 내 별자리로 등록(이름표 시트) + 궁합 보기 + 내일 운세 미리 보기(리워드) + 맨 아래 배너.
 * 광고를 띄우는 버튼에는 AD 표시와 '광고를 보면 …' 안내가 항상 같이 있어요(mandalartplan 3.0.1 반려 교훈 — 재시도도 같은 버튼). 공유·카드 저장은 ⑦.
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
  const tomorrow = tomorrowReading(content, sign, today);
  useEffect(() => {
    logEvent('sign_view', { sign, house: day ? houseOf(sign, day.moon) : null, from });
  }, [sign, day, from]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [label, setLabel] = useState<LabelChoice>(() => defaultLabel(mineCount));
  const [saving, setSaving] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [sharing, setSharing] = useState<'link' | 'card' | null>(null);
  const { openAlert } = useDialog();
  const toast = useToast();

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

  return (
    <>
      <Top
        title={<Top.TitleParagraph size={22}>{info.name}</Top.TitleParagraph>}
        subtitleBottom={<Top.SubtitleParagraph size={17}>{info.dates}</Top.SubtitleParagraph>}
      />
      {/* 종이 머리 블록(비주얼 '천체도'): 내 별자리가 꼭대기인 12칸 고리에 오늘 달의 집 + 근거 한 줄 */}
      <PaperBlock aria-label="오늘 하늘" style={{ margin: '0 20px 12px', padding: '14px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {day && reading ? (
            <SkyChart top={sign} moon={day.moon} nameOf={(id) => signInfo(content, id).name} size={96} center={{ title: String(reading.house) }} label={`천체도: ${info.name}가 꼭대기, 오늘 달은 ${reading.house}번째 집`} />
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
              </>
            ) : (
              <Text display="block" typography="t6" color={PAPER.ink}>
                오늘 하늘 정보가 아직 없어요. 앱을 업데이트해 주세요.
              </Text>
            )}
          </div>
        </div>
      </PaperBlock>
      <Text display="block" typography="t6" color={colors.grey700} style={{ margin: '0 20px 12px' }}>
        {info.trait}
      </Text>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 20px 16px' }}>
        {inMine ? (
          <Text typography="t7" color={colors.grey600}>
            내 별자리에 있어요
          </Text>
        ) : (
          <Button size="medium" color="dark" variant="weak" onClick={() => void openSheet()}>
            내 별자리로 등록
          </Button>
        )}
        <Button size="medium" color="dark" variant="weak" onClick={onOpenMatch}>
          궁합 보기
        </Button>
      </div>
      {day ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 20px 16px' }}>
          {onSaveCard ? (
            <Button size="medium" color="dark" variant="weak" loading={sharing === 'card'} disabled={sharing !== null} onClick={() => void share('card')}>
              카드 저장
            </Button>
          ) : null}
          <Button size="medium" color="dark" variant="weak" loading={sharing === 'link'} disabled={sharing !== null} onClick={() => void share('link')}>
            링크 공유
          </Button>
        </div>
      ) : null}

      {reading ? <ReadingRows reading={reading} /> : null}

      {tomorrow ? (
        <section aria-label="내일 운세" style={{ margin: '24px 0 0' }}>
          <Text display="block" typography="t5" fontWeight="bold" color={colors.grey800} style={{ margin: '0 20px 4px' }}>
            내일 운세 미리 보기
          </Text>
          {tomorrowUnlocked ? (
            <>
              <Text display="block" typography="t7" color={colors.grey600} style={{ margin: '0 20px 8px' }}>
                {formatDateLabel(tomorrow.day.date)} · 달은 {signInfo(content, tomorrow.day.moon).name}에 있어요
              </Text>
              <ReadingRows reading={tomorrow.reading} />
            </>
          ) : (
            <div style={{ margin: '8px 20px 0' }}>
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
        <div style={{ margin: '32px 0 24px' }}>
          <AdBanner adGroupId={bannerAdGroupId} />
        </div>
      ) : (
        <div style={{ height: 24 }} />
      )}

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
    </>
  );
}
