/**
 * Live App Button - Direct access to GitHub Pages deployment
 */

import { ExternalLink } from 'lucide-react';

export function LiveAppButton() {
  const githubPagesUrl = "https://stephtonybro.github.io/Bytewise-Nutritionist/";

  const handleOpenLiveApp = () => {
    window.open(githubPagesUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed top-20 right-4 z-40">
      <button
        onClick={handleOpenLiveApp}
        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors border border-green-500"
        title="Open Live Production App"
      >
        <ExternalLink className="w-4 h-4" />
        <span className="font-medium">Live App</span>
        <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
      </button>
    </div>
  );
}