// Cleanup old fragmented player data and migrate to new schema
const admin = require('firebase-admin');
const serviceAccount = require('./backend/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "fantasy-volleyball-21364"
});

const db = admin.firestore();

async function cleanupOldData() {
  try {
    console.log('🧹 Starting cleanup of old fragmented data...');

    // 1. Delete old individual matchPlayers documents
    console.log('\n1. Cleaning up old matchPlayers collection...');
    const matchPlayersSnapshot = await db.collection('matchPlayers').get();
    let deletedMatchPlayers = 0;
    
    const batch1 = db.batch();
    matchPlayersSnapshot.docs.forEach((doc) => {
      batch1.delete(doc.ref);
      deletedMatchPlayers++;
    });
    
    if (deletedMatchPlayers > 0) {
      await batch1.commit();
      console.log(`✅ Deleted ${deletedMatchPlayers} old matchPlayers documents`);
    } else {
      console.log('✅ No matchPlayers documents to delete');
    }

    // 2. Clean up old player documents with empty schema fields
    console.log('\n2. Cleaning up old player documents with incomplete schema...');
    const playersSnapshot = await db.collection('players').get();
    let deletedPlayers = 0;
    
    const batch2 = db.batch();
    playersSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      // Delete players with old schema (missing new fields or empty values)
      if (!data.defaultCategory || !data.defaultCredits || !data.nationality) {
        batch2.delete(doc.ref);
        deletedPlayers++;
      }
    });
    
    if (deletedPlayers > 0) {
      await batch2.commit();
      console.log(`✅ Deleted ${deletedPlayers} old player documents with incomplete schema`);
    } else {
      console.log('✅ No incomplete player documents to delete');
    }

    // 3. Clean up any test data
    console.log('\n3. Cleaning up test data...');
    const testMatches = await db.collection('matches').where('matchId', '==', 'test123').get();
    let deletedTestData = 0;
    
    const batch3 = db.batch();
    testMatches.docs.forEach((doc) => {
      batch3.delete(doc.ref);
      deletedTestData++;
    });
    
    if (deletedTestData > 0) {
      await batch3.commit();
      console.log(`✅ Deleted ${deletedTestData} test match documents`);
    } else {
      console.log('✅ No test match documents to delete');
    }

    // 4. Summary of remaining data
    console.log('\n📊 Remaining data after cleanup:');
    
    const remainingPlayers = await db.collection('players').get();
    console.log(`   Players: ${remainingPlayers.size} documents`);
    
    const remainingTeams = await db.collection('teams').get();
    console.log(`   Teams: ${remainingTeams.size} documents`);
    
    const remainingLeagues = await db.collection('leagues').get();
    console.log(`   Leagues: ${remainingLeagues.size} documents`);
    
    const remainingMatches = await db.collection('matches').get();
    console.log(`   Matches: ${remainingMatches.size} documents`);
    
    const remainingTeamPlayers = await db.collection('teamPlayers').get();
    console.log(`   Team Associations: ${remainingTeamPlayers.size} documents`);
    
    const remainingMatchSquads = await db.collection('matchSquads').get();
    console.log(`   Match Squads: ${remainingMatchSquads.size} documents`);

    console.log('\n🎉 Database cleanup completed successfully!');
    console.log('💾 New normalized schema is now clean and ready for use.');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

// Run the cleanup
cleanupOldData();