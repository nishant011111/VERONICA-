const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(
  /} from '\.\.\/services\/supabaseAuth';/g,
  "} from '../services/firebase';"
);

fs.writeFileSync('src/context/AppContext.tsx', code);
