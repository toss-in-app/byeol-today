import { colors } from '@toss/tds-colors';
import { Chip, ChipItem, FixedBottomCTA, List, ListRow, SegmentedControl, Text, TextField, Top, useDialog, useToast } from '@toss/tds-mobile';
import { useState } from 'react';

import { LabelPicker } from '../components/LabelPicker';
import { signInfo, type Content } from '../content';
import { formatTimeKo } from '../lib/date';
import { defaultLabel, labelOf, type LabelChoice } from '../lib/label';
import { MAX_MINE, type AddMineResult } from '../lib/state';
import { findSign, SIGN_IDS, type SignId } from '../sky';

export interface FindScreenProps {
  content: Content;
  /** 지금 등록된 내 별자리 수(5개면 등록 대신 안내) */
  mineCount: number;
  onRegister: (sign: SignId, label: string | null) => Promise<AddMineResult>;
  /** 등록을 마치면 이전 화면으로 */
  onDone: () => void;
}

type Tab = 'birthday' | 'list';

export const FULL_TITLE = '내 별자리는 5개까지예요';
export const FULL_DESCRIPTION = '하나를 지우고 등록해 주세요.';

const digits = (value: string, max: number) => value.replace(/\D/g, '').slice(0, max);

/**
 * 내 별자리 찾기(주요 기능 2의 입구). 생일로 찾기(월·일, 태어난 해는 선택) / 목록에서 고르기 + 이름표 → FixedBottomCTA 등록.
 * 생일·태어난 해는 저장하지 않아요. 경계일은 해를 모르면 두 별자리 중 고르게, 해를 알면 바뀌는 시각으로 앞뒤를 고르게 해요.
 */
export function FindScreen({ content, mineCount, onRegister, onDone }: FindScreenProps) {
  const [tab, setTab] = useState<Tab>('birthday');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');
  const [cuspPick, setCuspPick] = useState<SignId | null>(null);
  const [listPick, setListPick] = useState<SignId | null>(null);
  const [label, setLabel] = useState<LabelChoice>(() => defaultLabel(mineCount));
  const [saving, setSaving] = useState(false);
  const { openAlert } = useDialog();
  const toast = useToast();

  const m = Number(month);
  const d = Number(day);
  const y = year.length === 4 ? Number(year) : undefined;
  const found = month && day ? findSign(m, d, y) : null;

  const birthdaySign: SignId | null = found?.kind === 'one' ? found.sign : found?.kind === 'cusp' ? cuspPick : null;
  const selected = tab === 'birthday' ? birthdaySign : listPick;
  const name = (id: SignId) => signInfo(content, id).name;

  const setBirthday = (setter: (v: string) => void, max: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(digits(e.target.value, max));
    setCuspPick(null);
  };

  const register = async () => {
    if (!selected || saving) return;
    if (mineCount >= MAX_MINE) {
      await openAlert({ title: FULL_TITLE, description: FULL_DESCRIPTION });
      return;
    }
    setSaving(true);
    const result = await onRegister(selected, labelOf(label));
    setSaving(false);
    if (!result.ok) {
      await openAlert({ title: FULL_TITLE, description: FULL_DESCRIPTION });
      return;
    }
    toast.openToast(`${name(selected)}를 내 별자리로 등록했어요`);
    onDone();
  };

  return (
    <>
      <Top title={<Top.TitleParagraph size={22}>내 별자리 찾기</Top.TitleParagraph>} />
      <div style={{ padding: '0 24px 12px' }}>
        <SegmentedControl value={tab} onChange={(value: string) => setTab(value === 'list' ? 'list' : 'birthday')}>
          <SegmentedControl.Item value="birthday">생일로 찾기</SegmentedControl.Item>
          <SegmentedControl.Item value="list">목록에서 고르기</SegmentedControl.Item>
        </SegmentedControl>
      </div>

      {tab === 'birthday' ? (
        <section aria-label="생일로 찾기" style={{ padding: '0 24px' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <TextField variant="box" aria-label="월" placeholder="월" inputMode="numeric" value={month} onChange={setBirthday(setMonth, 2)} />
            <TextField variant="box" aria-label="일" placeholder="일" inputMode="numeric" value={day} onChange={setBirthday(setDay, 2)} />
            <TextField variant="box" aria-label="태어난 해" placeholder="태어난 해(선택)" inputMode="numeric" value={year} onChange={setBirthday(setYear, 4)} />
          </div>
          <Text display="block" typography="t7" color={colors.grey600} style={{ marginTop: 8 }}>
            별자리 날짜는 실제 태양 위치로 계산해요. 해마다 하루쯤 달라서, 경계일이면 태어난 해를 넣으면 정확해요. 생일은 저장하지 않아요.
          </Text>
          <div style={{ marginTop: 16, minHeight: 28 }}>
            {found?.kind === 'invalid' ? (
              <Text display="block" typography="t6" color={colors.red500}>
                날짜를 확인해 주세요.
              </Text>
            ) : null}
            {found?.kind === 'one' ? (
              <Text display="block" typography="t5" fontWeight="bold" color={colors.grey900}>
                {name(found.sign)}예요
              </Text>
            ) : null}
            {found?.kind === 'cusp' ? (
              <>
                <Text display="block" typography="t6" color={colors.grey800}>
                  {found.changeAt
                    ? `이날 ${formatTimeKo(found.changeAt)}에 ${name(found.signs[1])}로 바뀌어요. 태어난 시각을 알면 골라 주세요.`
                    : `태어난 해에 따라 ${name(found.signs[0])} 또는 ${name(found.signs[1])}예요. 태어난 해를 넣으면 정확히 알려 드려요.`}
                </Text>
                <div style={{ margin: '8px -24px 0' }}>
                  <Chip kind="select" aria-label="경계일 별자리 고르기">
                    <ChipItem selected={cuspPick === found.signs[0]} onClick={() => setCuspPick(found.signs[0])}>
                      {found.changeAt ? `그 전 · ${name(found.signs[0])}` : name(found.signs[0])}
                    </ChipItem>
                    <ChipItem selected={cuspPick === found.signs[1]} onClick={() => setCuspPick(found.signs[1])}>
                      {found.changeAt ? `그 뒤 · ${name(found.signs[1])}` : name(found.signs[1])}
                    </ChipItem>
                  </Chip>
                </div>
              </>
            ) : null}
          </div>
        </section>
      ) : (
        <List aria-label="목록에서 고르기">
          {SIGN_IDS.map((id) => {
            const sign = signInfo(content, id);
            const picked = listPick === id;
            return (
              <ListRow
                key={id}
                onClick={() => setListPick(id)}
                aria-pressed={picked}
                contents={<ListRow.Texts type="2RowTypeA" top={sign.name} bottom={sign.dates} />}
                right={
                  picked ? (
                    <Text typography="t6" fontWeight="bold" color={colors.blue500}>
                      선택
                    </Text>
                  ) : null
                }
              />
            );
          })}
        </List>
      )}

      <div style={{ marginTop: 24 }}>
        <LabelPicker value={label} onChange={setLabel} />
      </div>
      <div style={{ height: 120 }} />

      <FixedBottomCTA disabled={!selected} loading={saving} onClick={() => void register()}>
        {selected ? `${name(selected)}${labelOf(label) ? ` · ${labelOf(label)}` : ''} 등록` : '내 별자리로 등록'}
      </FixedBottomCTA>
    </>
  );
}
