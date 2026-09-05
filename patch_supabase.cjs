const fs = require('fs');
let code = fs.readFileSync('src/services/supabaseAuth.ts', 'utf8');

const resetCode = `export const resetPasswordForEmail = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Supabase Password Reset Error:', error);
    throw error;
  }
};
`;

code = code + '\n' + resetCode;
fs.writeFileSync('src/services/supabaseAuth.ts', code);
