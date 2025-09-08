import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Match {
  matchId: string;
  team1: {
    name: string;
    code: string;
    logo: string;
  };
  team2: {
    name: string;
    code: string;
    logo: string;
  };
  startTime: string;
  status: string;
  league: string;
}

const HomePage: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProfile, signOut } = useAuth();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      const response = await fetch(`${apiUrl}/matches`);
      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        setMatches(data.map(match => ({
          ...match,
          startTime: match.startTime?.seconds ? 
            new Date(match.startTime.seconds * 1000).toISOString() : 
            match.startTime
        })));
      } else {
        throw new Error('Invalid data format');
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      // Mock data for development
      setMatches([
        {
          matchId: 'match_1',
          team1: {
            name: 'Mumbai Thunder',
            code: 'MUM',
            logo: 'https://via.placeholder.com/40x40/FF6B35/FFFFFF?text=MUM'
          },
          team2: {
            name: 'Delhi Dynamos',
            code: 'DEL',
            logo: 'https://via.placeholder.com/40x40/004E89/FFFFFF?text=DEL'
          },
          startTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
          status: 'upcoming',
          league: 'Pro Volleyball League'
        },
        {
          matchId: 'match_2',
          team1: {
            name: 'Chennai Chargers',
            code: 'CHE',
            logo: 'https://via.placeholder.com/40x40/FFAA00/000000?text=CHE'
          },
          team2: {
            name: 'Bangalore Blasters',
            code: 'BAN',
            logo: 'https://via.placeholder.com/40x40/7209B7/FFFFFF?text=BAN'
          },
          startTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
          status: 'upcoming',
          league: 'Pro Volleyball League'
        },
        {
          matchId: 'match_3',
          team1: {
            name: 'Kolkata Knights',
            code: 'KOL',
            logo: 'https://via.placeholder.com/40x40/9333EA/FFFFFF?text=KOL'
          },
          team2: {
            name: 'Hyderabad Hawks',
            code: 'HYD',
            logo: 'https://via.placeholder.com/40x40/F59E0B/FFFFFF?text=HYD'
          },
          startTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
          status: 'upcoming',
          league: 'Premier Volleyball Championship'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container py-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-8"></div>
                  <div className="flex items-center space-x-3">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
              <div className="bg-white rounded-lg p-2">
                <span className="text-red-600 font-bold text-lg">PV</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">PrimeV Fantasy</h1>
                <p className="text-red-100 text-sm">"Play Smart, Win Big"</p>
              </div>
            </div>
            
            <button
              onClick={signOut}
              className="bg-red-700 px-3 py-2 rounded-lg text-sm hover:bg-red-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Sports Navigation */}
      <div className="bg-red-600 text-white">
        <div className="container">
          <div className="flex justify-around py-4">
            <div className="flex flex-col items-center space-y-2 opacity-50">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2L3 7v11a2 2 0 002 2h4v-8h2v8h4a2 2 0 002-2V7l-7-5z" />
                </svg>
              </div>
              <span className="text-xs font-medium">CRICKET</span>
            </div>
            
            <div className="flex flex-col items-center space-y-2 opacity-50">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2L3 7v11a2 2 0 002 2h4v-8h2v8h4a2 2 0 002-2V7l-7-5z" />
                </svg>
              </div>
              <span className="text-xs font-medium">Kabaddi</span>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                </svg>
              </div>
              <span className="text-xs font-medium">Volleyball</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container py-4">
        {/* Prize Banner */}
        <div className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 rounded-xl p-6 text-white mb-6 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl font-bold">WIN EXCITING PRIZES</h2>
            </div>
            <p className="text-yellow-100">
              Join free contests and compete for amazing cash prizes!
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-4 text-center">
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <p className="text-2xl font-bold">{userProfile?.totalContestsJoined || 0}</p>
                <p className="text-sm text-yellow-100">Contests Joined</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <p className="text-2xl font-bold">{userProfile?.totalWins || 0}</p>
                <p className="text-sm text-yellow-100">Total Wins</p>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-white bg-opacity-10 rounded-full -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white bg-opacity-10 rounded-full -ml-8 -mb-8"></div>
        </div>

        {/* Matches Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Upcoming Matches
          </h3>

          {matches.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No matches available</h3>
              <p className="text-gray-600">Check back later for upcoming volleyball matches!</p>
            </div>
          ) : (
            matches.map((match) => (
              <Link
                key={match.matchId}
                to={`/match/${match.matchId}/contests`}
                className="block"
              >
                <div className="bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow">
                  {/* League and Time */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {match.league}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded">
                        {formatTimeLeft(match.startTime)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(match.startTime).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Teams */}
                  <div className="flex items-center justify-between">
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

                  {/* Contest Info */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                          Free Giveaway Available
                        </span>
                        <span className="text-xs font-medium text-purple-600">
                          ₹75,000
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Tap to create team</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>

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
            
            <Link to="/my-teams" className="flex flex-col items-center space-y-1 py-2">
              <div className="p-2">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs text-gray-600">My Contests</span>
            </Link>
            
            <Link to="/my-teams" className="flex flex-col items-center space-y-1 py-2">
              <div className="p-2">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <span className="text-xs text-gray-600">My Teams</span>
            </Link>
            
            <Link to="/admin" className="flex flex-col items-center space-y-1 py-2">
              <div className="p-2">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-gray-600">More</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Bottom padding to account for fixed nav */}
      <div className="h-20"></div>
    </div>
  );
};

export default HomePage;