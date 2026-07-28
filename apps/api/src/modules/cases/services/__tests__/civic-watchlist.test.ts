import { describe, it, expect } from 'vitest';
import type { CivicWatchlistItem, WatchlistSummary } from '@sidewalk/shared';

interface WatchlistStore {
  lists: Map<string, CivicWatchlistItem[]>;
}

function createStore(): WatchlistStore {
  return { lists: new Map() };
}

function addToWatchlist(store: WatchlistStore, userId: string, item: CivicWatchlistItem): void {
  const list = store.lists.get(userId) ?? [];
  list.push(item);
  store.lists.set(userId, list);
}

function removeFromWatchlist(store: WatchlistStore, userId: string, caseId: string): boolean {
  const list = store.lists.get(userId);
  if (!list) return false;
  const idx = list.findIndex((i) => i.caseId === caseId);
  if (idx === -1) return false;
  list.splice(idx, 1);
  return true;
}

function getWatchlistSummary(store: WatchlistStore, userId: string): WatchlistSummary {
  const items = store.lists.get(userId) ?? [];

  const highPriority = items.filter((i) => i.priority === 'high').length;

  return {
    userId,
    totalCasesWatched: items.length,
    activeFollowUpsCount: highPriority,
    items,
  };
}

function findStaleItems(store: WatchlistStore, userId: string, staleDays = 7): CivicWatchlistItem[] {
  const items = store.lists.get(userId) ?? [];
  const now = Date.now();
  const threshold = staleDays * 24 * 60 * 60 * 1000;
  return items.filter((i) => now - new Date(i.lastActivityAtIso).getTime() > threshold);
}

describe('Civic Watchlist', () => {
  const sevenDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
  const recentDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();

  it('adds case to watchlist', () => {
    const store = createStore();
    const item: CivicWatchlistItem = {
      caseId: 'case-1',
      title: 'Broken sidewalk',
      neighborhood: 'Downtown',
      category: 'infrastructure',
      followUpStatus: 'active_review',
      priority: 'high',
      lastActivityAtIso: recentDate,
      addedAtIso: new Date().toISOString(),
    };

    addToWatchlist(store, 'user-1', item);
    const summary = getWatchlistSummary(store, 'user-1');
    expect(summary.totalCasesWatched).toBe(1);
    expect(summary.items[0].caseId).toBe('case-1');
  });

  it('removes from watchlist', () => {
    const store = createStore();
    addToWatchlist(store, 'user-1', {
      caseId: 'case-1',
      title: 'Test',
      neighborhood: 'Area',
      category: 'safety',
      followUpStatus: 'active_review',
      priority: 'medium',
      lastActivityAtIso: recentDate,
      addedAtIso: new Date().toISOString(),
    });

    const removed = removeFromWatchlist(store, 'user-1', 'case-1');
    expect(removed).toBe(true);
    const summary = getWatchlistSummary(store, 'user-1');
    expect(summary.totalCasesWatched).toBe(0);
  });

  it('returns false when removing non-existent case', () => {
    const store = createStore();
    const removed = removeFromWatchlist(store, 'user-1', 'nonexistent');
    expect(removed).toBe(false);
  });

  it('gets watchlist summary', () => {
    const store = createStore();
    addToWatchlist(store, 'user-1', {
      caseId: 'case-1',
      title: 'High priority',
      neighborhood: 'A',
      category: 'safety',
      followUpStatus: 'active_review',
      priority: 'high',
      lastActivityAtIso: recentDate,
      addedAtIso: new Date().toISOString(),
    });
    addToWatchlist(store, 'user-1', {
      caseId: 'case-2',
      title: 'Low priority',
      neighborhood: 'B',
      category: 'infrastructure',
      followUpStatus: 'resolved',
      priority: 'low',
      lastActivityAtIso: recentDate,
      addedAtIso: new Date().toISOString(),
    });

    const summary = getWatchlistSummary(store, 'user-1');
    expect(summary.totalCasesWatched).toBe(2);
    expect(summary.activeFollowUpsCount).toBe(1);
  });

  it('identifies stale items with no activity for >7 days', () => {
    const store = createStore();
    addToWatchlist(store, 'user-1', {
      caseId: 'stale-case',
      title: 'Old issue',
      neighborhood: 'A',
      category: 'safety',
      followUpStatus: 'stale',
      priority: 'medium',
      lastActivityAtIso: sevenDaysAgo,
      addedAtIso: sevenDaysAgo,
    });
    addToWatchlist(store, 'user-1', {
      caseId: 'active-case',
      title: 'Recent issue',
      neighborhood: 'B',
      category: 'infrastructure',
      followUpStatus: 'active_review',
      priority: 'high',
      lastActivityAtIso: recentDate,
      addedAtIso: recentDate,
    });

    const stale = findStaleItems(store, 'user-1');
    expect(stale).toHaveLength(1);
    expect(stale[0].caseId).toBe('stale-case');
  });

  it('handles empty watchlist', () => {
    const store = createStore();
    const summary = getWatchlistSummary(store, 'nonexistent-user');
    expect(summary.totalCasesWatched).toBe(0);
    expect(findStaleItems(store, 'nonexistent-user')).toHaveLength(0);
  });
});
