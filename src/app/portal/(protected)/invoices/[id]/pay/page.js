import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Client from '@/models/Client';
import Invoice from '@/models/Invoice';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { AnimatedCard } from '@/components/ui/Motion';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default async function InvoicePaymentPage({ params }) {
  const session = await auth();
  const { id } = await params;
  
  await dbConnect();
  
  const client = await Client.findById(session.user.id).lean();
  if (!client) notFound();

  const invoice = await Invoice.findOne({ _id: id, clientId: client._id }).lean();
  if (!invoice) notFound();

  if (invoice.status === 'paid') {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center glass rounded-[24px]">
        <ShieldCheck size={48} className="mx-auto text-[#30d158] mb-4" />
        <h3 className="text-xl font-serif text-white">Invoice Already Paid</h3>
        <p className="text-[rgba(255,255,255,0.55)] mt-2">Thank you! This invoice has already been settled.</p>
        <Link href={`/portal/invoices`} className="btn-secondary mt-8 inline-block">
          Back to Invoices
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      <Link href={`/portal/invoices`} className="text-[rgba(255,255,255,0.55)] hover:text-white transition-colors text-sm font-semibold flex items-center">
        <ArrowLeft size={16} className="mr-2" />
        Back to Invoices
      </Link>
      
      <div>
        <h1 className="text-3xl font-serif text-white tracking-[-0.5px]">Complete Payment</h1>
        <p className="text-[rgba(255,255,255,0.55)] mt-1">Invoice {invoice.invoiceNumber}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        <AnimatedCard delay={0.1} className="md:col-span-3 glass p-6 md:p-8 rounded-[24px]">
          <h2 className="text-xl font-serif text-white mb-6">Payment Details</h2>
          
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
              <h3 className="text-sm text-[rgba(255,255,255,0.55)] mb-1">Billed To</h3>
              <p className="text-white font-semibold">{client.company || client.name}</p>
              <p className="text-sm text-white">{client.email}</p>
            </div>
            
            <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] space-y-4">
              <h3 className="text-sm text-[rgba(255,255,255,0.55)] mb-2 border-b border-[rgba(255,255,255,0.06)] pb-2">Line Items</h3>
              {invoice.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-white">{item.description}</span>
                  <span className="text-white font-semibold">₹{item.amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center p-4">
              <span className="text-lg font-serif text-white">Total Amount</span>
              <span className="text-2xl font-serif text-white">₹{invoice.amount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </AnimatedCard>

        <div className="md:col-span-2 space-y-6">
          <AnimatedCard delay={0.2} className="glass p-6 rounded-[24px]">
            <h2 className="text-lg font-serif text-white mb-4 flex items-center">
              <ShieldCheck size={18} className="text-[#30d158] mr-2" />
              Secure Payment
            </h2>
            <p className="text-sm text-[rgba(255,255,255,0.55)] mb-6 leading-relaxed">
              Payments are processed securely via Razorpay. We do not store your card details on our servers.
            </p>
            
            {/* Real Razorpay integration will happen via a client component in Phase 8/9, 
                for now we render a dummy checkout button */}
            <button className="w-full btn-primary py-3 flex justify-center items-center font-bold text-lg opacity-50 cursor-not-allowed">
              Pay ₹{invoice.amount.toLocaleString('en-IN')}
            </button>
            <p className="text-center text-xs text-[#ff9f0a] mt-3">Payment gateway integration pending</p>
          </AnimatedCard>
        </div>
      </div>
    </div>
  );
}
