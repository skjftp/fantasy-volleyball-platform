const { execSync } = require('child_process');
const fs = require('fs');

// PVL Team Squad URLs
const SQUAD_URLS = [
  { teamId: 69, name: 'Ahmedabad Defenders', code: 'AMD', url: 'https://www.primevolleyballleague.com/squads/ahmedabad-defenders-69' },
  { teamId: 72, name: 'Bengaluru Torpedoes', code: 'BT', url: 'https://www.primevolleyballleague.com/squads/bengaluru-torpedoes-72' },
  { teamId: 70, name: 'Calicut Heroes', code: 'CH', url: 'https://www.primevolleyballleague.com/squads/calicut-heroes-70' },
  { teamId: 68, name: 'Chennai Blitz', code: 'CB', url: 'https://www.primevolleyballleague.com/squads/chennai-blitz-68' },
  { teamId: 372, name: 'Delhi Toofans', code: 'DT', url: 'https://www.primevolleyballleague.com/squads/delhi-toofans-372' },
  { teamId: 381, name: 'Goa Guardians', code: 'GG', url: 'https://www.primevolleyballleague.com/squads/goa-guardians-381' },
  { teamId: 64, name: 'Hyderabad Black Hawks', code: 'HBH', url: 'https://www.primevolleyballleague.com/squads/hyderabad-black-hawks-64' },
  { teamId: 67, name: 'Kochi Blue Spikers', code: 'KBS', url: 'https://www.primevolleyballleague.com/squads/kochi-blue-spikers-67' },
  { teamId: 71, name: 'Kolkata Thunderbolts', code: 'KTB', url: 'https://www.primevolleyballleague.com/squads/kolkata-thunderbolts-71' },
  { teamId: 259, name: 'Mumbai Meteors', code: 'MM', url: 'https://www.primevolleyballleague.com/squads/mumbai-meteors-259' }
];

// Category mapping
const CATEGORY_MAPPING = {
  'Middle Blocker': 'blocker',
  'Outside Hitter': 'attacker', 
  'Setter': 'setter',
  'Libero': 'libero',
  'Opposite': 'attacker',
  'Universal': 'universal',
  'Opposite Hitter': 'attacker'
};

// Credit assignment
const POSITION_CREDITS = {
  'libero': 8.5,
  'setter': 9.0,
  'blocker': 8.0,
  'attacker': 8.5,
  'universal': 9.5
};

function extractSquadData() {
  console.log('🏐 Extracting Squad Data from PVL Website');
  console.log('==========================================');
  console.log('');
  console.log('📋 EXTRACTED DATA PREVIEW (NEEDS YOUR APPROVAL)');
  console.log('================================================');
  console.log('');

  try {
    // Test extraction with Ahmedabad Defenders first
    console.log('🔍 Testing extraction with Ahmedabad Defenders...');
    
    const curlCommand = `curl -s 'https://www.primevolleyballleague.com/squads/ahmedabad-defenders-69' ` +
      `-H 'accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7' ` +
      `-H 'accept-language: en-GB,en-US;q=0.9,en;q=0.8,sn;q=0.7' ` +
      `-H 'cache-control: max-age=0' ` +
      `-H 'priority: u=0, i' ` +
      `-H 'referer: https://www.primevolleyballleague.com/fixtures-and-results' ` +
      `-H 'sec-ch-ua: "Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"' ` +
      `-H 'sec-ch-ua-mobile: ?0' ` +
      `-H 'sec-ch-ua-platform: "macOS"' ` +
      `-H 'sec-fetch-dest: document' ` +
      `-H 'sec-fetch-mode: navigate' ` +
      `-H 'sec-fetch-site: same-origin' ` +
      `-H 'sec-fetch-user: ?1' ` +
      `-H 'upgrade-insecure-requests: 1' ` +
      `-H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'`;

    const htmlContent = execSync(curlCommand).toString();
    
    // Basic check if we got HTML content
    if (htmlContent.includes('<!doctype html') && htmlContent.includes('Ahmedabad Defenders')) {
      console.log('✅ Successfully accessed squad page HTML content');
      console.log('✅ Found team name: Ahmedabad Defenders');
      
      // Look for player data patterns
      const hasPlayerData = htmlContent.includes('player') || htmlContent.includes('jersey') || htmlContent.includes('position');
      
      if (hasPlayerData) {
        console.log('✅ Found potential player data in HTML');
        
        // Save the HTML for analysis
        fs.writeFileSync('sample-squad-page.html', htmlContent);
        console.log('📄 Saved sample HTML to sample-squad-page.html for analysis');
        
        console.log('');
        console.log('📊 HTML Content Analysis:');
        console.log(`   - Content Length: ${htmlContent.length} characters`);
        console.log(`   - Contains "player": ${htmlContent.toLowerCase().includes('player')}`);
        console.log(`   - Contains "jersey": ${htmlContent.toLowerCase().includes('jersey')}`);
        console.log(`   - Contains "position": ${htmlContent.toLowerCase().includes('position')}`);
        console.log(`   - Contains "squad": ${htmlContent.toLowerCase().includes('squad')}`);
        
        // Try to find JSON data in the HTML
        const jsonMatches = htmlContent.match(/"players":\s*\[.*?\]/g);
        if (jsonMatches) {
          console.log('🎯 Found JSON player data in HTML!');
          console.log('📄 Sample JSON data:');
          console.log(jsonMatches[0].substring(0, 200) + '...');
        } else {
          console.log('⚠️  No JSON player data found, will need HTML parsing');
        }
        
      } else {
        console.log('❌ No clear player data patterns found');
      }
      
    } else {
      console.log('❌ Could not access proper HTML content');
      console.log('📄 Response preview:');
      console.log(htmlContent.substring(0, 500) + '...');
    }

    console.log('');
    console.log('🤚 WAITING FOR YOUR APPROVAL');
    console.log('============================');
    console.log('Please review the extraction results above.');
    console.log('');
    console.log('If you want to proceed with data extraction:');
    console.log('1. Review the sample-squad-page.html file');
    console.log('2. Confirm if player data is accessible');
    console.log('3. Give explicit permission to extract and import data');
    console.log('');
    console.log('❌ NO DATA WILL BE IMPORTED WITHOUT YOUR PERMISSION');

  } catch (error) {
    console.error('❌ Extraction test failed:', error.message);
  }
}

// Run extraction test
extractSquadData();