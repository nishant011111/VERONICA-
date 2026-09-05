const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(
  "  signInWithEmail as supabaseSignInWithEmail,\n  signUpWithEmail as supabaseSignUpWithEmail,",
  "  signInWithEmail,\n  signUpWithEmail,"
);

code = code.replace(
  "await supabaseSignInWithEmail(email, password);",
  "await signInWithEmail(email, password);"
);

code = code.replace(
  "await supabaseSignUpWithEmail(email, password, name);",
  "await signUpWithEmail(email, password, name);"
);

fs.writeFileSync('src/context/AppContext.tsx', code);
