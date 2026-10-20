import { Storage } from '@apps-in-toss/web-framework';

import { withTimeout } from './async';

const BRIDGE_TIMEOUT_MS = 1500;

/*
 * 저장 순서 (mandalartplan 과 같음)
 *  1. 앱인토스 Storage 브릿지 — 토스앱 안에서는 네이티브 저장소, `npm run dev` 에서는
 *     AIT Devtools 가 localStorage(`__ait_storage:` 접두어)로 모킹해요.
 *  2. 브릿지가 없거나(일반 브라우저) 응답이 없으면 브라우저 localStorage 로 대체해요.
 * 키와 모양은 contract/state.schema.json(`zodiac.mine.v1`·`zodiac.settings.v1`). 정규화는 5단계 기능과 함께.
 */

function localGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function localSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* 저장 공간 부족·비공개 모드 등은 무시해요 */
  }
}

export async function readItem(key: string): Promise<string | null> {
  try {
    return await withTimeout(Storage.getItem(key), BRIDGE_TIMEOUT_MS);
  } catch {
    return localGet(key);
  }
}

export async function writeItem(key: string, value: string): Promise<void> {
  try {
    await withTimeout(Storage.setItem(key, value), BRIDGE_TIMEOUT_MS);
  } catch {
    localSet(key, value);
  }
}

/** JSON 으로 읽어요. 없거나 깨졌으면 null */
export async function readJson(key: string): Promise<unknown> {
  const raw = await readItem(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export function writeJson(key: string, value: unknown): Promise<void> {
  return writeItem(key, JSON.stringify(value));
}
