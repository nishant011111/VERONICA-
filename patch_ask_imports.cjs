const fs = require('fs');
let code = fs.readFileSync('src/components/screens/AskVeronicaScreen.tsx', 'utf8');

code = code.replace(
  "import { AIRouter } from '../../services/ai/AIRouter';",
  "import { AIRouter } from '../../services/ai/AIRouter';\nimport { MemoryService } from '../../services/ai/MemoryService';\nimport { vectorDB } from '../../services/ai/VectorDatabase';"
);

fs.writeFileSync('src/components/screens/AskVeronicaScreen.tsx', code);
