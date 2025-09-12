const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'fantasy-volleyball-21364'
});

const db = admin.firestore();

async function initializeContestSystem() {
  console.log('Initializing Contest System...');

  try {
    // Create composite indexes for contestTeams collection
    console.log('Creating Firestore indexes (these need to be created manually in Firebase Console):');
    console.log('');
    console.log('Required Firestore Composite Indexes:');
    console.log('');
    console.log('1. contestTeams collection:');
    console.log('   - Fields: contestId (Ascending), totalPoints (Descending), joinedAt (Ascending)');
    console.log('   - Purpose: Contest leaderboard with ranking');
    console.log('');
    console.log('2. contestTeams collection:');
    console.log('   - Fields: userId (Ascending), matchId (Ascending)');
    console.log('   - Purpose: User contests filtered by match');
    console.log('');
    console.log('3. contestTeams collection:');
    console.log('   - Fields: userId (Ascending), contestId (Ascending)');
    console.log('   - Purpose: User teams in specific contest');
    console.log('');

    // Sample contest teams data for testing
    const sampleContestTeams = [
      {
        contestTeamId: 'contest_1_user_1757400308642902360_team_1',
        contestId: 'contest_1',
        teamId: 'team_1',
        userId: 'user_1757400308642902360',
        matchId: 'match_1',
        entryFee: 25,
        totalPoints: 0,
        rank: 0,
        joinedAt: new Date().toISOString()
      },
      {
        contestTeamId: 'contest_1_user_1757400308642902360_team_2',
        contestId: 'contest_1', 
        teamId: 'team_2',
        userId: 'user_1757400308642902360',
        matchId: 'match_1',
        entryFee: 25,
        totalPoints: 0,
        rank: 0,
        joinedAt: new Date().toISOString()
      }
    ];

    // Create sample contest teams
    const batch = db.batch();
    
    sampleContestTeams.forEach(contestTeam => {
      const ref = db.collection('contestTeams').doc(contestTeam.contestTeamId);
      batch.set(ref, contestTeam);
    });

    await batch.commit();
    console.log('✅ Sample contest teams created');

    // Update existing contests to have proper structure
    const contestsSnapshot = await db.collection('contests').get();
    const contestUpdateBatch = db.batch();
    
    contestsSnapshot.forEach(doc => {
      const contest = doc.data();
      const updates = {};
      
      // Ensure all required fields exist
      if (!contest.spotsLeft) {
        updates.spotsLeft = contest.maxSpots || 100;
      }
      if (!contest.joinedUsers) {
        updates.joinedUsers = 0;
      }
      if (!contest.status) {
        updates.status = 'upcoming';
      }
      
      if (Object.keys(updates).length > 0) {
        contestUpdateBatch.update(doc.ref, updates);
      }
    });

    await contestUpdateBatch.commit();
    console.log('✅ Contest documents updated with proper structure');

    console.log('');
    console.log('🚀 Contest system initialization complete!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Create the composite indexes shown above in Firebase Console');
    console.log('2. Deploy the updated backend with: gcloud app deploy');
    console.log('3. Test the contest joining flow in the frontend');
    console.log('');
    console.log('API Endpoints now available:');
    console.log('- POST /api/contests/{contestId}/join');
    console.log('- GET /api/contests/{contestId}/leaderboard');
    console.log('- GET /api/contests/{contestId}');
    console.log('- GET /api/users/{userId}/contests');
    console.log('- GET /api/users/{userId}/contests?matchId={matchId}');

  } catch (error) {
    console.error('❌ Error initializing contest system:', error);
  }
}

// Database Schema Documentation
function printSchemaDocumentation() {
  console.log('');
  console.log('=== CONTEST SYSTEM DATABASE SCHEMA ===');
  console.log('');
  
  console.log('📊 contestTeams Collection:');
  console.log('Document ID: {contestId}_{userId}_{teamId}');
  console.log('Fields:');
  console.log('  - contestTeamId: string (unique identifier)');
  console.log('  - contestId: string (reference to contest)');
  console.log('  - teamId: string (reference to user team)');
  console.log('  - userId: string (reference to user)');
  console.log('  - matchId: string (reference to match)');
  console.log('  - entryFee: number (fee paid for this entry)');
  console.log('  - totalPoints: number (current team points, updated live)');
  console.log('  - rank: number (current rank in contest, 0 if not calculated)');
  console.log('  - joinedAt: string (ISO timestamp)');
  console.log('');
  
  console.log('🔍 Required Firestore Rules:');
  console.log('');
  console.log('rules_version = "2";');
  console.log('service cloud.firestore {');
  console.log('  match /databases/{database}/documents {');
  console.log('    // Contest teams - users can read their own, admins can read all');
  console.log('    match /contestTeams/{contestTeamId} {');
  console.log('      allow read: if request.auth != null &&');
  console.log('        (resource.data.userId == request.auth.uid ||');
  console.log('         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true);');
  console.log('      allow write: if false; // Only backend can write');
  console.log('    }');
  console.log('  }');
  console.log('}');
  console.log('');
}

// Run initialization
initializeContestSystem()
  .then(() => {
    printSchemaDocumentation();
    process.exit(0);
  })
  .catch(error => {
    console.error('Failed to initialize:', error);
    process.exit(1);
  });