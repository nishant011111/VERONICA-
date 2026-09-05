const fs = require('fs');
let code = fs.readFileSync('src/components/auth/LoginScreen.tsx', 'utf8');

const duplicateStr = "              {!showForgotPassword && (\n                <>";
code = code.replace(duplicateStr, "");

fs.writeFileSync('src/components/auth/LoginScreen.tsx', code);
