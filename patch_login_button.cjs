const fs = require('fs');
let code = fs.readFileSync('src/components/auth/LoginScreen.tsx', 'utf8');

code = code.replace(
  `<span>Continue with Google</span>`,
  `<span>Sign in with Supabase</span>`
);

code = code.replace(
  `<span>Authenticating with Google...</span>`,
  `<span>Authenticating with Supabase...</span>`
);

fs.writeFileSync('src/components/auth/LoginScreen.tsx', code);
console.log("Patched login button text");
