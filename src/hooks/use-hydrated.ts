import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False during SSR and until React hydrates the component. Interactive controls
 * use it to stay disabled while a click would do nothing (or a native submit).
 */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
