const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const oldSignInWithGoogle = `  const signInWithGoogle = async () => {
    try {
      let userObj: { uid: string; displayName?: string | null; email?: string | null; photoURL?: string | null } | null = null;
      // 1. Primary Attempt: Google Identity Services OAuth (Works across all referer domains without Firebase domain restriction)
      try {
        const { requestGoogleSignIn } = await import('../services/googleAuthService');
        const gUser = await requestGoogleSignIn();
        userObj = {
          uid: gUser.uid,
          displayName: gUser.displayName,
          email: gUser.email,
          photoURL: gUser.photoURL,
        };
      } catch (gisError: any) {
        console.warn('GIS Auth attempt notice:', gisError);
        // 2. Secondary Attempt: Firebase Auth popup
        try {
          const user = await loginWithGoogle();
          if (user) {
            userObj = {
              uid: user.uid,
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
            };
          }
        } catch (fbError: any) {
          console.error('Firebase Auth popup failed:', fbError);
          throw fbError;
        }
      }

      if (userObj) {
        setAuthUser(userObj as User);
        StorageService.saveUser(userObj as User);
        
        // Auto-create default settings
        let currentSettings = StorageService.getSettings();
        if (!currentSettings) {
           StorageService.saveSettings(defaultSettings);
        }
      }
    } catch (error: any) {
      console.error('Sign In Error:', error);
      throw error;
    }
  };`;

const newSignInWithGoogle = `  const signInWithGoogle = async () => {
    try {
      // Trigger Supabase OAuth directly
      await loginWithGoogle();
      // Note: OAuth redirects, so we don't handle user state here. 
      // onAuthStateChanged will pick it up on redirect back.
    } catch (error: any) {
      console.error('Sign In Error:', error);
      throw error;
    }
  };`;

if (code.includes('Primary Attempt: Google Identity Services OAuth')) {
  // Using a regex to replace the function as string literal might fail due to exact whitespace.
  code = code.replace(/const signInWithGoogle = async \(\) => \{[\s\S]*?\}\n    \} catch \(error: any\) \{\n      console\.error\('Sign In Error:', error\);\n      throw error;\n    \}\n  \};/, newSignInWithGoogle);
  fs.writeFileSync('src/context/AppContext.tsx', code);
  console.log("Patched signInWithGoogle");
} else {
  console.log("Could not find the function block");
}
