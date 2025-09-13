import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PointSystemModal from '../components/PointSystemModal';
import pvlLogo from '../assets/pvl-logo.svg';

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
  const [showPointSystem, setShowPointSystem] = useState(false);
  const { userProfile } = useAuth();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      const response = await fetch(`${apiUrl}/matches`);
      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        const upcomingMatches = data
          .map(match => ({
            ...match,
            startTime: match.startTime?.seconds ? 
              new Date(match.startTime.seconds * 1000).toISOString() : 
              match.startTime,
            league: match.leagueId === 'pvl_2025_season1' ? 'Prime Volleyball League' :
                   match.leagueId === 'league_1757427809972' ? 'Pro Volleyball League' : 
                   match.leagueId === 'league_test' ? 'Test League' : 
                   'Volleyball League' // Default fallback
          }))
          .filter(match => {
            const matchTime = new Date(match.startTime);
            const now = new Date();
            return matchTime.getTime() > now.getTime(); // Only show upcoming matches
          });
        
        setMatches(upcomingMatches);
      } else {
        throw new Error('Invalid data format');
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      
      // Show empty state if no real matches available
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const [currentTime, setCurrentTime] = useState(new Date());

  // Update timer every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const formatTimeLeft = (startTime: string) => {
    const matchTime = new Date(startTime);
    const diff = matchTime.getTime() - currentTime.getTime();

    if (diff <= 0) {
      return {
        status: 'live',
        timeLeft: 'LIVE',
        matchTime: matchTime.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      };
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return {
      status: 'upcoming',
      timeLeft: `${hours}h ${minutes}m Left`,
      matchTime: matchTime.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
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
      <header className="bg-black text-white">
        <div className="container py-5">
          <div className="flex items-center justify-between">
            <div className="w-8"></div>
            <img src={pvlLogo} alt="Prime Volleyball League" className="h-12 w-auto" />
            <button
              onClick={() => setShowPointSystem(true)}
              className="flex items-center text-white hover:text-gray-300 transition-colors p-1"
              title="Fantasy Point System"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-3">
        {/* Prize Banner */}
        <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-lg p-3 text-white mb-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold">WIN EXCITING PRIZES</h2>
              <p className="text-red-100 text-xs">Join free contests!</p>
            </div>
            <div className="text-right">
              <div className="text-base font-bold">{userProfile?.totalWins || 0}</div>
              <div className="text-xs text-red-100">Total Wins</div>
            </div>
          </div>
        </div>

        {/* Matches Section */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
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
            matches.map((match) => {
              const timeInfo = formatTimeLeft(match.startTime);
              
              return (
                <Link
                  key={match.matchId}
                  to={`/match/${match.matchId}/contests`}
                  className="block"
                >
                  <div className="bg-white rounded-lg p-3 shadow-sm border hover:shadow-md transition-shadow">
                    {/* Tournament Name - Centered */}
                    <div className="text-center mb-2">
                      <span className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                        {match.league}
                      </span>
                    </div>

                    {/* Match Date and Time */}
                    <div className="text-center mb-2">
                      <div className="text-xs text-gray-600 mb-1">
                        {new Date(match.startTime).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </div>
                      <div className="text-sm font-medium text-gray-800">
                        {timeInfo.matchTime}
                      </div>
                      <div className={`text-xs font-medium px-2 py-0.5 rounded mt-1 ${
                        timeInfo.status === 'live' 
                          ? 'text-red-600 bg-red-100' 
                          : 'text-orange-600 bg-orange-100'
                      }`}>
                        {timeInfo.timeLeft}
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
                    <div className="mt-3 pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded">
                          Free Giveaway Available
                        </span>
                        <span className="text-xs font-medium text-purple-600">
                          ₹75,000
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </main>

      {/* Bottom Navigation - Main Screen */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="container py-2">
          <div className="flex justify-around">
            <Link to="/" className="flex flex-col items-center space-y-1 py-2">
              <div className="bg-red-600 rounded-full p-2">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-9 9a1 1 0 001.414 1.414L2 12.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-4.586l.293.293a1 1 0 001.414-1.414l-9-9z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-red-600">Home</span>
            </Link>
            
            <Link to="/my-contests" className="flex flex-col items-center space-y-1 py-2">
              <div className="p-2">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <span className="text-xs text-gray-600">My Contests</span>
            </Link>
            
            <Link to="/my-profile" className="flex flex-col items-center space-y-1 py-2">
              <div className="p-2">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
              </div>
              <span className="text-xs text-gray-600">My Profile</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Bottom padding to account for fixed nav */}
      <div className="h-20"></div>
      
      {/* Point System Modal */}
      <PointSystemModal 
        isOpen={showPointSystem}
        onClose={() => setShowPointSystem(false)}
      />
    </div>
  );
};

export default HomePage;