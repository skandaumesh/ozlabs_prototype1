const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src'));
const models = ['Admin', 'Client', 'Project', 'Version', 'Comment', 'Invoice'];

let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  models.forEach(model => {
    // Regex to match: import { Model } from '@/models/Model' or './models/Model' or '../../models/Model'
    const regex = new RegExp(`import\\s+\\{\\s*${model}\\s*\\}\\s+from\\s+(['"])(.*?)models/${model}(['"])`, 'g');
    content = content.replace(regex, `import ${model} from $1$2models/${model}$3`);
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed imports in ${file}`);
    changedFiles++;
  }
});

console.log(`Done. Fixed ${changedFiles} files.`);
