import {
  activityFeedStateSchema,
  type RefinedProgressEvent,
  type ActivityFeedState,
} from '@sidewalk/shared';

export class RefinedActivitySignalsService {
  private readonly events: RefinedProgressEvent[] = [];

  public emitSignal(event: RefinedProgressEvent): void {
    this.events.unshift(event);
    if (this.events.length > 50) {
      this.events.pop(); // keep top 50
    }
  }

  public getFeedState(): ActivityFeedState {
    const state: ActivityFeedState = {
      events: this.events,
      lastPolledIso: new Date().toISOString(),
      isLive: true,
    };
    return activityFeedStateSchema.parse(state);
  }
}
