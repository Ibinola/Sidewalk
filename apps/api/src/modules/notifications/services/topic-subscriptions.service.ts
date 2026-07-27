import {
  topicSubscriptionSchema,
  type TopicSubscription,
  type TopicCategory,
} from '@qyou/shared';

export class TopicSubscriptionsService {
  private readonly subscriptions: Map<string, TopicSubscription> = new Map();

  public subscribe(params: {
    userId: string;
    topicId: string;
    category: TopicCategory;
    label: string;
    frequency?: TopicSubscription['frequency'];
  }): TopicSubscription {
    const id = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const subscription: TopicSubscription = {
      id,
      userId: params.userId,
      topicId: params.topicId,
      category: params.category,
      label: params.label,
      frequency: params.frequency ?? 'realtime',
      createdAtIso: new Date().toISOString(),
    };
    const parsed = topicSubscriptionSchema.parse(subscription);
    this.subscriptions.set(id, parsed);
    return parsed;
  }

  public unsubscribe(subscriptionId: string): boolean {
    return this.subscriptions.delete(subscriptionId);
  }

  public getByUser(userId: string): TopicSubscription[] {
    const results: TopicSubscription[] = [];
    for (const sub of this.subscriptions.values()) {
      if (sub.userId === userId) results.push(sub);
    }
    return results;
  }

  public getByCategory(userId: string, category: TopicCategory): TopicSubscription[] {
    const results: TopicSubscription[] = [];
    for (const sub of this.subscriptions.values()) {
      if (sub.userId === userId && sub.category === category) results.push(sub);
    }
    return results;
  }

  public getAll(): TopicSubscription[] {
    return Array.from(this.subscriptions.values());
  }
}
