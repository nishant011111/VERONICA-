const fs = require('fs');
let code = fs.readFileSync('src/components/screens/AskVeronicaScreen.tsx', 'utf8');

code = code.replace(
  `{filteredFiles.length > 0 ? (
            filteredFiles.map((f) => {`,
  `{filteredFiles.length > 0 ? (
            filteredFiles.map((f) => {`
); // Let's just fix the end of the file.

const t = `              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};`;

const r = `              );
            })
          ) : (
            <div className="text-center py-12 text-slate-500">
              <p>No files found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};`;

code = code.replace(t, r);
fs.writeFileSync('src/components/screens/AskVeronicaScreen.tsx', code);
console.log("fixed empty state branch!");
