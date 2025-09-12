const fs = require('fs');
const path = require('path');

// Data extraction script for Prime Volleyball League
console.log('🏐 Prime Volleyball League Data Extraction Tool');
console.log('===============================================');

// Team squad URLs from Prime Volleyball League
const TEAM_SQUAD_URLS = [
  { 
    name: 'Ahmedabad Defenders', 
    code: 'AHD', 
    url: 'https://www.primevolleyballleague.com/squads/ahmedabad-defenders-69',
    id: 'team_ahmedabad_defenders'
  },
  { 
    name: 'Bengaluru Torpedoes', 
    code: 'BEN', 
    url: 'https://www.primevolleyballleague.com/squads/bengaluru-torpedoes-72',
    id: 'team_bengaluru_torpedoes'
  },
  { 
    name: 'Calicut Heroes', 
    code: 'CAL', 
    url: 'https://www.primevolleyballleague.com/squads/calicut-heroes-70',
    id: 'team_calicut_heroes'
  },
  { 
    name: 'Chennai Blitz', 
    code: 'CHE', 
    url: 'https://www.primevolleyballleague.com/squads/chennai-blitz-68',
    id: 'team_chennai_blitz'
  },
  { 
    name: 'Delhi Toofans', 
    code: 'DEL', 
    url: 'https://www.primevolleyballleague.com/squads/delhi-toofans-372',
    id: 'team_delhi_toofans'
  },
  { 
    name: 'Goa Guardians', 
    code: 'GOA', 
    url: 'https://www.primevolleyballleague.com/squads/goa-guardians-381',
    id: 'team_goa_guardians'
  },
  { 
    name: 'Hyderabad Black Hawks', 
    code: 'HYD', 
    url: 'https://www.primevolleyballleague.com/squads/hyderabad-black-hawks-64',
    id: 'team_hyderabad_hawks'
  },
  { 
    name: 'Kochi Blue Spikers', 
    code: 'KOC', 
    url: 'https://www.primevolleyballleague.com/squads/kochi-blue-spikers-67',
    id: 'team_kochi_spikers'
  },
  { 
    name: 'Kolkata Thunderbolts', 
    code: 'KOL', 
    url: 'https://www.primevolleyballleague.com/squads/kolkata-thunderbolts-71',
    id: 'team_kolkata_thunderbolts'
  },
  { 
    name: 'Mumbai Meteors', 
    code: 'MUM', 
    url: 'https://www.primevolleyballleague.com/squads/mumbai-meteors-259',
    id: 'team_mumbai_meteors'
  }
];

// Category mapping for Prime Volleyball League positions
const CATEGORY_MAPPING = {
  'Middle Blocker': 'blocker',
  'Outside Hitter': 'attacker', 
  'Setter': 'setter',
  'Libero': 'libero',
  'Opposite': 'attacker',
  'Universal': 'universal',
  'Opposite Hitter': 'attacker'
};

// Credit assignment based on position (base values)
const POSITION_CREDITS = {
  'libero': 8.5,
  'setter': 9.0,
  'blocker': 8.0,
  'attacker': 8.5,
  'universal': 9.5
};

// Instructions for manual data extraction (since web scraping requires browser)
function generateExtractionInstructions() {
  console.log('');
  console.log('📋 MANUAL DATA EXTRACTION INSTRUCTIONS');
  console.log('=====================================');
  console.log('');
  console.log('Since automated web scraping requires browser automation,');
  console.log('here are the steps to manually extract the data:');
  console.log('');
  
  console.log('🏐 1. Extract Fixtures Data:');
  console.log('   → Visit: https://www.primevolleyballleague.com/fixtures-and-results');
  console.log('   → Copy match data including:');
  console.log('     - Match date and time');
  console.log('     - Team abbreviations');
  console.log('     - Team logos (right-click → copy image URL)');
  console.log('');
  
  console.log('👥 2. Extract Team Squad Data:');
  TEAM_SQUAD_URLS.forEach((team, index) => {
    console.log(`   ${index + 1}. ${team.name} (${team.code}):`);
    console.log(`      → Visit: ${team.url}`);
    console.log('      → Copy player data including:');
    console.log('        - Player names');
    console.log('        - Player positions (convert using mapping below)');
    console.log('        - Player images (right-click → copy image URL)');
    console.log('        - Jersey numbers');
    console.log('');
  });
  
  console.log('🏷️ 3. Position Category Mapping:');
  Object.entries(CATEGORY_MAPPING).forEach(([pvlPosition, ourCategory]) => {
    console.log(`   ${pvlPosition} → ${ourCategory}`);
  });
  console.log('');
  
  console.log('💰 4. Credit Assignment (Base Values):');
  Object.entries(POSITION_CREDITS).forEach(([category, credits]) => {
    console.log(`   ${category}: ${credits} credits`);
  });
  console.log('');
}

