/**
 * Minimal React component for testing
 */

export default function SimpleApp() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-yellow-400">ByteWise</h1>
        <p className="text-lg">React is working!</p>
        <div className="mt-4 p-4 bg-gray-800 rounded">
          <p>Basic rendering test successful</p>
        </div>
      </div>
    </div>
  );
}