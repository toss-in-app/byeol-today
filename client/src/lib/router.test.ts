import { describe, expect, it } from 'vitest';

import { parseRoute, resolveHash, routeFromSchemeUrl, routeToHash, type Route } from './router';

describe('router', () => {
  it('해시 ↔ 화면', () => {
    const routes: Route[] = [
      { name: 'home' },
      { name: 'sign', sign: 'leo' },
      { name: 'find' },
      { name: 'mine' },
      { name: 'match' },
      { name: 'match', a: 'aquarius', b: 'leo' },
      { name: 'settings' },
    ];
    for (const route of routes) expect(parseRoute(routeToHash(route))).toEqual(route);
  });

  it('모르는 별자리·경로는 홈', () => {
    expect(parseRoute('#/sign/dragon')).toEqual({ name: 'home' });
    expect(parseRoute('#/nowhere')).toEqual({ name: 'home' });
  });

  it('딥링크(콘솔 앱 내 기능·공유 링크)', () => {
    expect(routeFromSchemeUrl('intoss://byeol-today')).toEqual({ name: 'home' });
    expect(routeFromSchemeUrl('intoss://byeol-today/mine')).toEqual({ name: 'mine' });
    expect(routeFromSchemeUrl('intoss://byeol-today/match?a=aquarius&b=leo')).toEqual({ name: 'match', a: 'aquarius', b: 'leo' });
    expect(routeFromSchemeUrl('intoss://byeol-today/match?a=dragon')).toEqual({ name: 'match' });
    expect(routeFromSchemeUrl('intoss://byeol-today/sign/pisces')).toEqual({ name: 'sign', sign: 'pisces' });
    expect(routeFromSchemeUrl('not a url')).toBeNull();
  });

  it('히스토리 바닥은 딥링크 화면', () => {
    expect(resolveHash('', { name: 'mine' })).toEqual({ name: 'mine' });
    expect(resolveHash('#/find', { name: 'mine' })).toEqual({ name: 'find' });
  });
});
