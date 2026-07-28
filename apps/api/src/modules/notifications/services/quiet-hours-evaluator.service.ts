import {
  quietHoursScheduleSchema,
  type QuietHoursScheduleInput,
} from '@sidewalk/shared';

export class QuietHoursEvaluatorService {
  public isCurrentlyInQuietHours(schedule: QuietHoursScheduleInput, currentHour: number): boolean {
    const validated = quietHoursScheduleSchema.parse(schedule);
    if (!validated.isEnabled) return false;

    const start = parseInt(validated.startTimeWindow.split(':')[0], 10);
    const end = parseInt(validated.endTimeWindow.split(':')[0], 10);

    if (start > end) {
      return currentHour >= start || currentHour < end;
    }
    return currentHour >= start && currentHour < end;
  }
}
