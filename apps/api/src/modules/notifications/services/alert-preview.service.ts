import {
  alertPreviewPayloadSchema,
  type ExplanationContext,
  type AlertPreviewPayload,
} from '@sidewalk/shared';

export class AlertPreviewService {
  public generatePreview(
    notificationId: string,
    headline: string,
    previewBody: string,
    context: ExplanationContext
  ): AlertPreviewPayload {
    let explanationCopy = '';

    switch (context.reasonCode) {
      case 'followed_case':
        explanationCopy = `You're receiving this because you followed the case "${context.caseTitle}".`;
        break;
      case 'subscribed_topic':
        explanationCopy = `You're receiving this because you subscribed to the topic "${context.topicName}".`;
        break;
      case 'nearby_alert':
        explanationCopy = `This alert is happening ${context.distanceMiles} miles from your registered neighborhood.`;
        break;
      case 'mentioned':
        explanationCopy = 'You were mentioned in a comment.';
        break;
      case 'staff_assignment':
        explanationCopy = 'This case was assigned to you by a dispatcher.';
        break;
    }

    const payload: AlertPreviewPayload = {
      notificationId,
      headline,
      previewBody,
      explanationCopy,
      context,
    };

    return alertPreviewPayloadSchema.parse(payload);
  }
}
