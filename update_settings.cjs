const fs = require('fs');
let code = fs.readFileSync('src/components/screens/SettingsScreen.tsx', 'utf8');

// 1. Add imports
const imports = `import { SystemHealthCenter } from './settings/SystemHealthCenter';
import { PrivacyCenter } from './settings/PrivacyCenter';\n`;
code = code.replace("import { DeleteAccountModal } from '../profile/DeleteAccountModal';", "import { DeleteAccountModal } from '../profile/DeleteAccountModal';\n" + imports);

// 2. Add components at the bottom before the last modals
const target = `{/* Fingerprint Auth Modal */}`;
const injection = `
      {/* 4. Privacy Center */}
      <PrivacyCenter />
      
      {/* 5. System Health Center */}
      <SystemHealthCenter />

      `;
code = code.replace(target, injection + target);

fs.writeFileSync('src/components/screens/SettingsScreen.tsx', code);
console.log("Updated SettingsScreen.tsx");
