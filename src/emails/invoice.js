export function invoiceTemplate({ clientName, invoiceNumber, amount, paymentUrl }) {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2>Hi ${clientName},</h2>
      <p>Your invoice <strong>#${invoiceNumber}</strong> for the amount of <strong>$${amount}</strong> has been generated.</p>
      <p>Please find the PDF attached to this email.</p>
      ${paymentUrl ? `
      <div style="margin: 30px 0;">
        <a href="${paymentUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          Pay Invoice Now
        </a>
      </div>
      ` : ''}
      <p>Thank you for your business!</p>
      <p>Best regards,<br/>Ozlabs Team</p>
    </div>
  `;
}
