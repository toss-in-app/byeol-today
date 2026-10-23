import { useEffect, useState } from 'react';

import { bundledContent, compareVersions, fetchRemoteContent, type Content } from '../content';
import { loadContentCache, saveContentCache } from '../content/cache';

export interface ContentApi {
  content: Content;
  /** 'bundled' | 'remote' — 설정 화면 표시·분석용 */
  source: 'bundled' | 'remote';
}

/**
 * 번들 콘텐츠로 바로 그리고, 캐시(원격본)가 있으면 바꿔 끼운 뒤, 오늘 아직 안 물어봤으면 서버에 한 번 물어요(ETag).
 * 원격본은 contentVersion 이 번들보다 낮지 않을 때만 써요(번들이 더 새 것이면 번들). 실패하면 조용히 지금 것 그대로.
 */
export function useContent(today: string, clientVersion: string = __APP_VERSION__): ContentApi {
  const [state, setState] = useState<ContentApi>({ content: bundledContent, source: 'bundled' });

  useEffect(() => {
    let alive = true;
    const apply = (content: Content) => {
      if (!alive) return;
      if (content.contentVersion >= bundledContent.contentVersion && compareVersions(content.minClientVersion, clientVersion) <= 0) {
        setState({ content, source: 'remote' });
      }
    };
    void (async () => {
      const cache = await loadContentCache(clientVersion);
      if (cache) apply(cache.content);
      if (cache && cache.fetchedOn === today) return;
      const result = await fetchRemoteContent(clientVersion, cache?.etag ?? null);
      if (!alive) return;
      if (result.status === 'ok') {
        apply(result.content);
        await saveContentCache({ version: 1, fetchedOn: today, etag: result.etag, content: result.content });
      } else if (result.status === 'notModified' && cache) {
        await saveContentCache({ ...cache, fetchedOn: today });
      }
    })();
    return () => {
      alive = false;
    };
  }, [today, clientVersion]);

  return state;
}
