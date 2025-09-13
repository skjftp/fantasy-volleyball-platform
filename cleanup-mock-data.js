const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./backend/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'fantasy-volleyball-21364'
});

const db = admin.firestore();

async function cleanupMockData() {
  console.log('🧹 Cleaning up unauthorized mock data...');
  console.log('=======================================');

  try {
    // 1. Remove mock league
    console.log('1️⃣ Removing mock league...');
    await db.collection('leagues').doc('pvl_2025_season1').delete();
    console.log('✅ Mock league removed');

    // 2. Remove mock teams
    console.log('2️⃣ Removing mock teams...');
    const teamIds = [
      'team_hyderabad_hawks',
      'team_calicut_heroes', 
      'team_goa_guardians',
      'team_bengaluru_torpedoes',
      'team_kochi_spikers',
      'team_kolkata_thunderbolts',
      'team_mumbai_meteors',
      'team_delhi_toofans',
      'team_ahmedabad_defenders',
      'team_chennai_blitz'
    ];
    
    const teamBatch = db.batch();
    teamIds.forEach(teamId => {
      teamBatch.delete(db.collection('teams').doc(teamId));
    });
    await teamBatch.commit();
    console.log(`✅ ${teamIds.length} mock teams removed`);

    // 3. Remove mock players
    console.log('3️⃣ Removing mock players...');
    const playersQuery = await db.collection('players').where('playerId', '>=', 'player_pvl_001').where('playerId', '<=', 'player_pvl_999').get();
    
    if (!playersQuery.empty) {
      const playerBatch = db.batch();
      playersQuery.docs.forEach(doc => {
        playerBatch.delete(doc.ref);
      });
      await playerBatch.commit();
      console.log(`✅ ${playersQuery.docs.length} mock players removed`);
    } else {
      console.log('✅ No mock players found to remove');
    }

    // 4. Remove mock team-player associations
    console.log('4️⃣ Removing mock team-player associations...');
    const associationsQuery = await db.collection('teamPlayers').where('associationId', '>=', 'assoc_player_pvl').where('associationId', '<=', 'assoc_player_pvl_zzz').get();
    
    if (!associationsQuery.empty) {
      const assocBatch = db.batch();
      associationsQuery.docs.forEach(doc => {
        assocBatch.delete(doc.ref);
      });
      await assocBatch.commit();
      console.log(`✅ ${associationsQuery.docs.length} mock associations removed`);
    } else {
      console.log('✅ No mock associations found to remove');
    }

    // 5. Remove mock matches
    console.log('5️⃣ Removing mock matches...');
    const matchQuery = await db.collection('matches').where('matchId', '>=', 'pvl_match').where('matchId', '<=', 'pvl_match_zzz').get();
    
    if (!matchQuery.empty) {
      const matchBatch = db.batch();
      matchQuery.docs.forEach(doc => {
        matchBatch.delete(doc.ref);
      });
      await matchBatch.commit();
      console.log(`✅ ${matchQuery.docs.length} mock matches removed`);
    } else {
      console.log('✅ No mock matches found to remove');
    }

    // 6. Remove mock match squads
    console.log('6️⃣ Removing mock match squads...');
    const squadQuery = await db.collection('matchSquads').where('matchId', '>=', 'pvl_match').where('matchId', '<=', 'pvl_match_zzz').get();
    
    if (!squadQuery.empty) {
      const squadBatch = db.batch();
      squadQuery.docs.forEach(doc => {
        squadBatch.delete(doc.ref);
      });
      await squadBatch.commit();
      console.log(`✅ ${squadQuery.docs.length} mock match squads removed`);
    } else {
      console.log('✅ No mock match squads found to remove');
    }

    console.log('');
    console.log('✅ CLEANUP COMPLETED');
    console.log('===================');
    console.log('All unauthorized mock data has been removed from the database.');
    console.log('The database is now clean and ready for real PVL data extraction.');
    console.log('');
    console.log('Next steps:');
    console.log('1. Extract real player data from PVL squad pages');
    console.log('2. Extract real team logos and information');
    console.log('3. Import only authentic PVL data with proper authorization');

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    throw error;
  }
}

// Run cleanup
cleanupMockData()
  .then(() => {
    console.log('✅ Database cleanup completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  });