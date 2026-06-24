'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewProjectPage() {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    clientId: '',
    name: '',
    type: 'website_design',
    status: 'active',
    dueDate: ''
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!formData.clientId) {
      setError('Please select a client. If you have no clients, create one first.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/dashboard/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create project');
      }

      router.push('/dashboard/projects');
      router.refresh();
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-fade pb-20">
      <div className="flex items-center space-x-6">
        <Link href="/dashboard/projects" className="text-[rgba(255,255,255,0.55)] hover:text-white transition-colors text-sm font-semibold">
          ← Back
        </Link>
        <h1 className="text-3xl font-serif text-white tracking-[-0.5px]">New Project</h1>
      </div>

      <div className="glass p-8 md:p-10">
        {error && (
          <div className="mb-8 p-4 bg-[rgba(255,69,58,0.15)] text-[#ff453a] rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="label-section">Select Client *</label>
            <select required name="clientId" value={formData.clientId} onChange={handleChange} className="input-glass">
              <option value="" disabled>Select a client</option>
              {clients.map(c => (
                <option key={c._id} value={c._id}>{c.name} {c.company ? `(${c.company})` : ''}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="label-section">Project Name *</label>
            <input required name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Q3 Website Redesign" className="input-glass" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="label-section">Project Type *</label>
              <select required name="type" value={formData.type} onChange={handleChange} className="input-glass">
                <option value="website_design">Website Design</option>
                <option value="social_media">Social Media</option>
                <option value="graphic_design">Graphic Design</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="label-section">Due Date</label>
              <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="input-glass" style={{ colorScheme: 'dark' }} />
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || clients.length === 0}
              className="btn-primary disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
