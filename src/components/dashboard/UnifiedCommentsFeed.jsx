'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function UnifiedCommentsFeed({ comments }) {
  const router = useRouter();
  const [resolvingIds, setResolvingIds] = useState(new Set());

  const handleResolve = async (commentId) => {
    try {
      setResolvingIds(prev => new Set(prev).add(commentId));
      
      const res = await fetch(`/api/comments/${commentId}/resolve`, {
        method: 'PATCH'
      });
      
      if (!res.ok) throw new Error('Failed to resolve comment');
      
      toast.success('Comment resolved');
      router.refresh();
    } catch (err) {
      toast.error('Failed to resolve comment');
      setResolvingIds(prev => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
    }
  };

  if (!comments || comments.length === 0) {
    return (
      <div className="bg-card rounded-[16px] p-8 flex items-center justify-center text-muted text-sm font-medium">
        No open comments right now. You're all caught up.
      </div>
    );
  }

  return (
    <div className="bg-card rounded-[16px] overflow-hidden">
      <ul className="divide-y divide-background">
        {comments.map((comment) => {
          const version = comment.versionId;
          const project = version?.projectId;
          const client = project?.clientId;
          const isResolving = resolvingIds.has(comment._id);

          return (
            <li key={comment._id} className={`p-5 hover:bg-card-hover transition-all ${isResolving ? 'opacity-50 scale-[0.98]' : ''}`}>
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-0.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold ${comment.authorType === 'client' ? 'bg-foreground text-background' : 'bg-[#333] text-foreground'}`}>
                    {comment.authorName.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold truncate">
                      {comment.authorName} <span className="text-muted font-medium ml-1">on</span> {project?.name || 'Unknown'}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted font-medium whitespace-nowrap ml-2">
                      {new Date(comment.createdAt).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                  <p className="text-sm text-foreground mt-1.5 line-clamp-2">
                    "{comment.text}"
                  </p>
                  <div className="mt-4 pt-4 border-t border-background/50">
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3 truncate" title={`${client?.company || 'Unknown'} • V${version?.versionNumber || '?'}`}>
                      {client?.company || 'Unknown'} • V{version?.versionNumber || '?'}
                    </p>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleResolve(comment._id)}
                        disabled={isResolving}
                        className="flex-1 py-2 bg-background hover:bg-[#222] text-foreground text-[10px] font-bold rounded-lg transition-colors uppercase tracking-widest text-center"
                      >
                        {isResolving ? 'Resolving...' : '✓ Resolve'}
                      </button>
                      <Link 
                        href={`/review/${version?.reviewToken}`}
                        target="_blank"
                        className="flex-1 py-2 bg-foreground text-background hover:bg-white/90 text-[10px] font-bold rounded-lg transition-colors uppercase tracking-widest text-center"
                      >
                        View Design →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
