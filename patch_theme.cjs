const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf-8');

const target = `      if (effectiveTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }`;

const replacement = `      if (effectiveTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      
      // Handle Accent Color
      const accents = ['theme-indigo', 'theme-emerald', 'theme-rose', 'theme-amber', 'theme-blue'];
      root.classList.remove(...accents);
      if (settings.accentColor) {
        root.classList.add('theme-' + settings.accentColor);
      }`;

content = content.replace(target, replacement);

const target2 = `  }, [settings.theme]);`;
const replacement2 = `  }, [settings.theme, settings.accentColor]);`;
content = content.replace(target2, replacement2);

fs.writeFileSync('src/context/AppContext.tsx', content);
console.log("Patched AppContext theme useEffect");
