import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { bundledContent } from '../content';
import { CONTENT_CACHE_KEY, normalizeContentCache } from '../content/cache';
import { useContent } from './useContent';

const remote = { ...bundledContent, contentVersion: 2, notice: '10월 25일 새벽에 잠깐 점검해요.' };
const jsonResponse = (body: unknown, status = 200, etag: string | null = 'W/"v2"') =>
  ({ ok: status >= 200 && status < 300, status, headers: { get: (k: string) => (k === 'ETag' ? etag : null) }, json: async () => body }) as unknown as Response;

describe('useContent (번들 → 캐시 → 하루 1회 원격)', () => {
  const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>();
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it('원격본이 오면 바꿔 끼우고 캐시에 날짜·ETag 와 함께 남겨요', async () => {
    fetchMock.mockResolvedValue(jsonResponse(remote));
    const { result } = renderHook(() => useContent('2026-10-23', '1.0.0'));
    expect(result.current.source).toBe('bundled');
    await waitFor(() => expect(result.current.source).toBe('remote'));
    expect(result.current.content.notice).toBe(remote.notice);
    const cache = normalizeContentCache(JSON.parse(window.localStorage.getItem(`__ait_storage:${CONTENT_CACHE_KEY}`) ?? window.localStorage.getItem(CONTENT_CACHE_KEY) ?? 'null'), '1.0.0');
    expect(cache?.fetchedOn).toBe('2026-10-23');
    expect(cache?.etag).toBe('W/"v2"');
  });

  it('오늘 이미 물어봤으면 캐시만 쓰고 서버에 안 물어요', async () => {
    window.localStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify({ version: 1, fetchedOn: '2026-10-23', etag: 'W/"v2"', content: remote }));
    window.localStorage.setItem(`__ait_storage:${CONTENT_CACHE_KEY}`, JSON.stringify({ version: 1, fetchedOn: '2026-10-23', etag: 'W/"v2"', content: remote }));
    const { result } = renderHook(() => useContent('2026-10-23', '1.0.0'));
    await waitFor(() => expect(result.current.source).toBe('remote'));
    await act(async () => {});
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('날이 바뀌면 ETag 로 묻고 304 면 날짜만 갱신, 실패·형식 오류·minClientVersion 초과면 번들 그대로', async () => {
    window.localStorage.setItem(`__ait_storage:${CONTENT_CACHE_KEY}`, JSON.stringify({ version: 1, fetchedOn: '2026-10-22', etag: 'W/"v2"', content: remote }));
    fetchMock.mockResolvedValue(jsonResponse(null, 304, null));
    const { result } = renderHook(() => useContent('2026-10-23', '1.0.0'));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const init = fetchMock.mock.calls[0][1] as { headers: Record<string, string> };
    expect(init.headers['If-None-Match']).toBe('W/"v2"');
    await waitFor(() => expect(result.current.source).toBe('remote'));

    window.localStorage.clear();
    fetchMock.mockResolvedValue(jsonResponse({ ...remote, minClientVersion: '9.0.0' }));
    const second = renderHook(() => useContent('2026-10-23', '1.0.0'));
    await act(async () => {});
    expect(second.result.current.source).toBe('bundled');
    fetchMock.mockRejectedValue(new Error('offline'));
    const third = renderHook(() => useContent('2026-10-23', '1.0.0'));
    await act(async () => {});
    expect(third.result.current.source).toBe('bundled');
  });

  it('refresh: 오늘 이미 물었어도 ETag 로 다시 묻고 — 304 면 same, 새 버전이면 updated, 실패면 failed', async () => {
    window.localStorage.setItem(`__ait_storage:${CONTENT_CACHE_KEY}`, JSON.stringify({ version: 1, fetchedOn: '2026-10-23', etag: 'W/"v2"', content: remote }));
    const { result } = renderHook(() => useContent('2026-10-23', '1.0.0'));
    await waitFor(() => expect(result.current.source).toBe('remote'));
    expect(fetchMock).not.toHaveBeenCalled();

    fetchMock.mockResolvedValue(jsonResponse(null, 304, null));
    let outcome = '';
    await act(async () => {
      outcome = await result.current.refresh();
    });
    expect(outcome).toBe('same');
    expect((fetchMock.mock.calls[0][1] as { headers: Record<string, string> }).headers['If-None-Match']).toBe('W/"v2"');

    fetchMock.mockResolvedValue(jsonResponse({ ...remote, contentVersion: 3 }, 200, 'W/"v3"'));
    await act(async () => {
      outcome = await result.current.refresh();
    });
    expect(outcome).toBe('updated');
    expect(result.current.content.contentVersion).toBe(3);

    fetchMock.mockRejectedValue(new Error('offline'));
    await act(async () => {
      outcome = await result.current.refresh();
    });
    expect(outcome).toBe('failed');
    expect(result.current.content.contentVersion).toBe(3);
  });

  it('캐시 모양이 다르면 없는 것으로', () => {
    expect(normalizeContentCache({ version: 1, fetchedOn: 'today', etag: null, content: bundledContent }, '1.0.0')).toBeNull();
    expect(normalizeContentCache({ version: 1, fetchedOn: '2026-10-23', etag: null, content: { nope: true } }, '1.0.0')).toBeNull();
    expect(normalizeContentCache({ version: 1, fetchedOn: '2026-10-23', etag: 'x', content: bundledContent }, '1.0.0')?.etag).toBe('x');
  });
});
