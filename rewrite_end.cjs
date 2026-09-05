const fs = require('fs');
let code = fs.readFileSync('src/components/screens/AskVeronicaScreen.tsx', 'utf8');

const strToReplace = `                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">📚 {subj.name}</span>                            );};`;
const idx = code.indexOf(`<span className="text-emerald-600 dark:text-emerald-400 font-medium">📚 {subj.name}</span>`);
if (idx > -1) {
  code = code.substring(0, idx) + `<span className="text-emerald-600 dark:text-emerald-400 font-medium">📚 {subj.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {isAttached && (
                    <div className="shrink-0 p-1 bg-indigo-100 dark:bg-indigo-900/50 rounded-full text-indigo-600">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};
`;
  fs.writeFileSync('src/components/screens/AskVeronicaScreen.tsx', code);
  console.log("Rewrote end completely");
} else {
  console.log("Could not find anchor");
}
