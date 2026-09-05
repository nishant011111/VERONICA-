const fs = require('fs');
let code = fs.readFileSync('src/components/auth/LoginScreen.tsx', 'utf8');

code = code.replace(
  "import { resetPasswordForEmail } from '../../services/supabaseAuth';",
  "import { resetPasswordForEmail } from '../../services/firebase';"
);

fs.writeFileSync('src/components/auth/LoginScreen.tsx', code);
