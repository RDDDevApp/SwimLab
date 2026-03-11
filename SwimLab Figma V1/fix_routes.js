const fs = require('fs');
let file = '../src/app/components/home/SwimmerHome.tsx';
let data = fs.readFileSync(file, 'utf8');
data = data.replace(/\/planning-nageur/g, '/swimmer-planning');
data = data.replace(/\/profil-nageur/g, '/swimmer-profile');
fs.writeFileSync(file, data, 'utf8');