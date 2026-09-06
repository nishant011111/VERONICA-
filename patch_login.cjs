const fs = require('fs');
let code = fs.readFileSync('src/components/auth/LoginScreen.tsx', 'utf8');

code = code.replace(/addToast/g, 'showToast');

fs.writeFileSync('src/components/auth/LoginScreen.tsx', code);
