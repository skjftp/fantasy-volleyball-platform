import React, { useState, useEffect } from 'react';

interface Match {
  matchId: string;
  leagueId: string;
  team1Id: string;
  team2Id: string;
  team1: { name: string; code: string; logo: string };
  team2: { name: string; code: string; logo: string };
  startTime: string;
  status: string;
  venue: string;
  round: string;
  createdAt: string;
}

interface ContestTemplate {
  templateId: string;
  name: string;
  description: string;
  entryFee: number;
  totalPrizePool: number;
  maxSpots: number;
  maxTeamsPerUser: number;
  isGuaranteed: boolean;
  prizeDistribution: PrizeRank[];
  createdAt: string;
}

interface PrizeRank {
  rankStart: number;
  rankEnd: number;
  prizeAmount: number;
  prizeType: 'cash' | 'kind';
  prizeDesc: string;
}

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
  prizeDistribution: PrizeRank[];
  status: string;
  createdAt: string;
}

interface ContestManagerProps {
  getAuthHeaders: () => Record<string, string>;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const ContestManager: React.FC<ContestManagerProps> = ({ getAuthHeaders, loading, setLoading }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [templates, setTemplates] = useState<ContestTemplate[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  useEffect(() => {
    fetchMatches();
    fetchTemplates();
    fetchContests();
  }, []);

  const fetchMatches = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      const response = await fetch(`${apiUrl}/admin/matches`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setMatches(data || []);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      const response = await fetch(`${apiUrl}/admin/contest-templates`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setTemplates(data || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchContests = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      const response = await fetch(`${apiUrl}/admin/contests`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setContests(data || []);
      }
    } catch (error) {
      console.error('Error fetching contests:', error);
    }
  };

  const handleCreateContest = async () => {
    if (!selectedMatchId || !selectedTemplateId) {
      alert('Please select both a match and template');
      return;
    }

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      
      const selectedMatch = matches.find(m => m.matchId === selectedMatchId);
      const selectedTemplate = templates.find(t => t.templateId === selectedTemplateId);
      
      if (!selectedMatch || !selectedTemplate) {
        alert('Invalid match or template selection');
        return;
      }

      const contestData = {
        contestId: `contest_${Date.now()}`,
        matchId: selectedMatchId,
        templateId: selectedTemplateId,
        name: `${selectedTemplate.name} - ${selectedMatch.team1.code} vs ${selectedMatch.team2.code}`,
        description: selectedTemplate.description,
        entryFee: selectedTemplate.entryFee,
        totalPrizePool: selectedTemplate.totalPrizePool,
        maxSpots: selectedTemplate.maxSpots,
        spotsLeft: selectedTemplate.maxSpots,
        joinedUsers: 0,
        maxTeamsPerUser: selectedTemplate.maxTeamsPerUser,
        isGuaranteed: selectedTemplate.isGuaranteed,
        prizeDistribution: selectedTemplate.prizeDistribution,
        status: 'open',
        createdAt: new Date().toISOString()
      };

      const response = await fetch(`${apiUrl}/admin/contests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(contestData)
      });

      if (response.ok) {
        alert(`Contest created successfully for ${selectedMatch.team1.code} vs ${selectedMatch.team2.code}!`);
        setSelectedMatchId('');
        setSelectedTemplateId('');
        fetchContests();
      } else {
        const errorText = await response.text();
        alert(`Failed to create contest: ${errorText}`);
      }
    } catch (error) {
      console.error('Error creating contest:', error);
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContest = async (contestId: string, contestName: string) => {
    if (!confirm(`Are you sure you want to delete "${contestName}"? This cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      const response = await fetch(`${apiUrl}/admin/contests/${contestId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        alert('Contest deleted successfully!');
        fetchContests();
      } else {
        alert('Failed to delete contest');
      }
    } catch (error) {
      console.error('Error deleting contest:', error);
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  const formatPrizeDisplay = (prizeRanks: PrizeRank[]) => {
    if (!prizeRanks || prizeRanks.length === 0) return 'No prizes defined';
    
    return prizeRanks.map(prize => {
      const rankText = prize.rankStart === prize.rankEnd 
        ? `Rank ${prize.rankStart}` 
        : `Rank ${prize.rankStart}-${prize.rankEnd}`;
      
      const prizeText = prize.prizeType === 'cash' 
        ? `₹${(prize.prizeAmount || 0).toLocaleString()}` 
        : (prize.prizeDesc || 'Prize');
      
      return `${rankText}: ${prizeText}`;
    }).join(' | ');
  };

  const selectedMatch = matches.find(m => m.matchId === selectedMatchId);
  const selectedTemplate = templates.find(t => t.templateId === selectedTemplateId);

  return (
    <div className="space-y-8">
      {/* Create Contest */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Step 7: Create Contest for Match
        </h2>
        
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Match</label>
            <select
              value={selectedMatchId}
              onChange={(e) => setSelectedMatchId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a match...</option>
              {matches.map(match => (
                <option key={match.matchId} value={match.matchId}>
                  {match.team1.code} vs {match.team2.code} - {new Date(match.startTime).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Contest Template</label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a template...</option>
              {templates.map(template => (
                <option key={template.templateId} value={template.templateId}>
                  {template.name} - ₹{(template.totalPrizePool || 0).toLocaleString()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Preview */}
        {selectedMatch && selectedTemplate && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-800 mb-2">Contest Preview</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
              <div>
                <strong>Match:</strong> {selectedMatch.team1.code} vs {selectedMatch.team2.code}<br/>
                <strong>Venue:</strong> {selectedMatch.venue}<br/>
                <strong>Time:</strong> {new Date(selectedMatch.startTime).toLocaleString()}
              </div>
              <div>
                <strong>Template:</strong> {selectedTemplate.name}<br/>
                <strong>Entry Fee:</strong> ₹{selectedTemplate.entryFee}<br/>
                <strong>Prize Pool:</strong> ₹{(selectedTemplate.totalPrizePool || 0).toLocaleString()}<br/>
                <strong>Max Spots:</strong> {(selectedTemplate.maxSpots || 0).toLocaleString()}
              </div>
            </div>
            <div className="mt-3">
              <strong className="text-blue-800">Prize Structure:</strong><br/>
              <span className="text-sm">{formatPrizeDisplay(selectedTemplate.prizeDistribution)}</span>
            </div>
          </div>
        )}

        <button
          onClick={handleCreateContest}
          disabled={loading || !selectedMatchId || !selectedTemplateId}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-md font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Creating Contest...' : 'Create Contest'}
        </button>
      </div>

      {/* Existing Contests */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Created Contests ({contests.length})</h3>
        </div>
        
        {contests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p>No contests created yet. Create your first contest above.</p>
          </div>
        ) : (
          <div className="divide-y">
            {contests.map((contest) => {
              const match = matches.find(m => m.matchId === contest.matchId);
              
              return (
                <div key={contest.contestId} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <h4 className="font-medium text-gray-800 text-lg">{contest.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          contest.status === 'open' ? 'bg-green-100 text-green-800' :
                          contest.status === 'live' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {contest.status.toUpperCase()}
                        </span>
                        {contest.isGuaranteed && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                            Guaranteed
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <strong>Match:</strong> {match ? `${match.team1.code} vs ${match.team2.code}` : 'Unknown'}<br/>
                          <strong>Venue:</strong> {match?.venue || 'TBA'}<br/>
                          <strong>Date:</strong> {match ? new Date(match.startTime).toLocaleDateString() : 'TBA'}
                        </div>
                        <div>
                          <strong>Entry Fee:</strong> ₹{contest.entryFee}<br/>
                          <strong>Prize Pool:</strong> ₹{(contest.totalPrizePool || 0).toLocaleString()}<br/>
                          <strong>Spots:</strong> {contest.spotsLeft}/{contest.maxSpots} available<br/>
                          <strong>Joined:</strong> {contest.joinedUsers} users
                        </div>
                      </div>

                      {contest.prizeDistribution && contest.prizeDistribution.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Prize Distribution:</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {contest.prizeDistribution.map((prize, idx) => (
                              <div key={idx} className="text-xs text-gray-600">
                                {prize.rankStart === prize.rankEnd 
                                  ? `Rank ${prize.rankStart}` 
                                  : `Rank ${prize.rankStart}-${prize.rankEnd}`
                                }: {prize.prizeType === 'cash' 
                                    ? `₹${(prize.prizeAmount || 0).toLocaleString()}` 
                                    : (prize.prizeDesc || 'Prize')
                                  }
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => alert('Contest editing coming soon!')}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteContest(contest.contestId, contest.name)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestManager;