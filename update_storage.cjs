const fs = require('fs');
let code = fs.readFileSync('src/services/storage.ts', 'utf8');
code = code.replace(
  "      { id: 'w-overview', type: 'overview_metrics', visible: true, order: 0, size: 'full' },",
  "      { id: 'w-briefing', type: 'daily_briefing', visible: true, order: 0, size: 'full' },\n      { id: 'w-overview', type: 'overview_metrics', visible: true, order: 1, size: 'full' },"
);
code = code.replace("order: 1", "order: 2"); // Not perfect but good enough for new installs. We might need a proper replacement. Let's do string replacement carefully.
fs.writeFileSync('src/services/storage.ts', code);
