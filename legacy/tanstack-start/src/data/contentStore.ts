import { useSyncExternalStore } from "react";
import type { ContentItem, ContentKind } from "@/components/admin/ContentManager";

type Store = Record<ContentKind, ContentItem[]>;

const store: Store = { Page: [], Service: [], Notice: [] };
const initialized: Record<ContentKind, boolean> = { Page: false, Service: false, Notice: false };
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

export function ensureSeed(kind: ContentKind, seed: ContentItem[]) {
  if (!initialized[kind]) {
    store[kind] = seed;
    initialized[kind] = true;
  }
}

export function getList(kind: ContentKind) {
  return store[kind];
}

export function getItem(kind: ContentKind, id: number) {
  return store[kind].find((x) => x.id === id) ?? null;
}

export function upsertItem(kind: ContentKind, item: ContentItem): ContentItem {
  const list = store[kind];
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx === -1 || item.id === 0) {
    const newItem = { ...item, id: Math.max(0, ...list.map((x) => x.id)) + 1 };
    store[kind] = [newItem, ...list];
    emit();
    return newItem;
  }
  const next = [...list];
  next[idx] = item;
  store[kind] = next;
  emit();
  return item;
}

export function removeItem(kind: ContentKind, id: number) {
  store[kind] = store[kind].filter((x) => x.id !== id);
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useContentList(kind: ContentKind) {
  return useSyncExternalStore(
    subscribe,
    () => store[kind],
    () => store[kind],
  );
}
