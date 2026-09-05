const fs = require('fs');
let content = fs.readFileSync('src/services/storage.ts', 'utf-8');

const target1 = `  static getTasks(): Task[] {`;
const insert1 = `  static getNotifications(): AppNotification[] {
    return this.getItem<AppNotification[]>('veronica_notifications', []);
  }
  static saveNotifications(notifications: AppNotification[]): void {
    this.setItem('veronica_notifications', notifications);
  }

  static getTasks(): Task[] {`;
  
content = content.replace(target1, insert1);

// import AppNotification
const importTarget = `Goal,`;
const importInsert = `Goal, AppNotification,`;
content = content.replace(importTarget, importInsert);

fs.writeFileSync('src/services/storage.ts', content);
console.log("Patched storage.ts");
