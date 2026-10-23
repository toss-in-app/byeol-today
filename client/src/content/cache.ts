/**
 * 원격 콘텐츠 캐시(계약 state.schema v2 `zodiac.content.v1`): 마지막으로 물어본 날짜 · ETag · 본문.
 * 날이 바뀌면 ETag 로 다시 묻고(304 면 날짜만), 모양이 다르면 없는 것으로 봐요.
 */
import { readJson, writeJson } from '../lib/storage';
import { isUsableContent, type Content } from '.';

export const CONTENT_CACHE_KEY = 'zodiac.content.v1';
const DATE_RE = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;

export interface ContentCache {
  version: 1;
  fetchedOn: string;
  etag: string | null;
  content: Content;
}

export function normalizeContentCache(value: unknown, clientVersion: string): ContentCache | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  if (v.version !== 1 || typeof v.fetchedOn !== 'string' || !DATE_RE.test(v.fetchedOn)) return null;
  if (!(v.etag === null || typeof v.etag === 'string')) return null;
  if (!isUsableContent(v.content, clientVersion)) return null;
  return { version: 1, fetchedOn: v.fetchedOn, etag: v.etag, content: v.content };
}

export async function loadContentCache(clientVersion: string): Promise<ContentCache | null> {
  return normalizeContentCache(await readJson(CONTENT_CACHE_KEY), clientVersion);
}

export function saveContentCache(cache: ContentCache): Promise<void> {
  return writeJson(CONTENT_CACHE_KEY, cache);
}
