'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch('/api/dashboard/invoices');
        if (res.ok) {
          const data = await res.json();
          setInvoices(data);
        }
      } catch (error) {
        console.error('Failed to load invoices', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  return (
    <div className="space-y-8 animate-fade pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-serif text-white tracking-[-0.5px]">Invoices</h1>
        </div>
        <Link 
          href="/dashboard/invoices/new"
          className="btn-primary"
        >
          New Invoice
        </Link>
      </div>

      <div className="glass overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-[rgba(255,255,255,0.55)] font-semibold">Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center text-[rgba(255,255,255,0.55)] font-semibold">
            No invoices found. They will appear here once generated.
          </div>
        ) : (
          <ul className="flex flex-col">
            {invoices.map((invoice, index) => (
              <li key={invoice._id} className={`${index !== 0 ? 'divider-inset' : ''} p-5 hover:bg-[rgba(255,255,255,0.02)] transition-colors group`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex flex-col">
                    <p className="font-semibold text-white text-[15px]">{invoice.invoiceNumber || 'Draft'}</p>
                    <p className="text-[13px] text-[rgba(255,255,255,0.55)] font-medium mt-1">
                      {invoice.clientId?.company || invoice.clientId?.name || 'Unknown Client'}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col text-right">
                      <p className="label-section text-[11px]">Amount</p>
                      <p className="text-[15px] text-white font-semibold">
                        {formatCurrency(invoice.total || 0)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className={`badge ${
                        invoice.status === 'paid' ? 'badge-green' : 
                        invoice.status === 'overdue' ? 'badge-red' : 
                        invoice.status === 'sent' ? 'badge-blue' : 'badge-yellow'
                      }`}>
                        {(invoice.status || 'draft')}
                      </span>
                      
                      <Link 
                        href={`/dashboard/invoices/${invoice._id}`}
                        className="btn-secondary py-2 px-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
