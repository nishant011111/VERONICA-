const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes("import { LoginScreen }")) {
  code = code.replace(
    "import { AppProvider, useApp } from './context/AppContext';",
    "import { AppProvider, useApp } from './context/AppContext';\nimport { LoginScreen } from './components/auth/LoginScreen';"
  );
  fs.writeFileSync('src/App.tsx', code);
}
