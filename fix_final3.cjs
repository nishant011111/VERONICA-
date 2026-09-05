const fs = require('fs');
let code = fs.readFileSync('src/components/screens/AskVeronicaScreen.tsx', 'utf8');

const t = `      )}
    </div>
    </>
  );
};

// Helper Item Component`;

if (!code.includes(t)) {
   // Maybe I added </> to every single </div>? Yes, I did `sed -i 's/    <\/div>/    <\/div>\n    <\/>/g'` !
   // Oh no! That replaced ALL 100 </div> tags with </> !!
}
