const fs = require('fs');

function fixColors(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');
  let original = content;

  content = content.replace(/bg-teal-50\b/g, 'bg-indigo-50');
  content = content.replace(/bg-teal-50\//g, 'bg-indigo-50/');
  content = content.replace(/bg-teal-100\b/g, 'bg-indigo-100');
  content = content.replace(/bg-teal-100\//g, 'bg-indigo-100/');
  content = content.replace(/bg-teal-200\b/g, 'bg-indigo-200');
  content = content.replace(/bg-teal-200\//g, 'bg-indigo-200/');
  content = content.replace(/bg-teal-300\b/g, 'bg-indigo-300');
  content = content.replace(/bg-teal-300\//g, 'bg-indigo-300/');
  content = content.replace(/bg-teal-400\b/g, 'bg-indigo-400');
  content = content.replace(/bg-teal-400\//g, 'bg-indigo-400/');
  content = content.replace(/bg-teal-500\b/g, 'bg-indigo-500');
  content = content.replace(/bg-teal-500\//g, 'bg-indigo-500/');
  content = content.replace(/bg-teal-600\b/g, 'bg-indigo-600');
  content = content.replace(/bg-teal-600\//g, 'bg-indigo-600/');
  content = content.replace(/bg-teal-700\b/g, 'bg-indigo-700');
  content = content.replace(/bg-teal-700\//g, 'bg-indigo-700/');
  content = content.replace(/bg-teal-800\b/g, 'bg-indigo-800');
  content = content.replace(/bg-teal-900\b/g, 'bg-indigo-900');
  
  content = content.replace(/text-teal-50\b/g, 'text-indigo-50');
  content = content.replace(/text-teal-100\b/g, 'text-indigo-100');
  content = content.replace(/text-teal-200\b/g, 'text-indigo-200');
  content = content.replace(/text-teal-300\b/g, 'text-indigo-300');
  content = content.replace(/text-teal-400\b/g, 'text-indigo-400');
  content = content.replace(/text-teal-500\b/g, 'text-indigo-500');
  content = content.replace(/text-teal-600\b/g, 'text-indigo-600');
  content = content.replace(/text-teal-700\b/g, 'text-indigo-700');
  content = content.replace(/text-teal-800\b/g, 'text-indigo-800');
  content = content.replace(/text-teal-900\b/g, 'text-indigo-900');
  
  content = content.replace(/border-teal-50\b/g, 'border-indigo-50');
  content = content.replace(/border-teal-100\b/g, 'border-indigo-100');
  content = content.replace(/border-teal-100\//g, 'border-indigo-100/');
  content = content.replace(/border-teal-200\b/g, 'border-indigo-200');
  content = content.replace(/border-teal-200\//g, 'border-indigo-200/');
  content = content.replace(/border-teal-300\b/g, 'border-indigo-300');
  content = content.replace(/border-teal-400\b/g, 'border-indigo-400');
  content = content.replace(/border-teal-400\//g, 'border-indigo-400/');
  content = content.replace(/border-teal-500\b/g, 'border-indigo-500');
  content = content.replace(/border-t-teal-500\b/g, 'border-t-indigo-500');
  
  content = content.replace(/shadow-teal-100\b/g, 'shadow-indigo-100');
  content = content.replace(/shadow-teal-400\//g, 'shadow-indigo-400/');
  content = content.replace(/shadow-teal-500\//g, 'shadow-indigo-500/');
  content = content.replace(/shadow-teal-900\//g, 'shadow-indigo-900/');
  
  content = content.replace(/from-teal-500\b/g, 'from-indigo-500');
  content = content.replace(/from-teal-500\//g, 'from-indigo-500/');
  content = content.replace(/from-teal-400\//g, 'from-indigo-400/');
  content = content.replace(/from-teal-50\//g, 'from-indigo-50/');
  
  content = content.replace(/accent-teal-600\b/g, 'accent-indigo-600');
  
  content = content.replace(/hover:border-teal-300\b/g, 'hover:border-indigo-300');
  content = content.replace(/hover:bg-teal-200\b/g, 'hover:bg-indigo-200');

  content = content.replace(/to-emerald-500/g, 'to-blue-500');
  content = content.replace(/to-emerald-600/g, 'to-blue-600');
  
  if (content !== original) {
    fs.writeFileSync(filepath, content, 'utf8');
  }
}

['../src/app/components/workout/WorkoutBuilder.tsx',
 '../src/app/components/home/SoloSwimmerHome.tsx',
 '../src/app/components/home/SwimmerHome.tsx',
 '../src/app/components/groups/GroupsManager.tsx'
].forEach(f => {
  if(fs.existsSync(f)) {
    fixColors(f);
  }
});