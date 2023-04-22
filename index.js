const fs = require('fs');
const path = require('path');

const scriptsDir = path.join(__dirname, 'scripts');

const runScripts = (dirPath) => {
    fs.readdirSync(dirPath).forEach((file) => {
        const filePath = path.join(dirPath, file);

        if (fs.statSync(filePath).isDirectory()) {
            runScripts(filePath);
        } else if (path.extname(file) === '.js') {
            require(filePath);
            console.log(`Executed ${filePath}`);
        }
    });
};

runScripts(scriptsDir);

console.log('App started');
