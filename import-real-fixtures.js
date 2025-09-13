const admin = require('firebase-admin');
const { execSync } = require('child_process');

// Initialize Firebase Admin SDK
const serviceAccount = require('./backend/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'fantasy-volleyball-21364'
});

const db = admin.firestore();

async function importRealPVLData() {
  console.log('🏐 Importing Real PVL Fixtures & Teams from API...');
  console.log('================================================');

  try {
    // 1. Fetch real fixtures from PVL API
    console.log('1️⃣ Fetching fixtures from PVL API...');
    const fixturesJson = execSync('curl -s "https://www.primevolleyballleague.com/volleyball/live/json/98_calendar.json"').toString();
    const fixturesData = JSON.parse(fixturesJson);
    
    console.log(`Found ${fixturesData.calendar.matches.length} real matches from PVL API`);

    // 2. Extract unique teams from fixtures
    console.log('2️⃣ Extracting teams from fixtures...');
    const teamsMap = new Map();
    
    fixturesData.calendar.matches.forEach(match => {
      // Add team A
      if (!teamsMap.has(match.teama_id)) {
        teamsMap.set(match.teama_id, {
          teamId: `team_pvl_${match.teama_id}`,
          pvlTeamId: match.teama_id,
          name: match.teama,
          code: match.teama_short,
          logo: '', // Will be filled later
          leagueId: 'pvl_2025_season1',
          homeCity: match.teama.split(' ')[0],
          captain: '',
          coach: '',
          createdAt: new Date().toISOString()
        });
      }
      
      // Add team B
      if (!teamsMap.has(match.teamb_id)) {
        teamsMap.set(match.teamb_id, {
          teamId: `team_pvl_${match.teamb_id}`,
          pvlTeamId: match.teamb_id,
          name: match.teamb,
          code: match.teamb_short,
          logo: '', // Will be filled later
          leagueId: 'pvl_2025_season1',
          homeCity: match.teamb.split(' ')[0],
          captain: '',
          coach: '',
          createdAt: new Date().toISOString()
        });
      }
    });

    const teams = Array.from(teamsMap.values());
    console.log(`Extracted ${teams.length} unique teams from fixtures`);

    // 3. Create PVL League
    console.log('3️⃣ Creating PVL League...');
    const leagueData = {
      leagueId: 'pvl_2025_season1',
      name: 'Prime Volleyball League',
      description: 'India\'s premier professional volleyball league',
      startDate: fixturesData.calendar.matches[0].series_start_date.split('/').reverse().join('-'), // Convert DD/MM/YYYY to YYYY-MM-DD
      endDate: fixturesData.calendar.matches[0].series_end_date.split('/').reverse().join('-'),
      status: 'upcoming',
      createdAt: new Date().toISOString()
    };
    
    await db.collection('leagues').doc('pvl_2025_season1').set(leagueData);
    console.log('✅ PVL League created');

    // 4. Import real teams
    console.log('4️⃣ Importing real teams...');
    const teamBatch = db.batch();
    
    teams.forEach(team => {
      const teamRef = db.collection('teams').doc(team.teamId);
      teamBatch.set(teamRef, team);
    });
    
    await teamBatch.commit();
    console.log(`✅ ${teams.length} real teams imported`);

    // 5. Import real fixtures
    console.log('5️⃣ Importing real fixtures...');
    const matchBatch = db.batch();
    const matches = [];
    
    fixturesData.calendar.matches.forEach(match => {
      // Convert PVL date/time to ISO format
      const [day, month, year] = match.matchdate_ist.split('/');
      const [hour, minute] = match.start_time_ist.split(':');
      const startTime = new Date(`${year}-${month}-${day}T${hour}:${minute}:00.000Z`);
      
      const matchData = {
        matchId: `pvl_match_${match.match_id}`,
        pvlMatchId: match.match_id,
        leagueId: 'pvl_2025_season1',
        team1Id: `team_pvl_${match.teama_id}`,
        team2Id: `team_pvl_${match.teamb_id}`,
        team1: {
          name: match.teama,
          code: match.teama_short,
          logo: ''
        },
        team2: {
          name: match.teamb,
          code: match.teamb_short,
          logo: ''
        },
        startTime: startTime.toISOString(),
        status: match.upcoming ? 'upcoming' : (match.live ? 'live' : (match.complete ? 'completed' : 'upcoming')),
        venue: match.venue_name,
        round: match.matchstage,
        createdAt: new Date().toISOString()
      };
      
      matches.push(matchData);
      const matchRef = db.collection('matches').doc(matchData.matchId);
      matchBatch.set(matchRef, matchData);
    });
    
    await matchBatch.commit();
    console.log(`✅ ${matches.length} real fixtures imported`);

    console.log('');
    console.log('✅ REAL PVL DATA IMPORT COMPLETED');
    console.log('================================');
    console.log('✅ League: Prime Volleyball League (from API)');
    console.log(`✅ Teams: ${teams.length} real teams (from API)`);
    console.log(`✅ Fixtures: ${matches.length} real matches (from API)`);
    console.log('');
    console.log('📋 Real Teams Imported:');
    teams.forEach(team => {
      console.log(`   - ${team.name} (${team.code})`);
    });
    console.log('');
    console.log('🔄 Next: Extract real player data from squad pages');

  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  }
}

// Run import
importRealPVLData()
  .then(() => {
    console.log('✅ Real PVL data import completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Import failed:', error);
    process.exit(1);
  });