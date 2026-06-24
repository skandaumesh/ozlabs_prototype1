'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewInvoicePage() {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    clientId: '',
    month: currentMonth,
    year: currentYear,
    items: [{ description: '', amount: '' }]
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch('/api/dashboard/clients');
        if (res.ok) {
          const data = await res.json();
          setClients(data);
          if (data.length > 0) {
            setFormData(prev => ({ ...prev, clientId: data[0]._id }));
          }
        }
      } catch (err) {
        console.error('Failed to load clients', err);
      }
    };
    fetchClients();
  }, []);

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({ ...formData, items: [...formData.items, { description: '', amount: '' }] });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!formData.clientId) {
      setError('Please select a client.');
      setIsSubmitting(false);
      return;
    }

    const validItems = formData.items.filter(item => item.description && item.amount);
    if (validItems.length === 0) {
      setError('Please add at least one valid line item.');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        clientId: formData.clientId,
        month: Number(formData.month),
        year: Number(formData.year),
        lineItems: validItems.map(item => ({
          description: item.description,
          amount: Number(item.amount)
        }))
      };

      const res = await fetch('/api/dashboard/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create invoice');
      }

      router.push('/dashboard/invoices');
      router.refresh();
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-fade pb-20">
      <div className="flex items-center space-x-6">
        <Link href="/dashboard/invoices" className="text-[rgba(255,255,255,0.55)] hover:text-white transition-colors text-sm font-semibold">
          ← Back
        </Link>
        <h1 className="text-3xl font-serif text-white tracking-[-0.5px]">New Invoice</h1>
      </div>

      <div className="glass p-8 md:p-10">
        {error && (
          <div className="mb-8 p-4 bg-[rgba(255,69,58,0.15)] text-[#ff453a] rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 md:col-span-3">
              <label className="label-section">Select Client *</label>
              <select required value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})} className="input-glass">
                <option value="" disabled>Select a client</option>
                {clients.map(c => (
                  <option key={c._id} value={c._id}>{c.company || c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="label-section">Billing Month</label>
              <select value={formData.month} onChange={e => setFormData({...formData, month: e.target.value})} className="input-glass">
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="label-section">Billing Year</label>
              <input type="number" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="input-glass" />
            </div>
          </div>

          <div className="divider-inset ml-0 my-8" />
          
          <div>
            <div className="flex justify-between items-end mb-6">
              <h3 className="text-xl font-serif text-white tracking-[-0.5px]">Line Items</h3>
              <button type="button" onClick={addItem} className="text-sm font-semibold text-[#0a84ff] hover:text-white transition-colors">
                + Add Item
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="flex-1">
                    <input 
                      placeholder="Description" 
                      value={item.description} 
                      onChange={e => handleItemChange(index, 'description', e.target.value)} 
                      className="input-glass"
                      required
                    />
                  </div>
                  <div className="w-1/3">
                    <input 
                      type="number"
                      placeholder="Amount (₹)" 
                      value={item.amount} 
                      onChange={e => handleItemChange(index, 'amount', e.target.value)} 
                      className="input-glass"
                      required
                    />
                  </div>
                  {formData.items.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeItem(index)} 
                      className="btn-dismiss mt-3 flex-shrink-0"
                      title="Remove Item"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[12px] text-[rgba(255,255,255,0.4)] mt-4">18% GST will be calculated automatically upon creation.</p>
          </div>

          <div className="pt-6 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || clients.length === 0}
              className="btn-primary disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Invoice (Draft)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
