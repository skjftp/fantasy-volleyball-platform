import React, { useState, useEffect } from 'react';

interface Player {
  playerId: string;
  name: string;
  imageUrl: string;
  defaultCategory: 'libero' | 'setter' | 'attacker' | 'blocker' | 'universal';
  defaultCredits: number;
  dateOfBirth: string;
  nationality: string;
  createdAt: string;
}

interface PlayerManagementProps {
  getAuthHeaders: () => Record<string, string>;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const PlayerManagement: React.FC<PlayerManagementProps> = ({ getAuthHeaders, loading, setLoading }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [existingPlayers, setExistingPlayers] = useState<Player[]>([]);

  useEffect(() => {
    fetchExistingPlayers();
  }, []);

  const fetchExistingPlayers = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      const response = await fetch(`${apiUrl}/admin/players`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setExistingPlayers(data || []);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add a new empty player to the creation list
  const addNewPlayer = () => {
    const newPlayer: Player = {
      playerId: `player_${Date.now()}_${players.length}`,
      name: '',
      imageUrl: '',
      defaultCategory: 'libero',
      defaultCredits: 8.0,
      dateOfBirth: '',
      nationality: 'India',
      createdAt: new Date().toISOString()
    };
    setPlayers([...players, newPlayer]);
  };

  // Update a specific player in creation list
  const updatePlayer = (index: number, field: keyof Player, value: any) => {
    const updatedPlayers = [...players];
    updatedPlayers[index] = { ...updatedPlayers[index], [field]: value };
    setPlayers(updatedPlayers);
  };

  // Remove a player from creation list
  const removePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index));
  };


  // Save all players to master database
  const handleSaveAllPlayers = async () => {
    if (players.length === 0) {
      alert('Please add at least one player');
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
      
      // Save each player individually to master database
      for (const player of players) {
        const response = await fetch(`${apiUrl}/admin/players`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify(player)
        });

        if (!response.ok) {
          throw new Error(`Failed to create player: ${player.name}`);
        }
      }

      alert(`Successfully created ${players.length} players in master database!`);
      setPlayers([]);
      // Refresh existing players list
      fetchExistingPlayers();
    } catch (error) {
      console.error('Error creating players:', error);
      alert('Error creating players. Some players may have been created.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlayer = async (playerId: string, playerName: string) => {
    if (!confirm(`Are you sure you want to delete ${playerName}? This will remove them from all team associations.`)) {
      return;
    }

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      const response = await fetch(`${apiUrl}/admin/players/${playerId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        alert('Player deleted successfully!');
        fetchExistingPlayers();
      } else {
        alert('Failed to delete player');
      }
    } catch (error) {
      console.error('Error deleting player:', error);
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Existing Players */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Master Player Database ({existingPlayers.length} players)
        </h2>
        
        {existingPlayers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {existingPlayers.map((player) => (
              <div key={player.playerId} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src={player.imageUrl || 'https://randomuser.me/api/portraits/men/1.jpg'}
                    alt={player.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{player.name}</h4>
                    <div className="text-sm text-gray-600">
                      {player.defaultCategory} • {player.defaultCredits} credits
                    </div>
                    <div className="text-xs text-gray-500">
                      {player.nationality} • Born: {player.dateOfBirth}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => alert('Player editing coming soon!')}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePlayer(player.playerId, player.name)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No players in database</h3>
            <p className="text-gray-600">Start by creating your first players below.</p>
          </div>
        )}
      </div>

      {/* Create New Players */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Add New Players to Master Database</h3>
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
            <p className="text-gray-500 mb-4">No new players added yet</p>
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
              <div key={player.playerId} className="border border-gray-200 rounded-lg p-4 bg-green-50">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <h4 className="font-medium text-gray-800">New Player {index + 1}</h4>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter player name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Position</label>
                    <select
                      value={player.defaultCategory}
                      onChange={(e) => updatePlayer(index, 'defaultCategory', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="libero">Libero</option>
                      <option value="setter">Setter</option>
                      <option value="attacker">Attacker</option>
                      <option value="blocker">Blocker</option>
                      <option value="universal">Universal</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Credits</label>
                    <input
                      type="number"
                      step="0.5"
                      min="6"
                      max="15"
                      value={player.defaultCredits}
                      onChange={(e) => updatePlayer(index, 'defaultCredits', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={player.dateOfBirth}
                      onChange={(e) => updatePlayer(index, 'dateOfBirth', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                    <input
                      type="text"
                      value={player.nationality}
                      onChange={(e) => updatePlayer(index, 'nationality', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="India"
                    />
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
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          updatePlayer(index, 'imageUrl', event.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
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
    </div>
  );
};

export default PlayerManagement;