import { useState } from 'react';
import { AddToolMoveForm } from './components/AddToolMoveForm';
import { AddWeldForm } from './components/AddWeldForm';

function App() {
  const [showToolMoveForm, setShowToolMoveForm] = useState(false);
  const [showWeldForm, setShowWeldForm] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Tool Move Tracking System</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setShowToolMoveForm(true)}
            className="px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Record Tool Move
          </button>
          <button
            onClick={() => setShowWeldForm(true)}
            className="px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Add Weld Touch Up
          </button>
        </div>

        {showToolMoveForm && (
          <AddToolMoveForm
            onSuccess={() => setShowToolMoveForm(false)}
            onCancel={() => setShowToolMoveForm(false)}
          />
        )}

        {showWeldForm && (
          <AddWeldForm
            onSuccess={() => setShowWeldForm(false)}
            onCancel={() => setShowWeldForm(false)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
