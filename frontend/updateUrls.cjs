const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            walk(filePath);
        } else if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
            let content = fs.readFileSync(filePath, 'utf8');
            if (content.includes('http://localhost:5000/api')) {
                console.log(`Updating ${filePath}`);
                // Add import if not present
                if (!content.includes("import API_URL from")) {
                    // Find first import or top of file
                    const importMatch = content.match(/import.*;/);
                    if (importMatch) {
                        content = content.replace(/(import.*;)/, `$1\nimport API_URL from '${path.relative(path.dirname(filePath), path.join(srcDir, 'config')).replace(/\\/g, '/')}';`);
                    } else {
                        content = `import API_URL from '${path.relative(path.dirname(filePath), path.join(srcDir, 'config')).replace(/\\/g, '/')}';\n` + content;
                    }
                }
                // Replace URLs
                content = content.replace(/['"]http:\/\/localhost:5000\/api(.*?)['"]/g, '`${API_URL}$1`');
                fs.writeFileSync(filePath, content);
            }
        }
    });
}

walk(srcDir);
console.log('Done!');
