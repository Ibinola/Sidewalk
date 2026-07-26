import {
  emailDigestTemplateSchema,
  type EmailDigestTemplate,
  type DigestRecipient,
  type DigestItem,
} from '@qyou/shared';

export class EmailSummaryService {
  public generateDigest(
    recipient: DigestRecipient,
    frequency: 'daily' | 'weekly',
    items: DigestItem[]
  ): EmailDigestTemplate {
    const payload: EmailDigestTemplate = {
      templateId: `digest_${frequency}_${Date.now()}`,
      frequency,
      recipient,
      items,
      generatedAtIso: new Date().toISOString(),
    };

    return emailDigestTemplateSchema.parse(payload);
  }

  public renderHtml(template: EmailDigestTemplate): string {
    const listHtml = template.items
      .map((item) => `<li><strong>${item.title}</strong>: ${item.description}</li>`)
      .join('');
    
    return `
      <div>
        <h1>Your ${template.frequency} Civic Update, ${template.recipient.name}</h1>
        <ul>${listHtml}</ul>
      </div>
    `;
  }
}
