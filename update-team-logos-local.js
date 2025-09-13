const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./backend/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'fantasy-volleyball-21364'
});

const db = admin.firestore();

// Team logo mapping using local asset paths that work with Vite/React
const TEAM_LOGO_LOCAL_URLS = {
  'team_pvl_69': '/src/assets/team-logos/ahmedabad-defenders.png',
  'team_pvl_72': '/src/assets/team-logos/bengaluru-torpedoes.png',
  'team_pvl_70': '/src/assets/team-logos/calicut-heroes.png',
  'team_pvl_68': '/src/assets/team-logos/chennai-blitz.png',
  'team_pvl_372': '/src/assets/team-logos/delhi-toofans.png',
  'team_pvl_381': '/src/assets/team-logos/goa-guardians.png',
  'team_pvl_64': '/src/assets/team-logos/hyderabad-black-hawks.png',
  'team_pvl_67': '/src/assets/team-logos/kochi-blue-spikers.png',
  'team_pvl_71': '/src/assets/team-logos/kolkata-thunderbolts.png',
  'team_pvl_259': '/src/assets/team-logos/mumbai-meteors.png'
};

async function updateTeamLogosToLocal() {
  console.log('🏐 Updating Team Logos to Local Asset URLs');
  console.log('==========================================');
  
  try {
    // Get all teams from database
    console.log('\n📋 Fetching teams from database...');
    const teamsSnapshot = await db.collection('teams').get();
    
    if (teamsSnapshot.empty) {
      console.log('❌ No teams found in database');
      return;
    }
    
    console.log(`📊 Found ${teamsSnapshot.size} teams in database`);
    
    // Update each team with local logo path
    const batch = db.batch();
    let updatedCount = 0;
    let skippedCount = 0;
    
    teamsSnapshot.forEach(doc => {
      const teamId = doc.id;
      const teamData = doc.data();
      
      // Check if team has a local logo mapping
      if (TEAM_LOGO_LOCAL_URLS[teamId]) {
        const localLogoPath = TEAM_LOGO_LOCAL_URLS[teamId];
        
        // Update team document with local logo path
        batch.update(doc.ref, {
          logo: localLogoPath,
          updatedAt: new Date().toISOString()
        });
        
        console.log(`✅ Queued local logo update for ${teamData.name || teamId}: ${localLogoPath}`);
        updatedCount++;
      } else {
        console.log(`⚠️  No local logo mapping found for team: ${teamId} (${teamData.name || 'Unknown'})`);
        skippedCount++;
      }
    });
    
    // Commit all updates
    if (updatedCount > 0) {
      console.log(`\n💾 Committing ${updatedCount} local logo updates...`);
      await batch.commit();
      console.log('✅ All team logos updated to local paths successfully');
    }
    
    // Show summary
    console.log('\n📈 LOCAL UPDATE SUMMARY');
    console.log('=======================');
    console.log(`✅ Updated: ${updatedCount} teams`);
    console.log(`⚠️  Skipped: ${skippedCount} teams`);
    console.log(`📊 Total teams: ${teamsSnapshot.size}`);
    
    // Display updated teams
    if (updatedCount > 0) {
      console.log('\n🏆 UPDATED TEAMS WITH LOCAL LOGOS:');
      console.log('==================================');
      
      // Re-fetch to show updated data
      const updatedSnapshot = await db.collection('teams').get();
      updatedSnapshot.forEach(doc => {
        const teamId = doc.id;
        const teamData = doc.data();
        
        if (TEAM_LOGO_LOCAL_URLS[teamId]) {
          console.log(`${teamData.name || teamId}: ${teamData.logo}`);
        }
      });
    }
    
    console.log('\n📝 NEXT STEPS:');
    console.log('==============');
    console.log('✅ Team logos now use local asset paths');
    console.log('✅ Frontend will load logos from /src/assets/team-logos/');
    console.log('⚠️  Make sure to import logos properly in React components');
    console.log('💡 Use the TypeScript helper in /src/assets/team-logos/index.ts');
    
    console.log('\n🎉 LOCAL TEAM LOGO UPDATE COMPLETED!');
    console.log('====================================');
    console.log('✅ All PVL team logos now use local hosted images');
    console.log('✅ No dependency on external PVL website URLs');
    console.log('✅ Faster loading and better reliability');
    
  } catch (error) {
    console.error('❌ Local team logo update failed:', error);
    process.exit(1);
  }
}

// Run the update
updateTeamLogosToLocal();