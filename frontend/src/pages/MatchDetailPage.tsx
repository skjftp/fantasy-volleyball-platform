import React from 'react';
import { useParams } from 'react-router-dom';

const MatchDetailPage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Match Details
        </h1>
        <p className="text-gray-600">Match ID: {matchId}</p>
        <div className="mt-6 p-6 bg-white rounded-lg shadow-sm">
          <p className="text-gray-600">Match detail page - Coming soon!</p>
        </div>
      </div>
    </div>
  );
};

export default MatchDetailPage;