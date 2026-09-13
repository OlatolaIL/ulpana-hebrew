'use client';

import { useSyncExternalStore } from 'react';

const key = 'ulpana_auto_show_guides';
const changeEvent = 'ulpana-guide-preference';
const subscribe = (notify: () => void) => {
  window.addEventListener('storage', notify);
  window.addEventListener(changeEvent, notify);
  return () => {
    window.removeEventListener('storage', notify);
    window.removeEventListener(changeEvent, notify);
  };
};
const getSnapshot = () => window.localStorage.getItem(key) === 'true';

export function useGuidePreference(): [boolean, (enabled: boolean) => void] {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, () => false);
  return [enabled, (next: boolean) => {
    window.localStorage.setItem(key, String(next));
    window.dispatchEvent(new Event(changeEvent));
  }];
}
