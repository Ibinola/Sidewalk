import {
  watchlistSummarySchema,
  type CivicWatchlistItem,
  type WatchlistSummary,
} from '@sidewalk/shared';

export class CivicWatchlistService {
  private readonly watchlists: Map<string, CivicWatchlistItem[]> = new Map();

  public getWatchlist(userId: string): WatchlistSummary {
    const items = this.watchlists.get(userId) ?? [];
    const activeCount = items.filter((i) => i.followUpStatus === 'active_review' || i.followUpStatus === 'pending_city_response').length;

    const summary: WatchlistSummary = {
      userId,
      totalCasesWatched: items.length,
      activeFollowUpsCount: activeCount,
      items,
    };

    return watchlistSummarySchema.parse(summary);
  }

  public addToWatchlist(userId: string, item: CivicWatchlistItem): void {
    const list = this.watchlists.get(userId) ?? [];
    list.push(item);
    this.watchlists.set(userId, list);
  }
}
