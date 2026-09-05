const fs = require('fs');
let content = fs.readFileSync('src/components/screens/SettingsScreen.tsx', 'utf-8');

content = content.replace("import { Palette,  useApp } from '../../context/AppContext';", "import { useApp } from '../../context/AppContext';");
content = content.replace("import {", "import { Palette, "); // wait, no
// Let's just find the lucide-react import
content = content.replace("import { Sun, Moon, Laptop, Shield, Cloud, Save, Download, Upload, LogOut, Loader2, Key, Database, RefreshCw, Smartphone, Monitor } from 'lucide-react';", "import { Palette, Sun, Moon, Laptop, Shield, Cloud, Save, Download, Upload, LogOut, Loader2, Key, Database, RefreshCw, Smartphone, Monitor } from 'lucide-react';");

fs.writeFileSync('src/components/screens/SettingsScreen.tsx', content);
