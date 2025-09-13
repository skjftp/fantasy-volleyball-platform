import React, { useState } from 'react';

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
  category: 'libero' | 'setter' | 'attacker' | 'blocker' | 'universal';
  credits: number;
  imageUrl: string;
  teamId: string;
  isStarting6: boolean;
}

interface SquadManagementProps {
  teams: Team[];
  leagues: League[];
  getAuthHeaders: () => Record<string, string>;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const SquadManagement: React.FC<SquadManagementProps> = ({ teams, leagues, getAuthHeaders, loading, setLoading }) => {
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [existingPlayers, setExistingPlayers] = useState<Player[]>([]);

  // Add a new empty player to the list
  const addNewPlayer = () => {
    const newPlayer: Player = {
      playerId: `player_${Date.now()}_${players.length}`,
      name: '',
      category: 'libero',
      credits: 8.0,
      imageUrl: '',
      teamId: selectedTeamId,
      isStarting6: true
    };
    setPlayers([...players, newPlayer]);
  };

  // Update a specific player
  const updatePlayer = (index: number, field: keyof Player, value: any) => {
    const updatedPlayers = [...players];
    updatedPlayers[index] = { ...updatedPlayers[index], [field]: value };
    setPlayers(updatedPlayers);
  };

  // Remove a player
  const removePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  // Fetch existing players for selected team
  const fetchTeamPlayers = async (teamId: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      const response = await fetch(`${apiUrl}/admin/players/team/${teamId}`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setExistingPlayers(data || []);
      } else {
        setExistingPlayers([]);
      }
    } catch (error) {
      console.error('Error fetching team players:', error);
      setExistingPlayers([]);
    }
  };

  // Handle image upload
  const handleImageUpload = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      updatePlayer(index, 'imageUrl', event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Save all players
  const handleSaveAllPlayers = async () => {
    if (players.length === 0) {
      alert('Please add at least one player');
      return;
    }

    if (!selectedTeamId) {
      alert('Please select a team');
      return;
    }

    // Validate all players have names
    const invalidPlayers = players.filter(p => !p.name.trim());
    if (invalidPlayers.length > 0) {
      alert('Please enter names for all players');
      return;
    }

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      
      // Save each player individually
      for (const player of players) {
        const playerData = {
          ...player,
          matchId: '', // Will be set when assigning to matches
          lastMatchPoints: 0,
          selectionPercentage: 50.0,
          liveStats: {
            attacks: 0, aces: 0, blocks: 0, receptionsSuccess: 0, receptionErrors: 0,
            setsPlayed: [], setsAsStarter: [], setsAsSubstitute: [], totalPoints: 0
          }
        };

        const response = await fetch(`${apiUrl}/admin/players`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify(playerData)
        });

        if (!response.ok) {
          throw new Error(`Failed to create player: ${player.name}`);
        }
      }

      alert(`Successfully created ${players.length} players for the team!`);
      setPlayers([]);
      // Refresh existing players list
      if (selectedTeamId) {
        fetchTeamPlayers(selectedTeamId);
      }
    } catch (error) {
      console.error('Error creating players:', error);
      alert('Error creating players. Some players may have been created.');
    } finally {
      setLoading(false);
    }
  };

  const selectedTeam = teams.find(t => t.teamId === selectedTeamId);
  const selectedLeague = selectedTeam ? leagues.find(l => l.leagueId === selectedTeam.leagueId) : null;

  return (
    <div className="space-y-8">
      {/* Team Selection */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Step 3: Create Squad (Players for Team)
        </h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Team</label>
          <select
            value={selectedTeamId}
            onChange={(e) => {
              const teamId = e.target.value;
              setSelectedTeamId(teamId);
              setPlayers([]); // Clear new players when changing teams
              if (teamId) {
                fetchTeamPlayers(teamId); // Fetch existing players
              } else {
                setExistingPlayers([]);
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Choose a team to create players for...</option>
            {teams.map(team => {
              const league = leagues.find(l => l.leagueId === team.leagueId);
              return (
                <option key={team.teamId} value={team.teamId}>
                  {team.name} ({team.code}) - {league?.name || 'Unknown League'}
                </option>
              );
            })}
          </select>
        </div>

        {selectedTeam && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-4">
              <img src={selectedTeam.logo} alt={selectedTeam.code} className="w-12 h-12 rounded-full" />
              <div>
                <h3 className="font-medium text-gray-800">{selectedTeam.name} ({selectedTeam.code})</h3>
                <p className="text-sm text-gray-600">
                  {selectedTeam.homeCity} • {selectedLeague?.name} • Captain: {selectedTeam.captain}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Existing Players Display */}
      {selectedTeamId && existingPlayers.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            Existing Players - {selectedTeam?.name} ({existingPlayers.length} players)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {existingPlayers.map((player) => (
              <div key={player.playerId} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <img
                    src={player.imageUrl || 'https://randomuser.me/api/portraits/men/1.jpg'}
                    alt={player.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{player.name}</h4>
                    <div className="text-sm text-gray-600">
                      {player.category} • {player.credits} credits
                    </div>
                    <div className="text-xs text-gray-500">
                      {player.isStarting6 ? 'Starting 6' : 'Substitute'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Players Creation */}
      {selectedTeamId && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Add New Players for {selectedTeam?.name}</h3>
            <div className="flex space-x-3">
              <button
                onClick={addNewPlayer}
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 flex items-center"
              >
                <span className="mr-2">+</span>
                Add Player
              </button>
              {players.length > 0 && (
                <button
                  onClick={handleSaveAllPlayers}
                  disabled={loading}
                  className="bg-red-600 text-white px-6 py-2 rounded-md text-sm hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : `Save All ${players.length} Players`}
                </button>
              )}
            </div>
          </div>

          {players.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No players added yet</p>
              <button
                onClick={addNewPlayer}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
              >
                Add First Player
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {players.map((player, index) => (
                <div key={player.playerId} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <h4 className="font-medium text-gray-800">Player {index + 1}</h4>
                    <button
                      onClick={() => removePlayer(index)}
                      className="text-red-600 hover:text-red-800 text-sm ml-auto"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Player Name</label>
                      <input
                        type="text"
                        value={player.name}
                        onChange={(e) => updatePlayer(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Enter player name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Position Category</label>
                      <select
                        value={player.category}
                        onChange={(e) => updatePlayer(index, 'category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="libero">Libero</option>
                        <option value="setter">Setter</option>
                        <option value="attacker">Attacker</option>
                        <option value="blocker">Blocker</option>
                        <option value="universal">Universal</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Credits Value</label>
                      <input
                        type="number"
                        step="0.5"
                        min="6"
                        max="15"
                        value={player.credits}
                        onChange={(e) => updatePlayer(index, 'credits', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={player.isStarting6}
                          onChange={(e) => updatePlayer(index, 'isStarting6', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Starting 6 Player</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Player Headshot</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(index, file);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    />
                    {player.imageUrl && (
                      <div className="mt-2">
                        <img 
                          src={player.imageUrl} 
                          alt={player.name || `Player ${index + 1}`}
                          className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Add More Player Button */}
              <div className="text-center pt-4">
                <button
                  onClick={addNewPlayer}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 flex items-center mx-auto"
                >
                  <span className="mr-2">+</span>
                  Add Another Player
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SquadManagement;