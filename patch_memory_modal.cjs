const fs = require('fs');
let code = fs.readFileSync('src/components/ai/MemoryModal.tsx', 'utf8');

const target = `  // Mock local state, ideally would be in AppContext
  const [memories, setMemories] = useState<{id: string, content: string, createdAt: string}[]>([
    { id: '1', content: 'User is studying Computer Science.', createdAt: new Date().toISOString() },
    { id: '2', content: 'Prefers explanations in simple terms.', createdAt: new Date().toISOString() }
  ]);`;

const replacement = `  const { authUser, settings } = useApp();
  const userId = authUser?.uid || 'local_user';
  const [memories, setMemories] = useState<any[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      import('../../services/ai/MemoryService').then(({ MemoryService }) => {
        setMemories(MemoryService.getMemories(userId));
      });
    }
  }, [isOpen, userId]);

  const saveToService = async (newMemories: any[]) => {
    setMemories(newMemories);
    const { MemoryService } = await import('../../services/ai/MemoryService');
    MemoryService.saveMemories(userId, newMemories);
    
    // Attempt to update vectorDB but we don't strictly need to wait for it here
    const { vectorDB } = await import('../../services/ai/VectorDatabase');
    // Basic sync logic could be placed here if needed
  };
`;

code = code.replace(target, replacement);

const handleAddTarget = `  const handleAdd = () => {
    if (!newMemory.trim()) return;
    setMemories([{ id: crypto.randomUUID(), content: newMemory, createdAt: new Date().toISOString() }, ...memories]);
    setNewMemory('');
  };

  const handleDelete = (id: string) => {
    setMemories(memories.filter(m => m.id !== id));
  };

  const handleClear = () => {
    if(confirm('Are you sure you want to clear all AI memories?')) {
      setMemories([]);
    }
  };`;

const handleAddReplacement = `  const handleAdd = () => {
    if (!newMemory.trim()) return;
    const newM = { id: crypto.randomUUID(), userId, content: newMemory, category: 'fact', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    saveToService([newM, ...memories]);
    setNewMemory('');
  };

  const handleDelete = (id: string) => {
    saveToService(memories.filter(m => m.id !== id));
    import('../../services/ai/VectorDatabase').then(({ vectorDB }) => vectorDB.delete(id));
  };

  const handleClear = () => {
    if(confirm('Are you sure you want to clear all AI memories?')) {
      saveToService([]);
    }
  };`;

code = code.replace(handleAddTarget, handleAddReplacement);

fs.writeFileSync('src/components/ai/MemoryModal.tsx', code);
