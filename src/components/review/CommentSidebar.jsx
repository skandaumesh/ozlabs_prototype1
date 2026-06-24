'use client';

import { useState } from 'react';

export default function CommentSidebar({ comments, selectedCommentId, onCommentSelect, onAddComment, newPinData, onCancelPin, authorName, setAuthorName }) {
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !authorName.trim() || !newPinData) return;
    
    setIsSubmitting(true);
    await onAddComment({
      ...newPinData,
      text: newCommentText,
      authorName
    });
    setNewCommentText('');
    setIsSubmitting(false);
  };

  return (
    <div className="w-full h-full flex flex-col bg-background">
      <div className="p-6 flex-shrink-0">
        <h2 className="text-lg font-extrabold tracking-tight">COMMENTS</h2>
        <p className="text-sm text-muted font-medium mt-1">Click anywhere on the design to drop a pin.</p>
        
        <div className="mt-5">
          <label className="block text-xs font-bold text-muted uppercase tracking-[0.2em] mb-2">Your Name</label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full px-4 py-3 bg-card rounded-2xl text-foreground placeholder-[#555] outline-none transition-all focus:ring-2 focus:ring-foreground text-sm"
            placeholder="Enter your name to comment"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-4">
        {comments.length === 0 && !newPinData && (
          <div className="text-center py-10 text-muted font-medium text-sm">
            No comments yet. Click on the image to add the first one.
          </div>
        )}
        
        {comments.map((comment, index) => (
          <div 
            key={comment._id}
            id={`comment-${comment._id}`}
            className={`p-4 rounded-2xl transition-colors cursor-pointer ${
              selectedCommentId === comment._id 
                ? 'bg-card-hover' 
                : 'bg-card hover:bg-card-hover'
            }`}
            onClick={() => onCommentSelect(comment._id)}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-extrabold">
                {index + 1}
              </div>
              <span className="font-bold text-sm">{comment.authorName}</span>
              {comment.authorType === 'admin' && (
                <span className="px-2 py-0.5 rounded-md text-[10px] bg-foreground text-background font-bold uppercase tracking-widest">Team</span>
              )}
              <div className="ml-auto text-right">
                <div className="text-xs text-muted font-medium">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </div>
                {comment.imageIndex !== undefined && comment.imageIndex > 0 && (
                  <div className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1">
                    SLIDE {comment.imageIndex + 1}
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm text-muted font-medium mt-1 pl-9">{comment.text}</p>
          </div>
        ))}
        
        {newPinData && (
          <div className="p-4 rounded-2xl bg-card">
            <div className="flex items-center gap-3 mb-3 font-bold text-sm">
              <div className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-extrabold">
                +
              </div>
              New Comment
            </div>
            <form onSubmit={handleSubmit}>
              <textarea
                autoFocus
                className="w-full px-4 py-3 bg-background rounded-2xl text-foreground placeholder-[#555] outline-none focus:ring-2 focus:ring-foreground text-sm mb-3"
                rows="3"
                placeholder="What needs to be changed here?"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                required
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onCancelPin}
                  className="px-4 py-2 text-sm font-bold text-muted bg-background rounded-xl hover:bg-card-hover transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newCommentText.trim() || !authorName.trim()}
                  className="px-4 py-2 text-sm font-bold text-background bg-foreground rounded-xl disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
