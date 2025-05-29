
export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailSender {
  email: string;
  name: string;
}

export interface BrevoApiResponse {
  messageId?: string;
  [key: string]: any;
}

export interface AccountInfo {
  success: boolean;
  data?: any;
  error?: string;
}

export interface ConnectionTestResult {
  success: boolean;
  error?: string;
  details?: {
    accountName: string;
    plan: string;
    emailsRemaining: string;
  };
}
