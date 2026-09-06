const fs = require('fs');
let code = fs.readFileSync('src/services/storage.ts', 'utf8');

if (!code.includes('timetableReminders:')) {
  code = code.replace(
    "studyReminders: true,",
    "studyReminders: true,\n    timetableReminders: true,\n    timetableReminderMinutes: 15,"
  );
  fs.writeFileSync('src/services/storage.ts', code);
}
