import { describe, it, expect } from 'vitest';
import type { TopicSubscription, TopicSubscriptionPreference, SubscriptionFrequency, TopicType } from '@sidewalk/shared';

interface SubscriptionStore {
  subscriptions: Map<string, TopicSubscription[]>;
}

function createStore(): SubscriptionStore {
  return { subscriptions: new Map() };
}

function createSubscription(
  store: SubscriptionStore,
  userId: string,
  topicType: TopicType,
  topicId: string,
  frequency: SubscriptionFrequency = 'instant',
): TopicSubscription {
  const sub: TopicSubscription = {
    id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId,
    topicType,
    topicId,
    frequency,
    createdAt: new Date(),
  };
  const existing = store.subscriptions.get(userId) ?? [];
  existing.push(sub);
  store.subscriptions.set(userId, existing);
  return sub;
}

function updateFrequency(store: SubscriptionStore, userId: string, subscriptionId: string, frequency: SubscriptionFrequency): boolean {
  const subs = store.subscriptions.get(userId) ?? [];
  const sub = subs.find((s) => s.id === subscriptionId);
  if (!sub) return false;
  sub.frequency = frequency;
  return true;
}

function removeSubscription(store: SubscriptionStore, userId: string, subscriptionId: string): boolean {
  const subs = store.subscriptions.get(userId);
  if (!subs) return false;
  const idx = subs.findIndex((s) => s.id === subscriptionId);
  if (idx === -1) return false;
  subs.splice(idx, 1);
  return true;
}

function getUserPreferences(store: SubscriptionStore, userId: string, defaultFrequency: SubscriptionFrequency = 'daily'): TopicSubscriptionPreference {
  const overrides = store.subscriptions.get(userId) ?? [];
  return { defaultFrequency, overrides };
}

describe('Topic Subscription Management', () => {
  it('creates topic subscription', () => {
    const store = createStore();
    const sub = createSubscription(store, 'user-1', 'neighborhood', 'nhood-42');
    expect(sub.userId).toBe('user-1');
    expect(sub.topicType).toBe('neighborhood');
    expect(sub.topicId).toBe('nhood-42');
    expect(sub.frequency).toBe('instant');
  });

  it('updates frequency', () => {
    const store = createStore();
    const sub = createSubscription(store, 'user-1', 'category', 'cat-5');
    const updated = updateFrequency(store, 'user-1', sub.id, 'weekly');
    expect(updated).toBe(true);
    const prefs = getUserPreferences(store, 'user-1');
    expect(prefs.overrides[0].frequency).toBe('weekly');
  });

  it('removes subscription', () => {
    const store = createStore();
    const sub = createSubscription(store, 'user-1', 'report', 'rpt-1');
    const removed = removeSubscription(store, 'user-1', sub.id);
    expect(removed).toBe(true);
    const prefs = getUserPreferences(store, 'user-1');
    expect(prefs.overrides).toHaveLength(0);
  });

  it('returns false when removing non-existent subscription', () => {
    const store = createStore();
    const removed = removeSubscription(store, 'user-1', 'fake-id');
    expect(removed).toBe(false);
  });

  it('gets user preferences with default frequency', () => {
    const store = createStore();
    createSubscription(store, 'user-1', 'neighborhood', 'nhood-1');
    createSubscription(store, 'user-1', 'category', 'cat-2');
    const prefs = getUserPreferences(store, 'user-1');
    expect(prefs.defaultFrequency).toBe('daily');
    expect(prefs.overrides).toHaveLength(2);
  });

  it('gets empty preferences for user with no subscriptions', () => {
    const store = createStore();
    const prefs = getUserPreferences(store, 'new-user');
    expect(prefs.overrides).toHaveLength(0);
    expect(prefs.defaultFrequency).toBe('daily');
  });
});
