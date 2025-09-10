import React, { useState, useEffect } from 'react';

interface Team {
  teamId: string;
  name: string;
  code: string;
  logo: string;
  leagueId: string;
  homeCity: string;
  captain: string;
  coach: string;
}

interface League {
  leagueId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface Match {
  matchId: string;
  leagueId: string;
  team1Id: string;
  team2Id: string;
  team1: { name: string; code: string; logo: string };
  team2: { name: string; code: string; logo: string };
  startTime: string;
  status: string;
  venue: string;
  round: string;
  createdAt: string;
}

interface MatchPlayer {
  playerId: string;
  playerName: string;
  playerImageUrl: string;
  teamCode: string;
  category: 'setter' | 'attacker' | 'blocker' | 'universal';
  credits: number;
  isStarting6: boolean;
  jerseyNumber?: number;
  lastMatchPoints?: number;
  selectionPercentage?: number;
  liveStats?: any;
}

interface MatchManagementProps {
  teams: Team[];
  leagues: League[];
  getAuthHeaders: () => Record<string, string>;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const MatchManagement: React.FC<MatchManagementProps> = ({ teams, leagues, getAuthHeaders, loading, setLoading }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [matchPlayers, setMatchPlayers] = useState<MatchPlayer[]>([]);
  const [activeCategory, setActiveCategory] = useState<'setter' | 'attacker' | 'blocker' | 'universal'>('setter');

  // Match creation form
  const [newMatch, setNewMatch] = useState({
    leagueId: '',
    team1Id: '',
    team2Id: '',
    startTime: '',
    venue: '',
    round: ''
  });

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    if (selectedMatchId) {
      fetchMatchPlayers(selectedMatchId);
    }
  }, [selectedMatchId]);

