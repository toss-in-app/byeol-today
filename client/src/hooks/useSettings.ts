import { useCallback, useEffect, useRef, useState } from 'react';

import { defaultSettings, loadSettings, saveSettings, type SettingsState } from '../lib/state';

export interface SettingsApi {
  settings: SettingsState;
  ready: boolean;
  update: (change: (current: SettingsState) => SettingsState) => Promise<void>;
}

/** zodiac.settings.v1 을 Storage 와 맞춰 들고 있어요. 처음 연 시각은 읽자마자 한 번 적어요 */
export function useSettings(): SettingsApi {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [ready, setReady] = useState(false);
  const latest = useRef(settings);
  latest.current = settings;

  const update = useCallback(async (change: (current: SettingsState) => SettingsState) => {
    const next = change(latest.current);
    latest.current = next;
    setSettings(next);
    await saveSettings(next);
  }, []);

  useEffect(() => {
    let alive = true;
    loadSettings().then((loaded) => {
      if (!alive) return;
      latest.current = loaded;
      setSettings(loaded);
      setReady(true);
      if (loaded.firstOpenAt === null) void update((current) => ({ ...current, firstOpenAt: Date.now() }));
    });
    return () => {
      alive = false;
    };
  }, [update]);

  return { settings, ready, update };
}
