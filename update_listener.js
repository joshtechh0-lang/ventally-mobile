const fs = require('fs');

const path = './src/locales/en.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

function replaceText(text) {
  if (typeof text !== 'string') return text;
  
  // Plurals and possessives first
  text = text.replace(/\blisteners\b/g, 'Support Guides');
  text = text.replace(/\bListeners\b/g, 'Support Guides');
  text = text.replace(/\blistener's\b/g, "Support Guide's");
  text = text.replace(/\bListener's\b/g, "Support Guide's");
  
  // Singular
  text = text.replace(/\blistener\b/g, 'Support Guide');
  text = text.replace(/\bListener\b/g, 'Support Guide');
  
  // Special combinations like "listener-venter" -> "Support Guide-venter" (handled by \b)
  return text;
}

function traverse(obj) {
  for (let key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = replaceText(obj[key]);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      traverse(obj[key]);
    }
  }
}

traverse(data);
fs.writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
console.log('Done replacing in ' + path);
