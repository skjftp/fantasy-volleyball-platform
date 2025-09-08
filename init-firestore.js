const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, Timestamp } = require('firebase/firestore');

// Firebase config for fantasy-volleyball-21364
const firebaseConfig = {
  apiKey: "AIzaSyDYour_API_Key_Here", // You'll need to get this from Firebase Console
  authDomain: "fantasy-volleyball-21364.firebaseapp.com",
  projectId: "fantasy-volleyball-21364",
  storageBucket: "fantasy-volleyball-21364.appspot.com",
  messagingSenderId: "107958119805",
  appId: "1:107958119805:web:your_app_id_here"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function initializeData() {
  try {
    console.log('Initializing Firestore with sample data...');

    // Sample matches
    const matches = [
      {
        matchId: 'match_1',
        team1: {
          name: 'Mumbai Mavericks',
          code: 'MUM',
          logo: 'https://via.placeholder.com/40x40/FF6B35/FFFFFF?text=MUM'
        },
        team2: {
          name: 'Delhi Dragons',
          code: 'DEL',
          logo: 'https://via.placeholder.com/40x40/004E89/FFFFFF?text=DEL'
        },
        startTime: Timestamp.fromDate(new Date(Date.now() + 4 * 60 * 60 * 1000)), // 4 hours from now
        status: 'upcoming',
        league: 'Pro Volleyball League'
      },
      {
        matchId: 'match_2',
        team1: {
          name: 'Chennai Champions',
          code: 'CHE',
          logo: 'https://via.placeholder.com/40x40/FFAA00/000000?text=CHE'
        },
        team2: {
          name: 'Bangalore Blasters',
          code: 'BAN',
          logo: 'https://via.placeholder.com/40x40/7209B7/FFFFFF?text=BAN'
        },
        startTime: Timestamp.fromDate(new Date(Date.now() + 6 * 60 * 60 * 1000)), // 6 hours from now
        status: 'upcoming',
        league: 'Pro Volleyball League'
      }
    ];

    // Add matches to Firestore
    for (const match of matches) {
      await setDoc(doc(db, 'matches', match.matchId), match);
      console.log(`Added match: ${match.matchId}`);
    }

    // Sample players for match_1
    const playersMatch1 = [
      // Mumbai Mavericks players
      {
        playerId: 'player_1',
        matchId: 'match_1',
        name: 'Arjun Sharma',
        team: 'MUM',
        category: 'setter',
        credits: 10,
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
        credits: 12,
        imageUrl: 'https://via.placeholder.com/100x100/FF6B35/FFFFFF?text=RV',
        isStarting6: true,
        isSubstitute: false,
        lastMatchPoints: 52,
        selectionPercentage: 78.2,
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
        playerId: 'player_3',
        matchId: 'match_1',
        name: 'Vikash Kumar',
        team: 'MUM',
        category: 'blocker',
        credits: 9,
        imageUrl: 'https://via.placeholder.com/100x100/FF6B35/FFFFFF?text=VK',
        isStarting6: true,
        isSubstitute: false,
        lastMatchPoints: 38,
        selectionPercentage: 45.7,
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
      // Delhi Dragons players
      {
        playerId: 'player_4',
        matchId: 'match_1',
        name: 'Amit Singh',
        team: 'DEL',
        category: 'setter',
        credits: 11,
        imageUrl: 'https://via.placeholder.com/100x100/004E89/FFFFFF?text=AS',
        isStarting6: true,
        isSubstitute: false,
        lastMatchPoints: 48,
        selectionPercentage: 72.1,
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
        playerId: 'player_5',
        matchId: 'match_1',
        name: 'Suresh Raina',
        team: 'DEL',
        category: 'attacker',
        credits: 13,
        imageUrl: 'https://via.placeholder.com/100x100/004E89/FFFFFF?text=SR',
        isStarting6: true,
        isSubstitute: false,
        lastMatchPoints: 58,
        selectionPercentage: 85.3,
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
        playerId: 'player_6',
        matchId: 'match_1',
        name: 'Deepak Hooda',
        team: 'DEL',
        category: 'universal',
        credits: 8,
        imageUrl: 'https://via.placeholder.com/100x100/004E89/FFFFFF?text=DH',
        isStarting6: true,
        isSubstitute: false,
        lastMatchPoints: 35,
        selectionPercentage: 42.8,
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
      }
    ];

    // Add players to Firestore
    for (const player of playersMatch1) {
      await setDoc(doc(db, 'players', player.playerId), player);
      console.log(`Added player: ${player.name}`);
    }

    // Sample contests
    const contests = [
      {
        contestId: 'contest_1',
        matchId: 'match_1',
        name: 'VISION11 Giveaway',
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
        name: 'Mega Contest',
        prizePool: 100000,
        totalSpots: 15000,
        spotsLeft: 12543,
        joinedUsers: 2457,
        maxTeamsPerUser: 6,
        totalWinners: 2100,
        winnerPercentage: 14.0,
        isGuaranteed: true,
        status: 'open',
        prizeDistribution: [
          { rank: 1, prize: 25000 },
          { rank: 2, prize: 15000 },
          { rank: 3, prize: 10000 }
        ]
      }
    ];

    // Add contests to Firestore
    for (const contest of contests) {
      await setDoc(doc(db, 'contests', contest.contestId), contest);
      console.log(`Added contest: ${contest.name}`);
    }

    console.log('✅ Firestore initialization completed successfully!');
    console.log('📊 Sample data includes:');
    console.log(`  - ${matches.length} matches`);
    console.log(`  - ${playersMatch1.length} players`);
    console.log(`  - ${contests.length} contests`);

  } catch (error) {
    console.error('❌ Error initializing Firestore:', error);
  }
}

// Run the initialization
initializeData();