const fs = require('fs');

const pkgPath = '../package.json';
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const depsToRemove = [
  "@emotion/react",
  "@emotion/styled",
  "@mui/icons-material",
  "@mui/material",
  "@popperjs/core",
  "next-themes",
  "react-popper",
  "react-slick"
];

for (const dep of depsToRemove) {
  delete pkg.dependencies[dep];
}

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
