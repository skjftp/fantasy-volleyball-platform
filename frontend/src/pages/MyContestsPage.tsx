import React from 'react';
import { Link } from 'react-router-dom';

const MyContestsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-600 text-white">
        <div className="container py-4">
          <div className="text-center">
            <h1 className="text-xl font-bold">My Contests</h1>
            <p className="text-red-100 text-sm">Your active and completed contests</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container py-6">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No contests joined yet</h3>
          <p className="text-gray-600 mb-6">
            Start by joining your first volleyball contest!
          </p>
          
          <Link 
            to="/"
            className="inline-flex items-center bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
            Browse Contests
          </Link>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="container py-2">
          <div className="flex justify-around">
            <Link to="/" className="flex flex-col items-center space-y-1 py-2">
              <div className="p-2">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <span className="text-xs text-gray-600">Home</span>
            </Link>
            
            <Link to="/my-contests" className="flex flex-col items-center space-y-1 py-2">
              <div className="bg-red-600 rounded-full p-2">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-red-600">My Contests</span>
            </Link>
            
            <Link to="/my-profile" className="flex flex-col items-center space-y-1 py-2">
              <div className="p-2">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
              </div>
              <span className="text-xs text-gray-600">My Profile</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Bottom padding */}
      <div className="h-20"></div>
    </div>
  );
};

export default MyContestsPage;