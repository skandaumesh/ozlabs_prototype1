import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Client from '@/models/Client';
import { sendEmail } from '@/lib/resend';
import { reminder7Template } from '@/emails/reminder-7';
import { reminder14Template } from '@/emails/reminder-14';
import { logActivityAndNotify } from '@/lib/activity';

export async function POST(request) {
  try {
    const cronSecret = request.headers.get('x-cron-secret');
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const now = new Date();
    const results = [];

    // Find sent invoices that are unpaid
    const unpaidInvoices = await Invoice.find({ status: { $in: ['sent', 'overdue'] } });

    for (const invoice of unpaidInvoices) {
      const client = await Client.findById(invoice.clientId);
      if (!client) continue;

      const daysSinceSent = invoice.sentAt ? Math.floor((now - invoice.sentAt) / (1000 * 60 * 60 * 24)) : 0;

      if (daysSinceSent >= 14 && invoice.remindersSent < 2) {
        // 14-day final reminder
        await sendEmail({
          to: client.email,
          subject: `FINAL REMINDER: Invoice ${invoice.invoiceNumber} — OZL Studio`,
          html: reminder14Template({ clientName: client.name, invoiceNumber: invoice.invoiceNumber, amount: invoice.total }),
        });

        invoice.remindersSent = 2;
        invoice.status = 'overdue';
        await invoice.save();

        await logActivityAndNotify({
          projectId: null,
          action: `Final reminder sent for ${invoice.invoiceNumber}`,
          performedBy: 'System',
          performedByType: 'admin',
          notificationTitle: `Invoice ${invoice.invoiceNumber} overdue — final reminder sent`,
          notificationType: 'invoice',
          notificationLink: '/dashboard/invoices',
        });

        results.push({ invoice: invoice.invoiceNumber, reminder: '14-day' });
      } else if (daysSinceSent >= 7 && invoice.remindersSent < 1) {
        // 7-day reminder
        await sendEmail({
          to: client.email,
          subject: `Payment Reminder: Invoice ${invoice.invoiceNumber} — OZL Studio`,
          html: reminder7Template({ clientName: client.name, invoiceNumber: invoice.invoiceNumber, amount: invoice.total }),
        });

        invoice.remindersSent = 1;
        await invoice.save();
        results.push({ invoice: invoice.invoiceNumber, reminder: '7-day' });
      }
    }

    return NextResponse.json({ sent: results.length, reminders: results });
  } catch (error) {
    console.error('Reminders cron error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