// Generate data templates for manual entry
function generateDataTemplates() {
  console.log('📝 DATA TEMPLATES FOR MANUAL ENTRY');
  console.log('==================================');
  console.log('');
  
  // League template
  console.log('🏆 League Data:');
  console.log('```javascript');
  console.log('const leagueData = {');
  console.log('  leagueId: "pvl_2025_season1",');
  console.log('  name: "Prime Volleyball League",');
  console.log('  description: "India\'s premier professional volleyball league",');
  console.log('  startDate: "2025-01-15",');
  console.log('  endDate: "2025-03-15",');
  console.log('  status: "upcoming"');
  console.log('};');
  console.log('```');
  console.log('');
  
  // Teams template
  console.log('🏢 Teams Data Template:');
  console.log('```javascript');
  console.log('const teamsData = [');
  TEAM_SQUAD_URLS.forEach(team => {
    console.log('  {');
    console.log(`    teamId: "${team.id}",`);
    console.log(`    name: "${team.name}",`);
    console.log(`    code: "${team.code}",`);
    console.log(`    logo: "EXTRACTED_LOGO_URL_HERE",`);
    console.log('    leagueId: "pvl_2025_season1",');
    console.log(`    homeCity: "${team.name.split(' ')[0]}",`);
    console.log('    captain: "TBD",');
    console.log('    coach: "TBD"');
    console.log('  },');
  });
  console.log('];');
  console.log('```');
  console.log('');
  
  // Players template
  console.log('👤 Players Data Template:');
  console.log('```javascript');
  console.log('const playersData = [');
  console.log('  {');
  console.log('    playerId: "player_pvl_001",');
  console.log('    name: "EXTRACTED_PLAYER_NAME",');
  console.log('    imageUrl: "EXTRACTED_IMAGE_URL",');
  console.log('    defaultCategory: "MAPPED_CATEGORY", // Use mapping above');
  console.log('    defaultCredits: 8.5, // Use credit assignment above');
  console.log('    dateOfBirth: "1995-01-15",');
  console.log('    nationality: "India"');
  console.log('  },');
  console.log('  // ... more players');
  console.log('];');
  console.log('```');
  console.log('');
  
  // Match template
  console.log('🏐 Matches Data Template:');
  console.log('```javascript');
  console.log('const matchesData = [');
  console.log('  {');
  console.log('    matchId: "pvl_match_001",');
  console.log('    leagueId: "pvl_2025_season1",');
  console.log('    team1Id: "team_ahmedabad_defenders",');
  console.log('    team2Id: "team_bengaluru_torpedoes",');
  console.log('    startTime: "2025-01-20T14:30:00.000Z", // Convert from extracted time');
  console.log('    status: "upcoming",');
  console.log('    venue: "EXTRACTED_VENUE",');
  console.log('    round: "League Stage"');
  console.log('  },');
  console.log('  // ... more matches');
  console.log('];');
  console.log('```');
  console.log('');
}