  const fetchMatches = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      const response = await fetch(`${apiUrl}/admin/matches`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setMatches(data || []);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const fetchMatchPlayers = async (matchId: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      const response = await fetch(`${apiUrl}/admin/match-squads/match/${matchId}`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const squadData = await response.json();
        console.log('Squad data received:', squadData); // Debug log
        
        if (squadData.team1Players || squadData.team2Players) {
          // Get team codes from the match data
          const match = matches.find(m => m.matchId === matchId);
          const team1Code = match?.team1?.code || teams.find(t => t.teamId === squadData.team1Id)?.code || 'T1';
          const team2Code = match?.team2?.code || teams.find(t => t.teamId === squadData.team2Id)?.code || 'T2';
          
          // Convert squad data to flat player array for UI compatibility
          const allPlayers = [
            ...(squadData.team1Players || []).map((p: any) => ({...p, teamCode: team1Code})),
            ...(squadData.team2Players || []).map((p: any) => ({...p, teamCode: team2Code}))
          ];
          
          console.log('Converted players:', allPlayers); // Debug log
          setMatchPlayers(allPlayers);
        } else {
          console.log('No squad data found');
          setMatchPlayers([]);
        }
      }
    } catch (error) {
      console.error('Error fetching match players:', error);
    }
  };

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newMatch.team1Id === newMatch.team2Id) {
      alert('Please select different teams');
      return;
    }

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      
      const team1 = teams.find(t => t.teamId === newMatch.team1Id);
      const team2 = teams.find(t => t.teamId === newMatch.team2Id);
      
      const matchData = {
        matchId: `match_${Date.now()}`,
        ...newMatch,
        team1: { name: team1?.name || '', code: team1?.code || '', logo: team1?.logo || '' },
        team2: { name: team2?.name || '', code: team2?.code || '', logo: team2?.logo || '' },
        status: 'upcoming',
        createdAt: new Date().toISOString()
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
          leagueId: '', team1Id: '', team2Id: '', startTime: '', venue: '', round: ''
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

  // Simple field update without complex tracking
  const updatePlayerField = (playerId: string, field: string, value: any) => {
    setMatchPlayers(matchPlayers.map(player => 
      player.playerId === playerId ? { ...player, [field]: value } : player
    ));
  };

  // Simple save function - saves current state
  const handleSaveSquad = async () => {
    if (!selectedMatchId) return;
    
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      const match = matches.find(m => m.matchId === selectedMatchId);
      if (!match) return;

      // Separate players by team for the squad document
      const team1Players: any[] = [];
      const team2Players: any[] = [];

      matchPlayers.forEach(player => {
        // Remove UI-specific fields and prepare for backend
        const cleanPlayer = {
          playerId: player.playerId,
          playerName: player.playerName,
          playerImageUrl: player.playerImageUrl,
          category: player.category,
          credits: player.credits,
          isStarting6: player.isStarting6,
          jerseyNumber: player.jerseyNumber || 0,
          lastMatchPoints: player.lastMatchPoints || 0,
          selectionPercentage: player.selectionPercentage || 50.0,
          liveStats: player.liveStats || {
            attacks: 0, aces: 0, blocks: 0, receptionsSuccess: 0, receptionErrors: 0,
            setsPlayed: [], setsAsStarter: [], setsAsSubstitute: [], totalPoints: 0
          }
        };

        if (match.team1Id && player.teamCode === teams.find(t => t.teamId === match.team1Id)?.code) {
          team1Players.push(cleanPlayer);
        } else if (match.team2Id && player.teamCode === teams.find(t => t.teamId === match.team2Id)?.code) {
          team2Players.push(cleanPlayer);
        }
      });

      // Create complete squad document
      const matchSquadData = {
        matchSquadId: `squad_${selectedMatchId}`,
        matchId: selectedMatchId,
        team1Id: match.team1Id,
        team2Id: match.team2Id,
        team1Players: team1Players,
        team2Players: team2Players,
        updatedAt: new Date().toISOString()
      };

      const response = await fetch(`${apiUrl}/admin/match-squads/match/${selectedMatchId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(matchSquadData)
      });

      if (response.ok) {
        alert(`Squad saved successfully!`);
        // Refresh the squad data from backend to show updated values
        fetchMatchPlayers(selectedMatchId);
      } else {
        throw new Error('Failed to save squad');
      }
    } catch (error) {
      console.error('Error saving squad:', error);
      alert('Error saving squad. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoAssignSquad = async (matchId: string) => {
    if (!matchId) return;

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      
      // Single backend call to auto-assign squad
      const response = await fetch(`${apiUrl}/admin/match-squads/match/${matchId}/auto-assign`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || 'Squad auto-assigned successfully!');
        fetchMatchPlayers(matchId);
      } else {
        const errorText = await response.text();
        alert(`Error: ${errorText}`);
      }
    } catch (error) {
      console.error('Error auto-assigning squad:', error);
      alert('Network error during auto-assign.');
    } finally {
      setLoading(false);
    }
  };

  const getTeamsInLeague = (leagueId: string) => {
    return teams.filter(t => t.leagueId === leagueId);
  };

  const getPlayersByCategory = (category: string) => {
    return matchPlayers.filter(mp => mp.category === category);
  };

  const selectedMatch = matches.find(m => m.matchId === selectedMatchId);
  const categories = [
    { key: 'setter' as const, label: 'Setters', color: 'bg-blue-100 text-blue-800' },
    { key: 'attacker' as const, label: 'Attackers', color: 'bg-red-100 text-red-800' },
    { key: 'blocker' as const, label: 'Blockers', color: 'bg-green-100 text-green-800' },
    { key: 'universal' as const, label: 'Universal', color: 'bg-purple-100 text-purple-800' }
  ];

  return (
    <div className="space-y-8">
      {/* Create Match Form */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Step 5: Create Match
        </h2>
        <form onSubmit={handleCreateMatch} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">League</label>
              <select
                value={newMatch.leagueId}
                onChange={(e) => {
                  setNewMatch({...newMatch, leagueId: e.target.value, team1Id: '', team2Id: ''});
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select League</option>
                {leagues.map(league => (
                  <option key={league.leagueId} value={league.leagueId}>
                    {league.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Round/Stage</label>
              <input
                type="text"
                value={newMatch.round}
                onChange={(e) => setNewMatch({...newMatch, round: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Group Stage, Quarter Final, etc."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Team 1</label>
              <select
                value={newMatch.team1Id}
                onChange={(e) => setNewMatch({...newMatch, team1Id: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!newMatch.leagueId}
                required
              >
                <option value="">Select Team 1</option>
                {getTeamsInLeague(newMatch.leagueId).map(team => (
                  <option key={team.teamId} value={team.teamId}>
                    {team.name} ({team.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Team 2</label>
              <select
                value={newMatch.team2Id}
                onChange={(e) => setNewMatch({...newMatch, team2Id: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!newMatch.leagueId}
                required
              >
                <option value="">Select Team 2</option>
                {getTeamsInLeague(newMatch.leagueId).filter(t => t.teamId !== newMatch.team1Id).map(team => (
                  <option key={team.teamId} value={team.teamId}>
                    {team.name} ({team.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Match Start Time</label>
              <input
                type="datetime-local"
                value={newMatch.startTime}
                onChange={(e) => setNewMatch({...newMatch, startTime: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Venue</label>
              <input
                type="text"
                value={newMatch.venue}
                onChange={(e) => setNewMatch({...newMatch, venue: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Stadium/Arena name"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating Match...' : 'Create Match'}
          </button>
        </form>
      </div>

      {/* Existing Matches */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Existing Matches</h3>
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
                  <span className="text-gray-500 font-bold">VS</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{match.team2.code}</span>
                    <img src={match.team2.logo} alt={match.team2.code} className="w-10 h-10 rounded-full" />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">{match.venue}</div>
                    <div className="text-xs text-gray-600">
                      {new Date(match.startTime).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedMatchId(selectedMatchId === match.matchId ? '' : match.matchId)}
                    className={`px-4 py-2 rounded-md text-sm transition-colors ${
                      selectedMatchId === match.matchId
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {selectedMatchId === match.matchId ? 'Close Squad Editor' : 'Edit Squad'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Match-Specific Squad Management */}
      {selectedMatchId && selectedMatch && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Squad Management: {selectedMatch.team1.name} vs {selectedMatch.team2.name}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{selectedMatch.venue}</span>
              <span>•</span>
              <span>{new Date(selectedMatch.startTime).toLocaleString()}</span>
              <span>•</span>
              <span>{selectedMatch.round}</span>
            </div>
          </div>

          {/* Simple Save Button */}
          <div className="mb-6">
            <button
              onClick={handleSaveSquad}
              disabled={loading}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving Squad...' : 'Save Squad Changes'}
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex space-x-1 mb-6 border-b">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-2 border-b-2 font-medium transition-colors ${
                  activeCategory === cat.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                {cat.label} ({getPlayersByCategory(cat.key).length})
              </button>
            ))}
          </div>

          {/* Players by Category */}
          <div className="space-y-4">
            {getPlayersByCategory(activeCategory).length > 0 ? (
              getPlayersByCategory(activeCategory).map((player) => (
                <div 
                  key={player.playerId} 
                  className="border border-gray-200 bg-white rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={player.playerImageUrl || 'https://randomuser.me/api/portraits/men/1.jpg'}
                        alt={player.playerName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-medium text-gray-800">{player.playerName}</h4>
                        <div className="text-sm text-gray-600">
                          {player.teamCode} • {player.isStarting6 ? 'Starting 6' : 'Substitute'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Category</label>
                        <select
                          value={player.category}
                          onChange={(e) => updatePlayerField(player.playerId, 'category', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="setter">Setter</option>
                          <option value="attacker">Attacker</option>
                          <option value="blocker">Blocker</option>
                          <option value="universal">Universal</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Credits</label>
                        <input
                          type="number"
                          step="0.5"
                          min="6"
                          max="15"
                          value={player.credits}
                          onChange={(e) => updatePlayerField(player.playerId, 'credits', parseFloat(e.target.value))}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm text-center"
                        />
                      </div>

                      <div className="flex items-center">
                        <label className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={player.isStarting6}
                            onChange={(e) => updatePlayerField(player.playerId, 'isStarting6', e.target.checked)}
                            className="mr-2 h-4 w-4"
                          />
                          Starting 6
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No {categories.find(c => c.key === activeCategory)?.label.toLowerCase()} assigned to this match yet.
              </div>
            )}
          </div>

          {matchPlayers.length > 0 && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">
                <strong>Squad Summary:</strong> {matchPlayers.filter(mp => mp.isStarting6).length} Starting 6 players, 
                {matchPlayers.filter(mp => !mp.isStarting6).length} Substitutes
              </p>
            </div>
          )}
        </div>
      )}

      {selectedMatchId && matchPlayers.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No squad assigned</h3>
          <p className="text-gray-600 mb-4">
            Assign players from team squads to this match to set credits and categories.
          </p>
          <button 
            onClick={() => handleAutoAssignSquad(selectedMatchId)}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Assigning Squad...' : 'Auto-Assign Squad from Team Players'}
          </button>
        </div>
      )}
    </div>
  );
};

export default MatchManagement;