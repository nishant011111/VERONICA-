const fs = require('fs');
let code = fs.readFileSync('src/components/screens/VaultScreen.tsx', 'utf8');

if (!code.includes('import { ConfirmationModal }')) {
  code = code.replace("import { EmptyState }", "import { EmptyState } from '../ui/EmptyState';\nimport { ConfirmationModal }");
}

const stateTarget = "const [duplicateFileNotice, setDuplicateFileNotice]";
const newState = `const [duplicateFileNotice, setDuplicateFileNotice] = useState<{fileObj: any, fileName: string} | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);`;
if(!code.includes('const [confirmDelete, setConfirmDelete]')) {
  code = code.replace("const [duplicateFileNotice, setDuplicateFileNotice] = useState<{fileObj: any, fileName: string} | null>(null);", newState);
}

const handleTarget = "const handleDeleteWithConfirmation = (file: VaultFile) => {";
const newHandle = `const handleDeleteWithConfirmation = (file: VaultFile) => {
    setConfirmDelete(file);
  };
  
  const executeDelete = () => {
    if (confirmDelete) {
      deleteVaultFile(confirmDelete.id);
      setConfirmDelete(null);
    }
  };
  
  const oldDelete = (f: any) => {`;
if(!code.includes('const executeDelete = () => {')) {
  code = code.replace(handleTarget, newHandle);
}

const renderTarget = "{showAddModal && (";
const newRender = `<ConfirmationModal
        isOpen={!!confirmDelete}
        title="Delete File"
        message={
          <>
            Are you sure you want to delete <span className="font-bold text-slate-700 dark:text-slate-200">"{confirmDelete?.name}"</span>? 
            This action cannot be undone.
          </>
        }
        confirmText="Delete"
        onConfirm={executeDelete}
        onCancel={() => setConfirmDelete(null)}
      />
      {showAddModal && (`;
if(!code.includes('isOpen={!!confirmDelete}')) {
  code = code.replace(renderTarget, newRender);
}

fs.writeFileSync('src/components/screens/VaultScreen.tsx', code);
console.log('patched vault modal');
