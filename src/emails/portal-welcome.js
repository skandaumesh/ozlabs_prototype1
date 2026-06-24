export function portalWelcomeTemplate({ clientName, company, portalUrl }) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px; color: #111;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="font-size: 20px; font-weight: 700; letter-spacing: -0.5px; margin: 0;">OZL Studio</h1>
      </div>
      <p style="font-size: 16px; line-height: 1.6;">Hi ${clientName},</p>
      <p style="font-size: 16px; line-height: 1.6;">Welcome to OZL Studio. We've set up a dedicated workspace for <strong>${company}</strong>.</p>
      <p style="font-size: 16px; line-height: 1.6;">Your client portal is your one-stop place to review designs, track projects, view invoices, and access brand assets.</p>
      <p style="font-size: 16px; line-height: 1.6;">Please click the button below to set up your secure password and access your dashboard.</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${portalUrl}" style="display: inline-block; background: #000; color: #fff; padding: 14px 28px; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 6px;">Set Up Your Portal</a>
      </div>
      <p style="font-size: 14px; color: #666; line-height: 1.6;">This is a secure, one-time setup link.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
      <p style="font-size: 12px; color: #999;">OneZeroLabs · Bengaluru, India</p>
    </div>
  `;
}
