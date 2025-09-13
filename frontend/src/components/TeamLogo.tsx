import React from 'react';
import { getTeamLogoForComponent } from '../utils/teamLogos';

interface TeamLogoProps {
  teamId?: string;
  teamCode?: string;
  logoPath?: string;
  alt?: string;
  className?: string;
}

// React component helper for team logo img tag
export const TeamLogo: React.FC<TeamLogoProps> = ({ 
  teamId, 
  teamCode, 
  logoPath, 
  alt, 
  className = "w-8 h-8" 
}) => {
  const src = getTeamLogoForComponent(teamId, teamCode, logoPath);
  
  return (
    <img 
      src={src} 
      alt={alt || 'Team Logo'} 
      className={className}
      onError={(e) => {
        // Fallback if image fails to load
        const target = e.target as HTMLImageElement;
        target.src = '/src/assets/team-logos/default-team.png';
      }}
    />
  );
};

export default TeamLogo;