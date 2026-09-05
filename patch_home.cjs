const fs = require('fs');
let content = fs.readFileSync('src/components/screens/HomeScreen.tsx', 'utf-8');

const startStr = "      {/* Today's Overview Metric Grid */}";
const endStr = "      {/* Student Profile Modal */}";

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex > -1 && endIndex > -1) {
  const newContent = content.substring(0, startIndex) + 
    "      <Dashboard onOpenQuickCreate={onOpenQuickCreate} />\n\n" + 
    "      " + content.substring(endIndex);
  
  // also add import for Dashboard
  let imports = newContent.replace(
    "import { StudentProfileModal } from '../profile/StudentProfileModal';",
    "import { StudentProfileModal } from '../profile/StudentProfileModal';\nimport { Dashboard } from '../dashboard/Dashboard';"
  );
  
  // remove unused imports
  imports = imports.replace("import { Clock, Target, CalendarCheck, Flame } from 'lucide-react';\n", "");

  fs.writeFileSync('src/components/screens/HomeScreen.tsx', imports);
  console.log("Patched successfully");
} else {
  console.log("Could not find boundaries");
}
