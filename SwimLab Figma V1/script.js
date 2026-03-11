const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    let filepath = path.join(dir, file);
    let stats = fs.statSync(filepath);
    if (stats.isDirectory()) {
      walk(filepath, callback);
    } else if (stats.isFile() && filepath.endsWith('.tsx')) {
      callback(filepath);
    }
  });
}

walk('../src/app/components', (filepath) => {
  let content = fs.readFileSync(filepath, 'utf8');
  let original = content;

  // Mass replacements for common colors and styling
  content = content.replace(/selection:bg-cyan-500/g, 'selection:bg-indigo-500');
  content = content.replace(/bg-blue-50 font-sans/g, 'bg-slate-50 font-sans');
  content = content.replace(/bg-cyan-50 font-sans/g, 'bg-slate-50 font-sans');
  content = content.replace(/text-cyan-600/g, 'text-indigo-600');
  content = content.replace(/bg-cyan-100/g, 'bg-indigo-100');
  content = content.replace(/bg-cyan-500/g, 'bg-indigo-500');
  content = content.replace(/from-cyan-600/g, 'from-indigo-600');
  content = content.replace(/to-cyan-600/g, 'to-indigo-600');
  content = content.replace(/shadow-blue-900\/5/g, 'shadow-indigo-900/5');
  content = content.replace(/shadow-blue-900\/20/g, 'shadow-indigo-900/20');
  content = content.replace(/opacity-20 scale-105 blur-2xl/g, 'opacity-10 scale-105 blur-2xl');
  content = content.replace(/opacity-30 scale-105 blur-xl/g, 'opacity-10 scale-105 blur-2xl');
  content = content.replace(/opacity-40 scale-105 blur-xl/g, 'opacity-10 scale-105 blur-2xl');
  content = content.replace(/bg-gradient-to-br from-blue-50\/40 via-blue-100\/40 to-white\/60/g, 'bg-gradient-to-br from-indigo-50/60 via-blue-50/50 to-white/80');
  content = content.replace(/bg-gradient-to-br from-cyan-50\/80 via-white\/60 to-blue-100\/80/g, 'bg-gradient-to-br from-indigo-50/60 via-blue-50/50 to-white/80');
  content = content.replace(/bg-gradient-to-b from-blue-50\/80 via-white\/60 to-white\/90/g, 'bg-gradient-to-br from-indigo-50/60 via-blue-50/50 to-white/80');
  content = content.replace(/bg-cyan-400\/20/g, 'bg-indigo-400/10');
  content = content.replace(/bg-blue-400\/20/g, 'bg-blue-400/10');

  // Fix cards
  content = content.replace(/bg-white\/40 backdrop-blur-md border border-white\/60/g, 'bg-white/50 backdrop-blur-xl border border-white/80');
  content = content.replace(/bg-white\/40 backdrop-blur-xl border border-white\/60/g, 'bg-white/50 backdrop-blur-xl border border-white/80');
  content = content.replace(/bg-white\/60 backdrop-blur-md/g, 'bg-white/50 backdrop-blur-xl');
  
  if (content !== original) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Updated ${filepath}`);
  }
});
