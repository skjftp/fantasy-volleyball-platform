import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LeaderboardEntry {
  rank: number;
  teamId: string;
  teamName: string;
  userId: string;
  userName: string;
  points: number;
  isCurrentUser: boolean;
}

interface Contest {
  contestId: string;
  name: string;
  entryFee: number;
  totalPrizePool: number;
  maxSpots: number;
  joinedUsers: number;
  prizeDistribution?: Array<{
    rankStart: number;
    rankEnd: number;
    prizeAmount: number;
    prizeType: 'cash' | 'kind';
    prizeDesc: string;
  }>;
}

const ContestLeaderboardPage: React.FC = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const { user } = useAuth();
  const [contest, setContest] = useState<Contest | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userEntries, setUserEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContestLeaderboard();
  }, [contestId, user]);

  const fetchContestLeaderboard = async () => {
    if (!contestId || !user?.uid) return;

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      
      // Fetch contest details
      const contestResponse = await fetch(`${apiUrl}/contests/${contestId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (contestResponse.ok) {
        const contestData = await contestResponse.json();
        setContest(contestData);
      }

      // Fetch leaderboard
      const leaderboardResponse = await fetch(`${apiUrl}/contests/${contestId}/leaderboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (leaderboardResponse.ok) {
        const leaderboardData = await leaderboardResponse.json();
        console.log('Leaderboard data:', leaderboardData);
        
        // Separate user entries from all entries
        const currentUserEntries = leaderboardData.filter((entry: any) => entry.userId === user.uid);
        const otherEntries = leaderboardData.filter((entry: any) => entry.userId !== user.uid);
        
        setUserEntries(currentUserEntries);
        setLeaderboard(otherEntries);
      } else {
        console.error('Failed to fetch leaderboard');
        setLeaderboard([]);
        setUserEntries([]);
      }

    } catch (error) {
      console.error('Error fetching contest leaderboard:', error);
      setLeaderboard([]);
      setUserEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const getPrizeForRank = (rank: number): string => {
    if (!contest?.prizeDistribution) return '';
    
    const prize = contest.prizeDistribution.find(
      p => rank >= p.rankStart && rank <= p.rankEnd
    );
    
    return prize ? `₹${prize.prizeAmount.toLocaleString()}` : '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  const LeaderboardRow = ({ entry, showUserBadge = false }: { entry: LeaderboardEntry; showUserBadge?: boolean }) => (
    <div className={`flex items-center justify-between p-4 ${showUserBadge ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-white'}`}>
      <div className="flex items-center space-x-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
          entry.rank <= 3 
            ? entry.rank === 1 ? 'bg-yellow-400 text-yellow-900' 
              : entry.rank === 2 ? 'bg-gray-300 text-gray-700'
              : 'bg-amber-600 text-white'
            : 'bg-gray-100 text-gray-600'
        }`}>
          {entry.rank}
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-medium text-gray-800">{entry.teamName}</h3>
            {showUserBadge && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                You
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">{entry.userName}</p>
        </div>
      </div>
      
      <div className="text-right">
        <div className="font-bold text-gray-800">{entry.points}</div>
        <div className="text-xs text-gray-600">Points</div>
        {getPrizeForRank(entry.rank) && (
          <div className="text-xs text-green-600 font-medium">{getPrizeForRank(entry.rank)}</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white">
        <div className="container py-4">
          <div className="flex items-center space-x-3">
            <Link 
              to="/my-contests"
              className="text-white hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold">{contest?.name || 'Contest Leaderboard'}</h1>
              {contest && (
                <p className="text-sm text-gray-300">
                  ₹{contest.totalPrizePool?.toLocaleString()} • {contest.joinedUsers} users
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container py-4">
        {/* User's Teams Section */}
        {userEntries.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Your Teams</h2>
            <div className="space-y-2">
              {userEntries.map((entry) => (
                <LeaderboardRow key={entry.teamId} entry={entry} showUserBadge />
              ))}
            </div>
          </div>
        )}

        {/* Overall Leaderboard */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3">
            All Teams ({leaderboard.length + userEntries.length})
          </h2>
          
          {leaderboard.length === 0 && userEntries.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No entries yet</h3>
              <p className="text-gray-600">Leaderboard will be available once teams start scoring points.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
              {/* Show user entries first */}
              {userEntries.map((entry) => (
                <LeaderboardRow key={`user-${entry.teamId}`} entry={entry} showUserBadge />
              ))}
              
              {/* Then show other entries */}
              {leaderboard.map((entry) => (
                <LeaderboardRow key={entry.teamId} entry={entry} />
              ))}
            </div>
          )}
        </div>

        {/* Prize Distribution */}
        {contest?.prizeDistribution && contest.prizeDistribution.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Prize Distribution</h2>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="space-y-2">
                {contest.prizeDistribution.map((prize, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="text-gray-700">
                      {prize.rankStart === prize.rankEnd 
                        ? `Rank ${prize.rankStart}` 
                        : `Rank ${prize.rankStart}-${prize.rankEnd}`}
                    </div>
                    <div className="font-medium text-green-600">
                      ₹{prize.prizeAmount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom padding */}
      <div className="h-20"></div>
    </div>
  );
};

export default ContestLeaderboardPage;