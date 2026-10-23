import { useCallback, useEffect, useRef, useState } from 'react';

import { bundledContent, compareVersions, fetchRemoteContent, type Content } from '../content';
import { loadContentCache, saveContentCache, type ContentCache } from '../content/cache';

/** 당겨서 새로 고침 결과 — updated 만 토스트로 알려요 */
export type RefreshResult = 'updated' | 'same' | 'failed';

export interface ContentApi {
  content: Content;
  /** 'bundled' | 'remote' — 설정 화면 표시·분석용 */
  source: 'bundled' | 'remote';
  /** 당겨서 새로 고침: 오늘 이미 물어봤어도 ETag 로 한 번 더 물어요(304 면 same) */
  refresh: () => Promise<RefreshResult>;
}

interface ContentState {
  content: Content;
  source: 'bundled' | 'remote';
}

/**
 * 번들 콘텐츠로 바로 그리고, 캐시(원격본)가 있으면 바꿔 끼운 뒤, 오늘 아직 안 물어봤으면 서버에 한 번 물어요(ETag).
 * 원격본은 contentVersion 이 번들보다 낮지 않을 때만 써요(번들이 더 새 것이면 번들). 실패하면 조용히 지금 것 그대로.
 */
export function useContent(today: string, clientVersion: string = __APP_VERSION__): ContentApi {
  const [state, setState] = useState<ContentState>({ content: bundledContent, source: 'bundled' });
  const alive = useRef(true);
  const cacheRef = useRef<ContentCache | null>(null);
  const versionRef = useRef(bundledContent.contentVersion);

  /** 쓸 수 있는 원격본이면 바꿔 끼우고, 문구 버전이 실제로 바뀌었는지 돌려줘요 */
  const apply = useCallback(
    (content: Content): boolean => {
      if (!alive.current) return false;
      if (content.contentVersion >= bundledContent.contentVersion && compareVersions(content.minClientVersion, clientVersion) <= 0) {
        const changed = content.contentVersion !== versionRef.current;
        versionRef.current = content.contentVersion;
        setState({ content, source: 'remote' });
        return changed;
      }
      return false;
    },
    [clientVersion],
  );

  const fetchAndApply = useCallback(async (): Promise<RefreshResult> => {
    const cache = cacheRef.current;
    const result = await fetchRemoteContent(clientVersion, cache?.etag ?? null);
    if (!alive.current) return 'failed';
    if (result.status === 'ok') {
      const changed = apply(result.content);
      const next: ContentCache = { version: 1, fetchedOn: today, etag: result.etag, content: result.content };
      cacheRef.current = next;
      await saveContentCache(next);
      return changed ? 'updated' : 'same';
    }
    if (result.status === 'notModified') {
      if (cache) {
        const next = { ...cache, fetchedOn: today };
        cacheRef.current = next;
        await saveContentCache(next);
      }
      return 'same';
    }
    return 'failed';
  }, [apply, clientVersion, today]);

  useEffect(() => {
    alive.current = true;
    void (async () => {
      const cache = await loadContentCache(clientVersion);
      if (!alive.current) return;
      cacheRef.current = cache;
      if (cache) apply(cache.content);
      if (cache && cache.fetchedOn === today) return;
      await fetchAndApply();
    })();
    return () => {
      alive.current = false;
    };
  }, [today, clientVersion, apply, fetchAndApply]);

  return { ...state, refresh: fetchAndApply };
}
