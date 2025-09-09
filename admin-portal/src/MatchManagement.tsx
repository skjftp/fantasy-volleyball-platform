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
  matchPlayerId: string;
  playerId: string;
  matchId: string;
  teamId: string;
  playerName: string;
  playerImageUrl: string;
  teamCode: string;
  category: 'setter' | 'attacker' | 'blocker' | 'universal';
  credits: number;
  isStarting6: boolean;
  isSubstitute: boolean;
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editingPlayers, setEditingPlayers] = useState<{[key: string]: MatchPlayer}>({});

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
      const response = await fetch(`${apiUrl}/admin/match-players/match/${matchId}`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setMatchPlayers(data || []);
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

  // Track player changes without saving immediately
  const updatePlayerField = (matchPlayerId: string, field: keyof MatchPlayer, value: any) => {
    const currentPlayer = matchPlayers.find(mp => mp.matchPlayerId === matchPlayerId);
    if (!currentPlayer) return;

    const updatedPlayer = { ...currentPlayer, [field]: value };
    
    // Update editing players state
    setEditingPlayers(prev => ({
      ...prev,
      [matchPlayerId]: updatedPlayer
    }));

    // Update display state
    setMatchPlayers(matchPlayers.map(mp => 
      mp.matchPlayerId === matchPlayerId ? updatedPlayer : mp
    ));

    setHasUnsavedChanges(true);
  };

  // Save all changed players
  const handleSaveAllChanges = async () => {
    if (Object.keys(editingPlayers).length === 0) {
      alert('No changes to save');
      return;
    }

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      let savedCount = 0;

      for (const [matchPlayerId, playerData] of Object.entries(editingPlayers)) {
        const response = await fetch(`${apiUrl}/admin/match-players/${matchPlayerId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify(playerData)
        });

        if (response.ok) {
          savedCount++;
        }
      }

      alert(`Successfully saved changes for ${savedCount} players!`);
      setEditingPlayers({});
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Error saving changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Discard unsaved changes
  const handleDiscardChanges = () => {
    if (confirm('Discard all unsaved changes?')) {
      setEditingPlayers({});
      setHasUnsavedChanges(false);
      fetchMatchPlayers(selectedMatchId); // Refresh from server
    }
  };

  const handleAutoAssignSquad = async (matchId: string) => {
    if (!matchId) return;

    const match = matches.find(m => m.matchId === matchId);
    if (!match) return;

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      
      // Fetch team players for both teams
      const team1PlayersResponse = await fetch(`${apiUrl}/admin/team-players/team/${match.team1Id}`, {
        headers: getAuthHeaders()
      });
      const team2PlayersResponse = await fetch(`${apiUrl}/admin/team-players/team/${match.team2Id}`, {
        headers: getAuthHeaders()
      });

      if (!team1PlayersResponse.ok || !team2PlayersResponse.ok) {
        throw new Error('Failed to fetch team players');
      }

      const team1Players = await team1PlayersResponse.json();
      const team2Players = await team2PlayersResponse.json();
      
      const allTeamPlayers = [...team1Players, ...team2Players];

      if (allTeamPlayers.length === 0) {
        alert('No team players found. Please assign players to teams first in Step 4.');
        return;
      }

      // Create match players from team assignments
      let createdCount = 0;
      for (const teamPlayer of allTeamPlayers) {
        // Fetch player details from master database
        const playerResponse = await fetch(`${apiUrl}/admin/players/${teamPlayer.playerId}`, {
          headers: getAuthHeaders()
        });

        if (playerResponse.ok) {
          const playerData = await playerResponse.json();
          const teamInfo = teams.find(t => t.teamId === teamPlayer.teamId);

          const matchPlayerData = {
            matchPlayerId: `mp_${matchId}_${teamPlayer.playerId}`,
            playerId: teamPlayer.playerId,
            matchId: matchId,
            teamId: teamPlayer.teamId,
            playerName: playerData.name,
            playerImageUrl: playerData.imageUrl,
            teamCode: teamInfo?.code || '',
            category: playerData.defaultCategory || 'universal',
            credits: playerData.defaultCredits || 8.0,
            isStarting6: teamPlayer.role === 'captain' || Math.random() > 0.3, // Random starting assignment
            isSubstitute: false,
            lastMatchPoints: 0,
            selectionPercentage: 50.0,
            liveStats: {
              attacks: 0, aces: 0, blocks: 0, receptionsSuccess: 0, receptionErrors: 0,
              setsPlayed: [], setsAsStarter: [], setsAsSubstitute: [], totalPoints: 0
            },
            createdAt: new Date().toISOString()
          };

          // Create match player
          const createResponse = await fetch(`${apiUrl}/admin/match-players`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...getAuthHeaders()
            },
            body: JSON.stringify(matchPlayerData)
          });

          if (createResponse.ok) {
            createdCount++;
          }
        }
      }

      alert(`Successfully assigned ${createdCount} players to the match!`);
      fetchMatchPlayers(matchId);
    } catch (error) {
      console.error('Error auto-assigning squad:', error);
      alert('Error assigning squad. Please try again.');
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

          {/* Save/Discard Buttons */}
          {hasUnsavedChanges && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-yellow-600 rounded-full p-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-800">Unsaved Changes</h4>
                    <p className="text-sm text-yellow-600">You have {Object.keys(editingPlayers).length} players with unsaved changes</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleDiscardChanges}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-600"
                  >
                    Discard Changes
                  </button>
                  <button
                    onClick={handleSaveAllChanges}
                    disabled={loading}
                    className="bg-green-600 text-white px-6 py-2 rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save All Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

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
              getPlayersByCategory(activeCategory).map((player) => {
                const hasChanges = editingPlayers[player.matchPlayerId];
                return (
                <div 
                  key={player.matchPlayerId} 
                  className={`border rounded-lg p-4 transition-colors ${
                    hasChanges 
                      ? 'border-yellow-300 bg-yellow-50 shadow-md' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
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
                          onChange={(e) => {
                            e.stopPropagation();
                            updatePlayerField(player.matchPlayerId, 'category', e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
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
                          onChange={(e) => {
                            e.stopPropagation();
                            updatePlayerField(player.matchPlayerId, 'credits', parseFloat(e.target.value));
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center">
                        <label 
                          className="flex items-center text-sm cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={player.isStarting6}
                            onChange={(e) => {
                              e.stopPropagation();
                              const isChecked = e.target.checked;
                              updatePlayerField(player.matchPlayerId, 'isStarting6', isChecked);
                              updatePlayerField(player.matchPlayerId, 'isSubstitute', !isChecked);
                            }}
                            className="mr-2"
                          />
                          Starting 6
                        </label>
                      </div>
                    </div>
                  </div>
                  {hasChanges && (
                    <div className="mt-2 text-xs text-yellow-600 font-medium">
                      ⚠️ Unsaved changes
                    </div>
                  )}
                </div>
              );
              })
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
                {matchPlayers.filter(mp => mp.isSubstitute).length} Substitutes
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