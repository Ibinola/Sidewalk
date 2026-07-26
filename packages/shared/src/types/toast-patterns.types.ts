export interface StatusChangeContext {
  caseId: string;
  oldStatus: string;
  newStatus: string;
  updatedBy: string;
}

export interface ToastNotification {
  toastId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  context?: StatusChangeContext;
  durationMs: number;
}

export interface BannerAlert {
  bannerId: string;
  isDismissible: boolean;
  content: string;
  actionUrl?: string;
}
