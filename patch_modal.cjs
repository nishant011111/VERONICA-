const fs = require('fs');
let code = fs.readFileSync('src/components/forms/ImportTimetableModal.tsx', 'utf8');

code = code.replace(
  '<Modal isOpen={isOpen} onClose={handleClose} title="Import Timetable" size="4xl">',
  '<Modal isOpen={isOpen} onClose={handleClose} title="Import Timetable" maxWidth="2xl">'
);

fs.writeFileSync('src/components/forms/ImportTimetableModal.tsx', code);
