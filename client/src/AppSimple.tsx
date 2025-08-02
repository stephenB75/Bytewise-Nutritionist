/**
 * Simplified App Component for Debugging
 */

export default function AppSimple() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">ByteWise</h1>
        <p className="text-xl text-gray-600 mb-8">Nutrition Tracker</p>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-green-600 font-semibold">✅ App is loading successfully!</p>
          <p className="text-gray-500 mt-2">External URL working properly</p>
        </div>
      </div>
    </div>
  );
}