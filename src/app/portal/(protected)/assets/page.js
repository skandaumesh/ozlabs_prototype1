import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Client from '@/models/Client';
import BrandAsset from '@/models/BrandAsset';
import { notFound } from 'next/navigation';
import { AnimatedCard } from '@/components/ui/Motion';
import { Image as ImageIcon, Download, Palette, Type, ExternalLink } from 'lucide-react';

export default async function ClientAssetsPage({ params }) {
  const session = await auth();
  
  await dbConnect();
  
  const client = await Client.findById(session.user.id).lean();
  if (!client) notFound();

  const brandAsset = await BrandAsset.findOne({ clientId: client._id }).lean();

  if (!brandAsset) {
    return (
      <div className="space-y-8 pb-20">
        <div>
          <h1 className="text-3xl font-serif text-white tracking-[-0.5px]">Brand Assets</h1>
          <p className="text-[rgba(255,255,255,0.55)] mt-1">Access your logos, colors, and design files.</p>
        </div>
        
        <div className="py-20 text-center glass rounded-[24px]">
          <ImageIcon size={48} className="mx-auto text-[rgba(255,255,255,0.2)] mb-4" />
          <h3 className="text-xl font-serif text-white">No assets available</h3>
          <p className="text-[rgba(255,255,255,0.55)] mt-2">Your agency hasn't uploaded any brand assets yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-serif text-white tracking-[-0.5px]">Brand Assets</h1>
        <p className="text-[rgba(255,255,255,0.55)] mt-1">Access your logos, colors, and design files.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <AnimatedCard delay={0.1} className="md:col-span-2 glass p-6 md:p-8 rounded-[24px]">
          <div className="flex items-center mb-6">
            <ImageIcon size={20} className="mr-2 text-[#0a84ff]" />
            <h2 className="text-xl font-serif text-white tracking-[-0.5px]">Primary Logo</h2>
          </div>
          
          <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px]">
            {brandAsset.logoUrl ? (
              <img src={brandAsset.logoUrl} alt={`${client.company} Logo`} className="max-h-48 object-contain" />
            ) : (
              <p className="text-[rgba(255,255,255,0.55)] text-sm">Logo not uploaded</p>
            )}
            
            {brandAsset.logoUrl && (
              <a 
                href={brandAsset.logoUrl} 
                download
                target="_blank"
                rel="noreferrer"
                className="mt-8 btn-secondary py-2 px-4 flex items-center text-sm"
              >
                <Download size={14} className="mr-2" />
                Download Original
              </a>
            )}
          </div>
        </AnimatedCard>

        <div className="space-y-8">
          <AnimatedCard delay={0.2} className="glass p-6 rounded-[24px]">
            <div className="flex items-center mb-6">
              <Palette size={20} className="mr-2 text-[#ff453a]" />
              <h2 className="text-xl font-serif text-white tracking-[-0.5px]">Brand Colors</h2>
            </div>
            
            {brandAsset.brandColors && brandAsset.brandColors.length > 0 ? (
              <div className="space-y-4">
                {brandAsset.brandColors.map((color, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-md mr-3 border border-[rgba(255,255,255,0.1)]" style={{ backgroundColor: color }}></div>
                      <span className="text-white font-mono text-sm uppercase">{color}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[rgba(255,255,255,0.55)] text-sm">No colors defined</p>
            )}
          </AnimatedCard>

          <AnimatedCard delay={0.3} className="glass p-6 rounded-[24px]">
            <div className="flex items-center mb-6">
              <Type size={20} className="mr-2 text-[#30d158]" />
              <h2 className="text-xl font-serif text-white tracking-[-0.5px]">Typography</h2>
            </div>
            
            {brandAsset.fonts && brandAsset.fonts.length > 0 ? (
              <div className="space-y-4">
                {brandAsset.fonts.map((font, i) => (
                  <div key={i} className="p-4 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
                    <p className="text-xl text-white mb-1" style={{ fontFamily: font }}>{font}</p>
                    <p className="text-[10px] text-[rgba(255,255,255,0.55)] uppercase tracking-widest">Aa Bb Cc Dd Ee Ff 123</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[rgba(255,255,255,0.55)] text-sm">No typography defined</p>
            )}
          </AnimatedCard>
        </div>
      </div>
      
      {brandAsset.files && brandAsset.files.length > 0 && (
        <AnimatedCard delay={0.4} className="glass p-6 md:p-8 rounded-[24px]">
          <h2 className="text-xl font-serif text-white tracking-[-0.5px] mb-6">Additional Files</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {brandAsset.files.map((file, i) => (
              <a 
                key={i} 
                href={file.url} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.06)] transition-colors group"
              >
                <div className="flex items-center overflow-hidden">
                  <div className="w-8 h-8 rounded-lg bg-[rgba(10,132,255,0.15)] text-[#0a84ff] flex items-center justify-center mr-3 flex-shrink-0">
                    <ExternalLink size={14} />
                  </div>
                  <span className="text-sm text-white truncate">{file.name}</span>
                </div>
              </a>
            ))}
          </div>
        </AnimatedCard>
      )}
    </div>
  );
}
