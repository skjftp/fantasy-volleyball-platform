import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const MyProfilePage: React.FC = () => {
  const { userProfile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-600 text-white">
        <div className="container py-4">
          <div className="text-center">
            <h1 className="text-xl font-bold">My Profile</h1>
            <p className="text-red-100 text-sm">Account Details & Statistics</p>
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <main className="container py-6">
        {/* Profile Info */}
        <div className="bg-white rounded-lg p-6 border shadow-sm mb-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">
                {userProfile?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              {userProfile?.name || 'User'}
            </h2>
            <p className="text-gray-600">{userProfile?.phone}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-800">
                {userProfile?.totalContestsJoined || 0}
              </div>
              <div className="text-sm text-gray-600">Contests Joined</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-800">
                {userProfile?.totalWins || 0}
              </div>
              <div className="text-sm text-gray-600">Total Wins</div>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-800">Account Actions</h3>
          </div>
          
          <div className="divide-y">
            <button className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
                <span className="text-gray-800">Edit Profile</span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>

            <button className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-800">My Contest History</span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>

            <button className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-800">Help & Support</span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>

            <button 
              onClick={signOut}
              className="w-full p-4 text-left hover:bg-red-50 transition-colors flex items-center justify-between text-red-600"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-600">Logout</span>
              </div>
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="mt-6 text-center">
          <div className="text-xs text-gray-500">
            PrimeV Fantasy • Version 1.0.0
          </div>
          <div className="text-xs text-gray-500">
            "Play Smart, Win Big"
          </div>
        </div>
      </main>

      {/* Bottom padding for navigation */}
      <div className="h-20"></div>
    </div>
  );
};

export default MyProfilePage;