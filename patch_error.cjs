const fs = require('fs');
let code = fs.readFileSync('src/components/auth/LoginScreen.tsx', 'utf8');

const errorHelper = `
const parseAuthError = (err: any, fallbackMessage: string) => {
  const msg = err?.message || '';
  if (msg.includes('auth/requests-from-referer') && msg.includes('are-blocked')) {
    return 'Configuration Error: Your Google Cloud API Key is restricting access from this domain. Please go to Google Cloud Console -> APIs & Services -> Credentials -> Edit your Firebase API Key, and add this URL to "Website restrictions" (HTTP referrers), or remove the restriction.';
  }
  if (msg.includes('auth/unauthorized-domain')) {
    return 'Configuration Error: This domain is not authorized for OAuth. Please go to Firebase Console -> Authentication -> Settings -> Authorized domains, and add this URL.';
  }
  return msg || fallbackMessage;
};
`;

code = code.replace(
  "export const LoginScreen: React.FC = () => {",
  errorHelper + "\nexport const LoginScreen: React.FC = () => {"
);

code = code.replace(
  "setError(err?.message || 'Failed to send password reset email.');",
  "setError(parseAuthError(err, 'Failed to send password reset email.'));"
);

code = code.replace(
  "setError(err?.message || 'Authentication failed. Please try again.');",
  "setError(parseAuthError(err, 'Authentication failed. Please try again.'));"
);

code = code.replace(
  "setError(err?.message || 'Failed to sign in with Google. Please check your connection and try again.');",
  "setError(parseAuthError(err, 'Failed to sign in with Google. Please check your connection and try again.'));"
);

fs.writeFileSync('src/components/auth/LoginScreen.tsx', code);
