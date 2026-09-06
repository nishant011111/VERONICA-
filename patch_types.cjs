const fs = require('fs');
let code = fs.readFileSync('src/types/index.ts', 'utf8');

code = code.replace(
  "saveHistory: boolean;",
  "saveHistory: boolean;\n    memoryEnabled: boolean;"
);

const memoryType = `
export interface AIMemory {
  id: string;
  userId: string;
  content: string;
  category: 'preference' | 'project' | 'fact' | 'instruction';
  createdAt: string;
  updatedAt: string;
}
`;

code += memoryType;
fs.writeFileSync('src/types/index.ts', code);
