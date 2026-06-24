import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Client from '@/models/Client';
import { auth } from '@/auth';
import { generateInvoicePDF } from '@/lib/pdf';
import { sendEmail } from '@/lib/resend';
import { invoiceTemplate } from '@/emails/invoice';
import { logActivityAndNotify } from '@/lib/activity';

export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await dbConnect();

    const invoice = await Invoice.findById(id);
    if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

    const client = await Client.findById(invoice.clientId);
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoice, null, client);

    // Send email
    const result = await sendEmail({
      to: client.email,
      subject: `Invoice ${invoice.invoiceNumber} from OZL Studio`,
      html: invoiceTemplate({
        clientName: client.name,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.total,
      }),
      attachments: [
        { filename: `${invoice.invoiceNumber}.pdf`, content: pdfBuffer },
      ],
    });

    if (!result.success) {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    invoice.status = 'sent';
    invoice.sentAt = new Date();
    await invoice.save();

    // Log activity
    await logActivityAndNotify({
      projectId: null,
      action: `Invoice ${invoice.invoiceNumber} sent to ${client.name}`,
      performedBy: session.user.name || 'Admin',
      performedByType: 'admin',
      notificationTitle: `Invoice ${invoice.invoiceNumber} sent`,
      notificationType: 'invoice',
      notificationLink: `/dashboard/invoices`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending invoice:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
