
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
    console.log(`✅ ${teamsData.length} teams imported`);
    
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
    console.log(`✅ ${playersData.length} players imported`);
    
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
    console.log(`✅ ${matchesData.length} matches imported`);
    
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
