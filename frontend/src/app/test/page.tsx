export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Tailwind CSS Test
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Test Card 1 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Basic Styling
            </h2>
            <p className="text-gray-600 mb-4">
              This card tests basic Tailwind classes.
            </p>
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded">
              Test Button
            </button>
          </div>

          {/* Test Card 2 */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-green-800 mb-4">
              Green Theme
            </h2>
            <p className="text-green-700 mb-4">Testing green color variants.</p>
            <div className="flex space-x-2">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                Green 100
              </span>
              <span className="bg-green-500 text-white px-2 py-1 rounded text-sm">
                Green 500
              </span>
            </div>
          </div>

          {/* Test Card 3 */}
          <div className="bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg p-6 text-white">
            <h2 className="text-xl font-semibold mb-4">Gradient Background</h2>
            <p className="mb-4">
              Testing gradient backgrounds and text colors.
            </p>
            <div className="bg-white bg-opacity-20 rounded p-2">
              <span className="text-sm">Semi-transparent overlay</span>
            </div>
          </div>
        </div>

        {/* Responsive Test */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Responsive Design Test
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-red-100 p-4 rounded text-center">
              <span className="text-sm font-medium text-red-800">Mobile</span>
            </div>
            <div className="bg-yellow-100 p-4 rounded text-center">
              <span className="text-sm font-medium text-yellow-800">
                Tablet
              </span>
            </div>
            <div className="bg-green-100 p-4 rounded text-center">
              <span className="text-sm font-medium text-green-800">
                Desktop
              </span>
            </div>
            <div className="bg-blue-100 p-4 rounded text-center">
              <span className="text-sm font-medium text-blue-800">Large</span>
            </div>
          </div>
        </div>

        {/* Custom CSS Test */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Custom CSS Test
          </h2>
          <div className="space-y-4">
            <div className="gradient-green p-4 rounded text-white">
              <p>Custom gradient-green class</p>
            </div>
            <div className="glass-effect p-4 rounded">
              <p>Custom glass-effect class</p>
            </div>
            <button className="btn-primary">Custom btn-primary class</button>
          </div>
        </div>
      </div>
    </div>
  );
}
