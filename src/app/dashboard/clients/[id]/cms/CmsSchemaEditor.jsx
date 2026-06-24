'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save, AlertCircle, Webhook } from 'lucide-react';

export default function CmsSchemaEditor({ clientId, initialFields, initialWebhookUrl }) {
  const [fields, setFields] = useState(initialFields || []);
  const [vercelWebhookUrl, setVercelWebhookUrl] = useState(initialWebhookUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const addField = () => {
    setFields([...fields, { key: '', label: '', type: 'text', value: '' }]);
  };

  const removeField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index, key, val) => {
    const newFields = [...fields];
    newFields[index][key] = val;
    
    // Auto-generate key from label if key is empty
    if (key === 'label' && !newFields[index].key) {
      newFields[index].key = val.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
    }
    
    setFields(newFields);
  };

  const saveSchema = async () => {
    // Validate
    const hasEmptyKeys = fields.some(f => !f.key || !f.label);
    if (hasEmptyKeys) {
      setMessage('All fields must have a Key and Label');
      return;
    }

    const keys = fields.map(f => f.key);
    if (new Set(keys).size !== keys.length) {
      setMessage('All Keys must be unique');
      return;
    }

    setIsSaving(true);
    setMessage('');

    try {
      const res = await fetch(`/api/dashboard/clients/${clientId}/cms`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields, vercelWebhookUrl }),
      });

      if (!res.ok) throw new Error('Failed to save schema');

      setMessage('Schema saved successfully!');
      router.refresh();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-semibold ${
          message.includes('successfully') ? 'bg-[rgba(48,209,88,0.1)] text-[#30d158]' : 'bg-[rgba(255,69,58,0.1)] text-[#ff453a]'
        }`}>
          <AlertCircle size={16} />
          {message}
        </div>
      )}

      <div className="space-y-4 pt-4 border-t border-[rgba(255,255,255,0.1)]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Webhook size={16} className="text-[#0a84ff]" /> Vercel Deploy Webhook
            </h3>
            <p className="text-[10px] text-[rgba(255,255,255,0.55)] mt-1">If the client's website is a static Vercel build, paste the Deploy Hook URL here. It will automatically rebuild when they publish changes.</p>
          </div>
        </div>
        <input
          type="url"
          value={vercelWebhookUrl}
          onChange={(e) => setVercelWebhookUrl(e.target.value)}
          placeholder="https://api.vercel.com/v1/integrations/deploy/..."
          className="input-field font-mono text-sm"
        />
      </div>

      {fields.length === 0 ? (
        <div className="text-center p-8 border border-dashed border-[rgba(255,255,255,0.1)] rounded-xl">
          <p className="text-[rgba(255,255,255,0.55)] text-sm mb-4">No content fields defined yet.</p>
          <button onClick={addField} className="btn-secondary">
            <Plus size={16} className="mr-2" />
            Add First Field
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-4 p-4 bg-[rgba(255,255,255,0.02)] rounded-xl border border-[rgba(255,255,255,0.05)]">
              <div className="flex-1 space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[rgba(255,255,255,0.5)]">Label</label>
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => updateField(index, 'label', e.target.value)}
                  placeholder="e.g. Hero Title"
                  className="input-field"
                />
              </div>
              
              <div className="flex-1 space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[rgba(255,255,255,0.5)]">API Key</label>
                <input
                  type="text"
                  value={field.key}
                  onChange={(e) => updateField(index, 'key', e.target.value)}
                  placeholder="e.g. hero_title"
                  className="input-field font-mono text-sm"
                />
              </div>

              <div className="w-full md:w-48 space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[rgba(255,255,255,0.5)]">Field Type</label>
                <select
                  value={field.type}
                  onChange={(e) => updateField(index, 'type', e.target.value)}
                  className="input-field appearance-none"
                >
                  <option value="text">Short Text</option>
                  <option value="textarea">Long Text (Paragraph)</option>
                  <option value="image">Image Upload</option>
                </select>
              </div>

              <div className="flex items-end pb-1">
                <button
                  onClick={() => removeField(index)}
                  className="p-3 text-[rgba(255,255,255,0.3)] hover:text-[#ff453a] hover:bg-[rgba(255,69,58,0.1)] rounded-lg transition-colors"
                  title="Remove Field"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          <button onClick={addField} className="text-sm font-semibold text-[#0a84ff] hover:text-white transition-colors flex items-center">
            <Plus size={16} className="mr-1" /> Add Another Field
          </button>
        </div>
      )}

      <div className="pt-6 border-t border-[rgba(255,255,255,0.1)] flex justify-end">
        <button 
          onClick={saveSchema} 
          disabled={isSaving}
          className="btn-primary"
        >
          {isSaving ? 'Saving...' : (
            <>
              <Save size={16} className="mr-2" />
              Save CMS Schema
            </>
          )}
        </button>
      </div>
    </div>
  );
}
