import {
  lifecycleTriggerEvaluationPayloadSchema,
  type LifecycleTriggerEvaluationPayload,
  type ReportLifecycleStage,
} from '@sidewalk/shared';

export class ReportLifecycleTriggerService {
  public evaluateTransition(
    reportId: string,
    previousStage: ReportLifecycleStage,
    newStage: ReportLifecycleStage
  ): LifecycleTriggerEvaluationPayload {
    const isUrgent = newStage === 'resolved' || newStage === 'work_scheduled';

    const payload: LifecycleTriggerEvaluationPayload = {
      reportId,
      previousStage,
      newStage,
      ruleApplied: {
        stage: newStage,
        notifyAuthor: true,
        notifySubscribers: true,
        requiresUrgentAlert: isUrgent,
      },
      evaluatedAtIso: new Date().toISOString(),
    };

    return lifecycleTriggerEvaluationPayloadSchema.parse(payload);
  }
}
