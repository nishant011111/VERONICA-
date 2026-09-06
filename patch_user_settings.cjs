const fs = require('fs');
let code = fs.readFileSync('src/types/index.ts', 'utf8');

if (!code.includes('timetableReminders: boolean;')) {
  code = code.replace(
    "attendanceAlerts: boolean;",
    "attendanceAlerts: boolean;\n    timetableReminders: boolean;\n    timetableReminderMinutes: number;"
  );
  fs.writeFileSync('src/types/index.ts', code);
}
