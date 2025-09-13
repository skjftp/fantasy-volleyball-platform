const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./backend/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'fantasy-volleyball-21364'
});

const db = admin.firestore();

// Team mapping to team IDs
const TEAM_MAPPING = {
  'Ahmedabad Defenders': { teamId: 69, code: 'AMD' },
  'Bengaluru Torpedoes': { teamId: 72, code: 'BT' },
  'Calicut Heroes': { teamId: 70, code: 'CH' },
  'Chennai Blitz': { teamId: 68, code: 'CB' },
  'Delhi Toofans': { teamId: 372, code: 'DT' },
  'Goa Guardians': { teamId: 381, code: 'GG' },
  'Hyderabad Black Hawks': { teamId: 64, code: 'HBH' },
  'Kochi Blue Spikers': { teamId: 67, code: 'KBS' },
  'Kolkata Thunderbolts': { teamId: 71, code: 'KTB' },
  'Mumbai Meteors': { teamId: 259, code: 'MM' }
};

// CSV data to rebuild associations
const csvData = `Team,First Name,Last Name,Country,Position
Ahmedabad Defenders,Muthusamy,Appavu,India,Setter
Ahmedabad Defenders,Battur,Batsuuri,Mongolia,Attacker
Ahmedabad Defenders,Dhruvil,Patel,India,Attacker
Ahmedabad Defenders,Nandhagopal,Subramaniam,India,Attacker
Ahmedabad Defenders,Shon T,John,India,Attacker
Ahmedabad Defenders,Angamuthu,Ramaswamy,India,Universal
Ahmedabad Defenders,Harsh,Chaudhari,India,Universal
Ahmedabad Defenders,Abhinav,BS,India,Blocker
Ahmedabad Defenders,Akhin,GS,India,Blocker
Ahmedabad Defenders,Arshak,Sinan,India,Blocker
Ahmedabad Defenders,P,Prabagaran,India,Libero
Ahmedabad Defenders,Ronald,Martinez,Venezuela,Middle Blocker
Ahmedabad Defenders,Abhishek,Soni (R),India,Attacker
Ahmedabad Defenders,Ayush,Chaudhari (R),India,Attacker
Bengaluru Torpedoes,Matt,West,USA,Setter
Bengaluru Torpedoes,Sandeep,,India,Setter
Bengaluru Torpedoes,Himanshu,Tyagi,India,Attacker
Bengaluru Torpedoes,Joel,Benjamin J,India,Attacker
Bengaluru Torpedoes,Rohit,Kumar,India,Attacker
Bengaluru Torpedoes,Sethu,TR,India,Attacker
Bengaluru Torpedoes,Ibin,Jose,India,Universal
Bengaluru Torpedoes,Jalen,Penrose,USA,Universal
Bengaluru Torpedoes,Jishnu,PV,India,Blocker
Bengaluru Torpedoes,Mujeeb,Mc,India,Blocker
Bengaluru Torpedoes,Nitin,Minhas,India,Blocker
Bengaluru Torpedoes,Midhunkumar,Balasubramaniyan,India,Libero
Bengaluru Torpedoes,Arshad,KS (R),India,Blocker
Bengaluru Torpedoes,Naji,Ahmed (R),India,
Calicut Heroes,Haris,,India,Setter
Calicut Heroes,Mohan,Ukkrapandian,India,Setter
Calicut Heroes,Kiranraj,Thevalil,India,Attacker
Calicut Heroes,Santosh,S,India,Attacker
Calicut Heroes,Ussama,Rehamat,India,Attacker
Calicut Heroes,Abdul,Raheem,India,Universal
Calicut Heroes,Ashok,Bishnoi,India,Universal
Calicut Heroes,Shameemudheen,,India,Blocker
Calicut Heroes,Vikas,Maan,India,Blocker
Calicut Heroes,Mukesh,Kumar,India,Libero
Calicut Heroes,Dete,Bosco,Benin,Outside Hitter
Calicut Heroes,Tharusha,Chamath,Sri Lanka,Outside Hitter
Calicut Heroes,Sivanesan,V (R),India,Blocker
Calicut Heroes,Adarsh,K (R),India,
Chennai Blitz,Nanjil,Surya,India,Setter
Chennai Blitz,Sameer,Chaudhary,India,Setter
Chennai Blitz,Luiz Felipe,Perotto,Brazil,Attacker
Chennai Blitz,M Ashwin,Raj,India,Attacker
Chennai Blitz,Tarun Gowda,K,India,Attacker
Chennai Blitz,Dhilip,Kumar,India,Universal
Chennai Blitz,JEROME VINITH,C,India,Universal
Chennai Blitz,K Vishnu Vardhan,Babu,India,Universal
Chennai Blitz,Aditya,Rana,India,Blocker
Chennai Blitz,Leandro,Jose,Colombia,Blocker
Chennai Blitz,Namith,MN,India,Blocker
Chennai Blitz,T,Srikanth,India,Libero
Chennai Blitz,Pranav,K Dev (R),India,Attacker
Chennai Blitz,Venu,Chikkanna (R),India,
Delhi Toofans,Avinash,,India,Setter
Delhi Toofans,Saqlain,Tariq,India,Setter
Delhi Toofans,Anu,James,India,Attacker
Delhi Toofans,George,Antony,India,Attacker
Delhi Toofans,Mannat,Choudhary,India,Attacker
Delhi Toofans,Abhishek,Rajeev,India,Universal
Delhi Toofans,Aayush,,India,Blocker
Delhi Toofans,Jesus,Chourio,Venezuela,Blocker
Delhi Toofans,Muhammed,Jasim,India,Blocker
Delhi Toofans,Rijas,K R,India,Blocker
Delhi Toofans,Anand,K,India,Libero
Delhi Toofans,Carlos,Berrios,Venezuela,Outside Hitter
Delhi Toofans,Ajay,Kumar (R),India,Blocker
Delhi Toofans,Aljo,Sabu (R),India,
Goa Guardians,Aravindhan,D,India,Setter
Goa Guardians,Rohit,Yadav,India,Setter
Goa Guardians,Amit,Chhoker,India,Attacker
Goa Guardians,Chirag,Yadav,India,Attacker
Goa Guardians,Jeffrey,Menzel,USA,Attacker
Goa Guardians,Jerry,Danial,India,Attacker
Goa Guardians,Nathaniel,Dickinson,USA,Universal
Goa Guardians,Vikram,,India,Universal
Goa Guardians,Dushyant,Singh,India,Blocker
Goa Guardians,LM,Manoj,India,Blocker
Goa Guardians,Prince,,India,Blocker
Goa Guardians,Ramanathan,Ramamoorthy,India,Libero
Goa Guardians,Shakti,Singh (R),India,
Hyderabad Black Hawks,Paulo,Lamounier,Brazil,Setter
Hyderabad Black Hawks,Preet,Karan,India,Setter
Hyderabad Black Hawks,Aman,Kumar,India,Attacker
Hyderabad Black Hawks,Athul,,India,Attacker
Hyderabad Black Hawks,Rajneesh,Singh,India,Attacker
Hyderabad Black Hawks,Vitor,Yamamoto,Brazil,Attacker
Hyderabad Black Hawks,Guru,Prashanth,India,Universal
Hyderabad Black Hawks,Sahil,Kumar,India,Universal
Hyderabad Black Hawks,Digvijay,Singh,India,Blocker
Hyderabad Black Hawks,John,Joseph,India,Blocker
Hyderabad Black Hawks,Shikhar,Singh,India,Blocker
Hyderabad Black Hawks,Deepu,Venugopal,India,Libero
Hyderabad Black Hawks,Niyas,Abdul Salam (R),India,Attacker
Hyderabad Black Hawks,Shibin,TS (R),India,
Kochi Blue Spikers,Byron,Keturakis,Canada,Setter
Kochi Blue Spikers,Janshad,U,India,Setter
Kochi Blue Spikers,Amal K,Thomas,India,Attacker
Kochi Blue Spikers,Erin,Varghese,India,Attacker
Kochi Blue Spikers,Hemanth,P,India,Attacker
Kochi Blue Spikers,Nicholas,Marechal,France,Attacker
Kochi Blue Spikers,Vinit,Kumar,India,Universal
Kochi Blue Spikers,Amrinderpal,Singh,India,Blocker
Kochi Blue Spikers,Jasjodh,Singh,India,Blocker
Kochi Blue Spikers,Nirmal,George,India,Blocker
Kochi Blue Spikers,Alan,Ashiqe VL,India,Libero
Kochi Blue Spikers,Soorya,Santhosh,India,Libero
Kochi Blue Spikers,Abhishek,CK (R),India,Attacker
Kochi Blue Spikers,Bibin,Binoy (R),India,
Kolkata Thunderbolts,Jithin,Neelathazha,India,Setter
Kolkata Thunderbolts,Lal,Sujan MV,India,Setter
Kolkata Thunderbolts,Pankaj,Sharma,India,Attacker
Kolkata Thunderbolts,Rahul,K,India,Attacker
Kolkata Thunderbolts,Suryansh,Tomar,India,Attacker
Kolkata Thunderbolts,Ashwal,Rai,India,Universal
Kolkata Thunderbolts,Muhammad,Fawaz M,India,Blocker
Kolkata Thunderbolts,Muhammed,Iqbal,India,Blocker
Kolkata Thunderbolts,Srajan,Shetty,India,Blocker
Kolkata Thunderbolts,Hari,Prasad BS,India,Libero
Kolkata Thunderbolts,Matin,Takavar,Iran,Middle Blocker
Kolkata Thunderbolts,Sebastian,Gomez,Colombia,Outside Hitter
Kolkata Thunderbolts,Anush,(R),India,Attacker
Kolkata Thunderbolts,Soham,Dinesh More (R),India,
Mumbai Meteors,Lad Om,Vasant,India,Setter
Mumbai Meteors,Vipul,Kumar,India,Setter
Mumbai Meteors,Amit,Gulia,India,Attacker
Mumbai Meteors,Mritunjoy,Mahanta,India,Attacker
Mumbai Meteors,Nikhil,Choudhary,India,Attacker
Mumbai Meteors,Sonu,,India,Attacker
Mumbai Meteors,Nikhil,,India,Universal
Mumbai Meteors,Shubham,Chaudhary,India,Universal
Mumbai Meteors,Abhinav,Salar,India,Blocker
Mumbai Meteors,Karthik,A,India,Blocker
Mumbai Meteors,Yogesh,Kumar,India,Libero
Mumbai Meteors,Petter,Alstad,Norway,Middle Blocker
Mumbai Meteors,Mathias,Loftesnes,Norway,Outside Hitter
Mumbai Meteors,Kush,Singh (R),India,Blocker
Mumbai Meteors,Kamlesh,Khatik (R),India,`;

