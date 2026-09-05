const fs = require('fs');
let header = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');
header = header.replace(
  "settings: { title: 'Settings', desc: 'App configuration & data controls' },",
  "settings: { title: 'Settings', desc: 'App configuration & data controls' },\n    automations: { title: 'Automations', desc: 'Smart workflows & rules' },\n    timeline: { title: 'Activity Timeline', desc: 'Recent events & changes' },\n    integrations: { title: 'Integrations', desc: 'Connected accounts & services' },"
);
fs.writeFileSync('src/components/layout/Header.tsx', header);
console.log('patched header');
