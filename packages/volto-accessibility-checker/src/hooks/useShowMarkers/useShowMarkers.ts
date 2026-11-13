import { useSyncExternalStore } from 'react';

let showMarkers = false;
const listeners = new Set<() => void>();

export const setShowMarkers = (value: boolean) => {
  showMarkers = value;
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const useShowMarkers = () =>
  useSyncExternalStore(
    subscribe,
    () => showMarkers,
    () => false,
  );
