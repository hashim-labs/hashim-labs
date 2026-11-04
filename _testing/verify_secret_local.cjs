const fs = require('fs');
const cp = require('child_process');
const env = fs.readFileSync('.env.local', 'utf8');
let key = env.split(/\r?\n/).find(line => line.startsWith('GROQ_API_KEY='))?.slice(13).trim();
if (key?.startsWith('"') || key?.startsWith("'")) key = key.slice(1, -1);
if (!key) throw new Error('Expected configured key');
const committed = cp.execFileSync('git', ['diff-tree', '--no-commit-id', '--name-only', '-r', 'HEAD'], {encoding:'utf8'}).trim().split(/\r?\n/);
function walk(dir) { return fs.readdirSync(dir,{withFileTypes:true}).flatMap(item => item.isDirectory()?walk(`${dir}/${item.name}`):[`${dir}/${item.name}`]); }
const files = [...committed, ...walk('.next/static')];
const hits = files.filter(file => fs.existsSync(file) && fs.readFileSync(file).includes(Buffer.from(key)));
console.log(JSON.stringify({checked:files.length, credentialLeaks:hits.length}));
if(hits.length) process.exitCode=1;
