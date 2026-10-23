import { colors } from '@toss/tds-colors';
import { BottomSheet, Button, List, ListRow, Text, Top, useDialog, useToast } from '@toss/tds-mobile';
import { useState } from 'react';

import { LabelPicker } from '../components/LabelPicker';
import { signInfo, type Content } from '../content';
import { eulReul } from '../lib/josa';
import { defaultLabel, labelOf, type LabelChoice } from '../lib/label';
import { MAX_MINE, type AddMineResult } from '../lib/state';
import { houseOf, readingFor, skyDay, type SignId } from '../sky';
import { FULL_DESCRIPTION, FULL_TITLE } from './FindScreen';

export interface SignScreenProps {
  content: Content;
  today: string;
  sign: SignId;
  /** 이 별자리가 이미 내 별자리에 있는지(있으면 등록 버튼 대신 표시) */
  inMine: boolean;
  mineCount: number;
  onRegister: (sign: SignId, label: string | null) => Promise<AddMineResult>;
}

/** 별자리 자세히 — 오늘 하늘 근거·영역 4·달 모양 + 내 별자리로 등록(이름표 시트). 행운·내일 운세(리워드)·궁합·공유·배너는 뒤 기능에서 */
export function SignScreen({ content, today, sign, inMine, mineCount, onRegister }: SignScreenProps) {
  const info = signInfo(content, sign);
  const day = skyDay(today);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [label, setLabel] = useState<LabelChoice>(() => defaultLabel(mineCount));
  const [saving, setSaving] = useState(false);
  const { openAlert } = useDialog();
  const toast = useToast();

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

  return (
    <>
      <Top
        title={<Top.TitleParagraph size={22}>{info.name}</Top.TitleParagraph>}
        subtitleBottom={<Top.SubtitleParagraph size={17}>{info.dates}</Top.SubtitleParagraph>}
      />
      <Text display="block" typography="t6" color={colors.grey700} style={{ margin: '0 20px 12px' }}>
        {info.trait}
      </Text>
      <div style={{ margin: '0 20px 16px' }}>
        {inMine ? (
          <Text display="block" typography="t7" color={colors.grey600}>
            내 별자리에 있어요
          </Text>
        ) : (
          <Button size="medium" color="dark" variant="weak" onClick={() => void openSheet()}>
            내 별자리로 등록
          </Button>
        )}
      </div>
      {day ? (
        (() => {
          const reading = readingFor(content, sign, day);
          const house = content.houses[houseOf(sign, day.moon) - 1];
          return (
            <>
              <Text display="block" typography="t6" color={colors.grey800} style={{ margin: '0 20px 8px' }}>
                오늘 달은 {signInfo(content, day.moon).name}에 있어요. 나의 {reading.house}번째 집 {eulReul(`'${house.theme}'`)} 지나요.
              </Text>
              <List>
                <ListRow contents={<ListRow.Texts type="2RowTypeA" top="총운" bottom={reading.total} />} />
                <ListRow contents={<ListRow.Texts type="2RowTypeA" top="사랑" bottom={reading.love} />} />
                <ListRow contents={<ListRow.Texts type="2RowTypeA" top="일" bottom={reading.work} />} />
                <ListRow contents={<ListRow.Texts type="2RowTypeA" top="돈" bottom={reading.money} />} />
                <ListRow contents={<ListRow.Texts type="2RowTypeA" top="달 모양" bottom={reading.phaseLine} />} />
              </List>
            </>
          );
        })()
      ) : (
        <Text display="block" typography="t6" color={colors.grey700} style={{ margin: '0 20px' }}>
          오늘 하늘 정보가 아직 없어요. 앱을 업데이트해 주세요.
        </Text>
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
