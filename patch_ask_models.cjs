const fs = require('fs');
let code = fs.readFileSync('src/components/screens/AskVeronicaScreen.tsx', 'utf8');

if (!code.includes("import { AI_PROVIDERS_CONFIG }")) {
  code = code.replace(
    "import { AIRouter } from '../../services/ai/AIRouter';",
    "import { AIRouter } from '../../services/ai/AIRouter';\nimport { AI_PROVIDERS_CONFIG } from '../../services/ai/config';"
  );
}

const currentSelect = `             </select>
          </div>`;

const newSelect = `             </select>
          </div>
          
          {/* Model Selector */}
          {settings.ai.activeProvider && AI_PROVIDERS_CONFIG[settings.ai.activeProvider as keyof typeof AI_PROVIDERS_CONFIG] && (
            <div className="relative">
               <select
                  value={settings.ai.activeModel || AI_PROVIDERS_CONFIG[settings.ai.activeProvider as keyof typeof AI_PROVIDERS_CONFIG].primaryModel}
                  onChange={(e) => updateSettings({ ai: { ...settings.ai, activeModel: e.target.value } })}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
               >
                  <option value={AI_PROVIDERS_CONFIG[settings.ai.activeProvider as keyof typeof AI_PROVIDERS_CONFIG].primaryModel}>
                    {AI_PROVIDERS_CONFIG[settings.ai.activeProvider as keyof typeof AI_PROVIDERS_CONFIG].primaryModel}
                  </option>
                  {AI_PROVIDERS_CONFIG[settings.ai.activeProvider as keyof typeof AI_PROVIDERS_CONFIG].fallbackModels.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
               </select>
            </div>
          )}`;

code = code.replace(currentSelect, newSelect);

fs.writeFileSync('src/components/screens/AskVeronicaScreen.tsx', code);
