const fs = require('fs');

function replaceImages(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Need to import OptimizedImage
  // Compute relative path
  let importPath = '';
  if (filePath.includes('/planning/') || filePath.includes('/profile/') || filePath.includes('/dashboard/')) {
    importPath = '../OptimizedImage';
  } else if (filePath.includes('/home/')) {
    importPath = '../OptimizedImage';
  }

  if (content.includes('<img') && !content.includes('import { OptimizedImage }')) {
    content = `import { OptimizedImage } from '${importPath}';\n` + content;
  }
  
  content = content.replace(/<img([^>]*)>/g, '<OptimizedImage$1/>');
  
  fs.writeFileSync(filePath, content, 'utf8');
}

replaceImages('../src/app/components/home/Home.tsx');
replaceImages('../src/app/components/home/SoloSwimmerHome.tsx');
replaceImages('../src/app/components/profile/ProfileDashboard.tsx');
replaceImages('../src/app/components/profile/SwimmerProfile.tsx');
replaceImages('../src/app/components/dashboard/Dashboard.tsx');
replaceImages('../src/app/components/planning/WeekView.tsx');
replaceImages('../src/app/components/planning/SlotCard.tsx');

