import dbConnect from '@/lib/mongodb';
import Client from '@/models/Client';
import Project from '@/models/Project';
import Invoice from '@/models/Invoice';
import BrandAsset from '@/models/BrandAsset';
import ClientIntegration from '@/models/ClientIntegration';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Settings, Image as ImageIcon, Camera, LineChart, BarChart3 } from 'lucide-react';

export default async function ClientProfilePage({ params }) {
  const { id } = await params;
  
  await dbConnect();

  const client = await Client.findById(id).lean();
  
  if (!client) {
    notFound();
  }

  const [projects, invoices, brandAsset, integrations] = await Promise.all([
    Project.find({ clientId: id }).sort({ createdAt: -1 }).lean(),
    Invoice.find({ clientId: id }).sort({ createdAt: -1 }).lean(),
    BrandAsset.findOne({ clientId: id }).lean(),
    ClientIntegration.find({ clientId: id }).lean(),
  ]);

  const hasInstagram = integrations.some(i => i.platform === 'instagram');
  const hasGA = integrations.some(i => i.platform === 'google_analytics');

  return (
    <div className="space-y-10 animate-fade max-w-5xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center space-x-6">
          <Link href="/dashboard/clients" className="text-[rgba(255,255,255,0.55)] hover:text-white transition-colors text-sm font-semibold">
            ← Back
          </Link>
          <h1 className="text-3xl font-serif text-white tracking-[-0.5px]">{client.company || client.name}</h1>
        </div>
        <div className="flex space-x-3">
          <Link 
            href={`/dashboard/clients/${id}/analytics`}
            className="btn-primary !text-[14px] !px-5 !py-3"
          >
            <BarChart3 size={16} className="mr-2" />
            Analytics
          </Link>
          <Link 
            href={`/dashboard/clients/${id}/integrations`}
            className="btn-secondary"
          >
            <Settings size={16} className="mr-2" />
            Integrations
          </Link>
        </div>
      </div>

      <div className="glass p-8 md:p-10 flex flex-col md:flex-row justify-between items-start gap-8">
        <div className="space-y-1">
          <p className="label-section">Contact</p>
          <p className="text-lg font-semibold text-white">{client.name}</p>
          <p className="text-sm text-[rgba(255,255,255,0.55)]">{client.email}</p>
          {client.phone && <p className="text-sm text-[rgba(255,255,255,0.55)]">{client.phone}</p>}
        </div>

        <div className="space-y-1">
          <p className="label-section">Billing Profile</p>
          <p className="text-sm text-white">Retainer: <span className="font-semibold">₹{client.billingProfile?.retainerAmount?.toLocaleString('en-IN') || 0}</span></p>
          <p className="text-sm text-[rgba(255,255,255,0.55)]">
            Bills on day {client.billingProfile?.billingDate || 1}
            {client.billingProfile?.autoInvoice ? ' (Auto)' : ' (Manual)'}
          </p>
        </div>

        <div className="space-y-1">
          <p className="label-section">Portal Access</p>
          <Link 
            href="/portal/login"
            target="_blank"
            className="text-sm text-[#0a84ff] hover:underline"
          >
            Open Client Portal ↗
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-xl font-serif text-white tracking-[-0.5px]">Projects</h2>
          <div className="glass overflow-hidden">
            {projects.length === 0 ? (
              <div className="p-8 text-center text-[rgba(255,255,255,0.55)] text-sm font-semibold">
                No projects yet.
              </div>
            ) : (
              <ul className="flex flex-col">
                {projects.map((project, index) => (
                  <li key={project._id} className={`${index !== 0 ? 'divider-inset' : ''} p-5 hover:bg-[rgba(255,255,255,0.02)] transition-colors group`}>
                    <Link href={`/dashboard/projects/${project._id}`} className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-white text-[15px] group-hover:text-[#0a84ff] transition-colors">{project.name}</h3>
                        <p className="text-[13px] text-[rgba(255,255,255,0.55)] mt-1">{project.type.replace('_', ' ')}</p>
                      </div>
                      <span className={`badge ${project.status === 'active' ? 'badge-blue' : 'badge-green'}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-serif text-white tracking-[-0.5px]">Invoices</h2>
          <div className="glass overflow-hidden">
            {invoices.length === 0 ? (
              <div className="p-8 text-center text-[rgba(255,255,255,0.55)] text-sm font-semibold">
                No invoices generated yet.
              </div>
            ) : (
              <ul className="flex flex-col">
                {invoices.map((invoice, index) => (
                  <li key={invoice._id} className={`${index !== 0 ? 'divider-inset' : ''} p-5 hover:bg-[rgba(255,255,255,0.02)] transition-colors`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-white text-[15px]">₹{invoice.total?.toLocaleString('en-IN')}</h3>
                        <p className="text-[13px] text-[rgba(255,255,255,0.55)] mt-1">{invoice.invoiceNumber} • {invoice.month}/{invoice.year}</p>
                      </div>
                      <span className={`badge ${
                        invoice.status === 'paid' ? 'badge-green' : 
                        invoice.status === 'overdue' ? 'badge-red' : 
                        invoice.status === 'sent' ? 'badge-blue' : 'badge-yellow'
                      }`}>
                        {invoice.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-serif text-white tracking-[-0.5px]">Brand Assets</h2>
          <div className="glass p-8">
            {brandAsset ? (
              <div className="space-y-4">
                {brandAsset.logoUrl ? (
                  <div className="flex items-center space-x-4">
                    <img src={brandAsset.logoUrl} alt="Logo" className="w-12 h-12 rounded-lg bg-white object-contain p-1" />
                    <span className="text-sm font-medium text-white">Logo Uploaded</span>
                  </div>
                ) : (
                  <p className="text-sm text-[rgba(255,255,255,0.55)]">No logo uploaded.</p>
                )}
                
                {brandAsset.brandColors?.length > 0 && (
                  <div>
                    <p className="label-section mb-2">Colors</p>
                    <div className="flex space-x-2">
                      {brandAsset.brandColors.map((color, i) => (
                        <div key={i} className="w-8 h-8 rounded-full border border-[rgba(255,255,255,0.1)]" style={{ backgroundColor: color }} title={color} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <ImageIcon className="mx-auto text-[rgba(255,255,255,0.2)] mb-3" size={32} />
                <p className="text-sm text-[rgba(255,255,255,0.55)]">No brand assets configured.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif text-white tracking-[-0.5px]">Integrations</h2>
            <Link href={`/dashboard/clients/${id}/integrations`} className="text-xs font-semibold text-[#0a84ff] hover:underline">
              Manage
            </Link>
          </div>
          <div className="glass p-8 space-y-4">
            <div className="flex items-center justify-between p-4 bg-[rgba(255,255,255,0.03)] rounded-xl border border-[rgba(255,255,255,0.06)]">
              <div className="flex items-center space-x-3">
                <Camera size={20} className={client.socialProfile?.instagramUrl ? "text-[#E1306C]" : "text-[rgba(255,255,255,0.3)]"} />
                <span className="text-sm font-semibold text-white">Instagram</span>
              </div>
              <span className={`badge ${client.socialProfile?.instagramUrl ? 'badge-green' : 'badge-yellow'}`}>
                {client.socialProfile?.instagramUrl ? 'Connected' : 'Not Connected'}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-[rgba(255,255,255,0.03)] rounded-xl border border-[rgba(255,255,255,0.06)]">
              <div className="flex items-center space-x-3">
                <LineChart size={20} className={client.socialProfile?.websiteUrl ? "text-[#0a84ff]" : "text-[rgba(255,255,255,0.3)]"} />
                <span className="text-sm font-semibold text-white">Website / Analytics</span>
              </div>
              <span className={`badge ${client.socialProfile?.websiteUrl ? 'badge-green' : 'badge-yellow'}`}>
                {client.socialProfile?.websiteUrl ? 'Connected' : 'Not Connected'}
              </span>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif text-white tracking-[-0.5px]">Headless CMS</h2>
            <Link href={`/dashboard/clients/${id}/cms`} className="text-xs font-semibold text-[#0a84ff] hover:underline">
              Manage Schema
            </Link>
          </div>
          <div className="glass p-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#0a84ff]/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-[#0a84ff]/20">
                <Settings size={24} className="text-[#0a84ff]" />
              </div>
              <h3 className="text-white font-bold mb-2">Website Content Engine</h3>
              <p className="text-[13px] text-[rgba(255,255,255,0.55)] leading-relaxed">
                Define the content fields for this client's external website and give them editing access in their portal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
