import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import pvlLogo from '../assets/pvl-logo.svg';

interface Prize {
  prizeId: string;
  contestName: string;
  prizeDescription: string;
  prizeType: 'physical' | 'digital';
  prizeValue: number;
  wonDate: string;
  claimed: boolean;
  claimDeadline: string;
}

const MyProfilePage: React.FC = () => {
  const { userProfile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'prizes'>('profile');
  const [isVerified, setIsVerified] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [aadharNumber, setAadharNumber] = useState('');
  const [address, setAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    email: ''
  });

  // Mock prizes data - replace with actual API call
  const mockPrizes: Prize[] = [
    {
      prizeId: 'prize_1',
      contestName: 'PVL Championship Contest',
      prizeDescription: 'Official PVL Jersey',
      prizeType: 'physical',
      prizeValue: 2500,
      wonDate: '2024-03-15',
      claimed: false,
      claimDeadline: '2024-04-15'
    },
    {
      prizeId: 'prize_2', 
      contestName: 'Weekly Fantasy Contest',
      prizeDescription: 'Digital Certificate',
      prizeType: 'digital',
      prizeValue: 500,
      wonDate: '2024-03-10',
      claimed: true,
      claimDeadline: '2024-04-10'
    }
  ];

  const handleVerifyAadhar = () => {
    if (aadharNumber.length !== 12) {
      alert('Please enter a valid 12-digit Aadhaar number');
      return;
    }
    // Mock verification - replace with actual Aadhaar API
    setIsVerified(true);
    setShowVerificationModal(false);
    alert('Aadhaar verification successful!');
  };

  const handleClaimPrize = (prize: Prize) => {
    if (!isVerified) {
      setShowVerificationModal(true);
      return;
    }
    setSelectedPrize(prize);
    setShowClaimModal(true);
  };

  const handleSubmitClaim = () => {
    if (!selectedPrize) return;
    
    if (selectedPrize.prizeType === 'physical') {
      if (!address.line1 || !address.city || !address.state || !address.pincode) {
        alert('Please fill in all address fields');
        return;
      }
    } else {
      if (!address.email) {
        alert('Please enter your email address');
        return;
      }
    }
    
    // Mock API call to submit claim
    alert(`Prize claim submitted successfully! You will receive your ${selectedPrize.prizeDescription} soon.`);
    setShowClaimModal(false);
    setSelectedPrize(null);
    setAddress({ line1: '', line2: '', city: '', state: '', pincode: '', email: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white">
        <div className="container py-4">
          <div className="flex items-center justify-center">
            <img src={pvlLogo} alt="Prime Volleyball League" className="h-10 w-auto" />
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-t border-gray-700">
          <div className="container">
            <div className="flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-3 px-4 text-center transition-colors ${
                  activeTab === 'profile'
                    ? 'border-b-2 border-white text-white font-medium'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('prizes')}
                className={`flex-1 py-3 px-4 text-center transition-colors ${
                  activeTab === 'prizes'
                    ? 'border-b-2 border-white text-white font-medium'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Prizes Won ({mockPrizes.filter(p => !p.claimed).length})
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container py-6">
        {activeTab === 'profile' ? (
          /* Profile Tab Content */
          <>
            {/* Profile Info */}
            <div className="bg-white rounded-lg p-6 border shadow-sm mb-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">
                    {userProfile?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {userProfile?.name || 'User'}
                </h2>
                <p className="text-gray-600">{userProfile?.phone}</p>
                
                {/* Verification Status */}
                <div className="mt-3">
                  {isVerified ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified Account
                    </span>
                  ) : (
                    <button
                      onClick={() => setShowVerificationModal(true)}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800 hover:bg-orange-200"
                    >
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Verify with Aadhaar
                    </button>
                  )}
                </div>
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
                  className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between text-black"
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-black">Logout</span>
                  </div>
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Prizes Tab Content */
          <div className="space-y-4">
            {mockPrizes.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No prizes won yet</h3>
                <p className="text-gray-600">Join contests to win exciting prizes!</p>
              </div>
            ) : (
              mockPrizes.map((prize) => (
                <div key={prize.prizeId} className="bg-white rounded-lg p-4 border shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-800">{prize.prizeDescription}</h3>
                      <p className="text-sm text-gray-600">{prize.contestName}</p>
                      <p className="text-xs text-gray-500">Won on {new Date(prize.wonDate).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-800">₹{prize.prizeValue}</div>
                      <div className="text-xs text-gray-600">{prize.prizeType}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Claim by: {new Date(prize.claimDeadline).toLocaleDateString()}
                    </div>
                    {prize.claimed ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        Claimed
                      </span>
                    ) : (
                      <button
                        onClick={() => handleClaimPrize(prize)}
                        className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                      >
                        Claim Prize
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="container py-1">
          <div className="flex justify-around">
            <Link to="/" className="flex flex-col items-center space-y-0.5 py-1.5">
              <div className="p-1.5">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-9 9a1 1 0 001.414 1.414L2 12.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-4.586l.293.293a1 1 0 001.414-1.414l-9-9z" />
                </svg>
              </div>
              <span className="text-xs text-gray-600">Home</span>
            </Link>
            
            <Link to="/my-contests" className="flex flex-col items-center space-y-0.5 py-1.5">
              <div className="p-1.5">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <span className="text-xs text-gray-600">My Contests</span>
            </Link>
            
            <Link to="/my-profile" className="flex flex-col items-center space-y-0.5 py-1.5">
              <div className="bg-red-600 rounded-full p-1.5">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-red-600">My Profile</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Aadhaar Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Verify with Aadhaar</h2>
                <button 
                  onClick={() => setShowVerificationModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Verify your identity to claim prizes
              </p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aadhaar Number
                  </label>
                  <input
                    type="text"
                    value={aadharNumber}
                    onChange={(e) => setAadharNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    placeholder="Enter 12-digit Aadhaar number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={12}
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowVerificationModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyAadhar}
                  disabled={aadharNumber.length !== 12}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prize Claim Modal */}
      {showClaimModal && selectedPrize && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Claim Prize</h2>
                <button 
                  onClick={() => setShowClaimModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {selectedPrize.prizeDescription} - ₹{selectedPrize.prizeValue}
              </p>
            </div>
            
            <div className="p-6">
              {selectedPrize.prizeType === 'physical' ? (
                /* Physical Prize - Address Form */
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-800">Delivery Address</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1*</label>
                    <input
                      type="text"
                      value={address.line1}
                      onChange={(e) => setAddress({...address, line1: e.target.value})}
                      placeholder="House/Flat No., Building Name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                    <input
                      type="text"
                      value={address.line2}
                      onChange={(e) => setAddress({...address, line2: e.target.value})}
                      placeholder="Street, Area, Landmark"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City*</label>
                      <input
                        type="text"
                        value={address.city}
                        onChange={(e) => setAddress({...address, city: e.target.value})}
                        placeholder="City"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State*</label>
                      <input
                        type="text"
                        value={address.state}
                        onChange={(e) => setAddress({...address, state: e.target.value})}
                        placeholder="State"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code*</label>
                    <input
                      type="text"
                      value={address.pincode}
                      onChange={(e) => setAddress({...address, pincode: e.target.value.replace(/\D/g, '').slice(0, 6)})}
                      placeholder="6-digit PIN code"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={6}
                    />
                  </div>
                </div>
              ) : (
                /* Digital Prize - Email Form */
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-800">Email Delivery</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address*</label>
                    <input
                      type="email"
                      value={address.email}
                      onChange={(e) => setAddress({...address, email: e.target.value})}
                      placeholder="your@email.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      Your digital prize will be sent to this email address within 24-48 hours.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowClaimModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitClaim}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Submit Claim
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom padding for navigation */}
      <div className="h-15"></div>
    </div>
  );
};

export default MyProfilePage;