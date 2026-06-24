export function paymentConfirmedTemplate({ clientName, invoiceNumber, amount }) {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2>Hi ${clientName},</h2>
      <p>We have successfully received your payment of <strong>$${amount}</strong> for invoice <strong>#${invoiceNumber}</strong>.</p>
      <p>Thank you for your prompt payment.</p>
      <p>Best regards,<br/>Ozlabs Team</p>
    </div>
  `;
}
