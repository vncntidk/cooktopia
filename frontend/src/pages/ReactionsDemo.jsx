import ReactionButtons from '../components/ReactionButtons';

const ReactionsDemo = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Reaction Buttons Demo
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Click on any reaction to express how this recipe makes you feel. 
            Try hovering for interactive animations!
          </p>
        </div>

        {/* Demo Content Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Mock Recipe Card Header */}
          <div className="bg-gradient-to-r from-orange-400 to-pink-400 h-48 flex items-center justify-center">
            <h2 className="text-white text-3xl font-bold text-center px-4">
              Delicious Chocolate Cake Recipe
            </h2>
          </div>

          {/* Recipe Content */}
          <div className="p-6 md:p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Ingredients
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>🍫 2 cups all-purpose flour</li>
                <li>🥚 3 large eggs</li>
                <li>🍯 1 cup sugar</li>
                <li>🧈 1/2 cup butter</li>
                <li>🥛 1 cup milk</li>
                <li>🍫 1/2 cup cocoa powder</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Instructions
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Mix all ingredients together in a bowl, bake at 350°F for 30 minutes, 
                and enjoy your delicious cake!
              </p>
            </div>
          </div>

          {/* Reaction Buttons Section */}
          <div className="px-6 md:px-8 pb-6 md:pb-8 pt-4">
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-400 mb-4 text-center">
                How does this recipe make you feel?
              </p>
              <ReactionButtons />
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="text-4xl mb-3">🎨</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Beautiful Design
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Modern, colorful UI with smooth animations and transitions
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="text-4xl mb-3">🌓</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Dark Mode
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Fully compatible with both light and dark themes
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="text-4xl mb-3">📱</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Responsive
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Works perfectly on mobile, tablet, and desktop devices
            </p>
          </div>
        </div>

        {/* Implementation Notes */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-200 mb-3">
            💡 Implementation Notes
          </h3>
          <ul className="space-y-2 text-blue-800 dark:text-blue-300">
            <li>• Component is fully UI-only, ready for backend integration</li>
            <li>• State management uses React hooks for selection tracking</li>
            <li>• Accessible with ARIA labels for screen readers</li>
            <li>• Uses Framer Motion for smooth spring animations</li>
            <li>• Tailwind CSS v4 for modern, responsive styling</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReactionsDemo;

