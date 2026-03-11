const fs = require('fs');
let content = fs.readFileSync('../src/app/components/home/SoloSwimmerHome.tsx', 'utf8');
content = content.replace(/text-teal-100/g, 'text-indigo-100');
fs.writeFileSync('../src/app/components/home/SoloSwimmerHome.tsx', content, 'utf8');