"use client";

import { useSyncExternalStore } from "react";

// Simple hydration detection using useSyncExternalStore
// This avoids the useEffect/setState pattern that causes lint errors
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

function useIsMounted(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

interface CartHydrationWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Wrapper component that prevents cart content from rendering until
 * client-side hydration is complete.
 *
 * This prevents hydration mismatches between server (empty cart) and
 * client (hydrated cart from localStorage).
 */
export function CartHydrationWrapper({
  children,
  fallback = null,
}: CartHydrationWrapperProps) {
  const isMounted = useIsMounted();

  // During SSR and initial hydration, show fallback
  if (!isMounted) {
    return fallback;
  }

  return children;
}

/**
 * Hook for components that need to know if hydration is complete
 * Use this for conditional rendering based on hydration state
 */
export function useCartHydration(): boolean {
  return useIsMounted();
}
