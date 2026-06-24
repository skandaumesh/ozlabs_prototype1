'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewClientPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    billingDate: '1',
    retainerAmount: '',
    autoInvoice: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        billingProfile: {
          retainerAmount: Number(formData.retainerAmount) || 0,
          billingDate: Number(formData.billingDate),
          autoInvoice: formData.autoInvoice
        }
      };

      const res = await fetch('/api/dashboard/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create client');
      }

      router.push('/dashboard/clients');
      router.refresh();
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-fade pb-20">
      <div className="flex items-center space-x-6">
        <Link href="/dashboard/clients" className="text-[rgba(255,255,255,0.55)] hover:text-white transition-colors text-sm font-semibold">
          ← Back
        </Link>
        <h1 className="text-3xl font-serif text-white tracking-[-0.5px]">New Client</h1>
      </div>

      <div className="glass p-8 md:p-10">
        {error && (
          <div className="mb-8 p-4 bg-[rgba(255,69,58,0.15)] text-[#ff453a] rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="label-section">Full Name *</label>
              <input required name="name" value={formData.name} onChange={handleChange} className="input-glass" />
            </div>
            
            <div className="space-y-2">
              <label className="label-section">Email Address *</label>
              <input required type="email" name="email" value={formData.email} onChange={handleChange} className="input-glass" />
            </div>

            <div className="space-y-2">
              <label className="label-section">Company Name</label>
              <input name="company" value={formData.company} onChange={handleChange} className="input-glass" />
            </div>

            <div className="space-y-2">
              <label className="label-section">Phone Number</label>
              <input name="phone" value={formData.phone} onChange={handleChange} className="input-glass" />
            </div>

          </div>

          <div className="divider-inset ml-0 my-8" />
          
          <h3 className="text-xl font-serif text-white tracking-[-0.5px] mb-6">Billing Profile</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="label-section">Monthly Retainer (₹)</label>
              <input type="number" min="0" name="retainerAmount" value={formData.retainerAmount} onChange={handleChange} placeholder="e.g. 50000" className="input-glass" />
            </div>

            <div className="space-y-2">
              <label className="label-section">Billing Date (Day of Month)</label>
              <input type="number" min="1" max="28" required name="billingDate" value={formData.billingDate} onChange={handleChange} className="input-glass" />
            </div>
          </div>

          <label className="flex items-center space-x-4 mt-6 cursor-pointer group">
            <div className="relative flex items-center justify-center w-6 h-6 rounded-md border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.06)] group-hover:border-[rgba(255,255,255,0.2)] transition-colors">
              <input type="checkbox" name="autoInvoice" checked={formData.autoInvoice} onChange={handleChange} className="absolute opacity-0 w-full h-full cursor-pointer" />
              {formData.autoInvoice && (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-[rgba(255,255,255,0.55)] text-sm font-medium">Enable automated monthly invoice generation</span>
          </label>

          <div className="pt-6 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
