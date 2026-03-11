const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(dirPath);
  });
}

walk('../src/app/components', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Remove the const bgImage declaration (handles multi-line for ProfileDashboard)
    content = content.replace(/const bgImage\s*=\s*["'`]https:\/\/images\.unsplash\.com\/photo-1593935882214-7c9568ad5cde[^"']*["'`];?\n?/g, '');
    
    // Remove the img tag using bgImage
    content = content.replace(/<img\s*src=\{bgImage\}\s*alt="[^"]*"\s*className="[^"]*"\s*\/>\n?/g, '');
    content = content.replace(/<img\n\s*src=\{bgImage\}\n\s*alt="[^"]*"\n\s*className="[^"]*"\n\s*\/>\n?/g, '');
    
    // A broader catch-all for the img tag since some might be spread across multiple lines
    content = content.replace(/<img[^>]*src=\{bgImage\}[^>]*>\n?/g, '');

    // Also remove any stray `{/* Dynamic Background */}` or `{/* Background with Aquatic Blur */}` comments? The user just said to remove the URL and put back the old background, so probably removing the image is enough. But the comment says "Dynamic Background". Leaving the comment is fine.

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated', filePath);
    }
  }
});