const fs = require('fs');
let code = fs.readFileSync('src/components/screens/AskVeronicaScreen.tsx', 'utf8');

const t = `      )}
    </div>
  );
};`;
const r = `      )}
    </div>
    </>
  );
};`;
if (code.includes(t)) {
    code = code.replace(t, r);
    fs.writeFileSync('src/components/screens/AskVeronicaScreen.tsx', code);
    console.log("fixed fragment!");
}
