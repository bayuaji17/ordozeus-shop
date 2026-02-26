"use client";

import { useSyncExternalStore } from "react";
import { useCartStore } from "@/lib/stores/cart-store";

// Simple mount detection using useSyncExternalStore (avoids useEffect/setState lint errors)
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

  if (!isMounted) {
    return fallback;
  }

  return children;
}

/**
 * Hook for components that need to know if the cart store has finished
 * rehydrating from localStorage.
 *
 * Returns true only after Zustand persist has read and applied localStorage data,
 * preventing the badge from flashing 0 before real cart data is loaded.
 */
export function useCartHydration(): boolean {
  return useCartStore((state) => state.hasHydrated);
}
