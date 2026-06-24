'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch('/api/dashboard/clients');
        if (res.ok) {
          const data = await res.json();
          setClients(data);
        }
      } catch (error) {
        console.error('Failed to load clients', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, []);

  return (
    <div className="space-y-8 animate-fade pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-serif text-white tracking-[-0.5px]">Clients</h1>
        </div>
        <Link 
          href="/dashboard/clients/new"
          className="btn-primary"
        >
          Add Client
        </Link>
      </div>

      <div className="glass overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-[rgba(255,255,255,0.55)] font-semibold">Loading clients...</div>
        ) : clients.length === 0 ? (
          <div className="p-12 text-center text-[rgba(255,255,255,0.55)] font-semibold">
            No clients found. Click the button above to add your first client.
          </div>
        ) : (
          <ul className="flex flex-col">
            {clients.map((client, index) => (
              <li key={client._id} className={`${index !== 0 ? 'divider-inset' : ''} p-5 hover:bg-[rgba(255,255,255,0.02)] transition-colors group`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex flex-col">
                    <p className="font-semibold text-white text-[15px]">{client.name}</p>
                    <p className="text-[13px] text-[rgba(255,255,255,0.55)] font-medium mt-1">
                      {client.company || '-'} • {client.email}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col text-right">
                      <p className="label-section text-[11px]">Billing Day</p>
                      <p className="text-[13px] text-[rgba(255,255,255,0.55)] font-medium">
                        {client.billingProfile?.billingDate ? `Day ${client.billingProfile.billingDate}` : 'Not set'}
                      </p>
                    </div>
                    
                    <Link 
                      href={`/dashboard/clients/${client._id}`}
                      className="btn-secondary py-2 px-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      View
                    </Link>
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
