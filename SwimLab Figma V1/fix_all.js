const fs = require('fs');
const files = [
  '../src/app/components/workout/WorkoutBuilder.tsx',
  '../src/app/components/home/SoloSwimmerHome.tsx',
  '../src/app/components/home/SwimmerHome.tsx',
  '../src/app/components/groups/GroupsManager.tsx'
];

files.forEach(f => {
  if(fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/teal-/g, 'indigo-');
    content = content.replace(/to-emerald-500/g, 'to-blue-500');
    content = content.replace(/to-emerald-600/g, 'to-blue-600');
    fs.writeFileSync(f, content, 'utf8');
  }
});