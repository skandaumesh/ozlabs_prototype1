import { Resend } from 'resend';

// Only instantiate if API key is provided
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const sendEmail = async ({ to, subject, html, attachments }) => {
  if (!resend) {
    console.warn('RESEND_API_KEY is not set. Email will not be sent.', { to, subject });
    return { success: false, error: 'Resend API Key missing' };
  }

  try {
    const data = await resend.emails.send({
      from: 'Ozlabs <onboarding@resend.dev>', // Update this to verified domain in production
      to,
      subject,
      html,
      attachments,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};
