const fs = require('fs');
let file = '../src/app/components/groups/GroupsManager.tsx';
let data = fs.readFileSync(file, 'utf8');
data = data.replace(/from-cyan-500 to-blue-500/g, 'from-blue-400 to-indigo-500');
data = data.replace(/from-emerald-500 to-indigo-600/g, 'from-slate-400 to-indigo-600');
data = data.replace(/bg-emerald-100 text-emerald-700 border-emerald-200/g, 'bg-slate-100 text-slate-700 border-slate-200');
fs.writeFileSync(file, data, 'utf8');