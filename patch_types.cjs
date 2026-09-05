const fs = require('fs');
let types = fs.readFileSync('src/types/index.ts', 'utf8');

const newTypes = `
export type AutomationTrigger = 'time' | 'event' | 'schedule';
export type AutomationAction = 'notify' | 'organize' | 'summarize' | 'create_task';

export interface Automation {
  id: string;
  name: string;
  trigger: AutomationTrigger;
  triggerConfig: any;
  action: AutomationAction;
  actionConfig: any;
  status: 'active' | 'paused';
  createdAt: string;
  lastRun?: string;
}

export interface ActivityEvent {
  id: string;
  type: 'create' | 'update' | 'delete' | 'system' | 'automation';
  title: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

export interface Integration {
  id: string;
  provider: 'google_drive' | 'google_calendar' | 'github';
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  accountEmail?: string;
}
`;
types = types + newTypes;
fs.writeFileSync('src/types/index.ts', types);
console.log('patched types');
