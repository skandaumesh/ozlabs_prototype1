'use client';

export default function PinMarker({ comment, index, isSelected, onClick }) {
  return (
    <div
      className={`absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center font-extrabold text-xs cursor-pointer transform transition-transform ${
        isSelected
          ? 'bg-foreground text-background scale-125 z-20'
          : 'bg-card text-foreground hover:scale-110 z-10'
      }`}
      style={{ left: `${comment.x}%`, top: `${comment.y}%` }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(comment);
      }}
    >
      {index + 1}
    </div>
  );
}
