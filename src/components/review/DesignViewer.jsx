'use client';

import { useState, useRef } from 'react';
import PinMarker from './PinMarker';

export default function DesignViewer({ version, comments, selectedCommentId, onCommentSelect, onImageClick, currentImageIndex = 0, setCurrentImageIndex }) {
  const imageRef = useRef(null);
  
  // Safe fallback if the data structure is old
  const images = version.fileUrls || (version.fileUrl ? [version.fileUrl] : []);

  const handleClick = (e) => {
    if (!imageRef.current) return;
    
    // Calculate percentage based coordinates
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    onImageClick(x, y);
  };

  const hasMultiple = images.length > 1;

  const nextImage = (e) => {
    e.stopPropagation();
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  return (
    <div className="relative inline-block rounded-[20px] overflow-hidden max-w-full">
      <div 
        ref={imageRef}
        className="relative cursor-crosshair group"
        onClick={handleClick}
      >
        <img 
          src={images[currentImageIndex]} 
          alt={`Version ${version.versionNumber} - Slide ${currentImageIndex + 1}`}
          className="max-w-full h-auto max-h-[80vh] object-contain transition-opacity duration-300"
        />
        
        {hasMultiple && (
          <>
            <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-foreground">
              {currentImageIndex + 1} / {images.length}
            </div>

            <button 
              onClick={prevImage}
              disabled={currentImageIndex === 0}
              className={`absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-background/90 hover:bg-foreground text-foreground hover:text-background rounded-full shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 z-10 font-bold`}
            >
              ←
            </button>

            <button 
              onClick={nextImage}
              disabled={currentImageIndex === images.length - 1}
              className={`absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-background/90 hover:bg-foreground text-foreground hover:text-background rounded-full shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 z-10 font-bold`}
            >
              →
            </button>
          </>
        )}
        
        {comments.map((comment, index) => {
          // Only show pins for the current image
          const commentImageIndex = comment.imageIndex || 0;
          if (commentImageIndex !== currentImageIndex) return null;

          return (
            <PinMarker
              key={comment._id}
              comment={comment}
              index={index}
              isSelected={selectedCommentId === comment._id}
              onClick={() => onCommentSelect(comment._id)}
            />
          );
        })}
      </div>
    </div>
  );
}
