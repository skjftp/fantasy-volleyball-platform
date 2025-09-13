const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./backend/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'fantasy-volleyball-21364'
});

const db = admin.firestore();

// Team logo mapping - using local asset paths
const TEAM_LOGO_MAPPING = {
  'team_pvl_69': '/src/assets/team-logos/ahmedabad-defenders.png',  // Ahmedabad Defenders
  'team_pvl_72': '/src/assets/team-logos/bengaluru-torpedoes.png',  // Bengaluru Torpedoes
  'team_pvl_70': '/src/assets/team-logos/calicut-heroes.png',       // Calicut Heroes
  'team_pvl_68': '/src/assets/team-logos/chennai-blitz.png',        // Chennai Blitz
  'team_pvl_372': '/src/assets/team-logos/delhi-toofans.png',       // Delhi Toofans
  'team_pvl_381': '/src/assets/team-logos/goa-guardians.png',       // Goa Guardians
  'team_pvl_64': '/src/assets/team-logos/hyderabad-black-hawks.png', // Hyderabad Black Hawks
  'team_pvl_67': '/src/assets/team-logos/kochi-blue-spikers.png',   // Kochi Blue Spikers
  'team_pvl_71': '/src/assets/team-logos/kolkata-thunderbolts.png', // Kolkata Thunderbolts
  'team_pvl_259': '/src/assets/team-logos/mumbai-meteors.png'       // Mumbai Meteors
};

// Alternative mapping using direct URLs (for immediate use)
const TEAM_LOGO_URLS = {
  'team_pvl_69': 'https://www.primevolleyballleague.com/static-assets/images/team/69.png?v=1.55',
  'team_pvl_72': 'https://www.primevolleyballleague.com/static-assets/images/team/72.png?v=1.55',
  'team_pvl_70': 'https://www.primevolleyballleague.com/static-assets/images/team/70.png?v=1.55',
  'team_pvl_68': 'https://www.primevolleyballleague.com/static-assets/images/team/68.png?v=1.55',
  'team_pvl_372': 'https://www.primevolleyballleague.com/static-assets/images/team/372.png?v=1.55',
  'team_pvl_381': 'https://www.primevolleyballleague.com/static-assets/images/team/381.png?v=1.55',
  'team_pvl_64': 'https://www.primevolleyballleague.com/static-assets/images/team/64.png?v=1.55',
  'team_pvl_67': 'https://www.primevolleyballleague.com/static-assets/images/team/67.png?v=1.55',
  'team_pvl_71': 'https://www.primevolleyballleague.com/static-assets/images/team/71.png?v=1.55',
  'team_pvl_259': 'https://www.primevolleyballleague.com/static-assets/images/team/259.png?v=1.55'
};

async function updateTeamLogos() {
  console.log('🏐 Updating PVL Team Logos in Database');
  console.log('======================================');
  
  try {
    // Get all teams from database
    console.log('\n📋 Fetching teams from database...');
    const teamsSnapshot = await db.collection('teams').get();
    
    if (teamsSnapshot.empty) {
      console.log('❌ No teams found in database');
      return;
    }
    
    console.log(`📊 Found ${teamsSnapshot.size} teams in database`);
    
    // Update each team with new logo
    const batch = db.batch();
    let updatedCount = 0;
    let skippedCount = 0;
    
    teamsSnapshot.forEach(doc => {
      const teamId = doc.id;
      const teamData = doc.data();
      
      // Check if team has a logo mapping
      if (TEAM_LOGO_URLS[teamId]) {
        const newLogoUrl = TEAM_LOGO_URLS[teamId];
        
        // Update team document with new logo
        batch.update(doc.ref, {
          logo: newLogoUrl,
          updatedAt: new Date().toISOString()
        });
        
        console.log(`✅ Queued logo update for ${teamData.name || teamId}: ${newLogoUrl}`);
        updatedCount++;
      } else {
        console.log(`⚠️  No logo mapping found for team: ${teamId} (${teamData.name || 'Unknown'})`);
        skippedCount++;
      }
    });
    
    // Commit all updates
    if (updatedCount > 0) {
      console.log(`\n💾 Committing ${updatedCount} logo updates...`);
      await batch.commit();
      console.log('✅ All team logos updated successfully');
    }
    
    // Show summary
    console.log('\n📈 UPDATE SUMMARY');
    console.log('=================');
    console.log(`✅ Updated: ${updatedCount} teams`);
    console.log(`⚠️  Skipped: ${skippedCount} teams`);
    console.log(`📊 Total teams: ${teamsSnapshot.size}`);
    
    // Display updated teams
    if (updatedCount > 0) {
      console.log('\n🏆 UPDATED TEAMS WITH NEW LOGOS:');
      console.log('================================');
      
      // Re-fetch to show updated data
      const updatedSnapshot = await db.collection('teams').get();
      updatedSnapshot.forEach(doc => {
        const teamId = doc.id;
        const teamData = doc.data();
        
        if (TEAM_LOGO_URLS[teamId]) {
          console.log(`${teamData.name || teamId}: ${teamData.logo}`);
        }
      });
    }
    
    console.log('\n🎉 TEAM LOGO UPDATE COMPLETED!');
    console.log('==============================');
    console.log('✅ All PVL team logos are now using official images');
    console.log('✅ Teams will display with proper branding in the app');
    
  } catch (error) {
    console.error('❌ Team logo update failed:', error);
    process.exit(1);
  }
}

// Run the update
updateTeamLogos();