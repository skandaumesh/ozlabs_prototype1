const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  fs.readdirSync(dir).forEach(file => {
    file = path.join(dir, file);
    if (fs.statSync(file).isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.match(/\.(js|jsx)$/)) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src'));
let count = 0;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  const original = content;
  content = content.replace(
    /session\.user\.role !== 'admin'/g,
    "!['admin','superadmin'].includes(session.user.role)"
  );
  if (content !== original) {
    fs.writeFileSync(f, content);
    console.log('Fixed:', f);
    count++;
  }
});

console.log('Done. Fixed', count, 'files.');
