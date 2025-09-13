import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TeamLogo from '../components/TeamLogo';

// Human male caricature avatars for home and away teams - upper body only
const HomePlayerAvatar: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none">
    {/* Background circle - Home team blue */}
    <circle cx="50" cy="50" r="48" fill="#3B82F6" stroke="#1E40AF" strokeWidth="2"/>
    
    {/* Shoulders and upper chest */}
    <ellipse cx="50" cy="75" rx="30" ry="12" fill="#FBBF24"/>
    
    {/* Chest/Upper torso */}
    <rect x="30" y="65" width="40" height="30" rx="8" fill="#FBBF24"/>
    
    {/* Neck */}
    <rect x="44" y="58" width="12" height="10" fill="#FBBF24"/>
    
    {/* Head - realistic human proportions */}
    <ellipse cx="50" cy="35" rx="16" ry="20" fill="#FBBF24"/>
    
    {/* Hair - more natural style */}
    <path d="M34 25 Q42 18 50 20 Q58 18 66 25 Q66 30 62 35 Q58 32 50 32 Q42 32 38 35 Q34 30 34 25" fill="#6B4423"/>
    
    {/* Face features */}
    {/* Eyes with more detail */}
    <ellipse cx="43" cy="32" rx="3" ry="4" fill="white"/>
    <ellipse cx="57" cy="32" rx="3" ry="4" fill="white"/>
    <circle cx="43" cy="32" r="2" fill="#1F2937"/>
    <circle cx="57" cy="32" r="2" fill="#1F2937"/>
    <circle cx="44" cy="31" r="0.5" fill="white"/>
    <circle cx="58" cy="31" r="0.5" fill="white"/>
    
    {/* Eyebrows */}
    <path d="M38 27 Q43 25 48 27" stroke="#6B4423" strokeWidth="2" fill="none"/>
    <path d="M52 27 Q57 25 62 27" stroke="#6B4423" strokeWidth="2" fill="none"/>
    
    {/* Nose with nostrils */}
    <path d="M48 38 Q50 42 52 38" stroke="#D97706" strokeWidth="1.5" fill="none"/>
    <ellipse cx="48.5" cy="40" rx="0.5" ry="1" fill="#D97706"/>
    <ellipse cx="51.5" cy="40" rx="0.5" ry="1" fill="#D97706"/>
    
    {/* Mouth with slight smile */}
    <path d="M45 45 Q50 48 55 45" stroke="#1F2937" strokeWidth="2" fill="none"/>
    
    {/* Jawline definition */}
    <path d="M35 48 Q50 55 65 48" stroke="#D97706" strokeWidth="0.5" fill="none" opacity="0.3"/>
  </svg>
);

const AwayPlayerAvatar: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none">
    {/* Background circle - Away team red */}
    <circle cx="50" cy="50" r="48" fill="#EF4444" stroke="#DC2626" strokeWidth="2"/>
    
    {/* Shoulders and upper chest */}
    <ellipse cx="50" cy="75" rx="30" ry="12" fill="#D4A574"/>
    
    {/* Chest/Upper torso */}
    <rect x="30" y="65" width="40" height="30" rx="8" fill="#D4A574"/>
    
    {/* Neck */}
    <rect x="44" y="58" width="12" height="10" fill="#D4A574"/>
    
    {/* Head - realistic human proportions */}
    <ellipse cx="50" cy="35" rx="16" ry="20" fill="#D4A574"/>
    
    {/* Hair - more natural style */}
    <path d="M34 25 Q42 18 50 20 Q58 18 66 25 Q66 30 62 35 Q58 32 50 32 Q42 32 38 35 Q34 30 34 25" fill="#3C2A1E"/>
    
    {/* Face features */}
    {/* Eyes with more detail */}
    <ellipse cx="43" cy="32" rx="3" ry="4" fill="white"/>
    <ellipse cx="57" cy="32" rx="3" ry="4" fill="white"/>
    <circle cx="43" cy="32" r="2" fill="#1F2937"/>
    <circle cx="57" cy="32" r="2" fill="#1F2937"/>
    <circle cx="44" cy="31" r="0.5" fill="white"/>
    <circle cx="58" cy="31" r="0.5" fill="white"/>
    
    {/* Eyebrows */}
    <path d="M38 27 Q43 25 48 27" stroke="#3C2A1E" strokeWidth="2" fill="none"/>
    <path d="M52 27 Q57 25 62 27" stroke="#3C2A1E" strokeWidth="2" fill="none"/>
    
    {/* Nose with nostrils */}
    <path d="M48 38 Q50 42 52 38" stroke="#B45309" strokeWidth="1.5" fill="none"/>
    <ellipse cx="48.5" cy="40" rx="0.5" ry="1" fill="#B45309"/>
    <ellipse cx="51.5" cy="40" rx="0.5" ry="1" fill="#B45309"/>
    
    {/* Mouth with slight smile */}
    <path d="M45 45 Q50 48 55 45" stroke="#1F2937" strokeWidth="2" fill="none"/>
    
    {/* Jawline definition */}
    <path d="M35 48 Q50 55 65 48" stroke="#B45309" strokeWidth="0.5" fill="none" opacity="0.3"/>
  </svg>
);

