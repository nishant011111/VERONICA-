const fs = require('fs');
let content = fs.readFileSync('src/components/screens/SettingsScreen.tsx', 'utf-8');

const target = `      {/* 2. Appearance & Theme Switcher */}`;
const replacement = `      {/* 2. Appearance & Theme Switcher */}
      <Card glass className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <Palette className="w-5 h-5 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Accent Color
          </h3>
        </div>
        <div className="flex gap-4">
          {['indigo', 'emerald', 'rose', 'amber', 'blue'].map(color => (
            <button
              key={color}
              onClick={() => updateSettings({ accentColor: color })}
              className={\`w-10 h-10 rounded-full border-2 transition-transform \${
                (settings.accentColor || 'indigo') === color ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'
              }\`}
              style={{
                backgroundColor: color === 'indigo' ? '#4f46e5' :
                                 color === 'emerald' ? '#059669' :
                                 color === 'rose' ? '#e11d48' :
                                 color === 'amber' ? '#d97706' :
                                 '#2563eb'
              }}
              title={color.charAt(0).toUpperCase() + color.slice(1)}
            />
          ))}
        </div>
      </Card>

      {/* 2.5 Theme Mode Switcher */}`;

content = content.replace(target, replacement);

const targetImport = `import {`;
const replacementImport = `import { Palette, `;

content = content.replace(targetImport, replacementImport);

fs.writeFileSync('src/components/screens/SettingsScreen.tsx', content);
console.log("Patched SettingsScreen");
