// Team logo utility functions
import { getTeamLogo, getTeamLogoByCode } from '../assets/team-logos';

// Convert database logo path to imported asset
export const getTeamLogoSrc = (logoPath: string | undefined, teamId?: string): string => {
  // If no logo path provided, try to get by team ID
  if (!logoPath && teamId) {
    const localLogo = getTeamLogo(teamId);
    if (localLogo) return localLogo;
  }
  
  // If logo path is a local asset path, convert to imported asset
  if (logoPath?.startsWith('/src/assets/team-logos/')) {
    const teamId = findTeamIdByPath(logoPath);
    if (teamId) {
      const localLogo = getTeamLogo(teamId);
      if (localLogo) return localLogo;
    }
  }
  
  // If it's already a full URL or blob, return as-is
  if (logoPath?.startsWith('http') || logoPath?.startsWith('blob:') || logoPath?.startsWith('data:')) {
    return logoPath;
  }
  
  // Fallback to placeholder or external URL
  return logoPath || '/src/assets/team-logos/default-team.png';
};

// Find team ID by logo path
const findTeamIdByPath = (logoPath: string): string | undefined => {
  const pathToTeamId: { [key: string]: string } = {
    '/src/assets/team-logos/ahmedabad-defenders.png': 'team_pvl_69',
    '/src/assets/team-logos/bengaluru-torpedoes.png': 'team_pvl_72',
    '/src/assets/team-logos/calicut-heroes.png': 'team_pvl_70',
    '/src/assets/team-logos/chennai-blitz.png': 'team_pvl_68',
    '/src/assets/team-logos/delhi-toofans.png': 'team_pvl_372',
    '/src/assets/team-logos/goa-guardians.png': 'team_pvl_381',
    '/src/assets/team-logos/hyderabad-black-hawks.png': 'team_pvl_64',
    '/src/assets/team-logos/kochi-blue-spikers.png': 'team_pvl_67',
    '/src/assets/team-logos/kolkata-thunderbolts.png': 'team_pvl_71',
    '/src/assets/team-logos/mumbai-meteors.png': 'team_pvl_259'
  };
  
  return pathToTeamId[logoPath];
};

// Get team logo by team code (e.g., 'GG', 'AMD', etc.)
export const getTeamLogoByCodes = (teamCode: string): string => {
  const logo = getTeamLogoByCode(teamCode);
  return logo || '/src/assets/team-logos/default-team.png';
};

// Helper function to get the appropriate logo src for a team logo component
export const getTeamLogoForComponent = (
  teamId?: string, 
  teamCode?: string, 
  logoPath?: string
): string => {
  if (teamCode) {
    return getTeamLogoByCodes(teamCode);
  } else if (teamId) {
    return getTeamLogo(teamId) || '/src/assets/team-logos/default-team.png';
  } else {
    return getTeamLogoSrc(logoPath, teamId);
  }
};