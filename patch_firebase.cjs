const fs = require('fs');
let code = fs.readFileSync('src/services/firebase.ts', 'utf8');

// Update imports
code = code.replace(
  "  User,\n} from 'firebase/auth';",
  "  User,\n  signInWithEmailAndPassword,\n  createUserWithEmailAndPassword,\n  sendPasswordResetEmail,\n  updateProfile\n} from 'firebase/auth';"
);

// Add email/password auth functions
const emailAuthCode = `
export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Firebase Email Sign-In Error:', error);
    throw error;
  }
};

export const signUpWithEmail = async (email, password, displayName) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    return result.user;
  } catch (error) {
    console.error('Firebase Email Sign-Up Error:', error);
    throw error;
  }
};

export const resetPasswordForEmail = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Firebase Password Reset Error:', error);
    throw error;
  }
};
`;

code = code.replace("export { onAuthStateChanged };", emailAuthCode + "\nexport { onAuthStateChanged };");
fs.writeFileSync('src/services/firebase.ts', code);
