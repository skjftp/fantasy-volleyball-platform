const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./backend/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'fantasy-volleyball-21364'
});

const db = admin.firestore();

// Instead of storing file paths, let's store team codes
// The frontend can then map team codes to imported assets
const TEAM_CODE_MAPPING = {
  'team_pvl_69': 'AMD',    // Ahmedabad Defenders
  'team_pvl_72': 'BT',     // Bengaluru Torpedoes
  'team_pvl_70': 'CH',     // Calicut Heroes
  'team_pvl_68': 'CB',     // Chennai Blitz
  'team_pvl_372': 'DT',    // Delhi Toofans
  'team_pvl_381': 'GG',    // Goa Guardians
  'team_pvl_64': 'HBH',    // Hyderabad Black Hawks
  'team_pvl_67': 'KBS',    // Kochi Blue Spikers
  'team_pvl_71': 'KTB',    // Kolkata Thunderbolts
  'team_pvl_259': 'MM'     // Mumbai Meteors
};

async function updateTeamLogosToUseCodes() {
  console.log('🏐 Updating Team Logos to Use Team Codes');
  console.log('========================================');
  
  try {
    // Get all teams from database
    console.log('\n📋 Fetching teams from database...');
    const teamsSnapshot = await db.collection('teams').get();
    
    if (teamsSnapshot.empty) {
      console.log('❌ No teams found in database');
      return;
    }
    
    console.log(`📊 Found ${teamsSnapshot.size} teams in database`);
    
    // Update each team to use their team code for logo resolution
    const batch = db.batch();
    let updatedCount = 0;
    let skippedCount = 0;
    
    teamsSnapshot.forEach(doc => {
      const teamId = doc.id;
      const teamData = doc.data();
      
      // Check if team has a code mapping
      if (TEAM_CODE_MAPPING[teamId]) {
        const teamCode = TEAM_CODE_MAPPING[teamId];
        
        // Instead of storing a path, we'll store a special identifier
        // that the frontend can use to map to imported assets
        const logoIdentifier = `team-logo:${teamCode}`;
        
        // Update team document
        batch.update(doc.ref, {
          logo: logoIdentifier,
          logoCode: teamCode,  // Also store the code separately for easy access
          updatedAt: new Date().toISOString()
        });
        
        console.log(`✅ Queued logo update for ${teamData.name || teamId}: ${logoIdentifier} (${teamCode})`);
        updatedCount++;
      } else {
        console.log(`⚠️  No code mapping found for team: ${teamId} (${teamData.name || 'Unknown'})`);
        skippedCount++;
      }
    });
    
    // Commit all updates
    if (updatedCount > 0) {
      console.log(`\n💾 Committing ${updatedCount} logo updates...`);
      await batch.commit();
      console.log('✅ All team logos updated to use team codes successfully');
    }
    
    // Show summary
    console.log('\n📈 CODE-BASED UPDATE SUMMARY');
    console.log('============================');
    console.log(`✅ Updated: ${updatedCount} teams`);
    console.log(`⚠️  Skipped: ${skippedCount} teams`);
    console.log(`📊 Total teams: ${teamsSnapshot.size}`);
    
    // Display updated teams
    if (updatedCount > 0) {
      console.log('\n🏆 UPDATED TEAMS WITH CODE-BASED LOGOS:');
      console.log('======================================');
      
      // Re-fetch to show updated data
      const updatedSnapshot = await db.collection('teams').get();
      updatedSnapshot.forEach(doc => {
        const teamId = doc.id;
        const teamData = doc.data();
        
        if (TEAM_CODE_MAPPING[teamId]) {
          console.log(`${teamData.name || teamId}: ${teamData.logo} (code: ${teamData.logoCode})`);
        }
      });
    }
    
    console.log('\n📝 FRONTEND IMPLEMENTATION:');
    console.log('===========================');
    console.log('✅ Team logos now use team-logo:CODE format');
    console.log('✅ Frontend can detect team-logo: prefix and map to imported assets');
    console.log('✅ More reliable than file paths - immune to build system changes');
    console.log('✅ Easier to maintain and extend');
    
    console.log('\n🎉 CODE-BASED TEAM LOGO UPDATE COMPLETED!');
    console.log('=========================================');
    console.log('✅ All PVL team logos now use reliable team code references');
    console.log('✅ Frontend can properly resolve logos using imported assets');
    console.log('✅ Build system agnostic approach');
    
  } catch (error) {
    console.error('❌ Code-based team logo update failed:', error);
    process.exit(1);
  }
}

// Run the update
updateTeamLogosToUseCodes();