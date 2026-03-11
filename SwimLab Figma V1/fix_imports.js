const fs = require('fs');
const path = require('path');

const dir = '../src/app/components/planning/';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/from\s+['"]\.\/constants['"]/g, "from '../../../constants/colors'");
  fs.writeFileSync(filePath, content, 'utf8');
});
