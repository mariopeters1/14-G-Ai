const fs = require('fs');
const path = require('path');

function fixInFolder(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixInFolder(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const occurrences = (content.match(/ChefHat/g) || []).length;
      if (occurrences > 1) {
          // Check if it's imported multiple times in lucide-react
          const importMatches = content.match(/import\s+{([^}]*)}\s+from\s+['"]lucide-react['"]/g);
          if (importMatches) {
               for(const m of importMatches) {
                    let innerMatch = m.match(/import\s+{([^}]*)}\s+from/);
                    if (innerMatch) {
                        let inner = innerMatch[1];
                        let parts = inner.split(',').map(p => p.trim()).filter(Boolean);
                        let uniqueParts = Array.from(new Set(parts));
                        let newInner = uniqueParts.join(', ');
                        let newImport = m.replace(inner, ' ' + newInner + ' ');
                        content = content.replace(m, newImport);
                    }
               }
               fs.writeFileSync(fullPath, content);
               console.log('Fixed duplications in: ' + fullPath);
          }
      }
    }
  }
}
fixInFolder('c:\\\\Users\\\\djmar\\\\OneDrive\\\\Documents\\\\14 G Ai\\\\src');
