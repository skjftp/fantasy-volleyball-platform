import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import MatchDetailPage from './pages/MatchDetailPage';
import TeamCreatePage from './pages/TeamCreatePage';
import CaptainSelectionPage from './pages/CaptainSelectionPage';
import ContestsPage from './pages/ContestsPage';
import MyContestsPage from './pages/MyContestsPage';
import MyTeamsPage from './pages/MyTeamsPage';
import MyProfilePage from './pages/MyProfilePage';
import ContestLeaderboardPage from './pages/ContestLeaderboardPage';
import LoadingSpinner from './components/LoadingSpinner';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route Component (redirect to home if logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return !user ? <>{children}</> : <Navigate to="/" replace />;
};

function AppRoutes() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/match/:matchId" 
            element={
              <ProtectedRoute>
                <MatchDetailPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/match/:matchId/create-team" 
            element={
              <ProtectedRoute>
                <TeamCreatePage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/team/:teamId/captain" 
            element={
              <ProtectedRoute>
                <CaptainSelectionPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/match/:matchId/contests" 
            element={
              <ProtectedRoute>
                <ContestsPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/my-contests" 
            element={
              <ProtectedRoute>
                <MyContestsPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/my-teams" 
            element={
              <ProtectedRoute>
                <MyTeamsPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/match/:matchId/my-contests" 
            element={
              <ProtectedRoute>
                <MyContestsPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/match/:matchId/my-teams" 
            element={
              <ProtectedRoute>
                <MyTeamsPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/my-profile" 
            element={
              <ProtectedRoute>
                <MyProfilePage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/contest/:contestId/leaderboard" 
            element={
              <ProtectedRoute>
                <ContestLeaderboardPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;