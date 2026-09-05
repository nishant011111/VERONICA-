const fs = require('fs');
let code = fs.readFileSync('src/components/screens/AskVeronicaScreen.tsx', 'utf8');

const t = `                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">📚 {subj.name}</span>
                            );};`;
const r = `                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">📚 {subj.name}</span>
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

code = code.replace(t, r);
fs.writeFileSync('src/components/screens/AskVeronicaScreen.tsx', code);
