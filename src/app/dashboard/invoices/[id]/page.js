'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { Mail, FileText, CheckCircle2 } from 'lucide-react';

export default function InvoiceDetailPage({ params }) {
  const { id } = use(params);
  
  const [invoice, setInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await fetch('/api/dashboard/invoices');
        if (res.ok) {
          const data = await res.json();
          const found = data.find(inv => inv._id === id);
          if (found) setInvoice(found);
          else setError('Invoice not found');
        }
      } catch (err) {
        setError('Failed to load invoice');
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  const handleSend = async () => {
    setIsSending(true);
    setError('');
    try {
      const res = await fetch(`/api/dashboard/invoices/${id}/send`, { method: 'PATCH' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send invoice');
      }
      
      setInvoice(prev => ({ ...prev, status: 'sent', sentAt: new Date().toISOString() }));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSending(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  if (isLoading) {
    return <div className="p-8 text-[rgba(255,255,255,0.55)] font-semibold text-center">Loading invoice...</div>;
  }

  if (error || !invoice) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <div className="bg-[rgba(255,69,58,0.15)] text-[#ff453a] p-4 rounded-xl font-medium">{error || 'Invoice not found'}</div>
        <Link href="/dashboard/invoices" className="mt-4 inline-block text-[rgba(255,255,255,0.55)] hover:text-white font-medium">← Back to Invoices</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center space-x-6">
          <Link href="/dashboard/invoices" className="text-[rgba(255,255,255,0.55)] hover:text-white transition-colors text-sm font-semibold">
            ← Back
          </Link>
          <h1 className="text-3xl font-serif text-white tracking-[-0.5px]">Invoice {invoice.invoiceNumber || 'Draft'}</h1>
        </div>
        
        <div className="flex space-x-3">
          {invoice.status === 'draft' && (
            <button 
              onClick={handleSend}
              disabled={isSending}
              className="btn-primary"
            >
              <Mail size={16} className="mr-2" />
              {isSending ? 'Sending...' : 'Send to Client'}
            </button>
          )}
          {invoice.status === 'sent' && (
            <button 
              onClick={handleSend}
              disabled={isSending}
              className="btn-secondary"
            >
              <Mail size={16} className="mr-2" />
              {isSending ? 'Sending...' : 'Resend Invoice'}
            </button>
          )}
        </div>
      </div>

      <div className="glass p-8 md:p-12 space-y-10">
        {error && (
          <div className="p-4 bg-[rgba(255,69,58,0.15)] text-[#ff453a] rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Billed To</h2>
            <p className="text-white">{invoice.clientId?.company || invoice.clientId?.name}</p>
            <p className="text-sm text-[rgba(255,255,255,0.55)]">{invoice.clientId?.email}</p>
          </div>
          
          <div className="text-left md:text-right">
            <h2 className="text-xl font-semibold text-white mb-2">Details</h2>
            <p className="text-sm text-[rgba(255,255,255,0.55)]">Period: {new Date(0, invoice.month - 1).toLocaleString('default', { month: 'long' })} {invoice.year}</p>
            <div className="mt-3">
              <span className={`badge ${
                invoice.status === 'paid' ? 'badge-green' : 
                invoice.status === 'overdue' ? 'badge-red' : 
                invoice.status === 'sent' ? 'badge-blue' : 'badge-yellow'
              }`}>
                {invoice.status.toUpperCase()}
              </span>
            </div>
            {invoice.sentAt && (
              <p className="text-xs text-[rgba(255,255,255,0.4)] mt-2">Sent: {new Date(invoice.sentAt).toLocaleString()}</p>
            )}
            {invoice.paidAt && (
              <p className="text-xs text-[#30d158] mt-2">Paid: {new Date(invoice.paidAt).toLocaleString()}</p>
            )}
          </div>
        </div>

        <div className="divider-inset ml-0" />

        <div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.55)] text-xs font-semibold uppercase tracking-[0.6px]">
                <th className="py-3 font-medium">Description</th>
                <th className="py-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.06)]">
              {invoice.lineItems.map((item, index) => (
                <tr key={index}>
                  <td className="py-4 text-white text-[15px]">{item.description}</td>
                  <td className="py-4 text-right text-white font-medium">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-6">
          <div className="w-full md:w-1/2 space-y-3">
            <div className="flex justify-between text-sm text-[rgba(255,255,255,0.55)]">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-[rgba(255,255,255,0.55)]">
              <span>GST (18%)</span>
              <span>{formatCurrency(invoice.gst)}</span>
            </div>
            <div className="divider-inset ml-0 my-2" />
            <div className="flex justify-between items-center text-lg font-semibold text-white">
              <span>Total</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
