const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(
  "  onAuthStateChanged,",
  "  onAuthStateChanged,\n  auth,"
);

code = code.replace(
  "const unsubscribe = onAuthStateChanged((user) => {",
  "const unsubscribe = onAuthStateChanged(auth, (user) => {"
);

fs.writeFileSync('src/context/AppContext.tsx', code);
