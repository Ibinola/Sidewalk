import {
  mentionNotificationPayloadSchema,
  type CommentAuthorInfo,
  type MentionTag,
  type MentionNotificationPayload,
} from '@sidewalk/shared';

export class MentionParserService {
  public parseAndNotify(
    body: string,
    author: CommentAuthorInfo,
    caseId: string,
    commentId: string
  ): MentionNotificationPayload | null {
    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    const mentions: MentionTag[] = [];
    let match;

    while ((match = mentionRegex.exec(body)) !== null) {
      mentions.push({
        mentionedUsername: match[1],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }

    if (mentions.length === 0) return null;

    const payload: MentionNotificationPayload = {
      notificationId: `mn_${Date.now()}`,
      author,
      caseId,
      commentId,
      snippet: body.substring(0, 100) + (body.length > 100 ? '...' : ''),
      mentions,
      notifiedAtIso: new Date().toISOString(),
    };

    return mentionNotificationPayloadSchema.parse(payload);
  }
}
