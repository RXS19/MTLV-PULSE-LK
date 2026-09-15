import React from 'react';

interface MotoluvIsotypeProps {
  className?: string;
  withBackground?: boolean;
  backgroundClassName?: string;
}

export const MotoluvIsotype: React.FC<MotoluvIsotypeProps> = ({
  className = 'w-6 h-6',
  withBackground = false,
  backgroundClassName = '',
}) => {
  if (withBackground) {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-lg bg-black border border-red-600/30 p-1.5 shadow-[0_0_12px_rgba(238,28,37,0.15)] ${backgroundClassName}`}
      >
        <svg
          viewBox="0 0 512 512"
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 3 Parallel Red Slanted Bars */}
          <polygon points="70,207 318,78 318,150 70,279" fill="#EE1C25" />
          <polygon points="70,317 442,123 442,195 70,389" fill="#EE1C25" />
          <polygon points="194,362 442,233 442,305 194,434" fill="#EE1C25" />
        </svg>
      </div>
    );
  }

  return (
    <svg
      viewBox="0 0 512 512"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 3 Parallel Red Slanted Bars */}
      <polygon points="70,207 318,78 318,150 70,279" fill="#EE1C25" />
      <polygon points="70,317 442,123 442,195 70,389" fill="#EE1C25" />
      <polygon points="194,362 442,233 442,305 194,434" fill="#EE1C25" />
    </svg>
  );
};
