const fs = require('fs');
const files = [
  '../src/app/components/home/SoloSwimmerHome.tsx',
  '../src/app/components/home/SwimmerHome.tsx',
  '../src/app/components/workout/WorkoutBuilder.tsx'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;
  content = content.replace(/teal-/g, 'indigo-');
  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
  }
});