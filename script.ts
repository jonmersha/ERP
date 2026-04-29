import fs from 'fs';
import path from 'path';

const walk = (dir: string, callback: (path: string) => void) => {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(dirPath);
  });
};

console.log("Replacing fetch with fetchCollection");

walk('./src/pages', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    // MasterData.tsx uses GET fetches
    if (filePath.includes('MasterData.tsx')) {
      content = content.replace(/fetch\(\`\/api\/core\/factories\?companyId=\$\{companyId\}\`\)/g, "fetchCollection('factories', companyId)");
      content = content.replace(/fetch\(\`\/api\/core\/warehouses\?companyId=\$\{companyId\}\`\)/g, "fetchCollection('warehouses', companyId)");
      content = content.replace(/fetch\(\`\/api\/products\?companyId=\$\{companyId\}\`\)/g, "fetchCollection('products', companyId)");
      content = content.replace(/fetch\(\`\/api\/products\/raw-materials\?companyId=\$\{companyId\}\`\)/g, "fetchCollection('rawMaterials', companyId)");
      content = content.replace(/fetch\(\`\/api\/products\/categories\?companyId=\$\{companyId\}\`\)/g, "fetchCollection('categories', companyId)");
      
      // Need to import fetchCollection
      if (content.includes("fetchCollection('factories', companyId)") && !content.includes('fetchCollection')) {
        content = content.replace("import { useAuth }", "import { fetchCollection } from '../utils/firestore';\nimport { useAuth }");
      }
      modified = true;
    }
    
    // Users.tsx
    if (filePath.includes('Users.tsx')) {
       content = content.replace(/fetch\(\`\/api\/users\?companyId=\$\{companyId\}\`\)/g, "fetchCollection('users', companyId)");
       content = content.replace(/fetch\(\`\/api\/users\/company\/\$\{companyId\}\`\)/g, "fetchCollection('users', companyId)");
       
       if (content.includes("fetchCollection('users', companyId)") && !content.includes('fetchCollection')) {
         content = content.replace("import { useAuth }", "import { fetchCollection } from '../utils/firestore';\nimport { useAuth }");
       }
       modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log('Modified', filePath);
    }
  }
});
