const fs = require('fs');
let content = fs.readFileSync('../src/app/components/planning/DreamPlanning.tsx', 'utf8');

const newStr = `      <div
        className="min-h-screen w-full relative overflow-hidden font-sans bg-slate-50 selection:bg-indigo-500 selection:text-white"
        style={{ color: COLORS.textPrimary }}
      >
        {/* Dynamic Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <img 
            src={bgImage} 
            alt="Water Background" 
            className="w-full h-full object-cover opacity-10 scale-105 blur-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/60 via-blue-50/50 to-white/80" />
          
          {/* Animated Orbs */}
          <motion.div 
            animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 right-20 w-[400px] h-[400px] bg-indigo-400/10 rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
            transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl"
          />
        </div>

        {/* ── MOBILE LAYOUT ── */}
        <div
          className="md:hidden relative z-10 max-w-md mx-auto h-screen flex flex-col overflow-hidden bg-white/40 backdrop-blur-2xl"
        >`;

const oldStrRegex = /<div\s+className="min-h-screen w-full relative overflow-hidden font-sans"[\s\S]*?className="md:hidden relative z-10 max-w-md mx-auto h-screen flex flex-col overflow-hidden"\s+style={{ backgroundColor: 'rgba\(239,246,255,0\.55\)', backdropFilter: 'blur\(24px\)' }}\s+>/;

content = content.replace(oldStrRegex, newStr);

fs.writeFileSync('../src/app/components/planning/DreamPlanning.tsx', content, 'utf8');
console.log("Updated planning");