const AwayPlayerAvatar: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none">
    {/* Background circle - Away team red */}
    <circle cx="50" cy="50" r="48" fill="#EF4444" stroke="#DC2626" strokeWidth="2"/>
    
    {/* Shoulders and upper chest */}
    <ellipse cx="50" cy="75" rx="30" ry="12" fill="#D4A574"/>
    
    {/* Chest/Upper torso */}
    <rect x="30" y="65" width="40" height="30" rx="8" fill="#D4A574"/>
    
    {/* Neck */}
    <rect x="44" y="58" width="12" height="10" fill="#D4A574"/>
    
    {/* Head - realistic human proportions */}
    <ellipse cx="50" cy="35" rx="16" ry="20" fill="#D4A574"/>
    
    {/* Hair - more natural style */}
    <path d="M34 25 Q42 18 50 20 Q58 18 66 25 Q66 30 62 35 Q58 32 50 32 Q42 32 38 35 Q34 30 34 25" fill="#2D1810"/>
    
    {/* Face features */}
    {/* Eyes with more detail */}
    <ellipse cx="43" cy="32" rx="3" ry="4" fill="white"/>
    <ellipse cx="57" cy="32" rx="3" ry="4" fill="white"/>
    <circle cx="43" cy="32" r="2" fill="#1F2937"/>
    <circle cx="57" cy="32" r="2" fill="#1F2937"/>
    <circle cx="44" cy="31" r="0.5" fill="white"/>
    <circle cx="58" cy="31" r="0.5" fill="white"/>
    
    {/* Eyebrows */}
    <path d="M38 27 Q43 25 48 27" stroke="#2D1810" strokeWidth="2" fill="none"/>
    <path d="M52 27 Q57 25 62 27" stroke="#2D1810" strokeWidth="2" fill="none"/>
    
    {/* Nose with nostrils */}
    <path d="M48 38 Q50 42 52 38" stroke="#B45309" strokeWidth="1.5" fill="none"/>
    <ellipse cx="48.5" cy="40" rx="0.5" ry="1" fill="#B45309"/>
    <ellipse cx="51.5" cy="40" rx="0.5" ry="1" fill="#B45309"/>
    
    {/* Mouth with slight smile */}
    <path d="M45 45 Q50 48 55 45" stroke="#1F2937" strokeWidth="2" fill="none"/>
    
    {/* Jawline definition */}
    <path d="M35 48 Q50 55 65 48" stroke="#B45309" strokeWidth="0.5" fill="none" opacity="0.3"/>
  </svg>
);

// Helper function to get the appropriate avatar based on team
const getPlayerAvatar = (teamCode: string, match: Match | null, className?: string) => {
  if (!match) return <HomePlayerAvatar className={className} />;
  
  // Determine if this is home team (team1) or away team (team2)
  const isHomeTeam = teamCode === match.team1.code;
  
  return isHomeTeam ? 
    <HomePlayerAvatar className={className} /> : 
    <AwayPlayerAvatar className={className} />;
};

interface Player {
  playerId: string;
  matchId: string;
  name: string;
  team: string;
  category: 'libero' | 'setter' | 'blocker' | 'attacker' | 'universal';
  credits: number;
  imageUrl: string;
  isStarting6: boolean;
  lastMatchPoints: number;
  selectionPercentage: number;
}

interface Match {
  matchId: string;
  team1: { name: string; code: string; logo: string; teamId?: string };
  team2: { name: string; code: string; logo: string; teamId?: string };
  startTime: string;
  league: string;
}

