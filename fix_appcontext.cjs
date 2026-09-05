const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// Insert interface fields
const typeInsert = `  automations: Automation[];
  setAutomations: React.Dispatch<React.SetStateAction<Automation[]>>;
  integrations: Integration[];
  updateIntegration: (id: string, partial: Partial<Integration>) => void;
  activityTimeline: ActivityEvent[];
  addActivityEvent: (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => void;
`;
code = code.replace('  chatMessages: ChatMessage[];', '  chatMessages: ChatMessage[];\n' + typeInsert);

// Insert states
const stateInsert = `  const [automations, setAutomations] = useState<Automation[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([
    { id: 'gdrive', name: 'Google Drive', icon: 'drive', description: 'Sync files and backups', status: 'connected' },
    { id: 'calendar', name: 'Google Calendar', icon: 'calendar', description: 'Sync timetable and events', status: 'available' },
    { id: 'github', name: 'GitHub', icon: 'github', description: 'Sync coding assignments', status: 'available' }
  ]);
  const [activityTimeline, setActivityTimeline] = useState<ActivityEvent[]>([]);

  const updateIntegration = (id: string, partial: Partial<Integration>) => {
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, ...partial } : i));
  };

  const addActivityEvent = (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
    const newEvent: ActivityEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };
    setActivityTimeline(prev => [newEvent, ...prev]);
  };
`;
code = code.replace('  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => StorageService.getChatMessages());', '  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => StorageService.getChatMessages());\n' + stateInsert);

// Insert exports
const exportInsert = `        automations,
        setAutomations,
        integrations,
        updateIntegration,
        activityTimeline,
        addActivityEvent,
`;
code = code.replace('        chatMessages,', '        chatMessages,\n' + exportInsert);

fs.writeFileSync('src/context/AppContext.tsx', code);
console.log("updated AppContext.tsx!");
