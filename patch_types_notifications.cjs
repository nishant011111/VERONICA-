const fs = require('fs');
let content = fs.readFileSync('src/types/index.ts', 'utf-8');

const notifType = `export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'task' | 'deadline' | 'reminder' | 'sync' | 'security' | 'system';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}`;

content = content + "\n\n" + notifType;

fs.writeFileSync('src/types/index.ts', content);
