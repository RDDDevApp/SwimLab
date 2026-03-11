const fs = require('fs');
let c = fs.readFileSync('../src/app/components/home/SoloSwimmerHome.tsx', 'utf8');

c = c.replace(/from-teal-500/g, 'from-indigo-500');
c = c.replace(/via-emerald-500/g, 'via-blue-500');
c = c.replace(/to-teal-600/g, 'to-indigo-600');
c = c.replace(/shadow-teal-900\/20/g, 'shadow-indigo-900/20');
c = c.replace(/text-teal-50\b/g, 'text-indigo-50');
c = c.replace(/text-teal-100/g, 'text-indigo-100');
c = c.replace(/text-teal-700/g, 'text-indigo-700');
c = c.replace(/bg-teal-700\/40/g, 'bg-indigo-700/40');
c = c.replace(/hover:bg-teal-700\/60/g, 'hover:bg-indigo-700/60');
c = c.replace(/text-teal-600/g, 'text-indigo-600');
c = c.replace(/bg-teal-500/g, 'bg-indigo-500');

fs.writeFileSync('../src/app/components/home/SoloSwimmerHome.tsx', c, 'utf8');