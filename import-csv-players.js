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

// Category mapping from positions to our system
const CATEGORY_MAPPING = {
  'Setter': 'setter',
  'Attacker': 'attacker',
  'Universal': 'universal',
  'Blocker': 'blocker',
  'Libero': 'libero',
  'Middle Blocker': 'blocker',
  'Outside Hitter': 'attacker'
};

// Credit values to randomly assign
const CREDIT_VALUES = [16, 16.5, 17];

function getRandomCredits() {
  return CREDIT_VALUES[Math.floor(Math.random() * CREDIT_VALUES.length)];
}

// CSV data
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

function parseCSVData() {
  const lines = csvData.trim().split('\n');
  const headers = lines[0].split(',');
  const players = [];
  let playerCounter = 1;
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const team = values[0];
    const firstName = values[1];
    const lastName = values[2];
    const country = values[3];
    const position = values[4];
    
    // Skip rows with empty position or team
    if (!position || !team || position.trim() === '') {
      continue;
    }
    
    const teamInfo = TEAM_MAPPING[team];
    if (!teamInfo) {
      console.warn(`Unknown team: ${team}`);
      continue;
    }
    
    const category = CATEGORY_MAPPING[position] || 'universal';
    const fullName = lastName ? `${firstName} ${lastName}` : firstName;
    
    // Generate simple numeric player ID
    const playerId = String(playerCounter);
    playerCounter++;
    
    players.push({
      playerId,
      name: fullName,
      teamId: `team_pvl_${teamInfo.teamId}`,
      teamCode: teamInfo.code,
      position,
      category,
      credits: getRandomCredits(),
      country,
      imageUrl: `https://randomuser.me/api/portraits/men/${(i % 99) + 1}.jpg`,
      dateOfBirth: '1995-01-15'
    });
  }
  
  return players;
}

async function main() {
  console.log('🏐 CSV Player Import to Database');
  console.log('=================================');
  
  try {
    // Parse CSV data
    const players = parseCSVData();
    console.log(`\n📊 Parsed ${players.length} players from CSV data`);
    
    // Show category distribution
    const categoryCounts = {};
    players.forEach(player => {
      categoryCounts[player.category] = (categoryCounts[player.category] || 0) + 1;
    });
    
    console.log('\n🏐 Player Categories Distribution:');
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} players`);
    });
    
    // Show sample data
    console.log('\n📄 SAMPLE PLAYER DATA:');
    console.log('======================');
    players.slice(0, 10).forEach(player => {
      console.log(`${player.name} (${player.teamCode}) | ${player.position} → ${player.category} | ₹${player.credits} credits`);
    });
    
    // Import to database
    console.log('\n💾 IMPORTING TO DATABASE...');
    console.log('===========================');
    
    // Import Players
    const playerBatch = db.batch();
    players.forEach(player => {
      const playerData = {
        playerId: player.playerId,
        name: player.name,
        imageUrl: player.imageUrl,
        defaultCategory: player.category,
        defaultCredits: player.credits,
        dateOfBirth: player.dateOfBirth,
        nationality: player.country,
        createdAt: new Date().toISOString()
      };
      
      const playerRef = db.collection('players').doc(player.playerId);
      playerBatch.set(playerRef, playerData);
    });
    
    await playerBatch.commit();
    console.log(`✅ ${players.length} players imported to database`);
    
    // Create Team-Player Associations
    const assocBatch = db.batch();
    players.forEach(player => {
      const associationId = `assoc_${player.playerId}_${player.teamId}`;
      const associationData = {
        associationId,
        playerId: player.playerId,
        teamId: player.teamId,
        leagueId: 'pvl_2025_season1',
        season: '2025',
        jerseyNumber: Math.floor(Math.random() * 99) + 1,
        role: 'player',
        startDate: '2025-10-01',
        endDate: '2025-10-31',
        isActive: true,
        createdAt: new Date().toISOString()
      };
      
      const assocRef = db.collection('teamPlayers').doc(associationId);
      assocBatch.set(assocRef, associationData);
    });
    
    await assocBatch.commit();
    console.log(`✅ ${players.length} team-player associations created`);
    
    console.log('\n🎉 CSV PLAYER IMPORT COMPLETED!');
    console.log('===============================');
    console.log('✅ Database updated with real PVL player data from CSV');
    console.log('✅ Credits randomly assigned as 16, 16.5, or 17');
    console.log('✅ Middle Blocker → blocker, Outside Hitter → attacker');
    console.log('✅ Team-player associations created');
    console.log('\n🚀 Your fantasy platform is ready with real PVL players!');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

// Run the import
main();