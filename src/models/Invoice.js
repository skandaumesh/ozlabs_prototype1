import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client reference is required'],
  },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },
  year: {
    type: Number,
    required: true,
  },
  lineItems: [
    {
      description: { type: String, required: true },
      amount: { type: Number, required: true },
    },
  ],
  subtotal: {
    type: Number,
    required: true,
  },
  gst: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue'],
    default: 'draft',
  },
  pdfUrl: {
    type: String,
    default: '',
  },
  razorpayLinkId: {
    type: String,
    default: '',
  },
  razorpayPaymentLinkUrl: {
    type: String,
    default: '',
  },
  sentAt: {
    type: Date,
    default: null,
  },
  paidAt: {
    type: Date,
    default: null,
  },
  remindersSent: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

InvoiceSchema.index({ clientId: 1 });
InvoiceSchema.index({ invoiceNumber: 1 }, { unique: true });
InvoiceSchema.index({ razorpayLinkId: 1 });
InvoiceSchema.index({ status: 1 });

const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);

export default Invoice;
