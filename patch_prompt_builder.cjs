const fs = require('fs');
let code = fs.readFileSync('src/services/ai/promptBuilder.ts', 'utf8');

if (!code.includes('c.timetableStr')) {
  code = code.replace(
    "${c.assignmentTitle ? `- Assignment [${c.assignmentTitle}]: ${c.assignmentDescription || ''}` : ''}",
    "${c.assignmentTitle ? `- Assignment [\${c.assignmentTitle}]: \${c.assignmentDescription || ''}` : ''}\n${c.timetableStr ? `- User Timetable Data:\\n\${c.timetableStr}` : ''}"
  );
  fs.writeFileSync('src/services/ai/promptBuilder.ts', code);
}
