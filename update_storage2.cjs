const fs = require('fs');
let code = fs.readFileSync('src/services/storage.ts', 'utf8');

const oldWidgets = `  dashboard: {
    widgets: [
      { id: 'w-briefing', type: 'daily_briefing', visible: true, order: 0, size: 'full' },
      { id: 'w-overview', type: 'overview_metrics', visible: true, order: 2, size: 'full' },
      { id: 'w-schedule', type: 'schedule', visible: true, order: 1, size: 'large' },
      { id: 'w-quick', type: 'quick_access', visible: true, order: 2, size: 'large' },
      { id: 'w-subjects', type: 'subjects', visible: true, order: 3, size: 'full' },
    ]
  },`;

const newWidgets = `  dashboard: {
    widgets: [
      { id: 'w-briefing', type: 'daily_briefing', visible: true, order: 0, size: 'full' },
      { id: 'w-overview', type: 'overview_metrics', visible: true, order: 1, size: 'full' },
      { id: 'w-schedule', type: 'schedule', visible: true, order: 2, size: 'large' },
      { id: 'w-quick', type: 'quick_access', visible: true, order: 3, size: 'large' },
      { id: 'w-subjects', type: 'subjects', visible: true, order: 4, size: 'full' },
    ]
  },`;
code = code.replace(oldWidgets, newWidgets);
fs.writeFileSync('src/services/storage.ts', code);
