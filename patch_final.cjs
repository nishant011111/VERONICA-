const fs = require('fs');
let code = fs.readFileSync('src/components/auth/LoginScreen.tsx', 'utf8');

code = code.replace(
  "{/* Divider OR */}",
  "{!showForgotPassword && (\n<>\n{/* Divider OR */}"
);

fs.writeFileSync('src/components/auth/LoginScreen.tsx', code);
