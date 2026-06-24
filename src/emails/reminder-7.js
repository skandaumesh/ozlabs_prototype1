export function reminder7Template({ clientName, invoiceNumber, amount }) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px; color: #111;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="font-size: 20px; font-weight: 700; letter-spacing: -0.5px; margin: 0;">OZL Studio</h1>
      </div>
      <p style="font-size: 16px; line-height: 1.6;">Hi ${clientName},</p>
      <p style="font-size: 16px; line-height: 1.6;">This is a friendly reminder that invoice <strong>${invoiceNumber}</strong> for <strong>₹${amount.toLocaleString('en-IN')}</strong> is pending payment.</p>
      <p style="font-size: 16px; line-height: 1.6;">Please process the payment at your earliest convenience. You can pay directly from your client portal.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
      <p style="font-size: 12px; color: #999;">OneZeroLabs · Bengaluru, India</p>
    </div>
  `;
}
