const fs = require('fs');
let code = fs.readFileSync('src/components/auth/LoginScreen.tsx', 'utf8');

const regex = /\{!showForgotPassword && \(\s*<>\s*([\s\S]*?)\s*<\/>\s*\)\s*\}/;
const match = regex.exec(code);

if (match) {
  code = code.replace(match[0], match[1]);
  fs.writeFileSync('src/components/auth/LoginScreen.tsx', code);
  console.log('Fixed syntax error by removing the fragment.');
} else {
  console.log('Could not find the fragment.');
}

