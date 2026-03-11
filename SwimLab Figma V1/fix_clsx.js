const fs = require('fs');
let file = '../src/app/components/dashboard/StatCard.tsx';
let data = fs.readFileSync(file, 'utf8');
data = data.replace(/clsx\(/g, 'cn(');
fs.writeFileSync(file, data, 'utf8');