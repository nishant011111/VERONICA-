const fs = require('fs');
let code = fs.readFileSync('src/components/screens/AskVeronicaScreen.tsx', 'utf8');

// The very end should just be `  );\n};` for VaultPickerModalProps (or whatever component it is, it's `VaultPickerModal`!).
// The `</>` at the very end needs to be removed.
code = code.replace("    </div>\n    </>\n  );\n};", "    </div>\n  );\n};");

fs.writeFileSync('src/components/screens/AskVeronicaScreen.tsx', code);
console.log("Fixed the extra </> at the very end.");
