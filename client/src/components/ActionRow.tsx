import { colors } from '@toss/tds-colors';
import { Text } from '@toss/tds-mobile';
import type { CSSProperties } from 'react';

import { PAPER } from '../lib/chart';

export type ActionIconName = 'star' | 'match' | 'card' | 'link' | 'check';

const STROKE = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/** 24×24 선 아이콘(잉크 선 1.6, 색은 currentColor) — 시안 1 '아이콘 행'의 네 가지 + 등록 뒤 체크 */
export function ActionIcon({ name, size = 22 }: { name: ActionIconName; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden style={{ display: 'block' }}>
      {name === 'star' ? <path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.3l6.1-.7z" {...STROKE} /> : null}
      {name === 'match' ? (
        <>
          <circle cx="9" cy="12" r="5" {...STROKE} />
          <circle cx="15" cy="12" r="5" {...STROKE} />
        </>
      ) : null}
      {name === 'card' ? (
        <>
          <rect x="5" y="3" width="14" height="18" rx="2" {...STROKE} />
          <circle cx="12" cy="10" r="3.2" {...STROKE} />
          <path d="M8 17h8" {...STROKE} />
        </>
      ) : null}
      {name === 'link' ? <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.5 1.5M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5" {...STROKE} /> : null}
      {name === 'check' ? <path d="M5 12.5l4.5 4.5L19 7.5" {...STROKE} strokeWidth={2} /> : null}
    </svg>
  );
}

export interface ActionItem {
  icon: ActionIconName;
  /** 원 아래 글자 */
  label: string;
  /** 스크린리더 이름 — 글자가 짧을 때만('궁합' → '궁합 보기'). 보이는 글자를 포함해야 해요 */
  name?: string;
  /** 없으면 버튼이 아니라 상태 표시(등록 뒤 '내 별자리 ✓') */
  onClick?: () => void;
  disabled?: boolean;
  /** 잉크색 원 + 종이색 아이콘 */
  filled?: boolean;
}

const ITEM: CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: '1 1 0', minWidth: 0, padding: '2px 0', boxSizing: 'border-box' };

/**
 * 아이콘 행(시안 1, steps/3-design/wireframes/byeol-today-visual-v2.md, 2026-10-24) — 종이색 원(48px, 가는 잉크 테두리) 안의 선 아이콘 + 글자를 가로로 고르게.
 * 별자리 자세히의 성향 글 아래: 내 별자리 · 궁합 · 카드 저장 · 링크 공유. 등록 뒤 첫 항목은 잉크색 원 + 체크 + '내 별자리 ✓'(버튼 아님).
 */
export function ActionRow({ items, style }: { items: ActionItem[]; style?: CSSProperties }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', ...style }}>
      {items.map((item) => {
        const body = (
          <>
            <span
              aria-hidden
              className="byeol-action-circle"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: item.filled ? PAPER.ink : PAPER.paper,
                color: item.filled ? PAPER.paper : PAPER.ink,
                border: item.filled ? '1px solid transparent' : '1px solid rgba(31, 35, 64, 0.2)',
              }}
            >
              <ActionIcon name={item.icon} />
            </span>
            <Text typography="t7" color={colors.grey700} style={{ whiteSpace: 'nowrap' }}>
              {item.label}
            </Text>
          </>
        );
        if (!item.onClick) {
          return (
            <div key={item.label} style={ITEM}>
              {body}
            </div>
          );
        }
        return (
          <button
            key={item.label}
            type="button"
            className="byeol-action"
            aria-label={item.name}
            disabled={item.disabled}
            onClick={item.onClick}
            style={{ all: 'unset', ...ITEM, cursor: item.disabled ? 'default' : 'pointer', opacity: item.disabled ? 0.45 : 1, WebkitTapHighlightColor: 'transparent' }}
          >
            {body}
          </button>
        );
      })}
    </div>
  );
}
