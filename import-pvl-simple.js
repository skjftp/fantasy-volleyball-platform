const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./backend/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'fantasy-volleyball-21364'
});

const db = admin.firestore();

// Team mapping from PVL API
const TEAM_MAPPING = {
  64: { name: 'Hyderabad Black Hawks', code: 'HBH', id: 'team_hyderabad_hawks' },
  70: { name: 'Calicut Heroes', code: 'CH', id: 'team_calicut_heroes' },
  381: { name: 'Goa Guardians', code: 'GG', id: 'team_goa_guardians' },
  72: { name: 'Bengaluru Torpedoes', code: 'BT', id: 'team_bengaluru_torpedoes' },
  67: { name: 'Kochi Blue Spikers', code: 'KBS', id: 'team_kochi_spikers' },
  71: { name: 'Kolkata Thunderbolts', code: 'KTB', id: 'team_kolkata_thunderbolts' },
  259: { name: 'Mumbai Meteors', code: 'MM', id: 'team_mumbai_meteors' },
  372: { name: 'Delhi Toofans', code: 'DT', id: 'team_delhi_toofans' },
  69: { name: 'Ahmedabad Defenders', code: 'AMD', id: 'team_ahmedabad_defenders' },
  68: { name: 'Chennai Blitz', code: 'CB', id: 'team_chennai_blitz' }
};

async function importPVLData() {
  console.log('🏐 Importing Prime Volleyball League Data...');
  
  try {
    // 1. Create League
    const leagueData = {
      leagueId: 'pvl_2025_season1',
      name: 'Prime Volleyball League',
      description: 'India\'s premier professional volleyball league',
      startDate: '2025-10-02',
      endDate: '2025-10-26',
      status: 'upcoming',
      createdAt: new Date().toISOString()
    };
    
    await db.collection('leagues').doc('pvl_2025_season1').set(leagueData);
    console.log('✅ League created');

    // 2. Create Teams
    console.log('Creating teams...');
    const teamBatch = db.batch();
    
    Object.entries(TEAM_MAPPING).forEach(([pvlId, team]) => {
      const teamData = {
        teamId: team.id,
        name: team.name,
        code: team.code,
        logo: 'https://via.placeholder.com/100x100/FF6B35/FFFFFF?text=' + team.code,
        leagueId: 'pvl_2025_season1',
        homeCity: team.name.split(' ')[0],
        captain: 'TBD',
        coach: 'TBD',
        createdAt: new Date().toISOString()
      };
      
      const teamRef = db.collection('teams').doc(team.id);
      teamBatch.set(teamRef, teamData);
    });
    
    await teamBatch.commit();
    console.log('✅ 10 teams created');

    // 3. Create Sample Players (basic set for testing)
    console.log('Creating sample players...');
    const playerBatch = db.batch();
    let playerCounter = 1;
    
    // Create 6 players per team with proper 5-category distribution
    Object.entries(TEAM_MAPPING).forEach(([pvlId, team]) => {
      const positions = ['libero', 'setter', 'blocker', 'attacker', 'universal', 'attacker']; // 6 players
      const credits = [8.5, 9.0, 8.0, 8.5, 9.5, 8.5];
      
      positions.forEach((category, index) => {
        const playerId = 'player_pvl_' + String(playerCounter).padStart(3, '0');
        const playerData = {
          playerId,
          name: team.code + ' Player ' + (index + 1),
          imageUrl: 'https://randomuser.me/api/portraits/men/' + ((playerCounter % 99) + 1) + '.jpg',
          defaultCategory: category,
          defaultCredits: credits[index],
          dateOfBirth: '1995-01-15',
          nationality: 'India',
          createdAt: new Date().toISOString()
        };
        
        const playerRef = db.collection('players').doc(playerId);
        playerBatch.set(playerRef, playerData);
        playerCounter++;
      });
    });
    
    await playerBatch.commit();
    console.log('✅ 60 players created (6 per team)');

    // 4. Create a few sample matches
    console.log('Creating sample matches...');
    const sampleMatches = [
      {
        matchId: 'pvl_match_001',
        leagueId: 'pvl_2025_season1',
        team1Id: 'team_hyderabad_hawks',
        team2Id: 'team_calicut_heroes',
        team1: TEAM_MAPPING[64],
        team2: TEAM_MAPPING[70],
        startTime: '2025-10-02T18:30:00.000Z',
        status: 'upcoming',
        venue: 'G.M.C Balayogi Indoor Stadium, Hyderabad',
        round: 'League Round',
        createdAt: new Date().toISOString()
      },
      {
        matchId: 'pvl_match_002',
        leagueId: 'pvl_2025_season1',
        team1Id: 'team_goa_guardians',
        team2Id: 'team_bengaluru_torpedoes',
        team1: TEAM_MAPPING[381],
        team2: TEAM_MAPPING[72],
        startTime: '2025-10-03T18:30:00.000Z',
        status: 'upcoming',
        venue: 'G.M.C Balayogi Indoor Stadium, Hyderabad',
        round: 'League Round',
        createdAt: new Date().toISOString()
      }
    ];
    
    const matchBatch = db.batch();
    sampleMatches.forEach(match => {
      const matchRef = db.collection('matches').doc(match.matchId);
      matchBatch.set(matchRef, match);
    });
    
    await matchBatch.commit();
    console.log('✅ 2 sample matches created');

    console.log('');
    console.log('🎉 PVL Data Import Complete!');
    console.log('============================');
    console.log('✅ League: Prime Volleyball League');
    console.log('✅ Teams: 10 PVL teams with proper codes');
    console.log('✅ Players: 60 players (6 per team) with 5-category system');
    console.log('✅ Matches: Sample matches ready for testing');
    console.log('');
    console.log('🏐 Player Categories:');
    console.log('   - Libero: Exactly 1 required');
    console.log('   - Setter: 1-2 players');
    console.log('   - Blocker: 1-2 players');
    console.log('   - Attacker: 1-2 players');
    console.log('   - Universal: 1-2 players');
    console.log('');
    console.log('🚀 Your fantasy platform is ready with real PVL teams!');

  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  }
}

// Run the import
importPVLData()
  .then(() => {
    console.log('✅ Import completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Import failed:', error);
    process.exit(1);
  });