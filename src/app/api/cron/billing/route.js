import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Client from '@/models/Client';
import Invoice from '@/models/Invoice';
import { generateInvoicePDF } from '@/lib/pdf';
import { sendEmail } from '@/lib/resend';
import { invoiceTemplate } from '@/emails/invoice';
import { logActivityAndNotify } from '@/lib/activity';

export async function POST(request) {
  try {
    const cronSecret = request.headers.get('x-cron-secret');
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const clients = await Client.find({
      'billingProfile.autoInvoice': true,
      'billingProfile.billingDate': currentDay,
      'billingProfile.retainerAmount': { $gt: 0 },
    });

    const results = [];

    for (const client of clients) {
      // Check if invoice already exists for this month
      const existing = await Invoice.findOne({ clientId: client._id, month: currentMonth, year: currentYear });
      if (existing) continue;

      const monthStr = String(currentMonth).padStart(2, '0');
      const count = await Invoice.countDocuments({ month: currentMonth, year: currentYear });
      const invoiceNumber = `OZL-${currentYear}-${monthStr}-${String(count + 1).padStart(3, '0')}`;

      const subtotal = client.billingProfile.retainerAmount;
      const gst = Math.round(subtotal * 0.18 * 100) / 100;
      const total = Math.round((subtotal + gst) * 100) / 100;

      const invoice = await Invoice.create({
        clientId: client._id,
        invoiceNumber,
        month: currentMonth,
        year: currentYear,
        lineItems: [{ description: `Monthly retainer — ${client.company}`, amount: subtotal }],
        subtotal,
        gst,
        total,
        status: 'draft',
      });

      // Generate PDF and send
      try {
        const pdfBuffer = await generateInvoicePDF(invoice, null, client);
        await sendEmail({
          to: client.email,
          subject: `Invoice ${invoiceNumber} from OZL Studio`,
          html: invoiceTemplate({ clientName: client.name, invoiceNumber, amount: total }),
          attachments: [{ filename: `${invoiceNumber}.pdf`, content: pdfBuffer }],
        });
        invoice.status = 'sent';
        invoice.sentAt = new Date();
        await invoice.save();

        await logActivityAndNotify({
          projectId: null,
          action: `Auto-invoice ${invoiceNumber} generated and sent to ${client.name}`,
          performedBy: 'System',
          performedByType: 'admin',
          notificationTitle: `Invoice ${invoiceNumber} auto-generated`,
          notificationType: 'invoice',
          notificationLink: '/dashboard/invoices',
        });
      } catch (emailErr) {
        console.error(`Failed to send invoice to ${client.email}:`, emailErr);
      }

      results.push({ client: client.company, invoiceNumber });
    }

    return NextResponse.json({ generated: results.length, invoices: results });
  } catch (error) {
    console.error('Billing cron error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
