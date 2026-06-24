import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Client from '@/models/Client';
import { sendEmail } from '@/lib/resend';
import { paymentConfirmedTemplate } from '@/emails/payment-confirmed';
import { logActivityAndNotify } from '@/lib/activity';

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !secret) {
      return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
    }

    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    if (expected !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === 'payment_link.paid' || event.event === 'payment.captured') {
      const paymentLinkId = event.payload?.payment_link?.entity?.id;

      if (paymentLinkId) {
        await dbConnect();

        const invoice = await Invoice.findOne({ razorpayLinkId: paymentLinkId });
        if (invoice && invoice.status !== 'paid') {
          invoice.status = 'paid';
          invoice.paidAt = new Date();
          await invoice.save();

          const client = await Client.findById(invoice.clientId);
          if (client?.email) {
            await sendEmail({
              to: client.email,
              subject: `Payment Confirmed: ${invoice.invoiceNumber}`,
              html: paymentConfirmedTemplate({
                clientName: client.name,
                invoiceNumber: invoice.invoiceNumber,
                amount: invoice.total,
              }),
            });

            await logActivityAndNotify({
              projectId: null,
              action: `Invoice ${invoice.invoiceNumber} paid by ${client.name}`,
              performedBy: client.name,
              performedByType: 'client',
              notificationTitle: `Payment received: ${invoice.invoiceNumber}`,
              notificationType: 'invoice',
              notificationLink: '/dashboard/invoices',
            });
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
