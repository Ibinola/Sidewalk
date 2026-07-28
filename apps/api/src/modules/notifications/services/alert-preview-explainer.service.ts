import {
  alertPreviewPayloadSchema,
  type AlertPreviewPayload,
  type ExplainerCopyOptions,
} from '@sidewalk/shared';

export class AlertPreviewExplainerService {
  public generateExplainerPreview(options: ExplainerCopyOptions): AlertPreviewPayload {
    let explainer = 'You received this notification based on your account activity preferences.';
    if (options.category === 'report_author') {
      explainer = `Sent because you created the report: "${options.caseTitle}".`;
    } else if (options.category === 'subscribed_category') {
      explainer = `Sent because you subscribed to civic updates for this issue category.`;
    } else if (options.category === 'neighborhood_proximity') {
      explainer = `Sent because this activity occurred near ${options.locationName ?? 'your neighborhood'}.`;
    }

    const payload: AlertPreviewPayload = {
      previewId: `prev_${Date.now()}`,
      headline: `Update on ${options.caseTitle}`,
      bodySnippet: `New progress activity recorded for ${options.caseTitle}.`,
      explainerCopy: explainer,
      category: options.category,
      generatedAtIso: new Date().toISOString(),
    };

    return alertPreviewPayloadSchema.parse(payload);
  }
}
