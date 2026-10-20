import { describe, expect, it } from 'vitest';

import { eulReul } from './josa';

describe('조사', () => {
  it('받침이 있으면 을, 없으면 를', () => {
    expect(eulReul('나와 컨디션')).toBe('나와 컨디션을');
    expect(eulReul('짝과 관계')).toBe('짝과 관계를');
    expect(eulReul('쉼과 정리')).toBe('쉼과 정리를');
    expect(eulReul('돈과 소유')).toBe('돈과 소유를');
    expect(eulReul("'나와 컨디션'")).toBe("'나와 컨디션'을");
    expect(eulReul("'짝과 관계'")).toBe("'짝과 관계'를");
  });
});
