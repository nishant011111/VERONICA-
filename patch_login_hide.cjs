const fs = require('fs');
let code = fs.readFileSync('src/components/auth/LoginScreen.tsx', 'utf8');

// The block to hide is everything from `{/* Divider OR */}` to `<div className="border-t border-slate-700/60 pt-4 text-center">`
// Let's use a regex replacement.

const hideStart = '{/* Divider OR */}';
const hideEnd = '<div className="border-t border-slate-700/60 pt-4 text-center">';

const splitStart = code.indexOf(hideStart);
const splitEnd = code.indexOf(hideEnd);

if (splitStart !== -1 && splitEnd !== -1) {
  const innerContent = code.substring(splitStart, splitEnd);
  
  const replacement = `
              {!showForgotPassword && (
                <>
                  ${innerContent}
                </>
              )}
              ${hideEnd}
  `;
  code = code.substring(0, splitStart) + replacement + code.substring(splitEnd + hideEnd.length);
  fs.writeFileSync('src/components/auth/LoginScreen.tsx', code);
  console.log('Successfully hid social logins during password reset.');
} else {
  console.log('Could not find boundaries.');
}

