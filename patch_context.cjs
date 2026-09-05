const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// Change default user to null so we don't automatically log them in
code = code.replace(
  "const [authUser, setAuthUser] = useState<User | null>(defaultStudentUser);",
  "const [authUser, setAuthUser] = useState<User | null>(null);" // Ensure they are prompted to login initially
);

code = code.replace(
  "setAuthUser(user || defaultStudentUser);",
  "setAuthUser(user);"
);

// We should set authLoading to true initially
code = code.replace(
  "const [authLoading, setAuthLoading] = useState<boolean>(false);",
  "const [authLoading, setAuthLoading] = useState<boolean>(true);"
);

fs.writeFileSync('src/context/AppContext.tsx', code);
