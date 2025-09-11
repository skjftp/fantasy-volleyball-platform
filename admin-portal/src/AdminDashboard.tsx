import React, { useState, useEffect } from 'react';
import PlayerManagement from './PlayerManagement';
import SquadAssignment from './SquadAssignment';
import MatchManagement from './MatchManagement';
import ContestTemplateManager from './ContestTemplateManager';
import ContestManager from './ContestManager';

interface Admin {
  uid: string;
  username: string;
  role: string;
}

interface AdminDashboardProps {
  admin: Admin;
  onLogout: () => void;
}

interface League {
  leagueId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface Team {
  teamId: string;
  name: string;
  code: string;
  logo: string;
  leagueId: string;
  homeCity: string;
  captain: string;
  coach: string;
}



const AdminDashboard: React.FC<AdminDashboardProps> = ({ admin, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'leagues' | 'teams' | 'players' | 'squads' | 'matches' | 'templates' | 'contests' | 'stats'>('leagues');
  const [leagues, setLeagues] = useState<League[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);

  // Form states
  const [newLeague, setNewLeague] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: ''
  });

  const [editLeague, setEditLeague] = useState<League | null>(null);
  const [editTeam, setEditTeam] = useState<Team | null>(null);

  const [newTeam, setNewTeam] = useState({
    name: '',
    code: '',
    logo: '',
    leagueId: '',
    homeCity: '',
    captain: '',
    coach: ''
  });


  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      // Token missing, redirect to login
      onLogout();
      return {};
    }
    
    // Check if token is expired (basic check)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 < Date.now()) {
        // Token expired, redirect to login
        onLogout();
        return {};
      }
    } catch (error) {
      // Invalid token, redirect to login
      onLogout();
      return {};
    }
    
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    switch (activeTab) {
      case 'leagues':
        fetchLeagues();
        break;
      case 'teams':
        fetchTeams();
        fetchLeagues(); // For dropdowns
        break;
      default:
        break;
    }
  }, [activeTab]);

  const fetchLeagues = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      const response = await fetch(`${apiUrl}/admin/leagues`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setLeagues(data || []);
    } catch (error) {
      console.error('Error fetching leagues:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      const response = await fetch(`${apiUrl}/admin/teams`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleCreateLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      const leagueData = {
        leagueId: `league_${Date.now()}`,
        ...newLeague,
        startDate: new Date(newLeague.startDate).toISOString(),
        endDate: new Date(newLeague.endDate).toISOString(),
        status: 'upcoming',
        createdAt: new Date().toISOString()
      };

      const response = await fetch(`${apiUrl}/admin/leagues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(leagueData)
      });

      if (response.ok) {
        alert('League created successfully!');
        setNewLeague({ name: '', description: '', startDate: '', endDate: '' });
        fetchLeagues();
      } else {
        const errorText = await response.text();
        alert(`Failed to create league: ${errorText}`);
      }
    } catch (error) {
      console.error('Error creating league:', error);
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      const teamData = {
        teamId: `team_${Date.now()}`,
        ...newTeam,
        logo: newTeam.logo || `https://picsum.photos/80?random=${Date.now()}`,
        createdAt: new Date().toISOString()
      };

      const response = await fetch(`${apiUrl}/admin/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(teamData)
      });

      if (response.ok) {
        alert('Team created successfully!');
        setNewTeam({
          name: '', code: '', logo: '', leagueId: '',
          homeCity: '', captain: '', coach: ''
        });
        fetchTeams();
      } else {
        const errorText = await response.text();
        alert(`Failed to create team: ${errorText}`);
      }
    } catch (error) {
      console.error('Error creating team:', error);
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };


  const handleEditLeague = (league: League) => {
    setEditLeague(league);
    setEditingItem(league.leagueId);
  };

  const handleUpdateLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLeague) return;
    
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      const response = await fetch(`${apiUrl}/admin/leagues/${editLeague.leagueId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(editLeague)
      });

      if (response.ok) {
        alert('League updated successfully!');
        setEditLeague(null);
        setEditingItem(null);
        fetchLeagues();
      } else {
        alert('Failed to update league');
      }
    } catch (error) {
      console.error('Error updating league:', error);
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLeague = async (leagueId: string) => {
    if (!confirm('Are you sure you want to delete this league? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      const response = await fetch(`${apiUrl}/admin/leagues/${leagueId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        alert('League deleted successfully!');
        fetchLeagues();
      } else {
        alert('Failed to delete league');
      }
    } catch (error) {
      console.error('Error deleting league:', error);
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team? This will also remove all associated squads and player assignments.')) {
      return;
    }

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      const response = await fetch(`${apiUrl}/admin/teams/${teamId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        alert('Team deleted successfully!');
        fetchTeams();
      } else {
        alert('Failed to delete team');
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };


  const handleEditTeam = (team: Team) => {
    setEditTeam(team);
    setEditingItem(team.teamId);
  };

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTeam) return;
    
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
      const response = await fetch(`${apiUrl}/admin/teams/${editTeam.teamId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(editTeam)
      });

      if (response.ok) {
        alert('Team updated successfully!');
        setEditTeam(null);
        setEditingItem(null);
        fetchTeams();
      } else {
        alert('Failed to update team');
      }
    } catch (error) {
      console.error('Error updating team:', error);
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'leagues' as const, label: '1. Create Leagues', icon: '🏆' },
    { key: 'teams' as const, label: '2. Create Teams', icon: '⚽' },
    { key: 'players' as const, label: '3. Create Players', icon: '👤' },
    { key: 'squads' as const, label: '4. Assign Squad', icon: '👥' },
    { key: 'matches' as const, label: '5. Create Matches', icon: '🎯' },
    { key: 'templates' as const, label: '6. Contest Templates', icon: '📋' },
    { key: 'contests' as const, label: '7. Create Contests', icon: '🎮' },
    { key: 'stats' as const, label: '8. Update Stats', icon: '📊' }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gray-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-red-600 rounded-lg p-2">
                <span className="text-white font-bold text-lg">PA</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">PrimeV Admin Portal</h1>
                <p className="text-gray-400 text-sm">Volleyball Management System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium">Welcome, {admin.username}</p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
              
              <button
                onClick={onLogout}
                className="bg-red-600 px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs - Hierarchical Workflow */}
      <div className="bg-white border-b overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-red-600 text-red-600 bg-red-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Step 1: Create Leagues */}
        {activeTab === 'leagues' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Step 1: Create Volleyball League
              </h2>
              <form onSubmit={handleCreateLeague} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">League Name</label>
                    <input
                      type="text"
                      value={newLeague.name}
                      onChange={(e) => setNewLeague({...newLeague, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Pro Volleyball League"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <input
                      type="text"
                      value={newLeague.description}
                      onChange={(e) => setNewLeague({...newLeague, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Professional volleyball championship"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={newLeague.startDate}
                      onChange={(e) => setNewLeague({...newLeague, startDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={newLeague.endDate}
                      onChange={(e) => setNewLeague({...newLeague, endDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-md font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Creating League...' : 'Create League'}
                </button>
              </form>
            </div>

            {/* Leagues List */}
            <div className="bg-white rounded-lg shadow-lg">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-800">Existing Leagues</h3>
              </div>
              <div className="divide-y">
                {leagues.map((league) => (
                  <div key={league.leagueId} className="p-6 hover:bg-gray-50">
                    {editingItem === league.leagueId ? (
                      /* Edit Form */
                      <form onSubmit={handleUpdateLeague} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            value={editLeague?.name || ''}
                            onChange={(e) => setEditLeague(editLeague ? {...editLeague, name: e.target.value} : null)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="League Name"
                          />
                          <input
                            type="text"
                            value={editLeague?.description || ''}
                            onChange={(e) => setEditLeague(editLeague ? {...editLeague, description: e.target.value} : null)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Description"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <button
                            type="submit"
                            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
                            disabled={loading}
                          >
                            {loading ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {setEditingItem(null); setEditLeague(null);}}
                            className="bg-gray-500 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* Display Mode */
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-800">{league.name}</h4>
                          <p className="text-sm text-gray-600">{league.description}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-sm font-medium">{league.status}</div>
                            <div className="text-xs text-gray-600">
                              {new Date(league.startDate).toLocaleDateString()} - {new Date(league.endDate).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditLeague(league)}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteLeague(league.leagueId)}
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Create Teams */}
        {activeTab === 'teams' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Step 2: Create Teams
              </h2>
              <form onSubmit={handleCreateTeam} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Team Name</label>
                    <input
                      type="text"
                      value={newTeam.name}
                      onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Mumbai Thunder"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Team Code</label>
                    <input
                      type="text"
                      value={newTeam.code}
                      onChange={(e) => setNewTeam({...newTeam, code: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="MUM"
                      maxLength={3}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">League</label>
                    <select
                      value={newTeam.leagueId}
                      onChange={(e) => setNewTeam({...newTeam, leagueId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    >
                      <option value="">Select League</option>
                      {leagues.map(league => (
                        <option key={league.leagueId} value={league.leagueId}>
                          {league.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Home City</label>
                    <input
                      type="text"
                      value={newTeam.homeCity}
                      onChange={(e) => setNewTeam({...newTeam, homeCity: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Mumbai"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Captain</label>
                    <input
                      type="text"
                      value={newTeam.captain}
                      onChange={(e) => setNewTeam({...newTeam, captain: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Captain Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Coach</label>
                    <input
                      type="text"
                      value={newTeam.coach}
                      onChange={(e) => setNewTeam({...newTeam, coach: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Coach Name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Team Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setNewTeam({...newTeam, logo: event.target?.result as string});
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-md font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Creating Team...' : 'Create Team'}
                </button>
              </form>
            </div>

            {/* Teams List */}
            <div className="bg-white rounded-lg shadow-lg">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-800">Existing Teams</h3>
              </div>
              <div className="divide-y">
                {teams.map((team) => (
                  <div key={team.teamId} className="p-6 hover:bg-gray-50">
                    {editingItem === team.teamId ? (
                      /* Edit Team Form */
                      <form onSubmit={handleUpdateTeam} className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <input
                            type="text"
                            value={editTeam?.name || ''}
                            onChange={(e) => setEditTeam(editTeam ? {...editTeam, name: e.target.value} : null)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Team Name"
                            required
                          />
                          <input
                            type="text"
                            value={editTeam?.code || ''}
                            onChange={(e) => setEditTeam(editTeam ? {...editTeam, code: e.target.value} : null)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Code"
                            maxLength={3}
                            required
                          />
                          <input
                            type="text"
                            value={editTeam?.homeCity || ''}
                            onChange={(e) => setEditTeam(editTeam ? {...editTeam, homeCity: e.target.value} : null)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Home City"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <input
                            type="text"
                            value={editTeam?.captain || ''}
                            onChange={(e) => setEditTeam(editTeam ? {...editTeam, captain: e.target.value} : null)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Captain Name"
                          />
                          <input
                            type="text"
                            value={editTeam?.coach || ''}
                            onChange={(e) => setEditTeam(editTeam ? {...editTeam, coach: e.target.value} : null)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Coach Name"
                          />
                          <select
                            value={editTeam?.leagueId || ''}
                            onChange={(e) => setEditTeam(editTeam ? {...editTeam, leagueId: e.target.value} : null)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            <option value="">Select League</option>
                            {leagues.map(league => (
                              <option key={league.leagueId} value={league.leagueId}>
                                {league.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            type="submit"
                            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
                            disabled={loading}
                          >
                            {loading ? 'Saving...' : 'Save Team'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {setEditingItem(null); setEditTeam(null);}}
                            className="bg-gray-500 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* Display Mode */
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <img src={team.logo} alt={team.code} className="w-12 h-12 rounded-full" />
                          <div>
                            <h4 className="font-medium text-gray-800">{team.name} ({team.code})</h4>
                            <p className="text-sm text-gray-600">{team.homeCity} • Captain: {team.captain}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-sm text-gray-600">League: {team.leagueId}</div>
                            <div className="text-xs text-gray-500">Coach: {team.coach}</div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditTeam(team)}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTeam(team.teamId)}
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Contest Templates */}
        {activeTab === 'templates' && (
          <ContestTemplateManager 
            getAuthHeaders={getAuthHeaders}
            loading={loading}
            setLoading={setLoading}
          />
        )}

        {/* Step 3: Create Players */}
        {activeTab === 'players' && (
          <PlayerManagement 
            getAuthHeaders={getAuthHeaders}
            loading={loading}
            setLoading={setLoading}
          />
        )}

        {/* Step 4: Assign Squads (Team-Player Associations) */}
        {activeTab === 'squads' && (
          <SquadAssignment 
            teams={teams}
            leagues={leagues}
            getAuthHeaders={getAuthHeaders}
            loading={loading}
            setLoading={setLoading}
          />
        )}

        {/* Step 5: Create Matches */}
        {activeTab === 'matches' && (
          <MatchManagement 
            teams={teams}
            leagues={leagues}
            getAuthHeaders={getAuthHeaders}
            loading={loading}
            setLoading={setLoading}
          />
        )}

        {/* Step 7: Create Contests */}
        {activeTab === 'contests' && (
          <ContestManager 
            getAuthHeaders={getAuthHeaders}
            loading={loading}
            setLoading={setLoading}
          />
        )}

        {activeTab === 'stats' && (
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Step 7: Live Stats Update</h2>
            <p className="text-gray-600">Update player statistics during matches for point calculation</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;