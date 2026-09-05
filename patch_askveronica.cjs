const fs = require('fs');
let code = fs.readFileSync('src/components/screens/AskVeronicaScreen.tsx', 'utf8');

const importTarget = "import { ConversationService } from '../../services/ai/conversationService';";
code = code.replace(importTarget, importTarget + "\nimport { ContextEngine } from '../../services/ai/ContextEngine';");

// Update resolveContextData
const resolveTarget = `  const resolveContextData = () => {
    const selectedSubject = subjects.find(s => s.id === attachedContext.subjectId);
    const selectedNote = notes.find(n => n.id === attachedContext.noteId);
    const selectedPdf = vaultFiles.find(v => v.id === attachedContext.vaultFileId);
    const selectedAssign = assignments.find(a => a.id === attachedContext.assignmentId);

    return {
      subjectName: selectedSubject?.name,
      subjectCode: selectedSubject?.code,
      noteTitle: selectedNote?.title,
      noteContent: selectedNote?.content,
      pdfName: selectedPdf?.name,
      pdfContent: selectedPdf ? (selectedPdf.fileData || \`Attached Vault File: \${selectedPdf.name} (\${selectedPdf.type || 'document'})\`) : undefined,
      assignmentTitle: selectedAssign?.title,
      assignmentDescription: selectedAssign?.description
    };
  };`;

const resolveReplacement = `  const resolveContextData = () => {
    const selectedSubject = subjects.find(s => s.id === attachedContext.subjectId);
    const selectedNote = notes.find(n => n.id === attachedContext.noteId);
    const selectedPdf = vaultFiles.find(v => v.id === attachedContext.vaultFileId);
    const selectedAssign = assignments.find(a => a.id === attachedContext.assignmentId);

    // Context Engine 10.1 & 10.2: Provide general state
    const systemContext = ContextEngine.buildContext({
      userId: profile.id,
      exams,
      tasks,
      studySessions: [],
      subjects,
      settings
    }, vaultFiles, goals);

    return {
      subjectName: selectedSubject?.name,
      subjectCode: selectedSubject?.code,
      noteTitle: selectedNote?.title,
      noteContent: selectedNote?.content,
      pdfName: selectedPdf?.name,
      pdfContent: selectedPdf ? (selectedPdf.fileData || \`Attached Vault File: \${selectedPdf.name} (\${selectedPdf.type || 'document'})\`) : undefined,
      assignmentTitle: selectedAssign?.title,
      assignmentDescription: selectedAssign?.description,
      systemContext: ContextEngine.formatContextForPrompt(systemContext)
    };
  };`;
code = code.replace(resolveTarget, resolveReplacement);

fs.writeFileSync('src/components/screens/AskVeronicaScreen.tsx', code);
console.log("Updated AskVeronicaScreen.tsx");