const TeamCreatePage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();

  const [match, setMatch] = useState<Match | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [activeCategory, setActiveCategory] = useState<'libero' | 'setter' | 'blocker' | 'attacker' | 'universal'>('libero');
  const [loading, setLoading] = useState(true);
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [showTeamPreview, setShowTeamPreview] = useState(false);

  const TOTAL_CREDITS = 100;
  const TEAM_SIZE = 6;
  const MAX_PLAYERS_PER_TEAM = 4;
  
  // New category constraints: exactly 1 libero, 1-2 for others
  const getCategoryConstraints = (category: string) => {
    if (category === 'libero') return { min: 1, max: 1 };
    return { min: 1, max: 2 };
  };

  const categories = [
    { key: 'libero' as const, label: 'Libero', short: 'LIB', color: 'bg-yellow-100 text-yellow-800' },
    { key: 'setter' as const, label: 'Setter', short: 'SET', color: 'bg-blue-100 text-blue-800' },
    { key: 'blocker' as const, label: 'Blocker', short: 'BLK', color: 'bg-green-100 text-green-800' },
    { key: 'attacker' as const, label: 'Attacker', short: 'ATT', color: 'bg-gray-100 text-gray-800' },
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
            category: squadPlayer.category as 'libero' | 'setter' | 'attacker' | 'blocker' | 'universal',
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
    
    // Check team size limit
    if (selectedPlayers.length >= TEAM_SIZE) return false;
    
    // Check budget constraint
    if (creditsUsed + player.credits > TOTAL_CREDITS) return false;

    // Check max players from same team
    const playersFromSameTeam = selectedPlayers.filter(p => p.team === player.team).length;
    if (playersFromSameTeam >= MAX_PLAYERS_PER_TEAM) return false;

    // Check category-specific limits
    const counts = getCategoryRequirement();
    const currentCategoryCount = counts[player.category];
    
    // Check category-specific max constraints
    const categoryConstraints = getCategoryConstraints(player.category);
    if (currentCategoryCount >= categoryConstraints.max) return false;
    
    // Check if selecting this player would violate minimum requirements for other categories
    if (selectedPlayers.length === TEAM_SIZE - 1) {
      // This is the last player slot - ensure all categories have minimum 1 player
      const categoriesNeeded = Object.keys(counts).filter(cat => 
        counts[cat as keyof typeof counts] === 0 && cat !== player.category
      );
      
      // If there are categories that still need players and this isn't filling one of them, can't select
      if (categoriesNeeded.length > 0) return false;
    }
    
    // If we're getting close to team size, check if remaining slots allow for category minimums
    const remainingSlots = TEAM_SIZE - selectedPlayers.length - 1; // -1 for this player
    const categoriesWithZero = Object.keys(counts).filter(cat => 
      counts[cat as keyof typeof counts] === 0 && cat !== player.category
    ).length;
    
    // Ensure we have enough slots for required categories
    if (categoriesWithZero > remainingSlots) return false;

    return true;
  };

  const getFilteredPlayers = () => {
    return players.filter(player => player.category === activeCategory);
  };

  const getCategoryRequirement = () => {
    const counts = {
      libero: selectedPlayers.filter(p => p.category === 'libero').length,
      setter: selectedPlayers.filter(p => p.category === 'setter').length,
      blocker: selectedPlayers.filter(p => p.category === 'blocker').length,
      attacker: selectedPlayers.filter(p => p.category === 'attacker').length,
      universal: selectedPlayers.filter(p => p.category === 'universal').length
    };

    return counts;
  };

  const isTeamValid = () => {
    const counts = getCategoryRequirement();
    return selectedPlayers.length === TEAM_SIZE &&
           counts.libero === 1 &&     // Exactly 1 libero
           counts.setter >= 1 && counts.setter <= 2 &&   // 1-2 setters
           counts.blocker >= 1 && counts.blocker <= 2 && // 1-2 blockers
           counts.attacker >= 1 && counts.attacker <= 2 && // 1-2 attackers
           counts.universal >= 1 && counts.universal <= 2 && // 1-2 universal
           creditsUsed <= TOTAL_CREDITS;
  };

  const isMatchLive = () => {
    if (!match) return false;
    const now = new Date();
    const matchTime = new Date(match.startTime);
    const timeDiff = matchTime.getTime() - now.getTime();
    return timeDiff <= 0; // Match has started
  };

  const handleContinue = () => {
    // Prevent team creation for live or completed matches
    if (isMatchLive()) {
      alert('Cannot create or edit teams for matches that have already started.');
      return;
    }
    
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

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m Left`;
    } else {
      return `${hours}h ${minutes}m Left`;
    }
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
      <header className="bg-black text-white sticky top-0 z-10">
        <div className="container py-3">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center text-white hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0L2.586 11a2 2 0 010-2.828L6.293 4.465a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l3.293 3.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            <div className="flex items-center justify-center space-x-6 flex-1">
              <div className="flex items-center space-x-2">
                <TeamLogo
                  teamId={match.team1.teamId}
                  teamCode={match.team1.code}
                  logoPath={match.team1.logo}
                  alt={match.team1.code}
                  className="w-8 h-8 rounded-full bg-gray-100"
                />
                <span className="font-medium text-sm">{match.team1.code}</span>
              </div>
              
              <div className="text-center">
                <div className="text-xs text-gray-400">Players</div>
                <div className="font-bold text-sm">{selectedPlayers.length}/{TEAM_SIZE}</div>
              </div>
              
              <div className="text-center">
                <div className="text-xs text-gray-400">Credits Left</div>
                <div className="font-bold text-sm">{(TOTAL_CREDITS - creditsUsed).toFixed(1)}</div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm">{match.team2.code}</span>
                <TeamLogo
                  teamId={match.team2.teamId}
                  teamCode={match.team2.code}
                  logoPath={match.team2.logo}
                  alt={match.team2.code}
                  className="w-8 h-8 rounded-full bg-gray-100"
                />
              </div>
            </div>

            <div className="w-6"></div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-orange-400 font-medium">
              {formatTimeLeft(match.startTime)}
            </div>
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
                    ? 'border-b-2 border-black text-black font-medium'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <div className="text-sm font-medium">{category.short}</div>
                <div className="text-xs mt-1">
                  {counts[category.key]}/{getCategoryConstraints(category.key).max}
                </div>
              </button>
            ))}
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
                  ? 'border-green-500 bg-green-50 ring-1 ring-green-500'
                  : canSelectPlayer(player)
                  ? 'border-gray-200 hover:border-blue-400 hover:shadow-md cursor-pointer'
                  : 'border-gray-200 bg-gray-50 opacity-75 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="relative">
                    {getPlayerAvatar(player.team, match, "w-12 h-12 rounded-full")}
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
                  
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => handlePlayerSelect(player)}
                      disabled={!canSelectPlayer(player)}
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                        isPlayerSelected(player.playerId)
                          ? 'bg-green-600 border-green-600 text-white'
                          : canSelectPlayer(player)
                          ? 'border-gray-300 hover:border-green-600 text-gray-400 hover:text-green-600'
                          : 'border-gray-300 text-gray-300 cursor-not-allowed bg-gray-50'
                      }`}
                    >
                      {isPlayerSelected(player.playerId) ? '✓' : canSelectPlayer(player) ? '+' : '✕'}
                    </button>
                    {!canSelectPlayer(player) && !isPlayerSelected(player.playerId) && (
                      <span className="text-xs text-gray-500 mt-1 text-center">
                        {creditsUsed + player.credits > TOTAL_CREDITS ? 'Budget' :
                         getCategoryRequirement()[player.category] >= getCategoryConstraints(player.category).max ? 'Max Cat' :
                         selectedPlayers.filter(p => p.team === player.team).length >= MAX_PLAYERS_PER_TEAM ? 'Max Team' :
                         'Rules'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Team Requirements */}
        <div className="mt-6 bg-white rounded-lg p-4 border">
          <h3 className="font-medium text-gray-800 mb-3">Volleyball Team Rules</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span>Libero:</span>
              <span className={`font-medium ${
                counts.libero === 1 ? 'text-green-600' : 'text-gray-600'
              }`}>
                {counts.libero}/1 (exactly 1)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Setters:</span>
              <span className={`font-medium ${
                counts.setter >= 1 && counts.setter <= 2 ? 'text-green-600' : 'text-gray-600'
              }`}>
                {counts.setter}/1-2
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Blockers:</span>
              <span className={`font-medium ${
                counts.blocker >= 1 && counts.blocker <= 2 ? 'text-green-600' : 'text-gray-600'
              }`}>
                {counts.blocker}/1-2
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Attackers:</span>
              <span className={`font-medium ${
                counts.attacker >= 1 && counts.attacker <= 2 ? 'text-green-600' : 'text-gray-600'
              }`}>
                {counts.attacker}/1-2
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Universal:</span>
              <span className={`font-medium ${
                counts.universal >= 1 && counts.universal <= 2 ? 'text-green-600' : 'text-gray-600'
              }`}>
                {counts.universal}/1-2
              </span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Budget:</span>
                <span className={`font-bold ${
                  creditsUsed > TOTAL_CREDITS * 0.9 ? 'text-gray-600' : 
                  creditsUsed > TOTAL_CREDITS * 0.75 ? 'text-orange-600' : 'text-green-600'
                }`}>
                  {creditsUsed.toFixed(1)}/{TOTAL_CREDITS}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4">
        <div className="container">
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setShowTeamPreview(true)}
              disabled={selectedPlayers.length === 0}
              className={`py-3 rounded-lg font-medium border transition-colors ${
                selectedPlayers.length === 0
                  ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Team Preview ({selectedPlayers.length})
            </button>
            
            <button
              onClick={handleContinue}
              disabled={!isTeamValid() || isMatchLive()}
              className={`py-3 rounded-lg font-medium transition-colors ${
                isTeamValid() && !isMatchLive()
                  ? 'bg-gray-600 text-white hover:bg-gray-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isMatchLive() ? 'Match Started - Cannot Edit Team' : 'Continue'}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom padding */}
      <div className="h-32"></div>
      
      {/* Team Preview Modal */}
      {showTeamPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Team Preview</h2>
                <button 
                  onClick={() => setShowTeamPreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {selectedPlayers.length}/6 players selected
              </p>
            </div>
            
            {/* Volleyball Court */}
            <div className="p-6">
              <div className="relative bg-gradient-to-b from-orange-100 to-orange-200 rounded-lg p-4 min-h-[400px]">
                {/* Court boundaries */}
                <div className="absolute inset-4 border-2 border-white rounded">
                  {/* Net in the middle */}
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-white transform -translate-y-0.5"></div>
                  
                  {/* Attack lines */}
                  <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-white opacity-50"></div>
                  <div className="absolute top-3/4 left-0 right-0 h-0.5 bg-white opacity-50"></div>
                  
                  {/* Position players on court intelligently */}
                  {(() => {
                    // Define 6 positions with priority order for each category
                    const positions = [
                      { position: 1, name: 'Back Right', x: 'right-4', y: 'top-8', priority: ['attacker', 'universal'] },
                      { position: 2, name: 'Front Right', x: 'right-4', y: 'bottom-8', priority: ['setter', 'universal'] },
                      { position: 3, name: 'Front Center', x: 'left-1/2', y: 'bottom-8', priority: ['blocker', 'attacker', 'universal'] },
                      { position: 4, name: 'Front Left', x: 'left-4', y: 'bottom-8', priority: ['attacker', 'blocker', 'universal'] },
                      { position: 5, name: 'Back Left', x: 'left-4', y: 'top-8', priority: ['universal', 'attacker'] },
                      { position: 6, name: 'Back Center', x: 'left-1/2', y: 'top-8', priority: ['libero', 'universal'] }
                    ];
                    
                    // Distribute players to positions
                    const assignedPositions: Array<{position: number, name: string, x: string, y: string, priority: string[], player: Player}> = [];
                    const availablePlayers = [...selectedPlayers];
                    
                    positions.forEach(pos => {
                      for (const category of pos.priority) {
                        const player = availablePlayers.find(p => p.category === category);
                        if (player) {
                          assignedPositions.push({ ...pos, player });
                          availablePlayers.splice(availablePlayers.indexOf(player), 1);
                          break;
                        }
                      }
                    });
                    
                    // Fill remaining positions with any available players
                    positions.forEach(pos => {
                      if (!assignedPositions.find(ap => ap.position === pos.position) && availablePlayers.length > 0) {
                        const player = availablePlayers.shift();
                        if (player) {
                          assignedPositions.push({ ...pos, player });
                        }
                      }
                    });
                    
                    const getPlayerColor = (category: string): string => {
                      switch (category) {
                        case 'setter': return 'bg-purple-500';
                        case 'attacker': return 'bg-red-500';
                        case 'blocker': return 'bg-green-500';
                        case 'libero': return 'bg-yellow-500';
                        case 'universal': return 'bg-blue-500';
                        default: return 'bg-gray-500';
                      }
                    };
                    
                    return assignedPositions.map(({ position, player, x, y }) => {
                      const transformX = x === 'left-1/2' ? 'left-1/2 transform -translate-x-1/2' : x;
                      return (
                        <div 
                          key={position}
                          className={`absolute ${transformX} ${y} flex flex-col items-center justify-center`}
                        >
                          <div className="text-center">
                            <div className={`w-12 h-12 ${getPlayerColor(player.category)} rounded-full flex items-center justify-center text-white text-xs font-bold mb-1`}>
                              {player.name.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <div className="text-xs text-gray-700 font-medium max-w-16 truncate">
                              {player.name.split(' ')[0]}
                            </div>
                            <div className="text-xs text-gray-600">
                              {player.category.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
                
              </div>
              
              {/* Team Stats */}
              <div className="mt-4 bg-gray-50 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Players:</span>
                    <span className="ml-2 font-medium">{selectedPlayers.length}/6</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Credits:</span>
                    <span className="ml-2 font-medium">{creditsUsed.toFixed(1)}/{TOTAL_CREDITS}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 border-t">
              <button
                onClick={() => setShowTeamPreview(false)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamCreatePage;