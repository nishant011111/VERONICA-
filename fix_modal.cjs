const fs = require('fs');
let code = fs.readFileSync('src/components/forms/ImportTimetableModal.tsx', 'utf8');

code = code.replace(
  "notes: cls.section ? \\`Section: \\${cls.section}\\` : ''",
  "notes: cls.section ? `Section: ${cls.section}` : ''"
);

code = code.replace(
  "showToast(\\`Successfully imported \\${savedCount} classes!\\`, 'success');",
  "showToast(`Successfully imported ${savedCount} classes!`, 'success');"
);

fs.writeFileSync('src/components/forms/ImportTimetableModal.tsx', code);
