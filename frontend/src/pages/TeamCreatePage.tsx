import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Player {
  playerId: string;
  matchId: string;
  name: string;
  team: string;
  category: 'setter' | 'blocker' | 'attacker' | 'universal';
  credits: number;
  imageUrl: string;
  isStarting6: boolean;
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

const TeamCreatePage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();

  const [match, setMatch] = useState<Match | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [activeCategory, setActiveCategory] = useState<'setter' | 'blocker' | 'attacker' | 'universal'>('setter');
  const [loading, setLoading] = useState(true);
  const [creditsUsed, setCreditsUsed] = useState(0);

  const TOTAL_CREDITS = 100;
  const TEAM_SIZE = 6;
  const MAX_PLAYERS_PER_TEAM = 4;

  const categories = [
    { key: 'setter' as const, label: 'Setter', short: 'SET', color: 'bg-blue-100 text-blue-800' },
    { key: 'attacker' as const, label: 'Attacker', short: 'ATT', color: 'bg-red-100 text-red-800' },
    { key: 'blocker' as const, label: 'Blocker', short: 'BLK', color: 'bg-green-100 text-green-800' },
    { key: 'universal' as const, label: 'Universal', short: 'UNI', color: 'bg-purple-100 text-purple-800' }
  ];

  useEffect(() => {
    fetchMatchAndPlayers();
  }, [matchId]);

  useEffect(() => {
    const credits = selectedPlayers.reduce((sum, player) => sum + player.credits, 0);
    setCreditsUsed(credits);
  }, [selectedPlayers]);

  const fetchMatchAndPlayers = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      
      // Fetch real match data
      const matchResponse = await fetch(`${apiUrl}/matches`);
      const matchData = await matchResponse.json();
      const currentMatch = matchData.find((m: any) => m.matchId === matchId);
      
      if (!currentMatch) {
        throw new Error('Match not found');
      }

      const matchInfo: Match = {
        matchId: currentMatch.matchId,
        team1: currentMatch.team1,
        team2: currentMatch.team2,
        startTime: currentMatch.startTime?.seconds ? 
          new Date(currentMatch.startTime.seconds * 1000).toISOString() : 
          currentMatch.startTime,
        league: currentMatch.leagueId || 'Volleyball League'
      };

      // Fetch real squad players from matchSquads collection
      const squadResponse = await fetch(`${apiUrl}/match-squads/match/${matchId}`);
      let realPlayers: Player[] = [];
      
      if (squadResponse.ok) {
        const squadData = await squadResponse.json();
        console.log('Real squad data:', squadData);
        
        if (squadData.team1Players && squadData.team2Players) {
          const allSquadPlayers = [
            ...squadData.team1Players.map((p: any) => ({
              ...p,
              teamCode: currentMatch.team1.code
            })),
            ...squadData.team2Players.map((p: any) => ({
              ...p, 
              teamCode: currentMatch.team2.code
            }))
          ];
          
          // Convert squad players to Player interface
          realPlayers = allSquadPlayers.map((squadPlayer: any) => ({
            playerId: squadPlayer.playerId,
            matchId: matchId!,
            name: squadPlayer.playerName,
            team: squadPlayer.teamCode,
            category: squadPlayer.category as 'setter' | 'attacker' | 'blocker' | 'universal',
            credits: squadPlayer.credits,
            imageUrl: squadPlayer.playerImageUrl || 'https://randomuser.me/api/portraits/men/1.jpg',
            isStarting6: squadPlayer.isStarting6,
            lastMatchPoints: squadPlayer.lastMatchPoints || 0,
            selectionPercentage: 50.0
          }));
          
          console.log('Converted real players:', realPlayers);
        }
      }
      
      // Fallback to mock players if no real squad data
      const mockPlayers: Player[] = realPlayers.length > 0 ? realPlayers : [
        {
          playerId: 'p1',
          matchId: matchId!,
          name: 'Arjun Sharma',
          team: 'MUM',
          category: 'setter',
          credits: 10.5,
          imageUrl: 'https://via.placeholder.com/60',
          isStarting6: true,
          lastMatchPoints: 45,
          selectionPercentage: 65.4
        },
        {
          playerId: 'p2',
          matchId: matchId!,
          name: 'Rohit Verma',
          team: 'MUM',
          category: 'attacker',
          credits: 12,
          imageUrl: 'https://via.placeholder.com/60',
          isStarting6: true,
          lastMatchPoints: 52,
          selectionPercentage: 78.2
        },
        {
          playerId: 'p3',
          matchId: matchId!,
          name: 'Vikash Kumar',
          team: 'MUM',
          category: 'blocker',
          credits: 9,
          imageUrl: 'https://via.placeholder.com/60',
          isStarting6: true,
          lastMatchPoints: 38,
          selectionPercentage: 45.7
        },
        {
          playerId: 'p4',
          matchId: matchId!,
          name: 'Amit Singh',
          team: 'DEL',
          category: 'setter',
          credits: 11,
          imageUrl: 'https://via.placeholder.com/60',
          isStarting6: true,
          lastMatchPoints: 48,
          selectionPercentage: 72.1
        },
        {
          playerId: 'p5',
          matchId: matchId!,
          name: 'Suresh Raina',
          team: 'DEL',
          category: 'attacker',
          credits: 13,
          imageUrl: 'https://via.placeholder.com/60',
          isStarting6: true,
          lastMatchPoints: 58,
          selectionPercentage: 85.3
        },
        {
          playerId: 'p6',
          matchId: matchId!,
          name: 'Deepak Hooda',
          team: 'DEL',
          category: 'universal',
          credits: 8,
          imageUrl: 'https://via.placeholder.com/60',
          isStarting6: true,
          lastMatchPoints: 35,
          selectionPercentage: 42.8
        },
        {
          playerId: 'p7',
          matchId: matchId!,
          name: 'Priya Patel',
          team: 'MUM',
          category: 'universal',
          credits: 7,
          imageUrl: 'https://via.placeholder.com/60',
          isStarting6: false,
          lastMatchPoints: 28,
          selectionPercentage: 32.5
        },
        {
          playerId: 'p8',
          matchId: matchId!,
          name: 'Rajesh Kumar',
          team: 'DEL',
          category: 'blocker',
          credits: 9,
          imageUrl: 'https://via.placeholder.com/60',
          isStarting6: true,
          lastMatchPoints: 41,
          selectionPercentage: 58.3
        }
      ];

      setMatch(matchInfo);
      setPlayers(realPlayers.length > 0 ? realPlayers : mockPlayers);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerSelect = (player: Player) => {
    if (selectedPlayers.find(p => p.playerId === player.playerId)) {
      // Remove player
      setSelectedPlayers(prev => prev.filter(p => p.playerId !== player.playerId));
    } else {
      // Add player with validations
      if (selectedPlayers.length >= TEAM_SIZE) {
        alert('Team is full! Remove a player to add another.');
        return;
      }

      if (creditsUsed + player.credits > TOTAL_CREDITS) {
        alert('Not enough credits! Remove some players to add this one.');
        return;
      }

      // Check team constraint (max 4 players from same team)
      const playersFromSameTeam = selectedPlayers.filter(p => p.team === player.team).length;
      if (playersFromSameTeam >= MAX_PLAYERS_PER_TEAM) {
        alert(`Cannot select more than ${MAX_PLAYERS_PER_TEAM} players from ${player.team}`);
        return;
      }

      setSelectedPlayers(prev => [...prev, player]);
    }
  };

  const isPlayerSelected = (playerId: string) => {
    return selectedPlayers.some(p => p.playerId === playerId);
  };

  const canSelectPlayer = (player: Player) => {
    if (isPlayerSelected(player.playerId)) return true;
    if (selectedPlayers.length >= TEAM_SIZE) return false;
    if (creditsUsed + player.credits > TOTAL_CREDITS) return false;

    const playersFromSameTeam = selectedPlayers.filter(p => p.team === player.team).length;
    if (playersFromSameTeam >= MAX_PLAYERS_PER_TEAM) return false;

    return true;
  };

  const getFilteredPlayers = () => {
    return players.filter(player => player.category === activeCategory);
  };

  const getCategoryRequirement = () => {
    const counts = {
      setter: selectedPlayers.filter(p => p.category === 'setter').length,
      attacker: selectedPlayers.filter(p => p.category === 'attacker').length,  
      blocker: selectedPlayers.filter(p => p.category === 'blocker').length,
      universal: selectedPlayers.filter(p => p.category === 'universal').length
    };

    return counts;
  };

  const isTeamValid = () => {
    const counts = getCategoryRequirement();
    return selectedPlayers.length === TEAM_SIZE &&
           counts.setter >= 1 &&
           counts.attacker >= 1 &&
           counts.blocker >= 1 &&
           counts.universal >= 1 &&
           creditsUsed <= TOTAL_CREDITS;
  };

  const handleContinue = () => {
    if (!isTeamValid()) {
      alert('Please complete your team according to the requirements.');
      return;
    }

    // Navigate to captain selection
    navigate(`/team/temp/captain`, { 
      state: { 
        selectedPlayers, 
        matchId, 
        creditsUsed 
      } 
    });
  };

  const formatTimeLeft = (startTime: string) => {
    const now = new Date();
    const matchTime = new Date(startTime);
    const diff = matchTime.getTime() - now.getTime();

    if (diff <= 0) return 'Started';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m Left`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading players...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Match not found</p>
        </div>
      </div>
    );
  }

  const counts = getCategoryRequirement();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center text-white hover:text-gray-300"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0L2.586 11a2 2 0 010-2.828L6.293 4.465a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l3.293 3.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            <div className="text-center flex-1 mx-4">
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center space-x-2">
                  <img src={match.team1.logo} alt={match.team1.code} className="w-8 h-8 rounded-full" />
                  <span className="font-medium">{match.team1.code}</span>
                  <span className="text-gray-400 text-sm">0</span>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-400">Players</div>
                  <div className="font-bold text-lg">{selectedPlayers.length}/{TEAM_SIZE}</div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-400">Credits Left</div>
                  <div className="font-bold text-lg">{(TOTAL_CREDITS - creditsUsed).toFixed(1)}</div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 text-sm">0</span>
                  <span className="font-medium">{match.team2.code}</span>
                  <img src={match.team2.logo} alt={match.team2.code} className="w-8 h-8 rounded-full" />
                </div>
              </div>
              
              <div className="text-xs text-orange-400 font-medium mt-1">
                {formatTimeLeft(match.startTime)}
              </div>
            </div>

            <div className="w-6"></div>
          </div>
          
          {/* Team Progress Indicators */}
          <div className="flex justify-center mt-3 space-x-1">
            {Array.from({ length: TEAM_SIZE }, (_, index) => (
              <div
                key={index}
                className={`w-8 h-2 rounded ${
                  index < selectedPlayers.length ? 'bg-white' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
          
          <div className="text-center text-xs text-gray-400 mt-2">
            Max {MAX_PLAYERS_PER_TEAM} players from a team
          </div>
        </div>
      </header>

      {/* Category Tabs */}
      <div className="bg-white border-b">
        <div className="container">
          <div className="flex space-x-1 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setActiveCategory(category.key)}
                className={`flex-1 min-w-16 py-3 px-2 text-center transition-colors ${
                  activeCategory === category.key
                    ? 'border-b-2 border-red-600 text-red-600 font-medium'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <div className="text-sm font-medium">{category.short}</div>
                <div className="text-xs">
                  Pick {category.key === 'setter' ? '1-8' : category.key === 'attacker' ? '1-8' : category.key === 'blocker' ? '1-8' : '1-8'} {category.label}s
                </div>
              </button>
            ))}
          </div>
          
          {/* Quick Create Button */}
          <div className="mt-3 text-center">
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center mx-auto space-x-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
              <span>Quick Create</span>
            </button>
          </div>
        </div>
      </div>

      {/* Players List */}
      <main className="container py-4">
        <div className="space-y-3">
          {getFilteredPlayers().map((player) => (
            <div
              key={player.playerId}
              className={`bg-white rounded-lg p-4 border transition-all ${
                isPlayerSelected(player.playerId)
                  ? 'border-primary-500 bg-primary-50'
                  : canSelectPlayer(player)
                  ? 'border-gray-200 hover:border-gray-300'
                  : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="relative">
                    <img
                      src={player.imageUrl}
                      alt={player.name}
                      className="w-12 h-12 rounded-full bg-gray-100"
                    />
                    {player.isStarting6 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-800">{player.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        categories.find(c => c.key === player.category)?.color || 'bg-gray-100'
                      }`}>
                        {player.team}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-600 mt-1">
                      <span>Sel: {player.selectionPercentage}%</span>
                      <span>Last: {player.lastMatchPoints} pts</span>
                      {player.isStarting6 && <span className="text-green-600">Starting 6</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-800">{player.credits}</div>
                    <div className="text-xs text-gray-600">Credits</div>
                  </div>
                  
                  <button
                    onClick={() => handlePlayerSelect(player)}
                    disabled={!canSelectPlayer(player)}
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                      isPlayerSelected(player.playerId)
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : canSelectPlayer(player)
                        ? 'border-gray-300 hover:border-primary-600 text-gray-400'
                        : 'border-gray-200 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {isPlayerSelected(player.playerId) ? '✓' : '+'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Team Requirements */}
        <div className="mt-6 bg-white rounded-lg p-4 border">
          <h3 className="font-medium text-gray-800 mb-3">Team Requirements</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span>Setters (S):</span>
              <span className={counts.setter >= 1 ? 'text-green-600' : 'text-red-600'}>
                {counts.setter}/1+
              </span>
            </div>
            <div className="flex justify-between">
              <span>Attackers (A):</span>
              <span className={counts.attacker >= 1 ? 'text-green-600' : 'text-red-600'}>
                {counts.attacker}/1+
              </span>
            </div>
            <div className="flex justify-between">
              <span>Blockers (B):</span>
              <span className={counts.blocker >= 1 ? 'text-green-600' : 'text-red-600'}>
                {counts.blocker}/1+
              </span>
            </div>
            <div className="flex justify-between">
              <span>Universal (U):</span>
              <span className={counts.universal >= 1 ? 'text-green-600' : 'text-red-600'}>
                {counts.universal}/1+
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4">
        <div className="container">
          <div className="grid grid-cols-2 gap-3">
            <button className="py-3 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
              Team Preview
            </button>
            
            <button
              onClick={handleContinue}
              disabled={!isTeamValid()}
              className={`py-3 rounded-lg font-medium transition-colors ${
                isTeamValid()
                  ? 'bg-gray-600 text-white hover:bg-gray-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      </div>

      {/* Bottom padding */}
      <div className="h-32"></div>
    </div>
  );
};

export default TeamCreatePage;