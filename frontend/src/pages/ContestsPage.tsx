import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import pvlLogo from '../assets/pvl-logo.svg';

interface Contest {
  contestId: string;
  matchId: string;
  templateId: string;
  name: string;
  description: string;
  entryFee: number;
  totalPrizePool: number;
  maxSpots: number;
  spotsLeft: number;
  joinedUsers: number;
  maxTeamsPerUser: number;
  isGuaranteed: boolean;
  prizeDistribution?: Array<{
    rankStart: number;
    rankEnd: number;
    prizeAmount: number;
    prizeType: 'cash' | 'kind';
    prizeDesc: string;
  }>;
  status: string;
}

interface Match {
  matchId: string;
  team1: { name: string; code: string; logo: string };
  team2: { name: string; code: string; logo: string };
  startTime: string;
  league: string;
}

interface UserTeam {
  teamId: string;
  teamName: string;
  matchId: string;
  contestId: string;
  players: any[];
  captainId: string;
  viceCaptainId: string;
  totalPoints: number;
  rank: number;
}

const ContestsPage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [contests, setContests] = useState<Contest[]>([]);
  const [match, setMatch] = useState<Match | null>(null);
  const [userTeams, setUserTeams] = useState<UserTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'prizePool' | 'spots' | 'winners' | 'entry'>('prizePool');
  const [creditsLeft] = useState(106.93);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [joiningContest, setJoiningContest] = useState(false);

  useEffect(() => {
    fetchContests();
    fetchUserTeams();
  }, [matchId, user]);

  const fetchUserTeams = async () => {
    if (!user?.uid || !matchId) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      const response = await fetch(`${apiUrl}/users/${user.uid}/teams`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const teamsData = await response.json();
        // Filter teams for current match
        const matchTeams = teamsData.filter((team: UserTeam) => team.matchId === matchId);
        setUserTeams(matchTeams || []);
      }
    } catch (error) {
      console.error('Error fetching user teams:', error);
    }
  };

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
            currentMatch.startTime,
          league: currentMatch.leagueId === 'pvl_2025_season1' ? 'Prime Volleyball League' :
                 currentMatch.leagueId === 'league_1757427809972' ? 'Pro Volleyball League' : 
                 currentMatch.leagueId === 'league_test' ? 'Test League' : 
                 'Volleyball League' // Default fallback
        });
      }

      // Fetch contests for this match
      const contestResponse = await fetch(`${apiUrl}/contests`);
      const allContests = await contestResponse.json();
      
      // Filter contests for this specific match
      const matchContests = allContests.filter((contest: any) => contest.matchId === matchId);
      console.log('Real contests for match:', matchContests);
      
      setContests(matchContests || []);
      
    } catch (error) {
      console.error('Error fetching contests:', error);
      
      // Show empty state if no real contests available
      setContests([]);
    } finally {
      setLoading(false);
    }
  };

  const sortContests = (contests: Contest[]) => {
    return [...contests].sort((a, b) => {
      switch (sortBy) {
        case 'prizePool': return (b.totalPrizePool || 0) - (a.totalPrizePool || 0);
        case 'spots': return (a.spotsLeft || 0) - (b.spotsLeft || 0);
        case 'winners': return (b.prizeDistribution?.length || 0) - (a.prizeDistribution?.length || 0);
        case 'entry': return (a.entryFee || 0) - (b.entryFee || 0);
        default: return 0;
      }
    });
  };

  const isMatchLive = () => {
    if (!match) return false;
    const now = new Date();
    const matchTime = new Date(match.startTime);
    const timeDiff = matchTime.getTime() - now.getTime();
    return timeDiff <= 0; // Match has started
  };

  const handleJoinContest = (contest: Contest) => {
    // Prevent joining contests for live or completed matches
    if (isMatchLive()) {
      alert('Cannot join contests for matches that have already started.');
      return;
    }
    
    if (userTeams.length === 0) {
      // No teams for this match, redirect to create team
      navigate(`/match/${matchId}/create-team?contestId=${contest.contestId}`);
    } else {
      // User has teams, show selection modal
      setSelectedContest(contest);
      setSelectedTeamIds([]);
      setShowTeamModal(true);
    }
  };

  const handleTeamSelection = (teamId: string) => {
    if (!selectedContest) return;
    
    const maxTeams = selectedContest.maxTeamsPerUser;
    
    if (selectedTeamIds.includes(teamId)) {
      // Remove team from selection
      setSelectedTeamIds(prev => prev.filter(id => id !== teamId));
    } else {
      // Add team to selection
      if (selectedTeamIds.length < maxTeams) {
        setSelectedTeamIds(prev => [...prev, teamId]);
      } else if (maxTeams === 1) {
        // Single team selection - replace current selection
        setSelectedTeamIds([teamId]);
      }
    }
  };

  const confirmJoinContest = async () => {
    if (!selectedContest || selectedTeamIds.length === 0) return;
    
    setJoiningContest(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        alert('Please login first');
        return;
      }

      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      
      // Join contest with selected teams
      const response = await fetch(`${apiUrl}/contests/${selectedContest.contestId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          teamIds: selectedTeamIds,
          userId: user?.uid,
          matchId: matchId
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      
      const joinResult = await response.json();
      console.log('Contest join result:', joinResult);

      // Success - update UI
      alert(`Successfully joined contest with ${selectedTeamIds.length} team${selectedTeamIds.length > 1 ? 's' : ''}!`);
      
      // Update contest spots
      setContests(prev => prev.map(contest => 
        contest.contestId === selectedContest.contestId 
          ? { ...contest, spotsLeft: contest.spotsLeft - selectedTeamIds.length }
          : contest
      ));
      
      setShowTeamModal(false);
      setSelectedContest(null);
      setSelectedTeamIds([]);
      
    } catch (error) {
      console.error('Error joining contest:', error);
      alert(`Failed to join contest: ${error}`);
    } finally {
      setJoiningContest(false);
    }
  };

  const formatTimeLeft = (startTime: string) => {
    const now = new Date();
    const matchTime = new Date(startTime);
    const diff = matchTime.getTime() - now.getTime();

    if (diff <= 0) return 'LIVE';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m Left`;
  };

  const formatPrizeDisplay = (prizeDistribution?: Array<any>) => {
    if (!prizeDistribution || prizeDistribution.length === 0) {
      return 'Prize details available';
    }
    
    return prizeDistribution.slice(0, 2).map(prize => {
      const rankText = prize.rankStart === prize.rankEnd 
        ? `Rank ${prize.rankStart}` 
        : `Rank ${prize.rankStart}-${prize.rankEnd}`;
      
      const prizeText = prize.prizeType === 'cash' 
        ? `₹${(prize.prizeAmount || 0).toLocaleString()}` 
        : (prize.prizeDesc || 'Prize');
      
      return `${rankText}: ${prizeText}`;
    }).join(' | ') + (prizeDistribution.length > 2 ? ' | ...' : '');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contests...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Match not found</p>
          <Link to="/" className="text-black hover:underline mt-2 block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white shadow-sm border-b sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center text-white hover:text-gray-300 mr-4"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0L2.586 11a2 2 0 010-2.828L6.293 4.465a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l3.293 3.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            <img src={pvlLogo} alt="Prime Volleyball League" className="h-10 w-auto" />
            
            <div className="text-center flex-1 mx-4">
              <div className="flex items-center justify-center space-x-2 text-sm">
                <span className="font-medium">{match.team1.code}</span>
                <span className="text-gray-300">vs</span>
                <span className="font-medium">{match.team2.code}</span>
              </div>
              <div className="text-xs text-gray-300 font-medium">
                {formatTimeLeft(match.startTime)}
              </div>
            </div>

            <div className="bg-gray-800 px-3 py-1 rounded-full flex items-center space-x-1">
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
          </div>
        </div>
      </div>

      {/* Contests */}
      <main className="container py-4">
        {contests.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No contests available</h3>
            <p className="text-gray-600">Contests for this match haven't been created yet.</p>
            <Link 
              to="/"
              className="inline-block mt-4 text-black hover:underline"
            >
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sortContests(contests).map((contest) => (
              <div key={contest.contestId} className="bg-white rounded-lg border shadow-sm">
                {/* Contest Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-800">{contest.name}</h3>
                      {contest.isGuaranteed && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                          Guaranteed
                        </span>
                      )}
                    </div>
                    <button className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                      ₹{contest.entryFee}
                    </button>
                  </div>
                  
                  {/* Prize Pool */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Prize Pool</span>
                      <span className="font-semibold text-gray-800">
                        ₹{(contest.totalPrizePool || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>{(contest.spotsLeft || 0).toLocaleString()} Spots Left</span>
                      <span>{(contest.maxSpots || 0).toLocaleString()} Spots</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-black h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${contest.maxSpots ? ((contest.maxSpots - (contest.spotsLeft || 0)) / contest.maxSpots) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Prize Structure */}
                  {contest.prizeDistribution && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                      <h5 className="text-xs font-medium text-green-800 mb-2">Prize Structure:</h5>
                      <div className="text-xs text-green-700">
                        {formatPrizeDisplay(contest.prizeDistribution)}
                      </div>
                    </div>
                  )}

                  {/* Contest Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="text-gray-600">
                        Max {contest.maxTeamsPerUser} teams per user
                      </div>
                      <div className="text-gray-600">
                        {contest.joinedUsers} users joined
                      </div>
                    </div>
                  </div>
                </div>

                {/* Join Button */}
                <div className="p-4">
                  {isMatchLive() ? (
                    <button 
                      disabled
                      className="w-full bg-gray-400 text-white py-3 rounded-lg font-medium cursor-not-allowed"
                    >
                      MATCH STARTED - CANNOT JOIN
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleJoinContest(contest)}
                      className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      JOIN CONTEST
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Navigation - Match-Specific Context */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="container py-2">
          <div className="flex justify-around">
            {/* Contests (active) */}
            <div className="flex flex-col items-center space-y-1 py-2">
              <div className="bg-black rounded-full p-2">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-black">Contests</span>
            </div>
            
            <Link to={`/match/${matchId}/my-contests`} className="flex flex-col items-center space-y-1 py-2">
              <div className="p-2">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <span className="text-xs text-gray-600">My Contests(0)</span>
            </Link>
            
            <Link to={`/match/${matchId}/my-teams`} className="flex flex-col items-center space-y-1 py-2">
              <div className="p-2">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <span className="text-xs text-gray-600">My Teams(0)</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Bottom padding */}
      <div className="h-20"></div>
      
      {/* Team Selection Modal */}
      {showTeamModal && selectedContest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Select Teams</h2>
                <button 
                  onClick={() => setShowTeamModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Select {selectedContest.maxTeamsPerUser === 1 ? '1 team' : `up to ${selectedContest.maxTeamsPerUser} teams`} to join "{selectedContest.name}"
              </p>
            </div>
            
            {/* Teams List */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {userTeams.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-600">No teams found for this match.</p>
                  <button
                    onClick={() => {
                      setShowTeamModal(false);
                      navigate(`/match/${matchId}/create-team?contestId=${selectedContest.contestId}`);
                    }}
                    className="mt-3 text-black hover:underline"
                  >
                    Create a team first
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {userTeams.map((team) => (
                    <div
                      key={team.teamId}
                      onClick={() => handleTeamSelection(team.teamId)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedTeamIds.includes(team.teamId)
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-800">{team.teamName}</h3>
                          <p className="text-sm text-gray-600">
                            {team.players?.length || 6} players • {team.totalPoints} points
                          </p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedTeamIds.includes(team.teamId)
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedTeamIds.includes(team.teamId) && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 border-t">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600">
                  {selectedTeamIds.length} of {selectedContest.maxTeamsPerUser} teams selected
                </div>
                <div className="text-sm font-medium text-gray-800">
                  Entry Fee: ₹{(selectedContest.entryFee * selectedTeamIds.length).toFixed(2)}
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowTeamModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmJoinContest}
                  disabled={selectedTeamIds.length === 0 || joiningContest}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {joiningContest ? 'Joining...' : `Join Contest (${selectedTeamIds.length})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContestsPage;