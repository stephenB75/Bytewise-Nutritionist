/**
 * Live Preview Page - Direct access to GitHub Pages deployment
 */

export default function LivePreview() {
  const githubPagesUrl = "https://stephtonybro.github.io/Bytewise-Nutritionist/";
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Live Production Preview
          </h1>
          <p className="text-gray-600 mb-4">
            Access your live GitHub Pages deployment directly:
          </p>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">Production URL:</span>
              <a 
                href={githubPagesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline break-all"
              >
                {githubPagesUrl}
              </a>
            </div>
            <div className="flex space-x-3">
              <a 
                href={githubPagesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Open in New Tab
              </a>
              <button 
                onClick={() => window.open(githubPagesUrl, '_blank')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Launch Production App
              </button>
            </div>
          </div>
        </div>

        {/* Live Preview Frame */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 border-b">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600 ml-4">Live Production App</span>
            </div>
          </div>
          <div className="relative">
            <iframe
              src={githubPagesUrl}
              className="w-full h-screen border-0"
              title="Live Production App"
              onError={() => {
                console.log('GitHub Pages not yet deployed - showing deployment instructions');
              }}
            />
            {/* Fallback content if iframe fails */}
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-center p-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  GitHub Pages Not Yet Deployed
                </h3>
                <p className="text-gray-600 mb-4">
                  Upload the files from <code>github-pages-deploy/</code> to your repository
                </p>
                <a 
                  href="https://github.com/stephtonybro/Bytewise-Nutritionist"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Go to GitHub Repository
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}