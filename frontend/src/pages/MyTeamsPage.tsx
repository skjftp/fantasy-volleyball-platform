import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface UserTeam {
  teamId: string;
  teamName: string;
  matchId: string;
  contestId: string;
  players: Player[];
  captainId: string;
  viceCaptainId: string;
  totalPoints: number;
  rank: number;
}

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

interface Match {
  matchId: string;
  team1: { name: string; code: string; logo: string };
  team2: { name: string; code: string; logo: string };
  startTime: string;
  league: string;
}

const MyTeamsPage: React.FC = () => {
  const { user } = useAuth();
  const { matchId } = useParams<{ matchId: string }>();
  const [teams, setTeams] = useState<UserTeam[]>([]);
  const [matches, setMatches] = useState<{ [key: string]: Match }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserTeams();
  }, []);

  const fetchUserTeams = async () => {
    try {
      if (!user?.uid) {
        console.log('No user UID found');
        return;
      }

      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      console.log('Fetching teams for user:', user.uid);
      console.log('API URL:', `${apiUrl}/users/${user.uid}/teams`);
      
      // Get auth token from localStorage
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.error('No auth token found');
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${apiUrl}/users/${user.uid}/teams`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Teams API Response status:', response.status);
      console.log('Teams API Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Teams API Error Response:', errorText);
        throw new Error(`Failed to fetch teams: ${response.status} - ${errorText}`);
      }
      
      const teamsData = await response.json();
      console.log('Teams data received:', teamsData);
      
      // Process teams data to get complete player information using match-squads endpoint
      const processedTeams = [];
      const matchPlayersCache: { [matchId: string]: Player[] } = {};
      
      for (const team of teamsData || []) {
        console.log('Processing team:', team);
        
        // If players are just IDs, get player details from match-squads
        if (team.players && team.players.length > 0 && team.matchId) {
          let matchPlayers: Player[] = [];
          
          // Check cache first
          if (matchPlayersCache[team.matchId]) {
            matchPlayers = matchPlayersCache[team.matchId];
          } else {
            try {
              // Fetch all players for this match using match-squads endpoint
              const squadResponse = await fetch(`${apiUrl}/match-squads/match/${team.matchId}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
              
              if (squadResponse.ok) {
                const squadData = await squadResponse.json();
                console.log('Squad data for match', team.matchId, ':', squadData);
                
                if (squadData.team1Players && squadData.team2Players) {
                  const allSquadPlayers = [
                    ...squadData.team1Players.map((p: any) => ({ ...p, teamCode: squadData.team1?.code || 'T1' })),
                    ...squadData.team2Players.map((p: any) => ({ ...p, teamCode: squadData.team2?.code || 'T2' }))
                  ];
                  
                  // Convert squad players to Player interface
                  matchPlayers = allSquadPlayers.map((squadPlayer: any) => ({
                    playerId: squadPlayer.playerId,
                    name: squadPlayer.playerName || 'Unknown Player',
                    team: squadPlayer.teamCode,
                    category: squadPlayer.category as 'setter' | 'attacker' | 'blocker' | 'universal',
                    credits: squadPlayer.credits || 0,
                    imageUrl: squadPlayer.playerImageUrl || 'https://randomuser.me/api/portraits/men/1.jpg',
                    lastMatchPoints: squadPlayer.lastMatchPoints || 0,
                    selectionPercentage: squadPlayer.selectionPercentage || 0
                  }));
                  
                  // Cache the players for this match
                  matchPlayersCache[team.matchId] = matchPlayers;
                }
              } else {
                console.warn('Failed to fetch squad data for match:', team.matchId);
              }
            } catch (error) {
              console.error('Error fetching squad data:', error);
            }
          }
          
          // Map team player IDs to full player objects
          const teamPlayersWithDetails = [];
          
          for (const playerId of team.players) {
            if (typeof playerId === 'object' && playerId.playerId) {
              // Already a full player object
              teamPlayersWithDetails.push(playerId);
            } else if (typeof playerId === 'string') {
              // Find the player in the match players
              const fullPlayer = matchPlayers.find(p => p.playerId === playerId);
              if (fullPlayer) {
                teamPlayersWithDetails.push(fullPlayer);
              } else {
                // Fallback player object
                console.warn('Player not found in squad data:', playerId);
                teamPlayersWithDetails.push({
                  playerId,
                  name: 'Unknown Player',
                  team: 'Unknown',
                  category: 'universal' as const,
                  credits: 0,
                  imageUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
                  lastMatchPoints: 0,
                  selectionPercentage: 0
                });
              }
            }
          }
          
          processedTeams.push({ ...team, players: teamPlayersWithDetails });
        } else {
          processedTeams.push(team);
        }
      }
      
      console.log('Processed teams with player details:', processedTeams);
      setTeams(processedTeams);
      
      // Fetch match details for teams
      if (teamsData && teamsData.length > 0) {
        console.log('Fetching match details for teams');
        const matchesResponse = await fetch(`${apiUrl}/matches`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (matchesResponse.ok) {
          const matchesData = await matchesResponse.json();
          console.log('Matches data received:', matchesData);
          
          const matchesMap: { [key: string]: Match } = {};
          matchesData.forEach((match: Match) => {
            matchesMap[match.matchId] = match;
          });
          setMatches(matchesMap);
        } else {
          console.error('Failed to fetch matches:', matchesResponse.status);
        }
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your teams...</p>
          {process.env.NODE_ENV === 'development' && (
            <p className="text-xs text-gray-400 mt-2">User ID: {user?.uid}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-600 text-white">
        <div className="container py-3">
          <div className="text-center">
            <h1 className="text-xl font-bold">My Teams</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container py-4">
        {teams.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No teams created yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first volleyball team to get started!
            </p>
            
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-gray-100 p-4 rounded-lg mb-6 text-left max-w-md mx-auto">
                <p className="text-xs text-gray-600 mb-2"><strong>Debug Info:</strong></p>
                <p className="text-xs text-gray-600">User ID: {user?.uid}</p>
                <p className="text-xs text-gray-600">Match ID: {matchId || 'None'}</p>
                <p className="text-xs text-gray-600">Teams Count: {teams.length}</p>
              </div>
            )}
            
            <Link 
              to={matchId ? `/match/${matchId}/create-team` : "/"}
              className="inline-flex items-center bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create Team
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {teams.map((team) => {
              const match = matches[team.matchId];
              const captain = team.players?.find(p => p.playerId === team.captainId);
              const viceCaptain = team.players?.find(p => p.playerId === team.viceCaptainId);
              
              // Debug logging
              console.log('Team:', team.teamName, {
                captainId: team.captainId,
                viceCaptainId: team.viceCaptainId,
                playersCount: team.players?.length,
                captain: captain ? captain.name : 'Not found',
                viceCaptain: viceCaptain ? viceCaptain.name : 'Not found'
              });
              
              return (
                <div key={team.teamId} className="bg-white rounded-lg p-4 border shadow-sm">
                  {/* Team Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-red-600 text-white w-10 h-10 rounded-lg flex items-center justify-center font-bold">
                        {team.teamName}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">
                          {match ? `${match.team1.code} vs ${match.team2.code}` : 'Match Info'}
                        </div>
                        <div className="text-xs text-gray-600">
                          {match?.league}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-800">{team.totalPoints}</div>
                      <div className="text-xs text-gray-600">Points</div>
                    </div>
                  </div>

                  {/* Captain and Vice-Captain Section */}
                  {(captain || viceCaptain) ? (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <div className="flex items-center space-x-4">
                        {captain && (
                          <div className="flex items-center space-x-2 flex-1">
                            <img 
                              src={captain.imageUrl || 'https://randomuser.me/api/portraits/men/1.jpg'} 
                              alt={captain.name}
                              className="w-8 h-8 rounded-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://randomuser.me/api/portraits/men/1.jpg';
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium text-gray-900 truncate">{captain.name}</div>
                              <div className="flex items-center space-x-1">
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-medium">C</span>
                                <span className="text-xs text-gray-600">{captain.team}</span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {viceCaptain && (
                          <div className="flex items-center space-x-2 flex-1">
                            <img 
                              src={viceCaptain.imageUrl || 'https://randomuser.me/api/portraits/men/2.jpg'} 
                              alt={viceCaptain.name}
                              className="w-8 h-8 rounded-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://randomuser.me/api/portraits/men/2.jpg';
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium text-gray-900 truncate">{viceCaptain.name}</div>
                              <div className="flex items-center space-x-1">
                                <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-medium">VC</span>
                                <span className="text-xs text-gray-600">{viceCaptain.team}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <div className="text-center text-sm text-gray-600">
                        {process.env.NODE_ENV === 'development' && (
                          <div className="text-xs">
                            <p>Debug: No captain/VC data found</p>
                            <p>Captain: {team.players?.find(p => p.playerId === team.captainId)?.name || 'Not found'}</p>
                            <p>Vice-Captain: {team.players?.find(p => p.playerId === team.viceCaptainId)?.name || 'Not found'}</p>
                            <p>Players: {team.players?.length || 0}</p>
                          </div>
                        )}
                        Captain & Vice-Captain information loading...
                      </div>
                    </div>
                  )}

                  {/* Team Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-600">
                      {team.players?.length || 6} Players • C & VC Selected
                    </div>
                    <div className="flex items-center space-x-2">
                      {team.rank > 0 ? (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Rank #{team.rank}
                        </span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          Not Started
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="container py-2">
          <div className="flex justify-around">
            <Link to={matchId ? `/match/${matchId}/contests` : "/"} className="flex flex-col items-center space-y-1 py-2">
              <div className="p-2">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <span className="text-xs text-gray-600">Contests</span>
            </Link>
            
            <Link to={matchId ? `/match/${matchId}/my-contests` : "/my-contests"} className="flex flex-col items-center space-y-1 py-2">
              <div className="p-2">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <span className="text-xs text-gray-600">My Contests(1)</span>
            </Link>
            
            <Link to={matchId ? `/match/${matchId}/my-teams` : "/my-teams"} className="flex flex-col items-center space-y-1 py-2">
              <div className="bg-red-600 rounded-full p-2">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-red-600">My Teams(1)</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Bottom padding */}
      <div className="h-20"></div>
    </div>
  );
};

export default MyTeamsPage;