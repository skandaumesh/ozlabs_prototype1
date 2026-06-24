'use client';

import { useState } from 'react';
import { Save, AlertCircle, Upload, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CmsClientEditor({ initialFields }) {
  const [values, setValues] = useState(() => {
    const initialState = {};
    initialFields.forEach(f => {
      initialState[f.key] = f.value;
    });
    return initialState;
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(null);
  const router = useRouter();

  const handleInputChange = (key, val) => {
    setValues(prev => ({ ...prev, [key]: val }));
  };

  const handleImageUpload = async (key, file) => {
    if (!file) return;
    setUploadingImage(key);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      
      handleInputChange(key, data.url);
    } catch (err) {
      alert(err.message);
    } finally {
      setUploadingImage(null);
    }
  };

  const publishChanges = async () => {
    setIsSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/portal/cms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: values }),
      });

      if (!res.ok) throw new Error('Failed to publish changes');

      setMessage('Website updated successfully!');
      router.refresh();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-semibold ${
          message.includes('successfully') ? 'bg-[rgba(48,209,88,0.1)] text-[#30d158]' : 'bg-[rgba(255,69,58,0.1)] text-[#ff453a]'
        }`}>
          <AlertCircle size={16} />
          {message}
        </div>
      )}

      <div className="space-y-6">
        {initialFields.map(field => (
          <div key={field.key} className="space-y-2 pb-6 border-b border-[rgba(255,255,255,0.05)] last:border-0">
            <label className="block text-sm font-bold text-white">{field.label}</label>
            
            {field.type === 'text' && (
              <input
                type="text"
                value={values[field.key] || ''}
                onChange={(e) => handleInputChange(field.key, e.target.value)}
                className="input-field w-full"
              />
            )}

            {field.type === 'textarea' && (
              <textarea
                value={values[field.key] || ''}
                onChange={(e) => handleInputChange(field.key, e.target.value)}
                className="input-field w-full min-h-[120px] resize-y"
              />
            )}

            {field.type === 'image' && (
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {values[field.key] ? (
                  <img src={values[field.key]} alt={field.label} className="w-32 h-32 object-cover rounded-xl bg-black/50 border border-[rgba(255,255,255,0.1)]" />
                ) : (
                  <div className="w-32 h-32 rounded-xl bg-black/50 border border-dashed border-[rgba(255,255,255,0.2)] flex items-center justify-center text-[rgba(255,255,255,0.3)]">
                    <ImageIcon size={32} />
                  </div>
                )}
                <div>
                  <label className="btn-secondary cursor-pointer inline-flex">
                    {uploadingImage === field.key ? 'Uploading...' : (
                      <>
                        <Upload size={16} className="mr-2" />
                        Replace Image
                      </>
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden" 
                      onChange={(e) => handleImageUpload(field.key, e.target.files[0])}
                      disabled={uploadingImage === field.key}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-4 flex justify-end">
        <button 
          onClick={publishChanges} 
          disabled={isSaving || uploadingImage}
          className="btn-primary px-8"
        >
          {isSaving ? 'Publishing...' : (
            <>
              <Save size={16} className="mr-2" />
              Publish Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
