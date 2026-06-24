'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatedCard, AnimatedButton } from '@/components/ui/Motion';
import { MessageSquare, CheckCircle, ChevronLeft } from 'lucide-react';

export default function ClientReviewPage({ version, comments: initialComments, portalToken }) {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  
  const images = version.fileUrls && version.fileUrls.length > 0 
    ? version.fileUrls 
    : (version.fileUrl ? [version.fileUrl] : []);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/portal/${portalToken}/review/${version.reviewToken}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newComment }),
      });

      if (!res.ok) throw new Error('Failed to post comment');
      const data = await res.json();
      setComments([...comments, data]);
      setNewComment('');
    } catch (error) {
      console.error(error);
      alert('Failed to post comment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this version?')) return;
    
    setIsApproving(true);
    try {
      const res = await fetch(`/api/portal/${portalToken}/review/${version.reviewToken}/approve`, {
        method: 'PATCH',
      });
      if (!res.ok) throw new Error('Failed to approve');
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert('Failed to approve version.');
      setIsApproving(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <Link href={`/portal/${portalToken}/projects`} className="text-[rgba(255,255,255,0.55)] hover:text-white transition-colors text-sm font-semibold flex items-center mb-4">
            <ChevronLeft size={16} className="mr-1" />
            Back to Projects
          </Link>
          <h1 className="text-3xl font-serif text-white tracking-[-0.5px]">
            {version.projectId.name} <span className="text-[rgba(255,255,255,0.3)] font-sans text-xl ml-2 tracking-normal">V{version.versionNumber}</span>
          </h1>
        </div>
        
        {version.status !== 'approved' && (
          <AnimatedButton 
            onClick={handleApprove}
            disabled={isApproving}
            className="px-6 py-3 bg-[#30d158] hover:bg-[#28b64c] text-black font-semibold rounded-2xl transition-colors disabled:opacity-50 flex items-center"
          >
            <CheckCircle size={18} className="mr-2" />
            {isApproving ? 'Approving...' : 'Approve Version'}
          </AnimatedButton>
        )}
        {version.status === 'approved' && (
          <div className="px-6 py-3 bg-[rgba(48,209,88,0.15)] text-[#30d158] border border-[rgba(48,209,88,0.3)] font-semibold rounded-2xl flex items-center">
            <CheckCircle size={18} className="mr-2" />
            Approved
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <AnimatedCard delay={0.1} className="lg:col-span-2 glass overflow-hidden rounded-[24px]">
          {version.fileType === 'image' && images.length > 0 ? (
            <div className="flex flex-col space-y-4 max-h-[800px] overflow-y-auto custom-scrollbar bg-[rgba(0,0,0,0.5)] p-4">
              {images.map((imgUrl, i) => (
                <img key={i} src={imgUrl} alt={`Version ${version.versionNumber} part ${i+1}`} className="w-full h-auto object-contain rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="w-full h-96 flex items-center justify-center bg-[rgba(0,0,0,0.5)]">
              <p className="text-[rgba(255,255,255,0.55)]">PDF Preview Not Available. Please download.</p>
            </div>
          )}
        </AnimatedCard>

        <AnimatedCard delay={0.2} className="glass p-6 md:p-8 flex flex-col h-[600px] rounded-[24px]">
          <h2 className="text-xl font-serif text-white tracking-[-0.5px] mb-6 flex items-center">
            <MessageSquare size={18} className="mr-2 text-[rgba(255,255,255,0.55)]" />
            Comments
          </h2>
          
          <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 custom-scrollbar">
            {comments.length === 0 ? (
              <p className="text-[rgba(255,255,255,0.55)] text-sm text-center py-10">No comments yet.</p>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className={`p-4 rounded-xl ${comment.authorType === 'admin' ? 'bg-[rgba(10,132,255,0.15)] border border-[rgba(10,132,255,0.2)] ml-8' : 'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.06)] mr-8'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-[rgba(255,255,255,0.55)]">{comment.authorName}</span>
                    <span className="text-[10px] text-[rgba(255,255,255,0.4)]">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-white">{comment.text}</p>
                </div>
              ))
            )}
          </div>
          
          {version.status !== 'approved' && (
            <form onSubmit={handleAddComment} className="mt-auto">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Request a change..."
                  className="flex-1 px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-sm text-white placeholder-[rgba(255,255,255,0.3)] outline-none focus:border-[rgba(255,255,255,0.3)] transition-colors"
                />
                <AnimatedButton 
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="px-4 py-3 bg-white hover:bg-[#e6e6e6] text-black font-semibold rounded-xl transition-colors disabled:opacity-50 text-sm"
                >
                  Post
                </AnimatedButton>
              </div>
            </form>
          )}
        </AnimatedCard>
      </div>
    </div>
  );
}
