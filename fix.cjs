const fs = require('fs');
let code = fs.readFileSync('src/components/screens/AskVeronicaScreen.tsx', 'utf8');

code = code.replace(
`    return (
    <>
      <MemoryModal isOpen={showMemoryModal} onClose={() => setShowMemoryModal(false)} />) => {
      stopSpeaking();
    };
  }, []);`,
`    return () => {
      stopSpeaking();
    };
  }, []);`
);

const target = `  return (
    <div className="max-w-7xl mx-auto space-y-4 pb-20 md:pb-6">
      {/* Header Bar */}`;
const fixTarget = `  return (
    <>
      <MemoryModal isOpen={showMemoryModal} onClose={() => setShowMemoryModal(false)} />
    <div className="max-w-7xl mx-auto space-y-4 pb-20 md:pb-6">
      {/* Header Bar */}`;
code = code.replace(target, fixTarget);
// and close the fragment at the end
code = code.replace("    </div>\n  );\n};", "    </div>\n    </>\n  );\n};");
// wait, the initial script did replace the end correctly but it messed up the first `return (` it found.
// let's just make sure we don't have double `</>` at the end.
if(code.split('</>').length > 2) {
  code = code.substring(0, code.lastIndexOf('</>'));
  code = code + "\n  );\n};";
}

fs.writeFileSync('src/components/screens/AskVeronicaScreen.tsx', code);
