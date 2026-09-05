const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes("import { LoginScreen }")) {
  code = code.replace(
    "import { OnboardingModal } from './components/OnboardingModal';",
    "import { OnboardingModal } from './components/OnboardingModal';\nimport { LoginScreen } from './components/auth/LoginScreen';"
  );
}

const oldRoot = `const RootAppContent: React.FC = () => {
  const { authUser, authLoading } = useApp();

  return <MainAppContent />;
};`;

const newRoot = `const RootAppContent: React.FC = () => {
  const { authUser, authLoading } = useApp();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-indigo-500 rounded-full mb-4"></div>
          <p className="text-slate-400 font-medium">Loading Workspace...</p>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return <LoginScreen />;
  }

  return <MainAppContent />;
};`;

code = code.replace(oldRoot, newRoot);
fs.writeFileSync('src/App.tsx', code);
