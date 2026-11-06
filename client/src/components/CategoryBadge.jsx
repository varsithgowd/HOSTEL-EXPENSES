import React from 'react';
import { CATEGORY_CONFIG } from '../utils/formatters';

export const CategoryBadge = ({ category }) => {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.Other;

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border"
      style={{
        backgroundColor: config.bg,
        borderColor: config.border,
        color: config.color,
      }}
    >
      {category}
    </span>
  );
};

export default CategoryBadge;
