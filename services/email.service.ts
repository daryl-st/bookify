// Email notification service
// This will be implemented with your email provider (e.g., SendGrid, Resend, etc.)

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  async sendEmail(options: EmailOptions): Promise<void> {
    // TODO: Implement email sending logic
    // This will integrate with your email provider
    console.log("Sending email:", options);
  }

  async sendBookingConfirmation(to: string, bookingId: string): Promise<void> {
    // TODO: Implement booking confirmation email
  }

  async sendBookingReminder(to: string, bookingId: string): Promise<void> {
    // TODO: Implement booking reminder email
  }

  async sendCancellationNotification(
    to: string,
    bookingId: string,
    reason?: string
  ): Promise<void> {
    // TODO: Implement cancellation notification email
  }
}

export const emailService = new EmailService();




