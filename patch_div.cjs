const fs = require('fs');
let code = fs.readFileSync('src/components/auth/LoginScreen.tsx', 'utf8');

code = code.replace(
  "              )}\n              \n              <div className=\"border-t border-slate-700/60 pt-4 text-center mt-4\">",
  "              )}\n              </div>\n              <div className=\"border-t border-slate-700/60 pt-4 text-center mt-4\">"
);

fs.writeFileSync('src/components/auth/LoginScreen.tsx', code);
