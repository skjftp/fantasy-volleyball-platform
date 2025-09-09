import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

interface Contest {
  contestId: string;
  matchId: string;
  name: string;
  prizePool: number;
  totalSpots: number;
  spotsLeft: number;
  joinedUsers: number;
  maxTeamsPerUser: number;
  totalWinners: number;
  winnerPercentage: number;
  isGuaranteed: boolean;
  status: string;
}

interface Match {
  matchId: string;
  team1: { name: string; code: string; logo: string };
  team2: { name: string; code: string; logo: string };
  startTime: string;
  league: string;
}

const ContestsPage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();

  const [contests, setContests] = useState<Contest[]>([]);
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'prizePool' | 'spots' | 'winners' | 'entry'>('prizePool');
  const [creditsLeft] = useState(106.93); // Mock user credits

  useEffect(() => {
    fetchContests();
  }, [matchId]);

  const fetchContests = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      
      // Fetch match details
      const matchResponse = await fetch(`${apiUrl}/matches`);
      const matchData = await matchResponse.json();
      const currentMatch = matchData.find((m: any) => m.matchId === matchId);
      
      if (currentMatch) {
        setMatch({
          ...currentMatch,
          startTime: currentMatch.startTime?.seconds ? 
            new Date(currentMatch.startTime.seconds * 1000).toISOString() : 
            currentMatch.startTime
        });
      }

      // Fetch contests
      const contestResponse = await fetch(`${apiUrl}/matches/${matchId}/contests`);
      const contestData = await contestResponse.json();
      setContests(contestData || []);
      
    } catch (error) {
      console.error('Error fetching contests:', error);
      // Mock data
      setMatch({
        matchId: matchId!,
        team1: { name: 'Mumbai Thunder', code: 'MUM', logo: 'https://via.placeholder.com/40' },
        team2: { name: 'Delhi Dynamos', code: 'DEL', logo: 'https://via.placeholder.com/40' },
        startTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        league: 'Pro Volleyball League'
      });
      
      setContests([
        {
          contestId: 'contest_1',
          matchId: matchId!,
          name: 'PrimeV Giveaway',
          prizePool: 75000,
          totalSpots: 10000,
          spotsLeft: 2653,
          joinedUsers: 7347,
          maxTeamsPerUser: 6,
          totalWinners: 1400,
          winnerPercentage: 14.0,
          isGuaranteed: true,
          status: 'open'
        },
        {
          contestId: 'contest_2',
          matchId: matchId!,
          name: 'Mega Prize Pool',
          prizePool: 100000,
          totalSpots: 15000,
          spotsLeft: 5420,
          joinedUsers: 9580,
          maxTeamsPerUser: 6,
          totalWinners: 2100,
          winnerPercentage: 14.0,
          isGuaranteed: true,
          status: 'open'
        }
      ]);
    } finally {
      setLoading(false);
    }
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

  const sortContests = (contests: Contest[]) => {
    return [...contests].sort((a, b) => {
      switch (sortBy) {
        case 'prizePool': return b.prizePool - a.prizePool;
        case 'spots': return a.spotsLeft - b.spotsLeft;
        case 'winners': return b.totalWinners - a.totalWinners;
        case 'entry': return 0; // All are free
        default: return 0;
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-600 text-white">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => navigate(-1)}
                className="text-white hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0L2.586 11a2 2 0 010-2.828L6.293 4.465a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l3.293 3.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-lg">
                    {match?.team1.code} vs {match?.team2.code}
                  </span>
                </div>
                <div className="text-red-100 text-sm">
                  {match && formatTimeLeft(match.startTime)}
                </div>
              </div>
            </div>

            <div className="bg-red-700 px-3 py-1 rounded-full flex items-center space-x-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
              <span className="font-medium">₹{creditsLeft}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Sort Options */}
      <div className="bg-white border-b">
        <div className="container py-3">
          <div className="flex items-center space-x-1">
            <span className="text-gray-600 text-sm mr-2">Sort By:</span>
            <div className="flex space-x-1 overflow-x-auto">
              {[
                { key: 'prizePool' as const, label: 'PRIZE POOL' },
                { key: 'spots' as const, label: 'SPOTS' },
                { key: 'winners' as const, label: 'WINNERS' },
                { key: 'entry' as const, label: 'ENTRY' }
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => setSortBy(option.key)}
                  className={`px-3 py-1 text-sm font-medium transition-colors ${
                    sortBy === option.key
                      ? 'text-gray-800 border-b-2 border-red-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            
            <div className="ml-auto">
              <button className="flex items-center text-gray-600 text-sm">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                </svg>
                All Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Private Contest */}
      <div className="container py-4">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white rounded-full p-2">
              <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-medium">Create Private Contest</h3>
              <p className="text-yellow-100 text-sm">Compete with friends</p>
            </div>
          </div>
          <button className="bg-white text-yellow-600 rounded-full p-2 hover:bg-yellow-50 transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Contests List */}
        <div className="space-y-4">
          {sortContests(contests).map((contest) => (
            <div key={contest.contestId} className="bg-white rounded-lg border shadow-sm">
              {/* Contest Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-800">{contest.name}</h3>
                    {contest.name.toLowerCase().includes('loot') && (
                      <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">
                        Loot!!!
                      </span>
                    )}
                  </div>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">
                    ₹0
                  </button>
                </div>
                
                {/* Prize Pool */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Prize Pool</span>
                    <span className="font-semibold text-gray-800">
                      ₹{contest.prizePool.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>{contest.spotsLeft.toLocaleString()} Spots Left</span>
                    <span>{contest.totalSpots.toLocaleString()} Spots</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${((contest.totalSpots - contest.spotsLeft) / contest.totalSpots) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>

                {/* Contest Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-red-600 font-medium">
                        ₹{(contest.prizePool / contest.totalWinners).toFixed(0)}
                      </span>
                    </div>
                    <div className="text-gray-600">
                      {contest.winnerPercentage}%
                    </div>
                    <div className="text-gray-600">
                      Upto {contest.maxTeamsPerUser}
                    </div>
                  </div>
                  
                  {contest.isGuaranteed && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                      Guaranteed
                    </span>
                  )}
                </div>
              </div>

              {/* Join Button */}
              <div className="p-4">
                <button 
                  onClick={() => navigate(`/match/${matchId}/create-team`)}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  JOIN CONTEST
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-6 text-center">
          <button className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            View All {contests.length} Contests
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="container py-2">
          <div className="flex justify-around">
            <Link to="/" className="flex flex-col items-center space-y-1 py-2">
              <div className="bg-red-600 rounded-full p-2">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-red-600">Contests</span>
            </Link>
            
            <Link to="/my-contests" className="flex flex-col items-center space-y-1 py-2">
              <div className="p-2">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <span className="text-xs text-gray-600">My Contests(1)</span>
            </Link>
            
            <Link to="/my-teams" className="flex flex-col items-center space-y-1 py-2">
              <div className="p-2">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <span className="text-xs text-gray-600">My Teams(1)</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Bottom padding for navigation */}
      <div className="h-20"></div>
    </div>
  );
};

export default ContestsPage;