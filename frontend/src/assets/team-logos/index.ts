// Team logo imports for PVL teams
import ahmedabadDefenders from './ahmedabad-defenders.png';
import bengaluruTorpedoes from './bengaluru-torpedoes.png';
import calicutHeroes from './calicut-heroes.png';
import chennaiBlitz from './chennai-blitz.png';
import delhiToofans from './delhi-toofans.png';
import goaGuardians from './goa-guardians.png';
import hyderabadBlackHawks from './hyderabad-black-hawks.png';
import kochiBlueSpikers from './kochi-blue-spikers.png';
import kolkataThunderbolts from './kolkata-thunderbolts.png';
import mumbaiMeteors from './mumbai-meteors.png';

// Team logo mapping by team ID
export const TEAM_LOGOS: { [key: string]: string } = {
  'team_pvl_69': ahmedabadDefenders,   // Ahmedabad Defenders
  'team_pvl_72': bengaluruTorpedoes,   // Bengaluru Torpedoes
  'team_pvl_70': calicutHeroes,        // Calicut Heroes
  'team_pvl_68': chennaiBlitz,         // Chennai Blitz
  'team_pvl_372': delhiToofans,        // Delhi Toofans
  'team_pvl_381': goaGuardians,        // Goa Guardians
  'team_pvl_64': hyderabadBlackHawks,  // Hyderabad Black Hawks
  'team_pvl_67': kochiBlueSpikers,     // Kochi Blue Spikers
  'team_pvl_71': kolkataThunderbolts,  // Kolkata Thunderbolts
  'team_pvl_259': mumbaiMeteors        // Mumbai Meteors
};

// Team logo mapping by team code
export const TEAM_LOGOS_BY_CODE: { [key: string]: string } = {
  'AMD': ahmedabadDefenders,    // Ahmedabad Defenders
  'BT': bengaluruTorpedoes,     // Bengaluru Torpedoes
  'CH': calicutHeroes,          // Calicut Heroes
  'CB': chennaiBlitz,           // Chennai Blitz
  'DT': delhiToofans,           // Delhi Toofans
  'GG': goaGuardians,           // Goa Guardians
  'HBH': hyderabadBlackHawks,   // Hyderabad Black Hawks
  'KBS': kochiBlueSpikers,      // Kochi Blue Spikers
  'KTB': kolkataThunderbolts,   // Kolkata Thunderbolts
  'MM': mumbaiMeteors           // Mumbai Meteors
};

// Helper function to get team logo by team ID
export const getTeamLogo = (teamId: string): string | undefined => {
  return TEAM_LOGOS[teamId];
};

// Helper function to get team logo by team code
export const getTeamLogoByCode = (teamCode: string): string | undefined => {
  return TEAM_LOGOS_BY_CODE[teamCode];
};

// Fallback URL function for teams not in local assets
export const getTeamLogoUrl = (teamId: string): string => {
  const localLogo = TEAM_LOGOS[teamId];
  if (localLogo) {
    return localLogo;
  }
  
  // Extract team number from team_pvl_XX format
  const teamNumber = teamId.replace('team_pvl_', '');
  return `https://www.primevolleyballleague.com/static-assets/images/team/${teamNumber}.png?v=1.55`;
};

export default TEAM_LOGOS;