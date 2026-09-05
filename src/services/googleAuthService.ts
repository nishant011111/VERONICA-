// Google Authentication Service using Google Identity Services (GIS) & UserInfo API
// Bypasses Firebase domain referrer restrictions in sandbox environments

export interface GoogleAuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

export const requestGoogleSignIn = (): Promise<GoogleAuthUser> => {
  return new Promise((resolve, reject) => {
    const initGisClient = () => {
      try {
        if (!window.google?.accounts?.oauth2) {
          reject(new Error('Google Identity Services library not available'));
          return;
        }

        const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '418724110726-applet.apps.googleusercontent.com';

        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'openid profile email',
          callback: async (response: any) => {
            if (response.error) {
              reject(new Error(response.error_description || response.error));
              return;
            }

            if (response.access_token) {
              try {
                // Fetch Google User Info using Access Token
                const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${response.access_token}` },
                });

                if (!userInfoRes.ok) {
                  throw new Error('Failed to fetch user profile from Google');
                }

                const info = await userInfoRes.json();
                resolve({
                  uid: info.sub || `google_${Date.now()}`,
                  email: info.email || 'student@google.com',
                  displayName: info.name || 'Google Student',
                  photoURL: info.picture || '',
                });
              } catch (err: any) {
                reject(err);
              }
            } else {
              reject(new Error('No access token returned from Google'));
            }
          },
          error_callback: (err: any) => {
            reject(new Error(err?.message || 'Google Auth Popup closed or cancelled'));
          },
        });

        client.requestAccessToken({ prompt: 'select_account' });
      } catch (err) {
        reject(err);
      }
    };

    if (window.google?.accounts?.oauth2) {
      initGisClient();
    } else {
      const existingScript = document.getElementById('google-gsi-script');
      if (existingScript) {
        initGisClient();
        return;
      }
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => initGisClient();
      script.onerror = () => reject(new Error('Failed to load Google Identity Services library'));
      document.head.appendChild(script);
    }
  });
};
