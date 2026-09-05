const fs = require('fs');
let code = fs.readFileSync('src/components/screens/AskVeronicaScreen.tsx', 'utf8');

const regex = /<\/div>\s*\);\s*\/\/ Helper Item Component/g;

code = code.replace(regex, `</div>
    </>
  );
};

// Helper Item Component`);

fs.writeFileSync('src/components/screens/AskVeronicaScreen.tsx', code);
console.log("fixed missing }; and </> with regex");
