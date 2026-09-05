const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Header.tsx', 'utf-8');

const importStr = "import { NotificationCenter } from './NotificationCenter';";
if (!content.includes(importStr)) {
  content = content.replace(
    "import { GlobalSearchModal } from '../search/GlobalSearchModal';",
    "import { GlobalSearchModal } from '../search/GlobalSearchModal';\nimport { NotificationCenter } from './NotificationCenter';"
  );
}

const themeSwitcherTarget = `{/* Theme Switcher */}
        <button
          onClick={toggleTheme}`;

const newButtons = `<NotificationCenter />
        
        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}`;

content = content.replace(themeSwitcherTarget, newButtons);
fs.writeFileSync('src/components/layout/Header.tsx', content);
console.log("Patched Header notifications");
