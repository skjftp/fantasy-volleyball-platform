// Team logo utility functions
import { getTeamLogo, getTeamLogoByCode } from '../assets/team-logos';

// Convert database logo path to imported asset
export const getTeamLogoSrc = (logoPath: string | undefined, teamId?: string): string => {
  // Handle new team-logo:CODE format
  if (logoPath?.startsWith('team-logo:')) {
    const teamCode = logoPath.replace('team-logo:', '');
    const localLogo = getTeamLogoByCode(teamCode);
    if (localLogo) return localLogo;
  }
  
  // First, try to get by team ID using imported assets
  if (teamId) {
    const localLogo = getTeamLogo(teamId);
    if (localLogo) return localLogo;
  }
  
  // If logo path is a local asset path, convert to imported asset using the mapping
  if (logoPath?.startsWith('/src/assets/team-logos/')) {
    const teamIdFromPath = findTeamIdByPath(logoPath);
    if (teamIdFromPath) {
      const localLogo = getTeamLogo(teamIdFromPath);
      if (localLogo) return localLogo;
    }
  }
  
  // If it's already a full URL or blob, return as-is
  if (logoPath?.startsWith('http') || logoPath?.startsWith('blob:') || logoPath?.startsWith('data:')) {
    return logoPath;
  }
  
  // For any team logo, try to extract team ID from common patterns
  if (!teamId && logoPath) {
    const extractedTeamId = extractTeamIdFromPath(logoPath);
    if (extractedTeamId) {
      const localLogo = getTeamLogo(extractedTeamId);
      if (localLogo) return localLogo;
    }
  }
  
  // Fallback to external URL if we have a team ID
  if (teamId && teamId.startsWith('team_pvl_')) {
    const teamNumber = teamId.replace('team_pvl_', '');
    return `https://www.primevolleyballleague.com/static-assets/images/team/${teamNumber}.png?v=1.55`;
  }
  
  // Final fallback
  return logoPath || 'https://via.placeholder.com/40x40/cccccc/ffffff?text=Team';
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

// Extract team ID from various path patterns
const extractTeamIdFromPath = (logoPath: string): string | undefined => {
  // Try to extract team number from external URL pattern
  const urlMatch = logoPath.match(/\/team\/(\d+)\.png/);
  if (urlMatch) {
    return `team_pvl_${urlMatch[1]}`;
  }
  
  // Try to extract from local path pattern
  const fileNameMatch = logoPath.match(/\/([^/]+)\.png$/);
  if (fileNameMatch) {
    const fileName = fileNameMatch[1];
    // Map filename to team ID
    const fileToTeamId: { [key: string]: string } = {
      'ahmedabad-defenders': 'team_pvl_69',
      'bengaluru-torpedoes': 'team_pvl_72',
      'calicut-heroes': 'team_pvl_70',
      'chennai-blitz': 'team_pvl_68',
      'delhi-toofans': 'team_pvl_372',
      'goa-guardians': 'team_pvl_381',
      'hyderabad-black-hawks': 'team_pvl_64',
      'kochi-blue-spikers': 'team_pvl_67',
      'kolkata-thunderbolts': 'team_pvl_71',
      'mumbai-meteors': 'team_pvl_259'
    };
    return fileToTeamId[fileName];
  }
  
  return undefined;
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