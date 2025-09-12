import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface JoinedMatch {
  matchId: string;
  team1: { name: string; code: string; logo: string };
  team2: { name: string; code: string; logo: string };
  startTime: string;
  league: string;
  joinedContests: number;
  totalTeams: number;
  status: 'upcoming' | 'live' | 'completed';
}

interface JoinedContest {
  contestId: string;
  contestName: string;
  entryFee: number;
  totalPrizePool: number;
  maxSpots: number;
  joinedUsers: number;
  userTeams: {
    teamId: string;
    teamName: string;
    points: number;
    rank?: number;
  }[];
  status: 'upcoming' | 'live' | 'completed';
}

const MyContestsPage: React.FC = () => {
  const { user } = useAuth();
  const { matchId } = useParams<{ matchId: string }>();
  const location = useLocation();
  const [joinedMatches, setJoinedMatches] = useState<JoinedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'live' | 'completed'>('live');
  const [selectedMatchContests, setSelectedMatchContests] = useState<JoinedContest[]>([]);
  const [showMatchContests, setShowMatchContests] = useState(false);
  const [selectedMatchInfo, setSelectedMatchInfo] = useState<JoinedMatch | null>(null);

  // Check if we're in match-specific context
  const isMatchSpecific = location.pathname.includes('/match/');

  useEffect(() => {
    fetchJoinedMatches();
  }, [matchId]);

  const fetchJoinedMatches = async () => {
    try {
      if (!user?.uid) return;

      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      
      // Fetch user's joined contests
      const contestsResponse = await fetch(`${apiUrl}/users/${user.uid}/contests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (contestsResponse.ok) {
        const joinedContests = await contestsResponse.json();
        console.log('User joined contests:', joinedContests);
        
        // Fetch matches data to get match details
        const matchesResponse = await fetch(`${apiUrl}/matches`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (matchesResponse.ok) {
          const matchesData = await matchesResponse.json();
          
          // Group contests by match and count teams
          const matchContestMap: { [matchId: string]: { contests: number; teams: number } } = {};
          
          joinedContests.forEach((contest: any) => {
            if (!matchContestMap[contest.matchId]) {
              matchContestMap[contest.matchId] = { contests: 0, teams: 0 };
            }
            matchContestMap[contest.matchId].contests += 1;
            matchContestMap[contest.matchId].teams += contest.teamsCount || 1;
          });
          
          // Create joined matches array with status
          const now = new Date();
          const joinedMatchesData = Object.keys(matchContestMap).map(matchId => {
            const match = matchesData.find((m: any) => m.matchId === matchId);
            if (!match) return null;
            
            const matchTime = match.startTime?.seconds ? 
              new Date(match.startTime.seconds * 1000) : 
              new Date(match.startTime);
            
            let status: 'upcoming' | 'live' | 'completed';
            const timeDiff = matchTime.getTime() - now.getTime();
            const hoursUntilMatch = timeDiff / (1000 * 60 * 60);
            
            if (hoursUntilMatch > 0) {
              status = 'upcoming';
            } else if (hoursUntilMatch > -3) { // Consider live for 3 hours after start
              status = 'live';
            } else {
              status = 'completed';
            }
            
            return {
              matchId: match.matchId,
              team1: match.team1,
              team2: match.team2,
              startTime: matchTime.toISOString(),
              league: match.leagueId || match.league || 'Volleyball League',
              joinedContests: matchContestMap[matchId].contests,
              totalTeams: matchContestMap[matchId].teams,
              status
            };
          }).filter(Boolean);
          
          setJoinedMatches(joinedMatchesData as JoinedMatch[]);
        } else {
          console.error('Failed to fetch matches data');
          setJoinedMatches([]);
        }
      } else {
        console.log('No joined contests found or failed to fetch');
        setJoinedMatches([]);
      }
      
    } catch (error) {
      console.error('Error fetching joined matches:', error);
      setJoinedMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchContests = async (matchId: string) => {
    if (!user?.uid) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      
      // Fetch user's joined contests for this specific match
      const response = await fetch(`${apiUrl}/users/${user.uid}/contests?matchId=${matchId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const contestsData = await response.json();
        console.log('Match contests data:', contestsData);
        setSelectedMatchContests(contestsData || []);
      } else {
        console.error('Failed to fetch match contests');
        setSelectedMatchContests([]);
      }
      
    } catch (error) {
      console.error('Error fetching match contests:', error);
      setSelectedMatchContests([]);
    }
  };

  const handleMatchClick = (match: JoinedMatch) => {
    setSelectedMatchInfo(match);
    setShowMatchContests(true);
    fetchMatchContests(match.matchId);
  };

  const formatTimeLeft = (startTime: string) => {
    const now = new Date();
    const matchTime = new Date(startTime);
    const diff = matchTime.getTime() - now.getTime();

    if (diff <= 0) {
      const hoursAfter = Math.abs(diff) / (1000 * 60 * 60);
      if (hoursAfter <= 3) return 'LIVE';
      return 'COMPLETED';
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m Left`;
  };
  
  const getFilteredMatches = () => {
    return joinedMatches.filter(match => match.status === activeTab);
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
        {joinedMatches.length === 0 ? (
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
            {/* List of matches where user has joined contests */}
            {joinedMatches.map((match) => (
              <Link
                key={match.matchId}
                to={`/match/${match.matchId}/contests`}
                className="block"
              >
                <div className="bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow">
                  {/* Tournament Name - Centered */}
                  <div className="text-center mb-3">
                    <span className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      {match.league}
                    </span>
                  </div>

                  {/* Match Time and Timer */}
                  <div className="text-center mb-3">
                    <div className="text-sm font-medium text-gray-800">
                      {new Date(match.startTime).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </div>
                    <div className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded mt-1">
                      {formatTimeLeft(match.startTime)}
                    </div>
                  </div>

                  {/* Teams */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3 flex-1">
                      <img
                        src={match.team1.logo}
                        alt={match.team1.name}
                        className="w-10 h-10 rounded-full bg-gray-100"
                      />
                      <div>
                        <p className="font-medium text-gray-800">{match.team1.code}</p>
                        <p className="text-xs text-gray-600 truncate max-w-20">
                          {match.team1.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex-shrink-0 mx-4">
                      <span className="text-sm font-medium text-gray-600">VS</span>
                    </div>

                    <div className="flex items-center space-x-3 flex-1 flex-row-reverse">
                      <img
                        src={match.team2.logo}
                        alt={match.team2.name}
                        className="w-10 h-10 rounded-full bg-gray-100"
                      />
                      <div className="text-right">
                        <p className="font-medium text-gray-800">{match.team2.code}</p>
                        <p className="text-xs text-gray-600 truncate max-w-20">
                          {match.team2.name}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contest Status */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-green-800">
                        Joined {match.joinedContests} contests with {match.totalTeams} teams
                      </div>
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Navigation - Context Aware */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="container py-2">
          <div className="flex justify-around">
            {isMatchSpecific ? (
              // Match-specific navigation
              <>
                <Link to={`/match/${matchId}/contests`} className="flex flex-col items-center space-y-1 py-2">
                  <div className="p-2">
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600">Contests</span>
                </Link>
                
                <div className="flex flex-col items-center space-y-1 py-2">
                  <div className="bg-red-600 rounded-full p-2">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-red-600">My Contests(1)</span>
                </div>
                
                <Link to={`/match/${matchId}/my-teams`} className="flex flex-col items-center space-y-1 py-2">
                  <div className="p-2">
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600">My Teams(1)</span>
                </Link>
              </>
            ) : (
              // Main navigation
              <>
                <Link to="/" className="flex flex-col items-center space-y-1 py-2">
                  <div className="p-2">
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-9 9a1 1 0 001.414 1.414L2 12.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-4.586l.293.293a1 1 0 001.414-1.414l-9-9z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600">Home</span>
                </Link>
                
                <div className="flex flex-col items-center space-y-1 py-2">
                  <div className="bg-red-600 rounded-full p-2">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-red-600">My Contests</span>
                </div>
                
                <Link to="/my-profile" className="flex flex-col items-center space-y-1 py-2">
                  <div className="p-2">
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600">My Profile</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Bottom padding */}
      <div className="h-20"></div>
    </div>
  );
};

export default MyContestsPage;