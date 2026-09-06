const fs = require('fs');
let code = fs.readFileSync('src/components/forms/ImportTimetableModal.tsx', 'utf8');

code = code.replace(
  "import { Upload, X, Check, ArrowRight, Loader2, Image as ImageIcon, AlertTriangle } from 'lucide-react';",
  "import { Upload, X, Check, ArrowRight, Loader2, Image as ImageIcon, AlertTriangle, Sparkles } from 'lucide-react';"
);

fs.writeFileSync('src/components/forms/ImportTimetableModal.tsx', code);
