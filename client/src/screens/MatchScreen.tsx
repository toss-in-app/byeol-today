import { colors } from '@toss/tds-colors';
import { Button, Text, Top } from '@toss/tds-mobile';
import { useEffect, useRef, useState } from 'react';

import { SignPickerSheet } from '../components/SignPickerSheet';
import { signInfo, type Content } from '../content';
import { elementName, matchFor, todayMatchLine } from '../lib/match';
import type { MineItem } from '../lib/state';
import { skyDay, type SignId } from '../sky';

export interface MatchScreenProps {
  content: Content;
  today: string;
  mine: MineItem[];
  /** 딥링크 `/match?a=&b=` 로 들어오면 미리 채워져요. 없으면 a = 내 별자리 첫 번째 */
  initialA?: SignId;
  initialB?: SignId;
  /** 그날 리워드로 연 쌍인지 */
  isDetailUnlocked: (a: SignId, b: SignId) => boolean;
  /** '궁합 자세히' — ⑥에서 리워드 광고를 거쳐요. 열렸으면 true */
  onUnlockDetail: (a: SignId, b: SignId) => Promise<boolean>;
}

type Side = 'a' | 'b';

/** 별자리 궁합(주요 기능 3): 두 별자리 고르기 → 원소 짝 요약 + 오늘 달 원소 한 줄 → 자세히(리워드). 링크 보내기는 ⑦ */
export function MatchScreen({ content, today, mine, initialA, initialB, isDetailUnlocked, onUnlockDetail }: MatchScreenProps) {
  const [a, setA] = useState<SignId | null>(initialA ?? mine[0]?.sign ?? null);
  const [b, setB] = useState<SignId | null>(initialB ?? null);
  const [picking, setPicking] = useState<Side | null>(null);
  const [busy, setBusy] = useState(false);
  const day = skyDay(today);
  // 내 별자리는 저장소에서 늦게 오니, 사용자가 아직 아무것도 안 골랐으면 그때 첫 번째를 채워요
  const touched = useRef(false);
  useEffect(() => {
    if (!touched.current && !initialA && a === null && mine[0]) setA(mine[0].sign);
  }, [mine, a, initialA]);
  const name = (id: SignId | null) => (id ? signInfo(content, id).name : '고르기');

  const result = a && b ? matchFor(content, a, b) : null;
  const unlocked = a && b ? isDetailUnlocked(a, b) : false;

  const pick = (sign: SignId) => {
    touched.current = true;
    if (picking === 'a') setA(sign);
    if (picking === 'b') setB(sign);
    setPicking(null);
  };

  const unlock = async () => {
    if (!a || !b || busy) return;
    setBusy(true);
    try {
      await onUnlockDetail(a, b);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Top
        title={<Top.TitleParagraph size={22}>별자리 궁합</Top.TitleParagraph>}
        subtitleBottom={<Top.SubtitleParagraph size={17}>두 별자리의 원소 짝과 오늘 하늘로 봐요</Top.SubtitleParagraph>}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 20px 16px' }}>
        <Button size="medium" color="dark" variant="weak" aria-label={`첫 번째 별자리: ${name(a)}`} onClick={() => setPicking('a')} style={{ flex: 1 }}>
          {name(a)} ▾
        </Button>
        <Text typography="t5" color={colors.grey600}>
          ×
        </Text>
        <Button size="medium" color="dark" variant="weak" aria-label={`두 번째 별자리: ${name(b)}`} onClick={() => setPicking('b')} style={{ flex: 1 }}>
          {name(b)} ▾
        </Button>
      </div>

      {result && a && b ? (
        <section aria-label="궁합 결과" style={{ margin: '0 20px' }}>
          <Text display="block" typography="t7" color={colors.grey600}>
            {elementName(result.elements[0])} × {elementName(result.elements[1])}
          </Text>
          <Text display="block" typography="t5" fontWeight="bold" color={colors.grey900} style={{ marginTop: 4 }}>
            {result.summary}
          </Text>
          <Text display="block" typography="t6" color={colors.grey700} style={{ marginTop: 12 }}>
            {day ? todayMatchLine(content, day.moon) : '오늘 하늘 정보가 아직 없어요. 앱을 업데이트해 주세요.'}
          </Text>

          <div style={{ marginTop: 20 }}>
            {unlocked ? (
              <>
                <Text display="block" typography="t6" fontWeight="bold" color={colors.grey800}>
                  궁합 자세히
                </Text>
                <Text display="block" typography="t6" color={colors.grey700} style={{ marginTop: 4 }}>
                  {result.detail}
                </Text>
              </>
            ) : (
              <>
                <Button display="block" size="large" color="dark" variant="weak" loading={busy} onClick={() => void unlock()} aria-label="광고 보고 궁합 자세히">
                  <span style={{ display: 'inline-block', padding: '0 5px', marginRight: 6, borderRadius: 4, fontSize: 11, fontWeight: 700, background: colors.grey200, color: colors.grey700 }}>
                    AD
                  </span>
                  궁합 자세히
                </Button>
                <Text display="block" typography="t7" color={colors.grey600} style={{ marginTop: 6 }}>
                  광고를 한 번 보면 이 두 별자리의 자세한 글이 오늘 하루 열려요.
                </Text>
              </>
            )}
          </div>
        </section>
      ) : (
        <Text display="block" typography="t6" color={colors.grey600} style={{ margin: '0 20px' }}>
          {a ? '상대 별자리를 골라 주세요.' : '두 별자리를 골라 주세요.'}
        </Text>
      )}

      <SignPickerSheet
        content={content}
        open={picking !== null}
        title={picking === 'a' ? '첫 번째 별자리' : '두 번째 별자리'}
        mine={mine}
        selected={picking === 'a' ? a : b}
        onPick={pick}
        onClose={() => setPicking(null)}
      />
    </>
  );
}
