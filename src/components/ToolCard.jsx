import React, { memo, useCallback } from 'react';
import * as Icons from 'lucide-react';

const ToolCard = memo(({ tool }) => {
  const IconComponent = Icons[tool.icon] || Icons.Wrench;

  const handleClick = useCallback(() => {
    if (window.electronAPI) {
      window.electronAPI.openToolWindow(tool.name.toLowerCase().replace(' ', '-'));
    } else {
      // Fallback for development
      console.log(`Opening ${tool.name}`);
    }
  }, [tool.name]);

  return (
    <div
      onClick={handleClick}
      className="bg-white dark:bg-zinc-800 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-6 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-300 dark:hover:border-emerald-600"
    >
      <div className="flex items-center mb-4">
        <IconComponent className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mr-3" />
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{tool.name}</h3>
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{tool.category}</p>
    </div>
  );
});

ToolCard.displayName = 'ToolCard';

export default ToolCard;