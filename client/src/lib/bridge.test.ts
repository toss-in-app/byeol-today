import { afterEach, describe, expect, it, vi } from 'vitest';

const bridge = vi.hoisted(() => ({
  sendMessage: vi.fn<(p: { message: string }) => Promise<void>>(),
  createLink: vi.fn<(p: { path: string; ogImageUrl?: string }) => Promise<string>>(),
  requestPermission: vi.fn<() => Promise<string>>(),
  saveBase64: vi.fn<() => Promise<void>>(),
  openURL: vi.fn<() => Promise<void>>(),
}));
vi.mock('@apps-in-toss/web-framework', () => ({
  Share: { sendMessage: bridge.sendMessage, createLink: bridge.createLink },
  File: { saveBase64: Object.assign(bridge.saveBase64, { MIN_TOSS_APP_VERSION: { android: '5.218.0', ios: '5.216.0' } }) },
  Device: { openURL: bridge.openURL },
  requestPermission: bridge.requestPermission,
  isMinVersionSupported: () => true,
}));

import { APP_DEEP_LINK, canSaveImage, createShareLink, saveImageToPhotos, shareText } from './bridge';

describe('bridge', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    bridge.sendMessage.mockReset();
    bridge.createLink.mockReset();
    bridge.requestPermission.mockReset();
    bridge.saveBase64.mockReset();
  });

  it('딥링크는 appName 으로', () => {
    expect(APP_DEEP_LINK).toBe('intoss://byeol-today');
  });

  it('공유: 토스 시트 → Web Share → 클립보드 순서', async () => {
    bridge.sendMessage.mockResolvedValue();
    expect(await shareText('hi')).toBe('shared');
    bridge.sendMessage.mockRejectedValue(new Error('no bridge'));
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: vi.fn(async () => {}) }, configurable: true });
    expect(await shareText('hi')).toBe('copied');
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: vi.fn(async () => Promise.reject(new Error('x'))) }, configurable: true });
    expect(await shareText('hi')).toBe('failed');
  });

  it('공유 링크: path 와 og 이미지를 넘기고, 실패하면 null', async () => {
    bridge.createLink.mockResolvedValue('https://toss.im/_m/abc');
    expect(await createShareLink('intoss://byeol-today/sign/leo', 'https://example/og.png')).toBe('https://toss.im/_m/abc');
    expect(bridge.createLink).toHaveBeenCalledWith({ path: 'intoss://byeol-today/sign/leo', ogImageUrl: 'https://example/og.png' });
    bridge.createLink.mockRejectedValue(new Error('x'));
    expect(await createShareLink('intoss://byeol-today')).toBeNull();
  });

  it('사진 저장: 권한을 누른 뒤에만 묻고, 거부면 저장하지 않아요', async () => {
    expect(canSaveImage()).toBe(true);
    bridge.requestPermission.mockResolvedValue('denied');
    expect(await saveImageToPhotos('QUJD', 'a.png')).toBe('denied');
    expect(bridge.saveBase64).not.toHaveBeenCalled();
    bridge.requestPermission.mockResolvedValue('allowed');
    bridge.saveBase64.mockResolvedValue();
    expect(await saveImageToPhotos('QUJD', 'a.png')).toBe('saved');
    expect(bridge.saveBase64).toHaveBeenCalledWith({ data: 'QUJD', fileName: 'a.png', mimeType: 'image/png' });
    bridge.saveBase64.mockRejectedValue(new Error('x'));
    expect(await saveImageToPhotos('QUJD', 'a.png')).toBe('failed');
  });
});
