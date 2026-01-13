import React from 'react';

interface LikeProps {
  isLiked: boolean;
  count: number;
  disabled?: boolean;
  onToggle: () => void;
}

const Like: React.FC<LikeProps> = ({ isLiked, count, disabled = false, onToggle }) => {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className={`px-2 py-1 rounded-full border text-xs font-medium
          ${
            isLiked
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {isLiked ? 'Unlike' : 'Like'}
      </button>
      <span className="text-xs text-gray-600">{count} likes</span>
    </div>
  );
};

export default Like;
