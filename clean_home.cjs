const fs = require('fs');
let content = fs.readFileSync('src/components/screens/HomeScreen.tsx', 'utf-8');

// We want to remove unused local variables like formatStudyTime, calculateStreak, etc.
// From `// Time of day greeting` down to `return (`
const start = content.indexOf('  // Time of day greeting');
const end = content.indexOf('  return (');

if (start > -1 && end > -1) {
  const setupBlock = content.substring(start, end);
  // Just keep the greeting part, remove the rest inside setupBlock
  const greetingEnd = setupBlock.indexOf('  const todayIso') > -1 ? setupBlock.indexOf('  const todayIso') : setupBlock.indexOf('  const formatStudyTime');
  
  const newSetupBlock = setupBlock.substring(0, greetingEnd);
  
  content = content.substring(0, start) + newSetupBlock + content.substring(end);
}

fs.writeFileSync('src/components/screens/HomeScreen.tsx', content);
console.log("Cleaned HomeScreen.tsx");
