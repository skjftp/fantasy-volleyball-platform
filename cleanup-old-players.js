const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./backend/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'fantasy-volleyball-21364'
});

const db = admin.firestore();

async function cleanupOldPlayers() {
  console.log('🧹 Cleaning up old player documents');
  console.log('==================================');
  
  try {
    // Get all players
    const playersSnapshot = await db.collection('players').get();
    const oldPlayers = [];
    const newPlayers = [];
    
    playersSnapshot.forEach(doc => {
      const playerId = doc.id;
      // Check if it's a numeric ID (new format) or contains underscores (old format)
      if (/^\d+$/.test(playerId)) {
        newPlayers.push(playerId);
      } else {
        oldPlayers.push(playerId);
      }
    });
    
    console.log(`📊 Found ${playersSnapshot.size} total player documents:`);
    console.log(`   - ${newPlayers.length} new documents (numeric IDs)`);
    console.log(`   - ${oldPlayers.length} old documents (messy IDs)`);
    
    if (oldPlayers.length === 0) {
      console.log('✅ No old documents to clean up!');
      return;
    }
    
    // Show some examples of old IDs to be deleted
    console.log('\n🗑️  Sample old IDs to be deleted:');
    oldPlayers.slice(0, 5).forEach(id => {
      console.log(`   - ${id}`);
    });
    if (oldPlayers.length > 5) {
      console.log(`   ... and ${oldPlayers.length - 5} more`);
    }
    
    // Delete old players in batches
    console.log(`\n💾 Deleting ${oldPlayers.length} old player documents...`);
    const batchSize = 500; // Firestore batch limit
    let deletedCount = 0;
    
    for (let i = 0; i < oldPlayers.length; i += batchSize) {
      const batch = db.batch();
      const batchPlayers = oldPlayers.slice(i, i + batchSize);
      
      batchPlayers.forEach(playerId => {
        const playerRef = db.collection('players').doc(playerId);
        batch.delete(playerRef);
      });
      
      await batch.commit();
      deletedCount += batchPlayers.length;
      console.log(`   ✅ Deleted ${deletedCount}/${oldPlayers.length} players`);
    }
    
    // Also clean up old team-player associations
    console.log('\n🔗 Cleaning up old team-player associations...');
    const teamPlayersSnapshot = await db.collection('teamPlayers').get();
    const oldAssociations = [];
    
    teamPlayersSnapshot.forEach(doc => {
      const data = doc.data();
      // Check if the playerId is old format
      if (data.playerId && !/^\d+$/.test(data.playerId)) {
        oldAssociations.push(doc.id);
      }
    });
    
    console.log(`📊 Found ${oldAssociations.length} old team-player associations to delete`);
    
    if (oldAssociations.length > 0) {
      // Delete old associations in batches
      for (let i = 0; i < oldAssociations.length; i += batchSize) {
        const batch = db.batch();
        const batchAssociations = oldAssociations.slice(i, i + batchSize);
        
        batchAssociations.forEach(assocId => {
          const assocRef = db.collection('teamPlayers').doc(assocId);
          batch.delete(assocRef);
        });
        
        await batch.commit();
        console.log(`   ✅ Deleted ${Math.min(i + batchSize, oldAssociations.length)}/${oldAssociations.length} associations`);
      }
    }
    
    console.log('\n🎉 CLEANUP COMPLETED!');
    console.log('====================');
    console.log(`✅ Deleted ${oldPlayers.length} old player documents`);
    console.log(`✅ Deleted ${oldAssociations.length} old team-player associations`);
    console.log(`✅ Kept ${newPlayers.length} new player documents with numeric IDs`);
    console.log('\n🚀 Database is now clean with only organized numeric player IDs!');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

// Run the cleanup
cleanupOldPlayers();