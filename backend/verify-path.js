const path = require('path');
const fs = require('fs');

console.log('--- Path Verification ---');
console.log('Current CWD:', process.cwd());
console.log('__dirname:', __dirname);

const schemaPath = path.join(__dirname, 'schema.sql');
const schemaPathUp = path.join(__dirname, '..', 'schema.sql');

console.log('Path (./schema.sql):', schemaPath);
console.log('Exists:', fs.existsSync(schemaPath));

console.log('Path (../schema.sql):', schemaPathUp);
console.log('Exists:', fs.existsSync(schemaPathUp));

if (fs.existsSync(schemaPathUp)) {
    const content = fs.readFileSync(schemaPathUp, 'utf8');
    console.log('--- Content check for `change` ---');
    const line = content.split('\n').find(l => l.includes('change'));
    console.log('Line found:', line);
}
if (fs.existsSync(schemaPath)) {
    const content = fs.readFileSync(schemaPath, 'utf8');
    console.log('--- Content check for `change` ---');
    const line = content.split('\n').find(l => l.includes('change'));
    console.log('Line found:', line);
}
