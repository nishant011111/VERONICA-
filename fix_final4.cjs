const fs = require('fs');
let code = fs.readFileSync('src/components/screens/AskVeronicaScreen.tsx', 'utf8');

const t = `          }}
        />
      )}
    </div>
    );

// Helper Item Component`;

const r = `          }}
        />
      )}
    </div>
    </>
  );
};

// Helper Item Component`;

code = code.replace(t, r);
fs.writeFileSync('src/components/screens/AskVeronicaScreen.tsx', code);
