import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
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
  spotsLeft: number;
  joinedUsers: number;
  userTeams: {
    teamId: string;
    teamName: string;
    points: number;
    rank?: number;
  }[];
  status: string;
}

const MyContestsPage: React.FC = () => {
  const { user } = useAuth();
  const { matchId } = useParams<{ matchId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [joinedMatches, setJoinedMatches] = useState<JoinedMatch[]>([]);
  const [joinedContests, setJoinedContests] = useState<JoinedContest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'live' | 'completed'>('upcoming');

  // Check if we're in match-specific context
  const isMatchSpecific = location.pathname.includes('/match/');

  useEffect(() => {
    if (isMatchSpecific && matchId) {
      fetchMatchContests();
    } else {
      fetchJoinedMatches();
    }
  }, [matchId, isMatchSpecific]);

  const fetchMatchContests = async () => {
    if (!user?.uid || !matchId) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

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
        setJoinedContests(contestsData || []);
      } else {
        console.log('No joined contests found for this match');
        setJoinedContests([]);
      }
      
    } catch (error) {
      console.error('Error fetching match contests:', error);
      setJoinedContests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchJoinedMatches = async () => {
    try {
      if (!user?.uid) return;

      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      
      // Fetch user's teams to find matches where user has teams
      const teamsResponse = await fetch(`${apiUrl}/users/${user.uid}/teams`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Fetch user's joined contests
      const contestsResponse = await fetch(`${apiUrl}/users/${user.uid}/contests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const [teamsData, contestsData] = await Promise.all([
        teamsResponse.ok ? teamsResponse.json() : [],
        contestsResponse.ok ? contestsResponse.json() : []
      ]);

      // Get unique match IDs from both teams and contests
      const matchIds = new Set([
        ...teamsData.map((team: any) => team.matchId),
        ...contestsData.map((contest: any) => contest.matchId)
      ]);

      if (matchIds.size > 0) {
        // Fetch matches data to get match details
        const matchesResponse = await fetch(`${apiUrl}/matches`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (matchesResponse.ok) {
          const matchesData = await matchesResponse.json();
          
          // Create joined matches array with proper status
          const now = new Date();
          const joinedMatchesData = Array.from(matchIds).map(matchId => {
            const match = matchesData.find((m: any) => m.matchId === matchId);
            if (!match) return null;
            
            const matchTime = match.startTime?.seconds ? 
              new Date(match.startTime.seconds * 1000) : 
              new Date(match.startTime);
            
            // Determine match status
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
            
            // Count contests and teams for this match
            const matchContests = contestsData.filter((c: any) => c.matchId === matchId);
            const matchTeams = teamsData.filter((t: any) => t.matchId === matchId);
            
            return {
              matchId: match.matchId,
              team1: match.team1,
              team2: match.team2,
              startTime: matchTime.toISOString(),
              league: match.leagueId === 'league_1757427809972' ? 'Pro Volleyball League' : 
                     match.leagueId === 'league_test' ? 'Test League' : 
                     'Volleyball League', // Default fallback
              joinedContests: matchContests.length,
              totalTeams: matchTeams.length,
              status
            };
          }).filter(Boolean);
          
          setJoinedMatches(joinedMatchesData as JoinedMatch[]);
        } else {
          console.error('Failed to fetch matches data');
          setJoinedMatches([]);
        }
      } else {
        setJoinedMatches([]);
      }
      
    } catch (error) {
      console.error('Error fetching joined matches:', error);
      setJoinedMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const getMatchesByStatus = (status: 'upcoming' | 'live' | 'completed') => {
    return joinedMatches.filter(match => match.status === status);
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
  
  const getMatchStatusBadge = (match: JoinedMatch) => {
    if (match.status === 'live') {
      return <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-medium">🔴 LIVE</span>;
    } else if (match.status === 'upcoming') {
      return <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded font-medium">{formatTimeLeft(match.startTime)}</span>;
    } else {
      return <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">COMPLETED</span>;
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
          <div className="flex items-center justify-between">
            {isMatchSpecific ? (
              <>
                <button 
                  onClick={() => navigate('/')}
                  className="flex items-center text-white hover:text-gray-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0L2.586 11a2 2 0 010-2.828L6.293 4.465a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l3.293 3.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Back
                </button>
                <h1 className="text-xl font-bold">My Contests</h1>
                <div className="w-16"></div>
              </>
            ) : (
              <div className="w-full text-center">
                <h1 className="text-xl font-bold">My Contests</h1>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container py-4">
        {isMatchSpecific ? (
          /* Match-specific contests view */
          joinedContests.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No contests joined</h3>
              <p className="text-gray-600">You haven't joined any contests for this match yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {joinedContests.map((contest) => (
                <div key={contest.contestId} className="bg-white rounded-lg border shadow-sm">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-800">{contest.contestName}</h3>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">₹{contest.totalPrizePool?.toLocaleString() || '0'}</div>
                        <div className="text-xs text-gray-600">Total Prize</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <span>Entry Fee: ₹{contest.entryFee}</span>
                      <span>{contest.spotsLeft} spots left</span>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      {contest.userTeams.map((team) => (
                        <div key={team.teamId} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                          <span className="font-medium text-blue-800">{team.teamName}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-blue-700">{team.points} pts</span>
                            {team.rank && team.rank > 0 && (
                              <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                                Rank #{team.rank}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Link
                      to={`/contest/${contest.contestId}/leaderboard`}
                      className="w-full bg-red-600 text-white py-2 rounded text-center font-medium hover:bg-red-700 transition-colors block"
                    >
                      View Leaderboard
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* General My Contests view with tabs */
          <div>
            {/* Tabs */}
            <div className="bg-white border-b mb-4">
              <div className="flex space-x-0">
                {[
                  { key: 'upcoming' as const, label: 'Upcoming', count: getMatchesByStatus('upcoming').length },
                  { key: 'live' as const, label: 'Live', count: getMatchesByStatus('live').length },
                  { key: 'completed' as const, label: 'Completed', count: getMatchesByStatus('completed').length }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                      activeTab === tab.key
                        ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
            </div>
            
            {/* Tab Content */}
            {getMatchesByStatus(activeTab).length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No contests found</h3>
                <p className="text-gray-600 mb-6">
                  {activeTab === 'upcoming' && 'No upcoming contests found. Start by creating a team for an upcoming match!'}
                  {activeTab === 'live' && 'No live contests at the moment.'}
                  {activeTab === 'completed' && 'No completed contests found. Join some contests to see your history!'}
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
                {getMatchesByStatus(activeTab).map((match) => (
                  <div key={match.matchId} className="bg-white rounded-lg p-4 shadow-sm border">
                    {/* Tournament Name - Centered */}
                    <div className="text-center mb-3">
                      <span className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                        {match.league}
                      </span>
                    </div>

                    {/* Match Time and Status */}
                    <div className="text-center mb-3">
                      <div className="text-sm font-medium text-gray-800">
                        {new Date(match.startTime).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })} • {new Date(match.startTime).toLocaleDateString('en-IN')}
                      </div>
                      <div className="mt-1">
                        {getMatchStatusBadge(match)}
                      </div>
                    </div>

                    {/* Teams */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3 flex-1">
                        <img
                          src={match.team1.logo}
                          alt={match.team1.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="text-center flex-1">
                          <div className="font-medium text-gray-800">{match.team1.code}</div>
                        </div>
                      </div>
                      
                      <div className="text-center px-4">
                        <div className="text-xs text-gray-600 font-medium">VS</div>
                      </div>
                      
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="text-center flex-1">
                          <div className="font-medium text-gray-800">{match.team2.code}</div>
                        </div>
                        <img
                          src={match.team2.logo}
                          alt={match.team2.name}
                          className="w-10 h-10 rounded-full"
                        />
                      </div>
                    </div>

                    {/* Contest and Team Info */}
                    <div className="text-center text-sm text-gray-600 mb-3">
                      Joined {match.joinedContests} contests with {match.totalTeams} teams
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {match.status === 'upcoming' && (
                        <Link
                          to={`/match/${match.matchId}/contests`}
                          className="flex items-center justify-center w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          Join More Contests
                        </Link>
                      )}
                      
                      {(match.status === 'live' || match.status === 'completed') && (
                        <Link
                          to={`/match/${match.matchId}/my-contests`}
                          className="flex items-center justify-center w-full bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                          </svg>
                          View Contests & Leaderboards
                        </Link>
                      )}
                      
                      {match.status === 'completed' && (
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="text-sm text-green-600 font-medium">
                            🏆 Check your winnings in contest leaderboards
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="container py-2">
          <div className="flex justify-around">
            {isMatchSpecific ? (
              /* Match-specific navigation: Contests | My Contests | My Teams */
              <>
                <Link to={`/match/${matchId}/contests`} className="flex flex-col items-center space-y-1 py-2">
                  <div className="p-2">
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600">Contests</span>
                </Link>
                
                <Link to={`/match/${matchId}/my-contests`} className="flex flex-col items-center space-y-1 py-2">
                  <div className="bg-red-600 rounded-full p-2">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-red-600">My Contests</span>
                </Link>
                
                <Link to={`/match/${matchId}/my-teams`} className="flex flex-col items-center space-y-1 py-2">
                  <div className="p-2">
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600">My Teams</span>
                </Link>
              </>
            ) : (
              /* Main screen navigation: Home | My Contests | My Profile */
              <>
                <Link to="/" className="flex flex-col items-center space-y-1 py-2">
                  <div className="p-2">
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L9 5.414V17a1 1 0 102 0V5.414l5.293 5.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600">Home</span>
                </Link>
                
                <Link to="/my-contests" className="flex flex-col items-center space-y-1 py-2">
                  <div className="bg-red-600 rounded-full p-2">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-red-600">My Contests({joinedMatches.length})</span>
                </Link>
                
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