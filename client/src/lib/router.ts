import { Environment, graniteEvent } from '@apps-in-toss/web-framework';
import { useEffect, useState } from 'react';

import { isSignId, type SignId } from '../sky';

/**
 * 해시 기반 화면 전환 (mandalartplan 에서 확인한 규칙 그대로).
 *
 * 토스앱의 네비게이션 바 뒤로가기(‹)와 Android 백버튼은 웹뷰 히스토리 뒤로가기로 동작하고,
 * 히스토리 바닥(첫 화면)에서는 토스앱이 종료 확인 창을 띄워요(커뮤니티 3052, 토스 답변).
 * 그래서 화면 전환은 `history.pushState` 로만 쌓고, `replaceState` 는 쓰지 않아요(852·3107).
 *
 * 딥링크(`intoss://zodiac-today/match?a=aries&b=leo`)는 `Environment.initialURL` 로 읽어, 히스토리 바닥 항목이
 * 그릴 화면(`baseRoute`)만 메모리에 바꿔요. URL 은 건드리지 않아요.
 */

export type Route =
  | { name: 'home' }
  | { name: 'sign'; sign: SignId }
  | { name: 'find' }
  | { name: 'mine' }
  | { name: 'match'; a?: SignId; b?: SignId }
  | { name: 'settings' };

const HOME: Route = { name: 'home' };

function matchRoute(a: string | null | undefined, b: string | null | undefined): Route {
  return { name: 'match', ...(isSignId(a) ? { a } : {}), ...(isSignId(b) ? { b } : {}) };
}

export function parseRoute(hash: string): Route {
  const sign = /^#\/sign\/([a-z]+)$/.exec(hash);
  if (sign) return isSignId(sign[1]) ? { name: 'sign', sign: sign[1] } : HOME;
  const match = /^#\/match(?:\/([a-z]+)\/([a-z]+))?$/.exec(hash);
  if (match) return matchRoute(match[1], match[2]);
  if (hash === '#/find') return { name: 'find' };
  if (hash === '#/mine') return { name: 'mine' };
  if (hash === '#/settings') return { name: 'settings' };
  return HOME;
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case 'home':
      return '#/';
    case 'sign':
      return `#/sign/${route.sign}`;
    case 'match':
      return route.a && route.b ? `#/match/${route.a}/${route.b}` : '#/match';
    default:
      return `#/${route.name}`;
  }
}

/** `intoss://zodiac-today/match?a=aries&b=leo` 같은 스킴 URL 에서 첫 화면을 골라요. 모르면 null. */
export function routeFromSchemeUrl(url: string): Route | null {
  const m = /^[a-z][a-z0-9+.-]*:\/\/[^/?#]+\/?([^?#]*)(?:\?([^#]*))?/i.exec(url.trim());
  if (!m) return null;
  const path = m[1].replace(/\/+$/, '');
  const query = new URLSearchParams(m[2] ?? '');
  if (path === '') return HOME;
  if (path === 'match') return matchRoute(query.get('a'), query.get('b'));
  return parseRoute(`#/${path}`);
}

/** 해시가 비어 있으면(히스토리 바닥) base 화면, 아니면 해시가 가리키는 화면 */
export function resolveHash(hash: string, base: Route): Route {
  if (!hash || hash === '#' || hash === '#/') return base;
  return parseRoute(hash);
}

/** 히스토리 바닥 항목이 그리는 화면. 딥링크로 들어오면 그 화면, 아니면 홈 */
let baseRoute: Route = HOME;

function currentRoute(): Route {
  return resolveHash(window.location.hash, baseRoute);
}

function initialRoute(): Route {
  try {
    const fromScheme = routeFromSchemeUrl(Environment.initialURL ?? '');
    if (fromScheme && fromScheme.name !== 'home') baseRoute = fromScheme;
  } catch {
    /* 브라우저 등 브릿지가 없으면 홈 */
  }
  return currentRoute();
}

const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

function currentDepth(): number {
  const state: unknown = window.history.state;
  if (state && typeof state === 'object' && typeof (state as { depth?: unknown }).depth === 'number') {
    return (state as { depth: number }).depth;
  }
  return 0;
}

/** 지금 화면이 히스토리 바닥(첫 화면 또는 딥링크로 바로 들어온 화면)인지. 여기서 뒤로가기는 미니앱 종료예요. */
export function atHistoryBottom(): boolean {
  return currentDepth() === 0;
}

export function navigate(route: Route): void {
  const hash = routeToHash(route);
  if (window.location.hash === hash) return;
  window.history.pushState({ depth: currentDepth() + 1 }, '', hash);
  emit();
}

/** 이전 화면으로. 히스토리 바닥(딥링크로 바로 들어온 화면)이면 URL 은 그대로 두고 홈을 그려요. */
export function goBack(): void {
  if (currentDepth() > 0) {
    window.history.back();
    return;
  }
  baseRoute = HOME;
  emit();
}

/**
 * 개발 빌드 전용. AIT Devtools 의 모의 네비게이션 바 뒤로가기(‹)는 히스토리를 움직이지 않고
 * `backEvent` 만 쏘기 때문에, 여기서 받아 실제 토스앱과 같은 동작(히스토리 뒤로가기)을 흉내 내요.
 * 출시 번들에는 들어가지 않아요 — 토스앱에서는 backEvent 를 구독하면 기본 뒤로가기·종료 창이 막혀요.
 */
export function installDevBackHandler(): () => void {
  if (!import.meta.env.DEV) return () => {};
  try {
    return graniteEvent.addEventListener('backEvent', {
      onEvent: () => {
        if (currentDepth() > 0) window.history.back();
        else console.info('[zodiac-today] 첫 화면에서 뒤로가기 — 토스앱에서는 종료 확인 창이 떠요');
      },
    });
  } catch {
    return () => {};
  }
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(initialRoute);

  useEffect(() => {
    const update = () => setRoute(currentRoute());
    listeners.add(update);
    window.addEventListener('popstate', update);
    window.addEventListener('hashchange', update);
    const uninstall = installDevBackHandler();
    return () => {
      listeners.delete(update);
      window.removeEventListener('popstate', update);
      window.removeEventListener('hashchange', update);
      uninstall();
    };
  }, []);

  return route;
}
