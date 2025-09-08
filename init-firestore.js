// Initialize Firebase Admin SDK for server-side access
const admin = require('firebase-admin');
const serviceAccount = require('./backend/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "fantasy-volleyball-21364"
});

const db = admin.firestore();

async function initializeData() {
  try {
    console.log('🏐 Initializing Firestore with PrimeV Fantasy volleyball data...');

    // Sample volleyball matches
    const matches = [
      {
        matchId: 'match_1',
        team1: {
          name: 'Mumbai Thunder',
          code: 'MUM',
          logo: 'https://via.placeholder.com/40x40/FF6B35/FFFFFF?text=MUM'
        },
        team2: {
          name: 'Delhi Dynamos',
          code: 'DEL',
          logo: 'https://via.placeholder.com/40x40/004E89/FFFFFF?text=DEL'
        },
        startTime: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 4 * 60 * 60 * 1000)), // 4 hours from now
        status: 'upcoming',
        league: 'Pro Volleyball League'
      },
      {
        matchId: 'match_2',
        team1: {
          name: 'Chennai Chargers',
          code: 'CHE',
          logo: 'https://via.placeholder.com/40x40/FFAA00/000000?text=CHE'
        },
        team2: {
          name: 'Bangalore Blasters',
          code: 'BAN',
          logo: 'https://via.placeholder.com/40x40/7209B7/FFFFFF?text=BAN'
        },
        startTime: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 6 * 60 * 60 * 1000)), // 6 hours from now
        status: 'upcoming',
        league: 'Pro Volleyball League'
      },
      {
        matchId: 'match_3',
        team1: {
          name: 'Kolkata Knights',
          code: 'KOL',
          logo: 'https://via.placeholder.com/40x40/9333EA/FFFFFF?text=KOL'
        },
        team2: {
          name: 'Hyderabad Hawks',
          code: 'HYD',
          logo: 'https://via.placeholder.com/40x40/F59E0B/FFFFFF?text=HYD'
        },
        startTime: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 8 * 60 * 60 * 1000)), // 8 hours from now
        status: 'upcoming',
        league: 'Premier Volleyball Championship'
      }
    ];

    // Add matches to Firestore
    for (const match of matches) {
      await db.collection('matches').doc(match.matchId).set(match);
      console.log(`✅ Added match: ${match.team1.code} vs ${match.team2.code}`);
    }

    // Sample volleyball players for match_1
    const playersMatch1 = [
      // Mumbai Thunder players
      {
        playerId: 'player_1',
        matchId: 'match_1',
        name: 'Arjun Sharma',
        team: 'MUM',
        category: 'setter',
        credits: 10.5,
        imageUrl: 'https://via.placeholder.com/100x100/FF6B35/FFFFFF?text=AS',
        isStarting6: true,
        isSubstitute: false,
        lastMatchPoints: 45,
        selectionPercentage: 65.4,
        liveStats: {
          attacks: 0,
          aces: 0,
          blocks: 0,
          receptionsSuccess: 0,
          receptionErrors: 0,
          setsPlayed: [],
          setsAsStarter: [],
          setsAsSubstitute: [],
          totalPoints: 0
        }
      },
      {
        playerId: 'player_2',
        matchId: 'match_1',
        name: 'Rohit Verma',
        team: 'MUM',
        category: 'attacker',
        credits: 12.0,
        imageUrl: 'https://via.placeholder.com/100x100/FF6B35/FFFFFF?text=RV',
        isStarting6: true,
        isSubstitute: false,
        lastMatchPoints: 52,
        selectionPercentage: 78.2,
        liveStats: {
          attacks: 0, aces: 0, blocks: 0, receptionsSuccess: 0, receptionErrors: 0,
          setsPlayed: [], setsAsStarter: [], setsAsSubstitute: [], totalPoints: 0
        }
      },
      {
        playerId: 'player_3',
        matchId: 'match_1',
        name: 'Vikash Kumar',
        team: 'MUM',
        category: 'blocker',
        credits: 9.5,
        imageUrl: 'https://via.placeholder.com/100x100/FF6B35/FFFFFF?text=VK',
        isStarting6: true,
        isSubstitute: false,
        lastMatchPoints: 38,
        selectionPercentage: 45.7,
        liveStats: {
          attacks: 0, aces: 0, blocks: 0, receptionsSuccess: 0, receptionErrors: 0,
          setsPlayed: [], setsAsStarter: [], setsAsSubstitute: [], totalPoints: 0
        }
      },
      {
        playerId: 'player_4',
        matchId: 'match_1',
        name: 'Sanjay Singh',
        team: 'MUM',
        category: 'universal',
        credits: 8.0,
        imageUrl: 'https://via.placeholder.com/100x100/FF6B35/FFFFFF?text=SS',
        isStarting6: false,
        isSubstitute: true,
        lastMatchPoints: 28,
        selectionPercentage: 32.5,
        liveStats: {
          attacks: 0, aces: 0, blocks: 0, receptionsSuccess: 0, receptionErrors: 0,
          setsPlayed: [], setsAsStarter: [], setsAsSubstitute: [], totalPoints: 0
        }
      },
      // Delhi Dynamos players
      {
        playerId: 'player_5',
        matchId: 'match_1',
        name: 'Amit Singh',
        team: 'DEL',
        category: 'setter',
        credits: 11.0,
        imageUrl: 'https://via.placeholder.com/100x100/004E89/FFFFFF?text=AS',
        isStarting6: true,
        isSubstitute: false,
        lastMatchPoints: 48,
        selectionPercentage: 72.1,
        liveStats: {
          attacks: 0, aces: 0, blocks: 0, receptionsSuccess: 0, receptionErrors: 0,
          setsPlayed: [], setsAsStarter: [], setsAsSubstitute: [], totalPoints: 0
        }
      },
      {
        playerId: 'player_6',
        matchId: 'match_1',
        name: 'Suresh Raina',
        team: 'DEL',
        category: 'attacker',
        credits: 13.0,
        imageUrl: 'https://via.placeholder.com/100x100/004E89/FFFFFF?text=SR',
        isStarting6: true,
        isSubstitute: false,
        lastMatchPoints: 58,
        selectionPercentage: 85.3,
        liveStats: {
          attacks: 0, aces: 0, blocks: 0, receptionsSuccess: 0, receptionErrors: 0,
          setsPlayed: [], setsAsStarter: [], setsAsSubstitute: [], totalPoints: 0
        }
      },
      {
        playerId: 'player_7',
        matchId: 'match_1',
        name: 'Deepak Hooda',
        team: 'DEL',
        category: 'universal',
        credits: 8.5,
        imageUrl: 'https://via.placeholder.com/100x100/004E89/FFFFFF?text=DH',
        isStarting6: true,
        isSubstitute: false,
        lastMatchPoints: 35,
        selectionPercentage: 42.8,
        liveStats: {
          attacks: 0, aces: 0, blocks: 0, receptionsSuccess: 0, receptionErrors: 0,
          setsPlayed: [], setsAsStarter: [], setsAsSubstitute: [], totalPoints: 0
        }
      },
      {
        playerId: 'player_8',
        matchId: 'match_1',
        name: 'Rajesh Kumar',
        team: 'DEL',
        category: 'blocker',
        credits: 9.0,
        imageUrl: 'https://via.placeholder.com/100x100/004E89/FFFFFF?text=RK',
        isStarting6: true,
        isSubstitute: false,
        lastMatchPoints: 41,
        selectionPercentage: 58.3,
        liveStats: {
          attacks: 0, aces: 0, blocks: 0, receptionsSuccess: 0, receptionErrors: 0,
          setsPlayed: [], setsAsStarter: [], setsAsSubstitute: [], totalPoints: 0
        }
      }
    ];

    // Add players to Firestore
    for (const player of playersMatch1) {
      await db.collection('players').doc(player.playerId).set(player);
      console.log(`✅ Added player: ${player.name} (${player.team})`);
    }

    // Sample contests
    const contests = [
      {
        contestId: 'contest_1',
        matchId: 'match_1',
        name: 'PrimeV Mega Contest',
        prizePool: 75000,
        totalSpots: 10000,
        spotsLeft: 8547,
        joinedUsers: 1453,
        maxTeamsPerUser: 6,
        totalWinners: 1400,
        winnerPercentage: 14.0,
        isGuaranteed: true,
        status: 'open',
        prizeDistribution: [
          { rank: 1, prize: 15000 },
          { rank: 2, prize: 10000 },
          { rank: 3, prize: 7500 },
          { rank: 4, prize: 5000 },
          { rank: 5, prize: 2500 }
        ]
      },
      {
        contestId: 'contest_2',
        matchId: 'match_2',
        name: 'Free Practice Contest',
        prizePool: 50000,
        totalSpots: 5000,
        spotsLeft: 4200,
        joinedUsers: 800,
        maxTeamsPerUser: 6,
        totalWinners: 700,
        winnerPercentage: 14.0,
        isGuaranteed: true,
        status: 'open',
        prizeDistribution: [
          { rank: 1, prize: 10000 },
          { rank: 2, prize: 7500 },
          { rank: 3, prize: 5000 }
        ]
      }
    ];

    // Add contests to Firestore
    for (const contest of contests) {
      await db.collection('contests').doc(contest.contestId).set(contest);
      console.log(`✅ Added contest: ${contest.name}`);
    }

    console.log('\n🎉 PrimeV Fantasy Firestore initialization completed successfully!');
    console.log('📊 Sample data includes:');
    console.log(`  - ${matches.length} volleyball matches`);
    console.log(`  - ${playersMatch1.length} players with volleyball positions`);
    console.log(`  - ${contests.length} free contests`);
    console.log('\n🔧 Test Authentication:');
    console.log('  Phone: +919999999999 or +911234567890');
    console.log('  OTP: 123456');

  } catch (error) {
    console.error('❌ Error initializing Firestore:', error);
  }
}

// Run the initialization
initializeData();