async function main() {
  console.log('🧹 Fixing teamPlayers Collection');
  console.log('=================================');
  
  try {
    // Step 1: Clean up all teamPlayers
    console.log('\n1️⃣  Cleaning up all teamPlayers collection...');
    const teamPlayersSnapshot = await db.collection('teamPlayers').get();
    console.log(`   Found ${teamPlayersSnapshot.size} existing team-player associations`);
    
    if (teamPlayersSnapshot.size > 0) {
      const batchSize = 500;
      let deletedCount = 0;
      const totalDocs = teamPlayersSnapshot.size;
      
      for (let i = 0; i < totalDocs; i += batchSize) {
        const batch = db.batch();
        const docs = teamPlayersSnapshot.docs.slice(i, i + batchSize);
        
        docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
        deletedCount += docs.length;
        console.log(`   ✅ Deleted ${deletedCount}/${totalDocs} associations`);
      }
    }
    
    // Step 2: Check teams table for valid team_ids
    console.log('\n2️⃣  Checking teams table for valid team_ids...');
    const teamsSnapshot = await db.collection('teams').get();
    const validTeamIds = new Set();
    
    teamsSnapshot.forEach(doc => {
      validTeamIds.add(doc.id);
      console.log(`   Found team: ${doc.id} - ${doc.data().name || 'Unknown'}`);
    });
    
    console.log(`   Total valid teams found: ${validTeamIds.size}`);
    
    // Step 3: Get all current players (numeric IDs only)
    console.log('\n3️⃣  Getting current players...');
    const playersSnapshot = await db.collection('players').get();
    const players = [];
    
    playersSnapshot.forEach(doc => {
      if (/^\d+$/.test(doc.id)) { // Only numeric IDs
        players.push({
          id: doc.id,
          data: doc.data()
        });
      }
    });
    
    console.log(`   Found ${players.length} players with numeric IDs`);
    
    // Step 4: Parse CSV to map players to teams
    console.log('\n4️⃣  Mapping players to teams from CSV...');
    const lines = csvData.trim().split('\n');
    const playerTeamMap = new Map();
    let playerCounter = 1;
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const team = values[0];
      const firstName = values[1];
      const lastName = values[2];
      const position = values[4];
      
      if (!position || !team || position.trim() === '') {
        continue;
      }
      
      const teamInfo = TEAM_MAPPING[team];
      if (!teamInfo) {
        continue;
      }
      
      const fullName = lastName ? `${firstName} ${lastName}` : firstName;
      const playerId = String(playerCounter);
      const teamId = `team_pvl_${teamInfo.teamId}`;
      
      playerTeamMap.set(playerId, {
        teamId,
        teamCode: teamInfo.code,
        teamName: team
      });
      
      playerCounter++;
    }
    
    console.log(`   Mapped ${playerTeamMap.size} players to teams`);
    
    // Step 5: Create new team-player associations
    console.log('\n5️⃣  Creating new team-player associations...');
    const assocBatch = db.batch();
    let createdCount = 0;
    let skippedCount = 0;
    
    players.forEach(player => {
      const teamMapping = playerTeamMap.get(player.id);
      
      if (!teamMapping) {
        console.log(`   ⚠️  No team mapping found for player ${player.id}`);
        skippedCount++;
        return;
      }
      
      // Check if team exists in database
      if (!validTeamIds.has(teamMapping.teamId)) {
        console.log(`   ⚠️  Team ${teamMapping.teamId} not found in teams collection for player ${player.id}`);
        skippedCount++;
        return;
      }
      
      const associationId = `${player.id}_${teamMapping.teamId}_pvl_2025_season1`;
      const associationData = {
        associationId,
        playerId: player.id,
        teamId: teamMapping.teamId,
        leagueId: 'pvl_2025_season1',
        season: '2025',
        jerseyNumber: Math.floor(Math.random() * 99) + 1,
        role: 'player',
        startDate: '2025-02-01',
        endDate: '2025-04-30',
        isActive: true,
        createdAt: new Date().toISOString()
      };
      
      const assocRef = db.collection('teamPlayers').doc(associationId);
      assocBatch.set(assocRef, associationData);
      createdCount++;
    });
    
    if (createdCount > 0) {
      await assocBatch.commit();
    }
    
    console.log('\n🎉 TEAM-PLAYER FIX COMPLETED!');
    console.log('=============================');
    console.log(`✅ Cleaned up old teamPlayers collection`);
    console.log(`✅ Validated team_ids against teams table`);
    console.log(`✅ Created ${createdCount} new team-player associations`);
    console.log(`⚠️  Skipped ${skippedCount} players (no team mapping or invalid team)`);
    console.log(`✅ All associations use league_id: pvl_2025_season1`);
    console.log('\n🚀 TeamPlayers collection is now properly organized!');
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  }
}

// Run the fix
main();