const fs = require('fs');
let text = fs.readFileSync('../src/app/components/auth/AuthPage.tsx', 'utf8');
text = text.replace(/<img[^>]*src=\{bgImage\}[^>]*>\s*/g, '');
fs.writeFileSync('../src/app/components/auth/AuthPage.tsx', text, 'utf8');