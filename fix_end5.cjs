const fs = require('fs');
let code = fs.readFileSync('src/components/screens/AskVeronicaScreen.tsx', 'utf8');

const regex = /<span className="text-emerald-600 dark:text-emerald-400 font-medium">📚 \{subj\.name\}<\/span>\s*\)\}/g;

code = code.replace(regex, `<span className="text-emerald-600 dark:text-emerald-400 font-medium">📚 {subj.name}</span>
                          </>
                        )}`);

fs.writeFileSync('src/components/screens/AskVeronicaScreen.tsx', code);
console.log("fixed end fragment!");
