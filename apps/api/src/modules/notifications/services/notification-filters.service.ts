import {
  type NotificationFilter,
  type FilterPreset,
  type FilterOptions,
  type UrgencyLevel,
} from '@qyou/shared';
import { notificationFilterSchema, filterOptionsSchema } from '@qyou/shared';

export class NotificationFiltersService {
  private readonly filters: Map<string, NotificationFilter> = new Map();
  private readonly presets: Map<string, FilterPreset> = new Map();

  constructor() {
    this.seedDefaultPresets();
  }

  private seedDefaultPresets(): void {
    const defaults: FilterPreset[] = [
      {
        id: 'preset_urgent_only',
        name: 'Urgent Only',
        description: 'Show only high and critical urgency notifications',
        filters: {
          urgency: ['high', 'critical'],
          categories: [],
          proximity: null,
          timeRange: null,
        },
      },
      {
        id: 'preset_nearby',
        name: 'Nearby Reports',
        description: 'Show reports within 5km of your location',
        filters: {
          urgency: [],
          categories: [],
          proximity: { latitude: 0, longitude: 0, radiusKm: 5 },
          timeRange: null,
        },
      },
      {
        id: 'preset_last_24h',
        name: 'Last 24 Hours',
        description: 'Show notifications from the past 24 hours',
        filters: {
          urgency: [],
          categories: [],
          proximity: null,
          timeRange: {
            startIso: new Date(Date.now() - 86400000).toISOString(),
            endIso: new Date().toISOString(),
          },
        },
      },
    ];

    for (const preset of defaults) {
      this.presets.set(preset.id, preset);
    }
  }

  createFilter(options: Omit<NotificationFilter, 'id' | 'createdAt'>): NotificationFilter {
    const filter: NotificationFilter = {
      ...options,
      id: `filter_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    };
    const parsed = notificationFilterSchema.parse(filter);
    this.filters.set(parsed.id, parsed);
    return parsed;
  }

  getFilter(id: string): NotificationFilter | undefined {
    return this.filters.get(id);
  }

  listFilters(): NotificationFilter[] {
    return Array.from(this.filters.values());
  }

  deleteFilter(id: string): boolean {
    return this.filters.delete(id);
  }

  toggleFilter(id: string): NotificationFilter | null {
    const filter = this.filters.get(id);
    if (!filter) return null;
    filter.isActive = !filter.isActive;
    const parsed = notificationFilterSchema.parse(filter);
    this.filters.set(id, parsed);
    return parsed;
  }

  applyFilters(
    items: { urgency?: UrgencyLevel; category?: string; latitude?: number; longitude?: number; createdAt?: string }[],
    options: FilterOptions,
  ): typeof items {
    const parsed = filterOptionsSchema.parse(options);

    return items.filter((item) => {
      if (parsed.urgency.length > 0 && item.urgency && !parsed.urgency.includes(item.urgency)) {
        return false;
      }

      if (parsed.categories.length > 0 && item.category && !parsed.categories.includes(item.category)) {
        return false;
      }

      if (parsed.proximity && item.latitude != null && item.longitude != null) {
        const distance = this.haversineDistance(
          parsed.proximity.latitude,
          parsed.proximity.longitude,
          item.latitude,
          item.longitude,
        );
        if (distance > parsed.proximity.radiusKm) return false;
      }

      if (parsed.timeRange && item.createdAt) {
        const itemTime = new Date(item.createdAt).getTime();
        const start = new Date(parsed.timeRange.startIso).getTime();
        const end = new Date(parsed.timeRange.endIso).getTime();
        if (itemTime < start || itemTime > end) return false;
      }

      return true;
    });
  }

  listPresets(): FilterPreset[] {
    return Array.from(this.presets.values());
  }

  getPreset(id: string): FilterPreset | undefined {
    return this.presets.get(id);
  }

  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
