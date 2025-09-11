// Fix ContestsPage by removing all mock data after the catch block
const fs = require('fs');

const filePath = '/Users/sumitjha/Dropbox/Mac/Documents/Projects/fantasy-volleyball-platform/frontend/src/pages/ContestsPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Find the error handling section and clean it up
const errorStart = content.indexOf('console.error(\'Error fetching contests\', error);');
const finallyEnd = content.indexOf('} finally {', errorStart);
const sortByFunctionStart = content.indexOf('const sortContests = (contests: Contest[]) => {');

if (errorStart !== -1 && sortByFunctionStart !== -1) {
  const before = content.substring(0, errorStart);
  const after = content.substring(sortByFunctionStart);
  
  const cleanSection = `console.error('Error fetching contests:', error);
      
      // Show empty state if no real contests available
      setContests([]);
    } finally {
      setLoading(false);
    }
  };

  `;
  
  const fixedContent = before + cleanSection + after;
  fs.writeFileSync(filePath, fixedContent);
  console.log('✅ ContestsPage fixed');
} else {
  console.log('❌ Could not find the sections to fix');
}