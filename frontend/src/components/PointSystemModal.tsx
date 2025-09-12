import React from 'react';

interface PointSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PointSystemModal: React.FC<PointSystemModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Fantasy Point System</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="space-y-6">
            {/* Attacking Points */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">🏐 Attacking</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="text-sm text-gray-700">Attack Kill</span>
                  <span className="font-medium text-green-600">+2 points</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <span className="text-sm text-gray-700">Attack Error</span>
                  <span className="font-medium text-red-600">-1 point</span>
                </div>
              </div>
            </div>

            {/* Serving Points */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">🎯 Serving</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="text-sm text-gray-700">Service Ace</span>
                  <span className="font-medium text-green-600">+3 points</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <span className="text-sm text-gray-700">Service Error</span>
                  <span className="font-medium text-red-600">-1 point</span>
                </div>
              </div>
            </div>

            {/* Blocking Points */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">🛡️ Blocking</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="text-sm text-gray-700">Successful Block</span>
                  <span className="font-medium text-green-600">+2 points</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <span className="text-sm text-gray-700">Block Error</span>
                  <span className="font-medium text-red-600">-1 point</span>
                </div>
              </div>
            </div>

            {/* Reception Points */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">📡 Reception</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="text-sm text-gray-700">Successful Reception</span>
                  <span className="font-medium text-green-600">+1 point</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <span className="text-sm text-gray-700">Reception Error</span>
                  <span className="font-medium text-red-600">-1 point</span>
                </div>
              </div>
            </div>

            {/* Bonus Points */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">⭐ Bonus Points</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span className="text-sm text-gray-700">Playing in Starting 6</span>
                  <span className="font-medium text-blue-600">+2 points</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span className="text-sm text-gray-700">Playing as Substitute</span>
                  <span className="font-medium text-blue-600">+1 point</span>
                </div>
              </div>
            </div>

            {/* Captain Multipliers */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">👑 Captain & Vice-Captain</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                  <span className="text-sm text-gray-700">Captain Points</span>
                  <span className="font-medium text-yellow-600">2x multiplier</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                  <span className="text-sm text-gray-700">Vice-Captain Points</span>
                  <span className="font-medium text-yellow-600">1.5x multiplier</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">📝 Important Notes:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Points are calculated in real-time during matches</li>
                <li>• Captain and Vice-Captain multipliers apply to all points</li>
                <li>• Negative points are possible for errors</li>
                <li>• Final scores determine contest rankings</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default PointSystemModal;