// Create data import script template
function createImportScript() {
  const importScript = `
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'fantasy-volleyball-21364'
});

const db = admin.firestore();

// Import the data files (create these manually after extraction)
const leagueData = require('./data/league.json');
const teamsData = require('./data/teams.json');
const playersData = require('./data/players.json');
const matchesData = require('./data/matches.json');

async function importPVLData() {
  console.log('🏐 Starting Prime Volleyball League Data Import...');
  
  try {
    // 1. Import League
    console.log('1️⃣ Importing league data...');
    await db.collection('leagues').doc(leagueData.leagueId).set(leagueData);
    console.log('✅ League imported');
    
    // 2. Import Teams
    console.log('2️⃣ Importing teams data...');
    const teamBatch = db.batch();
    teamsData.forEach(team => {
      const teamRef = db.collection('teams').doc(team.teamId);
      teamBatch.set(teamRef, {
        ...team,
        createdAt: new Date().toISOString()
      });
    });
    await teamBatch.commit();
    console.log(\`✅ \${teamsData.length} teams imported\`);
    
    // 3. Import Players
    console.log('3️⃣ Importing players data...');
    const playerBatch = db.batch();
    playersData.forEach(player => {
      const playerRef = db.collection('players').doc(player.playerId);
      playerBatch.set(playerRef, {
        ...player,
        createdAt: new Date().toISOString()
      });
    });
    await playerBatch.commit();
    console.log(\`✅ \${playersData.length} players imported\`);
    
    // 4. Import Matches
    console.log('4️⃣ Importing matches data...');
    const matchBatch = db.batch();
    matchesData.forEach(match => {
      const matchRef = db.collection('matches').doc(match.matchId);
      matchBatch.set(matchRef, {
        ...match,
        createdAt: new Date().toISOString()
      });
    });
    await matchBatch.commit();
    console.log(\`✅ \${matchesData.length} matches imported\`);
    
    console.log('');
    console.log('🎉 Prime Volleyball League data import completed!');
    console.log('Next steps:');
    console.log('1. Create team-player associations');
    console.log('2. Set up match squads');
    console.log('3. Create contest templates');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  }
}

// Run import
importPVLData()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Failed:', error);
    process.exit(1);
  });
`;

  fs.writeFileSync('import-pvl-data.js', importScript);
  console.log('📄 Created import-pvl-data.js script');
}

// Create data directory structure
function createDataStructure() {
  const dataDir = 'data';
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }
  
  // Create template files
  const templates = {
    'league.json': {
      leagueId: "pvl_2025_season1",
      name: "Prime Volleyball League",
      description: "India's premier professional volleyball league",
      startDate: "2025-01-15",
      endDate: "2025-03-15",
      status: "upcoming"
    },
    'teams.json': TEAM_SQUAD_URLS.map(team => ({
      teamId: team.id,
      name: team.name,
      code: team.code,
      logo: "EXTRACT_FROM_WEBSITE",
      leagueId: "pvl_2025_season1",
      homeCity: team.name.split(' ')[0],
      captain: "TBD",
      coach: "TBD"
    })),
    'players.json': [
      {
        playerId: "player_pvl_001",
        name: "EXTRACT_FROM_WEBSITE",
        imageUrl: "EXTRACT_FROM_WEBSITE",
        defaultCategory: "libero", // Use: libero, setter, blocker, attacker, universal
        defaultCredits: 8.5,
        dateOfBirth: "1995-01-15",
        nationality: "India"
      }
    ],
    'matches.json': [
      {
        matchId: "pvl_match_001",
        leagueId: "pvl_2025_season1",
        team1Id: "team_ahmedabad_defenders",
        team2Id: "team_bengaluru_torpedoes", 
        startTime: "2025-01-20T14:30:00.000Z",
        status: "upcoming",
        venue: "EXTRACT_FROM_WEBSITE",
        round: "League Stage"
      }
    ]
  };
  
  Object.entries(templates).forEach(([filename, data]) => {
    const filePath = path.join(dataDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`📄 Created ${filePath} template`);
  });
}

// Main execution
async function main() {
  console.log('');
  console.log('🚀 Starting Prime Volleyball League data extraction setup...');
  console.log('');
  
  // Generate extraction instructions
  generateExtractionInstructions();
  
  // Generate data templates
  generateDataTemplates();
  
  // Create directory structure and templates
  createDataStructure();
  
  // Create import script
  createImportScript();
  
  console.log('');
  console.log('✅ SETUP COMPLETE!');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('1. Follow the extraction instructions above');
  console.log('2. Fill in the data template files in ./data/ directory');
  console.log('3. Run: node import-pvl-data.js');
  console.log('');
  console.log('🔧 New Player Categories:');
  console.log('- Libero: Exactly 1 required');
  console.log('- Setter: 1-2 players');  
  console.log('- Blocker: 1-2 players');
  console.log('- Attacker: 1-2 players');
  console.log('- Universal: 1-2 players');
  console.log('');
  console.log('📊 Team Constraints:');
  console.log('- Total: 6 players');
  console.log('- Max from same team: 4 players');
  console.log('- Total credits: 100');
  console.log('');
}

// Run the setup
main().catch(console.error);