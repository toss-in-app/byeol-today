import { BottomSheet, Text } from '@toss/tds-mobile';
import { useEffect, useState } from 'react';

import { signInfo, type Content } from '../content';
import { PAPER, signAtHouse } from '../lib/chart';
import { houseOf, type SignId, type SkyDay } from '../sky';
import { SkyChart } from './SkyChart';

export interface ChartSheetProps {
  content: Content;
  /** 꼭대기(1번 집) 별자리 */
  sign: SignId;
  day: SkyDay;
  open: boolean;
  onClose: () => void;
}

/**
 * 천체도 크게 보기 시트(별자리 자세히 머리 블록에서) — 12칸을 누르면 그 집의 뜻이 나와요. 처음엔 오늘 달이 있는 집이 골라져 있어요.
 * 분석 이벤트는 없어요(계약 events.md 16개 그대로).
 */
export function ChartSheet({ content, sign, day, open, onClose }: ChartSheetProps) {
  const moonHouse = houseOf(sign, day.moon);
  const [selected, setSelected] = useState(moonHouse);
  useEffect(() => {
    if (open) setSelected(moonHouse);
  }, [open, moonHouse]);
  const house = content.houses[selected - 1];
  const nameOf = (id: SignId) => signInfo(content, id).name;
  return (
    <BottomSheet open={open} onClose={onClose} header={<BottomSheet.Header>천체도</BottomSheet.Header>}>
      <div style={{ padding: '0 24px 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0 12px' }}>
          <SkyChart top={sign} moon={day.moon} nameOf={nameOf} size={300} labels center={{ title: nameOf(sign), sub: `오늘 달 · ${nameOf(day.moon)} · ${moonHouse}번째 집` }} onSelectHouse={setSelected} selectedHouse={selected} label={`천체도: ${nameOf(sign)}가 꼭대기, 오늘 달은 ${moonHouse}번째 집. 칸을 누르면 그 집의 뜻`} />
        </div>
        <div key={selected} className="byeol-rise" style={{ borderTop: '1px solid rgba(31, 35, 64, 0.16)', padding: '12px 0 4px' }}>
          <Text display="block" typography="t6" fontWeight="bold" color={PAPER.ink}>
            {selected}번째 집 · {house.name} — {nameOf(signAtHouse(sign, selected))}
            {selected === moonHouse ? ' · 오늘 달이 여기 있어요' : ''}
          </Text>
          <Text display="block" typography="t7" color={PAPER.muted} style={{ marginTop: 4 }}>
            주제: {house.theme}. 달이 이 집을 지나는 날엔 이 주제가 하루의 색이 돼요.
          </Text>
        </div>
        <Text display="block" typography="t7" color={PAPER.muted} style={{ marginTop: 12 }}>
          꼭대기가 내 별자리(1번 집)이고 시계 방향으로 2~12번 집이에요. 칸을 누르면 그 집의 뜻을 볼 수 있어요. 실제 하늘의 방향과는 달라요(도식).
        </Text>
      </div>
    </BottomSheet>
  );
}
