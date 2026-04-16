const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
                processDir(fullPath);
            }
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('Loader2')) {
                let matches = content.match(/import\s+\{([^}]+)\}\s+from\s+['"`]lucide-react['"`]/);
                if (matches) {
                    let imports = matches[1].split(',').map(s => s.trim()).filter(Boolean);
                    if (imports.includes('Loader2')) {
                        imports = imports.filter(x => x !== 'Loader2');
                        if (!imports.includes('ChefHat')) {
                            imports.push('ChefHat');
                        }
                        const newImportStr = 'import { ' + imports.join(', ') + ' } from "lucide-react"';
                        content = content.replace(matches[0], newImportStr);
                    }
                }
                
                content = content.replace(/<Loader2/g, '<ChefHat');
                content = content.replace(/<\/Loader2/g, '</ChefHat');
                // Catch any other references like `icon: Loader2` if any
                content = content.replace(/([^a-zA-Z0-9])Loader2([^a-zA-Z0-9])/g, '$1ChefHat$2');
                
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Updated: ' + fullPath);
            }
        }
    }
}

processDir(path.join(process.cwd(), 'src'));
