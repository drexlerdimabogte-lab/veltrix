"use client";
import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * Reads a browser-only value without a setState-in-effect round trip.
 * Server render (and hydration) uses `serverValue`; the client value is applied right after hydration.
 * The value is read once per render and not subscribed to changes (matches the previous mount-time behaviour).
 */
export function useClientSnapshot<T extends string | number | boolean | null>(getClient: () => T, serverValue: T): T {
  return useSyncExternalStore(noopSubscribe, getClient, () => serverValue);
}
