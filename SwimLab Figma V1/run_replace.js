const fs = require('fs');
let file = '../src/app/components/home/SoloSwimmerHome.tsx';
let data = fs.readFileSync(file, 'utf8');
data = data.replace('text-teal-100 uppercase font-bold mb-1">Calories</p>', 'text-indigo-100 uppercase font-bold mb-1">Calories</p>');
fs.writeFileSync(file, data, 'utf8');