const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf-8');

// 1. Add to interface
const iTarget = `  tasks: Task[];`;
const iInsert = `  notifications: AppNotification[];
  addNotification: (n: Omit<AppNotification, 'id' | 'userId' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  tasks: Task[];`;
content = content.replace(iTarget, iInsert);

// 2. Add state
const sTarget = `  const [tasks, setTasks] = useState<Task[]>(() => StorageService.getTasks());`;
const sInsert = `  const [notifications, setNotifications] = useState<AppNotification[]>(() => StorageService.getNotifications());
  const [tasks, setTasks] = useState<Task[]>(() => StorageService.getTasks());`;
content = content.replace(sTarget, sInsert);

// 3. Add methods
const mTarget = `  const addTask = (task: Omit<Task, 'id' | 'userId' | 'createdAt'>) => {`;
const mInsert = `  const addNotification = (n: Omit<AppNotification, 'id' | 'userId' | 'createdAt'>) => {
    const newN: AppNotification = {
      ...n,
      id: generateId(),
      userId: authUser?.uid || 'local-user',
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => {
      const next = [newN, ...prev];
      StorageService.saveNotifications(next);
      return next;
    });
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => {
      const next = prev.map(n => n.id === id ? { ...n, isRead: true } : n);
      StorageService.saveNotifications(next);
      return next;
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => {
      const next = prev.filter(n => n.id !== id);
      StorageService.saveNotifications(next);
      return next;
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    StorageService.saveNotifications([]);
  };

  const addTask = (task: Omit<Task, 'id' | 'userId' | 'createdAt'>) => {`;
content = content.replace(mTarget, mInsert);

// 4. Return in context value
const vTarget = `    tasks,
    addTask,`;
const vInsert = `    notifications,
    addNotification,
    markNotificationRead,
    deleteNotification,
    clearAllNotifications,
    tasks,
    addTask,`;
content = content.replace(vTarget, vInsert);

// 5. Add to imports
const impTarget = `Goal,`;
const impInsert = `Goal, AppNotification,`;
content = content.replace(impTarget, impInsert);

fs.writeFileSync('src/context/AppContext.tsx', content);
console.log("Patched AppContext.tsx");
