import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface Player {
  playerId: string;
  name: string;
  team: string;
  category: 'setter' | 'blocker' | 'attacker' | 'universal';
  credits: number;
  imageUrl: string;
  lastMatchPoints: number;
  selectionPercentage: number;
}

const CaptainSelectionPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { selectedPlayers, matchId, creditsUsed } = location.state || {};
  const [captainId, setCaptainId] = useState<string>('');
  const [viceCaptainId, setViceCaptainId] = useState<string>('');
  const [players] = useState<Player[]>(selectedPlayers || []);

  const handleCaptainSelect = (playerId: string) => {
    if (captainId === playerId) {
      setCaptainId('');
    } else {
      setCaptainId(playerId);
      // If player is already vice-captain, remove from vice-captain
      if (viceCaptainId === playerId) {
        setViceCaptainId('');
      }
    }
  };

  const handleViceCaptainSelect = (playerId: string) => {
    if (viceCaptainId === playerId) {
      setViceCaptainId('');
    } else {
      setViceCaptainId(playerId);
      // If player is already captain, remove from captain
      if (captainId === playerId) {
        setCaptainId('');
      }
    }
  };

  const handleSaveTeam = async () => {
    if (!captainId || !viceCaptainId) {
      alert('Please select both Captain and Vice-Captain');
      return;
    }

    if (captainId === viceCaptainId) {
      alert('Captain and Vice-Captain must be different players');
      return;
    }

    // Create team data
    const teamData = {
      matchId,
      players: players.map(p => p.playerId),
      captainId,
      viceCaptainId,
      totalCredits: creditsUsed
    };

    try {
      // Call API to save team with authentication
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      
      // Get auth token from localStorage
      const token = localStorage.getItem('auth_token');
      if (!token) {
        alert('Please login first');
        navigate('/login');
        return;
      }

      const response = await fetch(`${apiUrl}/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(teamData)
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Team "${result.teamName}" created successfully!`);
        
        // Get contest ID from URL params if available
        const urlParams = new URLSearchParams(window.location.search);
        const contestId = urlParams.get('contestId');
        
        if (contestId) {
          // If team was created for specific contest, navigate to contest page
          navigate(`/match/${matchId}/contests`, {
            state: { teamCreated: true, teamId: result.teamId, contestId }
          });
        } else {
          // Otherwise go to My Teams
          navigate('/my-teams');
        }
      } else {
        const errorText = await response.text();
        alert(`Failed to create team: ${errorText}`);
      }
    } catch (error) {
      console.error('Error creating team:', error);
      alert('Network error. Please check your connection.');
    }
  };

  const getCaptainPercentage = (playerId: string) => {
    // Mock captain selection percentages
    const percentages: { [key: string]: number } = {};
    players.forEach((player) => {
      percentages[player.playerId] = Math.floor(Math.random() * 40) + 10; // 10-50%
    });
    return percentages[playerId] || 25;
  };

  const getViceCaptainPercentage = (playerId: string) => {
    // Mock vice-captain selection percentages  
    const percentages: { [key: string]: number } = {};
    players.forEach((player) => {
      percentages[player.playerId] = Math.floor(Math.random() * 30) + 15; // 15-45%
    });
    return percentages[playerId] || 30;
  };

  if (!players || players.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No team data found. Please create a team first.</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const captain = players.find(p => p.playerId === captainId);
  const viceCaptain = players.find(p => p.playerId === viceCaptainId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container py-3">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0L2.586 11a2 2 0 010-2.828L6.293 4.465a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l3.293 3.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </button>
            
            <h1 className="font-semibold text-gray-800">Choose Captain</h1>
            
            <div className="w-12"></div>
          </div>
        </div>
      </header>

      {/* Current Selection Display */}
      <div className="bg-white border-b">
        <div className="container py-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Captain */}
            <div className="text-center">
              <div className="mb-2">
                <div className="w-16 h-16 mx-auto rounded-full bg-yellow-100 flex items-center justify-center border-2 border-yellow-400">
                  {captain ? (
                    <img 
                      src={captain.imageUrl} 
                      alt={captain.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded mt-1">
                  C
                </div>
              </div>
              <p className="text-sm font-medium text-gray-800">
                {captain ? captain.name : 'Select Captain'}
              </p>
              <p className="text-xs text-gray-600">2x Points</p>
            </div>

            {/* Vice-Captain */}
            <div className="text-center">
              <div className="mb-2">
                <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-400">
                  {viceCaptain ? (
                    <img 
                      src={viceCaptain.imageUrl} 
                      alt={viceCaptain.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                  )}
                </div>
                <div className="bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded mt-1">
                  VC
                </div>
              </div>
              <p className="text-sm font-medium text-gray-800">
                {viceCaptain ? viceCaptain.name : 'Select Vice-Captain'}
              </p>
              <p className="text-xs text-gray-600">1.5x Points</p>
            </div>
          </div>
        </div>
      </div>

      {/* Players List */}
      <main className="container py-4">
        <div className="space-y-3">
          <h3 className="font-medium text-gray-800 mb-4">Select from your team:</h3>
          
          {players.map((player) => (
            <div
              key={player.playerId}
              className="bg-white rounded-lg p-4 border shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="relative">
                    <img
                      src={player.imageUrl}
                      alt={player.name}
                      className="w-12 h-12 rounded-full bg-gray-100"
                    />
                    {/* Captain/VC Badge */}
                    {captainId === player.playerId && (
                      <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        C
                      </div>
                    )}
                    {viceCaptainId === player.playerId && (
                      <div className="absolute -bottom-1 -right-1 bg-gray-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        VC
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-800">{player.name}</h3>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {player.team}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-600 mt-1">
                      <span>Sel: {player.selectionPercentage}%</span>
                      <span>Last: {player.lastMatchPoints} pts</span>
                      <span>Credits: {player.credits}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  {/* Captain Selection */}
                  <div className="text-center">
                    <button
                      onClick={() => handleCaptainSelect(player.playerId)}
                      className={`w-16 py-2 rounded text-xs font-medium transition-colors ${
                        captainId === player.playerId
                          ? 'bg-yellow-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-yellow-100'
                      }`}
                    >
                      {captainId === player.playerId ? '✓ C' : 'C'}
                    </button>
                    <p className="text-xs text-gray-600 mt-1">
                      {getCaptainPercentage(player.playerId)}%C
                    </p>
                  </div>

                  {/* Vice-Captain Selection */}
                  <div className="text-center">
                    <button
                      onClick={() => handleViceCaptainSelect(player.playerId)}
                      className={`w-16 py-2 rounded text-xs font-medium transition-colors ${
                        viceCaptainId === player.playerId
                          ? 'bg-gray-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {viceCaptainId === player.playerId ? '✓ VC' : 'VC'}
                    </button>
                    <p className="text-xs text-gray-600 mt-1">
                      {getViceCaptainPercentage(player.playerId)}%VC
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="container">
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="py-3 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Team Preview
            </button>
            
            <button
              onClick={handleSaveTeam}
              disabled={!captainId || !viceCaptainId}
              className={`py-3 rounded-lg font-medium transition-colors ${
                captainId && viceCaptainId
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Save Team
            </button>
          </div>
        </div>
      </div>

      {/* Bottom padding */}
      <div className="h-24"></div>
    </div>
  );
};

export default CaptainSelectionPage;