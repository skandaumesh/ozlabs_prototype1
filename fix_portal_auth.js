const fs = require('fs');
const path = require('path');

const portalDir = path.join(__dirname, 'src', 'app', 'portal');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(portalDir, function(filePath) {
  if (filePath.endsWith('page.js') && !filePath.includes('login')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add auth import if not present
    if (!content.includes("import { auth } from '@/auth';")) {
      content = content.replace("import dbConnect", "import { auth } from '@/auth';\nimport dbConnect");
    }

    // Replace params destruction
    content = content.replace(/const { clientPortalToken } = await params;/g, 'const session = await auth();');
    content = content.replace(/const { clientPortalToken, reviewToken } = await params;/g, 'const session = await auth();\n  const { reviewToken } = await params;');
    content = content.replace(/const { clientPortalToken, id } = await params;/g, 'const session = await auth();\n  const { id } = await params;');

    // Replace findOne
    content = content.replace(/Client\.findOne\(\{ clientPortalToken \}\)/g, 'Client.findById(session.user.id)');

    // Replace links
    content = content.replace(/\/portal\/\$\{clientPortalToken\}/g, '/portal');

    // Replace specific check in review page
    content = content.replace(/version\.projectId\.clientId\.clientPortalToken !== clientPortalToken/g, 'version.projectId.clientId._id.toString() !== session.user.id');
    
    // Replace portalToken prop passing in review page
    content = content.replace(/portalToken=\{clientPortalToken\}/g, 'portalToken={""}');

    fs.writeFileSync(filePath, content);
  }
});
