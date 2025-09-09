import React, { useState, useEffect } from 'react';

interface Admin {
  uid: string;
  username: string;
  role: string;
}

interface AdminDashboardProps {
  admin: Admin;
  onLogout: () => void;
}

interface Match {
  matchId: string;
  team1: { name: string; code: string; logo: string };
  team2: { name: string; code: string; logo: string };
  startTime: string;
  status: string;
  league: string;
}


const AdminDashboard: React.FC<AdminDashboardProps> = ({ admin, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'matches' | 'players' | 'contests'>('matches');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [newMatch, setNewMatch] = useState({
    team1Name: '',
    team1Code: '',
    team1Logo: '',
    team2Name: '',
    team2Code: '',
    team2Logo: '',
    startTime: '',
    league: ''
  });

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('admin_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    if (activeTab === 'matches') {
      fetchMatches();
    }
  }, [activeTab]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      const response = await fetch(`${apiUrl}/matches`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      const matchData = {
        matchId: `match_${Date.now()}`,
        team1: {
          name: newMatch.team1Name,
          code: newMatch.team1Code,
          logo: newMatch.team1Logo || `https://picsum.photos/40?random=${Date.now()}`
        },
        team2: {
          name: newMatch.team2Name,
          code: newMatch.team2Code,
          logo: newMatch.team2Logo || `https://picsum.photos/40?random=${Date.now() + 1}`
        },
        startTime: new Date(newMatch.startTime).toISOString(),
        status: 'upcoming',
        league: newMatch.league
      };

      const response = await fetch(`${apiUrl}/admin/matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(matchData)
      });

      if (response.ok) {
        alert('Match created successfully!');
        setNewMatch({
          team1Name: '', team1Code: '', team1Logo: '',
          team2Name: '', team2Code: '', team2Logo: '',
          startTime: '', league: ''
        });
        fetchMatches();
      } else {
        const errorText = await response.text();
        alert(`Failed to create match: ${errorText}`);
      }
    } catch (error) {
      console.error('Error creating match:', error);
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gray-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-red-600 rounded-lg p-2">
                <span className="text-white font-bold text-lg">PA</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">PrimeV Admin Portal</h1>
                <p className="text-gray-400 text-sm">Volleyball Management System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium">Welcome, {admin.username}</p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
              
              <button
                onClick={onLogout}
                className="bg-red-600 px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { key: 'matches' as const, label: 'Match Management', icon: '⚽' },
              { key: 'players' as const, label: 'Player Management', icon: '👥' },
              { key: 'contests' as const, label: 'Contest Management', icon: '🏆' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-6 border-b-2 font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'matches' && (
          <div className="space-y-8">
            {/* Create Match Form */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Create New Volleyball Match</h2>
              <form onSubmit={handleCreateMatch} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Team 1 Name</label>
                    <input
                      type="text"
                      value={newMatch.team1Name}
                      onChange={(e) => setNewMatch({...newMatch, team1Name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Mumbai Thunder"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Team 1 Code</label>
                    <input
                      type="text"
                      value={newMatch.team1Code}
                      onChange={(e) => setNewMatch({...newMatch, team1Code: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="MUM"
                      maxLength={3}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Team 2 Name</label>
                    <input
                      type="text"
                      value={newMatch.team2Name}
                      onChange={(e) => setNewMatch({...newMatch, team2Name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Delhi Dynamos"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Team 2 Code</label>
                    <input
                      type="text"
                      value={newMatch.team2Code}
                      onChange={(e) => setNewMatch({...newMatch, team2Code: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="DEL"
                      maxLength={3}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                    <input
                      type="datetime-local"
                      value={newMatch.startTime}
                      onChange={(e) => setNewMatch({...newMatch, startTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">League</label>
                    <input
                      type="text"
                      value={newMatch.league}
                      onChange={(e) => setNewMatch({...newMatch, league: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Pro Volleyball League"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-md font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Creating Match...' : 'Create Match'}
                </button>
              </form>
            </div>

            {/* Matches List */}
            <div className="bg-white rounded-lg shadow-lg">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-800">Existing Matches</h2>
              </div>
              <div className="divide-y">
                {matches.map((match) => (
                  <div key={match.matchId} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <img src={match.team1.logo} alt={match.team1.code} className="w-10 h-10 rounded-full" />
                          <span className="font-medium">{match.team1.code}</span>
                        </div>
                        <span className="text-gray-500">vs</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{match.team2.code}</span>
                          <img src={match.team2.logo} alt={match.team2.code} className="w-10 h-10 rounded-full" />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{match.league}</div>
                        <div className="text-xs text-gray-600">
                          {new Date(match.startTime).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'players' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Player Management</h2>
            <p className="text-gray-600">Player management features will be implemented here.</p>
          </div>
        )}

        {activeTab === 'contests' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Contest Management</h2>
            <p className="text-gray-600">Contest management features will be implemented here.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;