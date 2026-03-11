const fs = require('fs');
let file = '../src/app/components/auth/AuthPage.tsx';
let data = fs.readFileSync(file, 'utf8');
data = data.replace(/<img\s+src=\{bgImage\}\s+alt="Water"\s+className="w-full h-full object-cover opacity-20 scale-105 blur-2xl"\s+\/>/, '');
fs.writeFileSync(file, data, 'utf8');