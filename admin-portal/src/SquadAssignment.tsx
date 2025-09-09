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

interface Player {
  playerId: string;
  name: string;
  imageUrl: string;
  defaultCategory: string;
  defaultCredits: number;
  dateOfBirth: string;
  nationality: string;
}

interface TeamPlayer {
  associationId: string;
  playerId: string;
  teamId: string;
  leagueId: string;
  season: string;
  jerseyNumber: number;
  role: string;
  isActive: boolean;
  playerName?: string; // populated from join
  playerImageUrl?: string; // populated from join
}

interface SquadAssignmentProps {
  teams: Team[];
  leagues: League[];
  getAuthHeaders: () => Record<string, string>;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const SquadAssignment: React.FC<SquadAssignmentProps> = ({ teams, leagues, getAuthHeaders, loading, setLoading }) => {
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectedLeagueId, setSelectedLeagueId] = useState('');
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [currentSquad, setCurrentSquad] = useState<TeamPlayer[]>([]);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);

  useEffect(() => {
    fetchAllPlayers();
  }, []);

  useEffect(() => {
    if (selectedTeamId) {
      fetchCurrentSquad(selectedTeamId);
    }
  }, [selectedTeamId]);

  const fetchAllPlayers = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      const response = await fetch(`${apiUrl}/admin/players`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailablePlayers(data || []);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const fetchCurrentSquad = async (teamId: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      const response = await fetch(`${apiUrl}/admin/team-players/team/${teamId}`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentSquad(data || []);
      } else {
        setCurrentSquad([]);
      }
    } catch (error) {
      console.error('Error fetching current squad:', error);
      setCurrentSquad([]);
    }
  };

  const handleAssignPlayers = async () => {
    if (!selectedTeamId || !selectedLeagueId) {
      alert('Please select team and league');
      return;
    }

    if (selectedPlayerIds.length === 0) {
      alert('Please select at least one player');
      return;
    }

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      const selectedTeam = teams.find(t => t.teamId === selectedTeamId);
      
      for (const playerId of selectedPlayerIds) {
        const associationData = {
          associationId: `assoc_${Date.now()}_${playerId}`,
          playerId,
          teamId: selectedTeamId,
          leagueId: selectedLeagueId,
          season: new Date().getFullYear().toString(),
          jerseyNumber: currentSquad.length + selectedPlayerIds.indexOf(playerId) + 1,
          role: 'player',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
          isActive: true,
          createdAt: new Date().toISOString()
        };

        const response = await fetch(`${apiUrl}/admin/team-players`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify(associationData)
        });

        if (!response.ok) {
          throw new Error(`Failed to assign player ${playerId}`);
        }
      }

      alert(`Successfully assigned ${selectedPlayerIds.length} players to ${selectedTeam?.name}!`);
      setSelectedPlayerIds([]);
      fetchCurrentSquad(selectedTeamId);
    } catch (error) {
      console.error('Error assigning players:', error);
      alert('Error assigning players. Some may have been assigned.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromSquad = async (associationId: string, playerName: string) => {
    if (!confirm(`Remove ${playerName} from this squad?`)) {
      return;
    }

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      const response = await fetch(`${apiUrl}/admin/team-players/${associationId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        alert('Player removed from squad successfully!');
        fetchCurrentSquad(selectedTeamId);
      } else {
        alert('Failed to remove player from squad');
      }
    } catch (error) {
      console.error('Error removing player from squad:', error);
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  const selectedTeam = teams.find(t => t.teamId === selectedTeamId);
  const selectedLeague = leagues.find(l => l.leagueId === selectedLeagueId);
  
  // Get players not already in current squad
  const assignedPlayerIds = currentSquad.map(tp => tp.playerId);
  const unassignedPlayers = availablePlayers.filter(p => !assignedPlayerIds.includes(p.playerId));

  return (
    <div className="space-y-8">
      {/* Team and League Selection */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Step 4: Assign Players to Team Squad
        </h2>
        
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Team</label>
            <select
              value={selectedTeamId}
              onChange={(e) => {
                setSelectedTeamId(e.target.value);
                setSelectedPlayerIds([]);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a team...</option>
              {teams.map(team => (
                <option key={team.teamId} value={team.teamId}>
                  {team.name} ({team.code}) - {team.homeCity}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select League/Season</label>
            <select
              value={selectedLeagueId}
              onChange={(e) => setSelectedLeagueId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a league...</option>
              {leagues.map(league => (
                <option key={league.leagueId} value={league.leagueId}>
                  {league.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedTeam && selectedLeague && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <img src={selectedTeam.logo} alt={selectedTeam.code} className="w-12 h-12 rounded-full" />
              <div>
                <h3 className="font-medium text-gray-800">{selectedTeam.name} ({selectedTeam.code})</h3>
                <p className="text-sm text-gray-600">
                  {selectedTeam.homeCity} • {selectedLeague.name} • Current Squad: {currentSquad.length} players
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Current Squad */}
      {selectedTeamId && currentSquad.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            Current Squad - {selectedTeam?.name} ({currentSquad.length} players)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentSquad.map((association) => (
              <div key={association.associationId} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <div className="flex items-center space-x-3 mb-2">
                  <img
                    src={association.playerImageUrl || 'https://randomuser.me/api/portraits/men/1.jpg'}
                    alt={association.playerName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{association.playerName || `Player ${association.playerId}`}</h4>
                    <div className="text-sm text-gray-600">
                      Jersey #{association.jerseyNumber} • {association.role}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveFromSquad(association.associationId, association.playerName || 'Player')}
                  className="text-red-600 hover:text-red-800 text-xs"
                >
                  Remove from Squad
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Players for Assignment */}
      {selectedTeamId && selectedLeagueId && unassignedPlayers.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Available Players ({unassignedPlayers.length} not assigned)
            </h3>
            {selectedPlayerIds.length > 0 && (
              <button
                onClick={handleAssignPlayers}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Assigning...' : `Assign ${selectedPlayerIds.length} Players`}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unassignedPlayers.map((player) => (
              <div 
                key={player.playerId} 
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedPlayerIds.includes(player.playerId)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => {
                  if (selectedPlayerIds.includes(player.playerId)) {
                    setSelectedPlayerIds(selectedPlayerIds.filter(id => id !== player.playerId));
                  } else {
                    setSelectedPlayerIds([...selectedPlayerIds, player.playerId]);
                  }
                }}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={player.imageUrl || 'https://randomuser.me/api/portraits/men/1.jpg'}
                    alt={player.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{player.name}</h4>
                    <div className="text-sm text-gray-600">
                      {player.defaultCategory} • {player.defaultCredits} credits
                    </div>
                  </div>
                  {selectedPlayerIds.includes(player.playerId) && (
                    <div className="bg-blue-600 text-white rounded-full p-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {selectedPlayerIds.length > 0 && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">
                {selectedPlayerIds.length} players selected for assignment to {selectedTeam?.name}
              </p>
            </div>
          )}
        </div>
      )}

      {selectedTeamId && selectedLeagueId && unassignedPlayers.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">All players assigned!</h3>
          <p className="text-gray-600">All available players are already assigned to teams.</p>
        </div>
      )}
    </div>
  );
};

export default SquadAssignment;