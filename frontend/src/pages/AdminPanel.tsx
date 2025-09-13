import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import pvlLogo from '../assets/pvl-logo.svg';

interface Match {
  matchId: string;
  team1: { name: string; code: string; logo: string };
  team2: { name: string; code: string; logo: string };
  startTime: string;
  status: string;
  league: string;
}

interface Player {
  playerId: string;
  matchId: string;
  name: string;
  team: string;
  category: string;
  credits: number;
  imageUrl: string;
  isStarting6: boolean;
  lastMatchPoints: number;
  selectionPercentage: number;
}

const AdminPanel: React.FC = () => {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'matches' | 'players' | 'contests'>('matches');
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
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

  const [newPlayer, setNewPlayer] = useState({
    matchId: '',
    name: '',
    team: '',
    category: 'libero',
    credits: 8.0,
    imageUrl: '',
    isStarting6: true
  });

  useEffect(() => {
    if (activeTab === 'matches') {
      fetchMatches();
    } else if (activeTab === 'players') {
      fetchPlayers();
    }
  }, [activeTab]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      const response = await fetch(`${apiUrl}/matches`);
      const data = await response.json();
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      const response = await fetch(`${apiUrl}/matches/match_1/players`);
      const data = await response.json();
      setPlayers(data || []);
    } catch (error) {
      console.error('Error fetching players:', error);
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
          logo: newMatch.team1Logo || `https://via.placeholder.com/40x40/FF6B35/FFFFFF?text=${newMatch.team1Code}`
        },
        team2: {
          name: newMatch.team2Name,
          code: newMatch.team2Code,
          logo: newMatch.team2Logo || `https://via.placeholder.com/40x40/004E89/FFFFFF?text=${newMatch.team2Code}`
        },
        startTime: new Date(newMatch.startTime).toISOString(),
        status: 'upcoming',
        league: newMatch.league
      };

      const response = await fetch(`${apiUrl}/admin/matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        alert('Failed to create match');
      }
    } catch (error) {
      console.error('Error creating match:', error);
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      const playerData = {
        playerId: `player_${Date.now()}`,
        ...newPlayer,
        imageUrl: newPlayer.imageUrl || `https://via.placeholder.com/100x100/FF6B35/FFFFFF?text=${newPlayer.name.charAt(0)}`,
        lastMatchPoints: Math.floor(Math.random() * 60) + 20,
        selectionPercentage: Math.floor(Math.random() * 80) + 10,
        liveStats: {
          attacks: 0, aces: 0, blocks: 0, receptionsSuccess: 0, receptionErrors: 0,
          setsPlayed: [], setsAsStarter: [], setsAsSubstitute: [], totalPoints: 0
        }
      };

      const response = await fetch(`${apiUrl}/admin/players`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(playerData)
      });

      if (response.ok) {
        alert('Player created successfully!');
        setNewPlayer({
          matchId: '', name: '', team: '', category: 'libero',
          credits: 8.0, imageUrl: '', isStarting6: true
        });
        fetchPlayers();
      } else {
        alert('Failed to create player');
      }
    } catch (error) {
      console.error('Error creating player:', error);
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img src={pvlLogo} alt="Prime Volleyball League" className="h-12 w-auto mr-4" />
              <div>
                <h1 className="text-xl font-bold">Admin Panel</h1>
                <p className="text-gray-300 text-sm">Match & Player Management</p>
              </div>
            </div>
            
            <button
              onClick={signOut}
              className="bg-gray-800 px-3 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="container">
          <div className="flex space-x-1">
            {[
              { key: 'matches' as const, label: 'Matches', icon: '⚽' },
              { key: 'players' as const, label: 'Players', icon: '👥' },
              { key: 'contests' as const, label: 'Contests', icon: '🏆' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-3 px-4 text-center transition-colors ${
                  activeTab === tab.key
                    ? 'border-b-2 border-red-600 text-red-600 font-medium'
                    : 'text-gray-600 hover:text-gray-800'
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
      <main className="container py-6">
        {activeTab === 'matches' && (
          <div className="space-y-6">
            {/* Create Match Form */}
            <div className="bg-white rounded-lg p-6 border">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Create New Match</h2>
              <form onSubmit={handleCreateMatch} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Team 1 Name</label>
                    <input
                      type="text"
                      value={newMatch.team1Name}
                      onChange={(e) => setNewMatch({...newMatch, team1Name: e.target.value})}
                      className="input-field"
                      placeholder="Mumbai Thunder"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Team 1 Code</label>
                    <input
                      type="text"
                      value={newMatch.team1Code}
                      onChange={(e) => setNewMatch({...newMatch, team1Code: e.target.value})}
                      className="input-field"
                      placeholder="MUM"
                      maxLength={3}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Team 1 Logo URL</label>
                    <input
                      type="url"
                      value={newMatch.team1Logo}
                      onChange={(e) => setNewMatch({...newMatch, team1Logo: e.target.value})}
                      className="input-field"
                      placeholder="https://example.com/logo1.png (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Team 1 Logo Upload</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // For now, create a URL for the uploaded file
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setNewMatch({...newMatch, team1Logo: event.target?.result as string});
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="input-field text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Team 2 Name</label>
                    <input
                      type="text"
                      value={newMatch.team2Name}
                      onChange={(e) => setNewMatch({...newMatch, team2Name: e.target.value})}
                      className="input-field"
                      placeholder="Delhi Dynamos"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Team 2 Code</label>
                    <input
                      type="text"
                      value={newMatch.team2Code}
                      onChange={(e) => setNewMatch({...newMatch, team2Code: e.target.value})}
                      className="input-field"
                      placeholder="DEL"
                      maxLength={3}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Team 2 Logo URL</label>
                    <input
                      type="url"
                      value={newMatch.team2Logo}
                      onChange={(e) => setNewMatch({...newMatch, team2Logo: e.target.value})}
                      className="input-field"
                      placeholder="https://example.com/logo2.png (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Team 2 Logo Upload</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setNewMatch({...newMatch, team2Logo: event.target?.result as string});
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="input-field text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                      type="datetime-local"
                      value={newMatch.startTime}
                      onChange={(e) => setNewMatch({...newMatch, startTime: e.target.value})}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">League</label>
                    <input
                      type="text"
                      value={newMatch.league}
                      onChange={(e) => setNewMatch({...newMatch, league: e.target.value})}
                      className="input-field"
                      placeholder="Pro Volleyball League"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3"
                >
                  {loading ? 'Creating...' : 'Create Match'}
                </button>
              </form>
            </div>

            {/* Matches List */}
            <div className="bg-white rounded-lg border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-800">Existing Matches</h2>
              </div>
              <div className="divide-y">
                {matches.map((match) => (
                  <div key={match.matchId} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <img src={match.team1.logo} alt={match.team1.code} className="w-8 h-8 rounded" />
                          <span className="font-medium">{match.team1.code}</span>
                        </div>
                        <span className="text-gray-500">vs</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{match.team2.code}</span>
                          <img src={match.team2.logo} alt={match.team2.code} className="w-8 h-8 rounded" />
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
          <div className="space-y-6">
            {/* Create Player Form */}
            <div className="bg-white rounded-lg p-6 border">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Player</h2>
              <form onSubmit={handleCreatePlayer} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Player Name</label>
                    <input
                      type="text"
                      value={newPlayer.name}
                      onChange={(e) => setNewPlayer({...newPlayer, name: e.target.value})}
                      className="input-field"
                      placeholder="Player Name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Team Code</label>
                    <select
                      value={newPlayer.team}
                      onChange={(e) => setNewPlayer({...newPlayer, team: e.target.value})}
                      className="input-field"
                      required
                    >
                      <option value="">Select Team</option>
                      <option value="MUM">Mumbai Thunder</option>
                      <option value="DEL">Delhi Dynamos</option>
                      <option value="CHE">Chennai Chargers</option>
                      <option value="BAN">Bangalore Blasters</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                    <select
                      value={newPlayer.category}
                      onChange={(e) => setNewPlayer({...newPlayer, category: e.target.value})}
                      className="input-field"
                      required
                    >
                      <option value="libero">Libero</option>
                      <option value="setter">Setter</option>
                      <option value="attacker">Attacker</option>
                      <option value="blocker">Blocker</option>
                      <option value="universal">Universal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
                    <input
                      type="number"
                      step="0.5"
                      min="6"
                      max="15"
                      value={newPlayer.credits}
                      onChange={(e) => setNewPlayer({...newPlayer, credits: parseFloat(e.target.value)})}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Match</label>
                    <select
                      value={newPlayer.matchId}
                      onChange={(e) => setNewPlayer({...newPlayer, matchId: e.target.value})}
                      className="input-field"
                      required
                    >
                      <option value="">Select Match</option>
                      {matches.map(match => (
                        <option key={match.matchId} value={match.matchId}>
                          {match.team1.code} vs {match.team2.code}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newPlayer.isStarting6}
                      onChange={(e) => setNewPlayer({...newPlayer, isStarting6: e.target.checked})}
                      className="mr-2"
                    />
                    Starting 6 Player
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3"
                >
                  {loading ? 'Adding...' : 'Add Player'}
                </button>
              </form>
            </div>

            {/* Players List */}
            <div className="bg-white rounded-lg border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-800">Players</h2>
              </div>
              <div className="divide-y">
                {players.map((player) => (
                  <div key={player.playerId} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img src={player.imageUrl} alt={player.name} className="w-10 h-10 rounded-full" />
                        <div>
                          <div className="font-medium text-gray-800">{player.name}</div>
                          <div className="text-sm text-gray-600">
                            {player.team} • {player.category} • {player.credits} credits
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{player.lastMatchPoints} pts</div>
                        <div className="text-xs text-gray-600">
                          {player.isStarting6 ? 'Starting 6' : 'Substitute'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contests' && (
          <div className="bg-white rounded-lg p-6 border text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Contest Management</h2>
            <p className="text-gray-600">Contest management features coming soon!</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;