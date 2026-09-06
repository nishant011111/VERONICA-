const fs = require('fs');
let code = fs.readFileSync('src/components/screens/TimetableScreen.tsx', 'utf8');

// Add import for ImportTimetableModal
if (!code.includes('ImportTimetableModal')) {
  code = code.replace(
    "import { EditSubjectModal } from '../forms/EditSubjectModal';", 
    "import { EditSubjectModal } from '../forms/EditSubjectModal';\nimport { ImportTimetableModal } from '../forms/ImportTimetableModal';\nimport { ImageIcon } from 'lucide-react';"
  );
}

// Add state for Import Modal
if (!code.includes('isImportModalOpen')) {
  code = code.replace(
    "const [editingSubject, setEditingSubject] = useState<Subject | null>(null);",
    "const [editingSubject, setEditingSubject] = useState<Subject | null>(null);\n  const [isImportModalOpen, setIsImportModalOpen] = useState(false);"
  );
}

// Add "Import Timetable" button next to "Add Class"
if (!code.includes('setIsImportModalOpen(true)')) {
  code = code.replace(
    "<Button\n          variant=\"primary\"\n          onClick={() => onOpenTimetableModal(null, selectedDay)}\n          icon={<Plus className=\"w-4 h-4\" />}\n        >\n          Add Class\n        </Button>",
    `<div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => setIsImportModalOpen(true)}
            icon={<ImageIcon className="w-4 h-4 text-blue-500" />}
            className="text-xs font-bold"
          >
            Import
          </Button>
          <Button
            variant="primary"
            onClick={() => onOpenTimetableModal(null, selectedDay)}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Class
          </Button>
        </div>`
  );
}

// Render ImportTimetableModal
if (!code.includes('<ImportTimetableModal')) {
  code = code.replace(
    "</EditSubjectModal>",
    "</EditSubjectModal>\n      <ImportTimetableModal\n        isOpen={isImportModalOpen}\n        onClose={() => setIsImportModalOpen(false)}\n      />"
  );
  // Just in case it's <EditSubjectModal /> self-closing
  code = code.replace(
    "subject={editingSubject}\n      />",
    "subject={editingSubject}\n      />\n      <ImportTimetableModal\n        isOpen={isImportModalOpen}\n        onClose={() => setIsImportModalOpen(false)}\n      />"
  );
}

fs.writeFileSync('src/components/screens/TimetableScreen.tsx', code);
