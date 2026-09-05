const fs = require('fs');
let code = fs.readFileSync('src/components/auth/LoginScreen.tsx', 'utf8');

code = code.replace("import { showToast } from '../ui/ToastContainer';", "");

code = code.replace(
  "const { signInWithGoogle, signInWithEmail, signUpWithEmail, signInWithFingerprintUser } = useApp();",
  "const { signInWithGoogle, signInWithEmail, signUpWithEmail, signInWithFingerprintUser, addToast } = useApp();"
);

code = code.replace(
  "showToast('Password reset email sent. Check your inbox.', 'success');",
  "addToast('Password reset email sent. Check your inbox.', 'success');"
);

fs.writeFileSync('src/components/auth/LoginScreen.tsx', code);
