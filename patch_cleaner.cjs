const fs = require('fs');
let code = fs.readFileSync('src/services/ai/mathCleaner.ts', 'utf8');

// Preserve headings and lists instead of removing them completely
code = code.replace(
  "speech = speech.replace(/^#{1,6}\\s+/gm, '');",
  "// Preserve headings by just stripping the hash\n  speech = speech.replace(/^#{1,6}\\s+/gm, '');"
);

code = code.replace(
  "speech = speech.replace(/^[-*+]\\s+/gm, '');",
  "// Preserve bullet points for TTS\n  // Convert them to something spoken or just remove the symbol but keep the structure\n  // Actually, Elevenlabs handles commas or pauses well. Let's just strip the symbol.\n  speech = speech.replace(/^[-*+]\\s+/gm, '');" // Wait, Elevenlabs handles '-' just fine. Let's keep it.
);
code = code.replace(
  "speech = speech.replace(/^\\d+\\.\\s+/gm, '');",
  "// Preserve numbered lists\n  // speech = speech.replace(/^\\d+\\.\\s+/gm, '');"
);

// We need to NOT strip all newlines into dots. We want to preserve paragraphs.
code = code.replace(
  "speech = speech.replace(/\\n+/g, '. ');",
  "// Keep paragraph breaks, just replace single newlines with spaces, and double newlines with double newlines\n  speech = speech.replace(/\\n\\n+/g, ' \\n\\n ');\n  speech = speech.replace(/(?<!\\n)\\n(?!\\n)/g, ' ');"
);

fs.writeFileSync('src/services/ai/mathCleaner.ts', code);
