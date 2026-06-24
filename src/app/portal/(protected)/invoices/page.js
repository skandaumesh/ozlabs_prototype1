import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Client from '@/models/Client';
import Invoice from '@/models/Invoice';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { AnimatedCard } from '@/components/ui/Motion';
import { Receipt, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default async function ClientInvoicesPage({ params }) {
  const session = await auth();
  
  await dbConnect();
  
  const client = await Client.findById(session.user.id).lean();
  if (!client) notFound();

  const invoices = await Invoice.find({ 
    clientId: client._id,
    status: { $in: ['sent', 'paid', 'overdue'] }
  }).sort({ createdAt: -1 }).lean();

  const getStatusConfig = (status) => {
    switch (status) {
      case 'paid':
        return { color: 'text-[#30d158]', bg: 'bg-[rgba(48,209,88,0.15)]', border: 'border-[rgba(48,209,88,0.3)]', icon: CheckCircle2, label: 'Paid' };
      case 'overdue':
        return { color: 'text-[#ff453a]', bg: 'bg-[rgba(255,69,58,0.15)]', border: 'border-[rgba(255,69,58,0.3)]', icon: AlertCircle, label: 'Overdue' };
      default:
        return { color: 'text-[#ff9f0a]', bg: 'bg-[rgba(255,159,10,0.15)]', border: 'border-[rgba(255,159,10,0.3)]', icon: Clock, label: 'Pending' };
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-serif text-white tracking-[-0.5px]">Invoices & Billing</h1>
        <p className="text-[rgba(255,255,255,0.55)] mt-1">Manage your payments and download past invoices.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {invoices.length === 0 ? (
          <div className="py-20 text-center glass rounded-[24px]">
            <Receipt size={48} className="mx-auto text-[rgba(255,255,255,0.2)] mb-4" />
            <h3 className="text-xl font-serif text-white">No invoices yet</h3>
            <p className="text-[rgba(255,255,255,0.55)] mt-2">When your agency sends an invoice, it will appear here.</p>
          </div>
        ) : (
          invoices.map((invoice, index) => {
            const statusConfig = getStatusConfig(invoice.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <AnimatedCard key={invoice._id} delay={0.1 * (index + 1)} className="glass p-6 md:p-8 rounded-[24px] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${statusConfig.bg} ${statusConfig.color}`}>
                    <Receipt size={24} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-semibold text-white">Invoice {invoice.invoiceNumber}</h2>
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full flex items-center ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border} border`}>
                        <StatusIcon size={10} className="mr-1" />
                        {statusConfig.label}
                      </span>
                    </div>
                    <p className="text-sm text-[rgba(255,255,255,0.55)]">
                      {invoice.items.length > 0 ? invoice.items[0].description : 'Billing'} 
                      {invoice.items.length > 1 && ` + ${invoice.items.length - 1} more`}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:items-end w-full md:w-auto pt-4 md:pt-0 border-t border-[rgba(255,255,255,0.06)] md:border-0">
                  <p className="text-2xl font-serif text-white mb-1">₹{invoice.amount.toLocaleString('en-IN')}</p>
                  <p className="text-sm text-[rgba(255,255,255,0.55)] mb-4 md:mb-0">
                    {invoice.status === 'paid' ? 'Paid on ' : 'Due by '}
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </p>
                  
                  <div className="flex gap-3 mt-4 md:mt-2">
                    {invoice.status !== 'paid' && (
                      <Link 
                        href={`/portal/invoices/${invoice._id}/pay`}
                        className="btn-primary py-2 px-4 text-sm whitespace-nowrap"
                      >
                        Pay Now
                      </Link>
                    )}
                    {/* Placeholder for PDF download in future */}
                    <button className="btn-secondary py-2 px-4 text-sm whitespace-nowrap opacity-50 cursor-not-allowed" disabled>
                      Download PDF
                    </button>
                  </div>
                </div>
              </AnimatedCard>
            );
          })
        )}
      </div>
    </div>
  );
}
