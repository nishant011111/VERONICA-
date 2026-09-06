const fs = require('fs');
let code = fs.readFileSync('src/services/ai/providers/OpenAIProvider.ts', 'utf8');

code = code.replace(
  "\\${referenceSolution ? `Reference Solution: \\${referenceSolution}` : ''}",
  "${referenceSolution ? `Reference Solution: ${referenceSolution}` : ''}"
);
code = code.replace(
  "Question: \\${question}",
  "Question: ${question}"
);
code = code.replace(
  "Student's Answer: \\${userAnswer}",
  "Student's Answer: ${userAnswer}"
);
code = code.replace(
  "Topic: \\${params.topic}",
  "Topic: ${params.topic}"
);
code = code.replace(
  "Difficulty: \\${params.difficulty}",
  "Difficulty: ${params.difficulty}"
);
code = code.replace(
  "Question Type: \\${params.type}",
  "Question Type: ${params.type}"
);
code = code.replace(
  /\\\$\{(.*?)\}/g,
  "${$1}"
);


fs.writeFileSync('src/services/ai/providers/OpenAIProvider.ts', code);
