import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface JoinedContest {
  contestId: string;
  contestName: string;
  matchId: string;
  teamName: string;
  prizePool: number;
  rank: number;
  totalPoints: number;
  status: 'upcoming' | 'live' | 'completed';
}

const MyContestsPage: React.FC = () => {
  const { user } = useAuth();
  const [joinedContests, setJoinedContests] = useState<JoinedContest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJoinedContests();
  }, []);

  const fetchJoinedContests = async () => {
    try {
      if (!user?.uid) return;

      // Mock data showing joined contests
      setJoinedContests([
        {
          contestId: 'contest_1',
          contestName: 'PrimeV Mega Contest',
          matchId: 'match_1',
          teamName: 'T1',
          prizePool: 150000,
          rank: 0,
          totalPoints: 0,
          status: 'upcoming'
        }
      ]);
    } catch (error) {
      console.error('Error fetching joined contests:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your contests...</p>
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
            <h1 className="text-xl font-bold">My Contests</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container py-4">
        {joinedContests.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No contests joined yet</h3>
            <p className="text-gray-600 mb-6">
              Start by joining your first volleyball contest!
            </p>
            
            <Link 
              to="/"
              className="inline-flex items-center bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              Browse Contests
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Joined with team section */}
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-800">Joined with 1 team</h3>
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              {joinedContests.map((contest) => (
                <div key={contest.contestId} className="p-4 border-b last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">{contest.contestName}</h4>
                    <div className="bg-red-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold">
                      {contest.teamName}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Prize Pool: ₹{contest.prizePool.toLocaleString()}
                    </div>
                    <div className="text-sm font-medium text-gray-800">
                      {contest.totalPoints} Points
                    </div>
                  </div>
                  
                  {contest.rank > 0 && (
                    <div className="mt-2 text-sm">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        Rank #{contest.rank}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="container py-2">
          <div className="flex justify-around">
            <Link to="/" className="flex flex-col items-center space-y-1 py-2">
              <div className="p-2">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <span className="text-xs text-gray-600">Contests</span>
            </Link>
            
            <Link to="/my-contests" className="flex flex-col items-center space-y-1 py-2">
              <div className="bg-red-600 rounded-full p-2">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-red-600">My Contests(1)</span>
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

      {/* Bottom padding */}
      <div className="h-20"></div>
    </div>
  );
};

export default MyContestsPage;