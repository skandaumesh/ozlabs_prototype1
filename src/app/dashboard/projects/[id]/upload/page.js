'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';
import { UploadCloud } from 'lucide-react';

export default function UploadVersionPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    if (files.length > 5) {
      setError('You can only upload a maximum of 5 files.');
      return;
    }

    const invalidFiles = files.filter(file => !file.type.startsWith('image/') && file.type !== 'application/pdf');
    if (invalidFiles.length > 0) {
      setError('Only images and PDFs are supported.');
      return;
    }
    
    setSelectedFiles(files);
    setError('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setError('Please select at least one file to upload.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });
      formData.append('projectId', id);

      const res = await fetch('/api/dashboard/versions/upload', {
        method: 'POST',
        body: formData, // FormData doesn't need Content-Type header manually set
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to upload version');
      }

      router.push(`/dashboard/projects/${id}`);
      router.refresh();
    } catch (err) {
      setError(err.message);
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-fade pb-20">
      <div className="flex items-center space-x-6">
        <Link href={`/dashboard/projects/${id}`} className="text-[rgba(255,255,255,0.55)] hover:text-white transition-colors text-sm font-semibold">
          ← Back to Project
        </Link>
        <h1 className="text-3xl font-serif text-white tracking-[-0.5px]">Upload Version</h1>
      </div>

      <div className="glass p-8 md:p-10">
        {error && (
          <div className="mb-8 p-4 bg-[rgba(255,69,58,0.15)] text-[#ff453a] rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-8">
          <div className="border-2 border-dashed border-[rgba(255,255,255,0.12)] rounded-2xl p-12 text-center hover:bg-[rgba(255,255,255,0.02)] transition-colors relative cursor-pointer group">
            <input 
              type="file" 
              multiple
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              accept="image/*,application/pdf" 
              onChange={handleFileSelect}
              disabled={isUploading}
            />
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center group-hover:bg-[rgba(255,255,255,0.1)] transition-colors">
                <UploadCloud size={32} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold mb-1">
                  {selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : 'Click to select or drag and drop (Max 5)'}
                </p>
                <p className="text-sm text-[rgba(255,255,255,0.4)]">
                  {selectedFiles.length > 0 ? 
                    selectedFiles.map(f => f.name).join(', ') : 
                    'PNG, JPG, or PDF up to 10MB'}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <button
              type="submit"
              disabled={isUploading || selectedFiles.length === 0}
              className="btn-primary disabled:opacity-50"
            >
              {isUploading ? 'Uploading & Notifying Client...' : 'Upload & Notify Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
