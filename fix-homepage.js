// Quick script to fix the HomePage fetchMatches function
const fs = require('fs');

const filePath = '/Users/sumitjha/Dropbox/Mac/Documents/Projects/fantasy-volleyball-platform/frontend/src/pages/HomePage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Find and replace the broken fetchMatches section
const brokenStart = content.indexOf('} catch (error) {');
const functionEnd = content.indexOf('const [currentTime, setCurrentTime] = useState(new Date());');

if (brokenStart !== -1 && functionEnd !== -1) {
  const before = content.substring(0, brokenStart);
  const after = content.substring(functionEnd);
  
  const cleanSection = `} catch (error) {
      console.error('Error fetching matches:', error);
      
      // Show empty state if no real matches available
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  `;
  
  const fixedContent = before + cleanSection + after;
  fs.writeFileSync(filePath, fixedContent);
  console.log('✅ HomePage fetchMatches function fixed');
} else {
  console.log('❌ Could not find the broken section to fix');
}