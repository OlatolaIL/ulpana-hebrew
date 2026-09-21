const fs = require('fs');
const html = fs.readFileSync('growth/scenes/rent_contract_vs_chest/index.html', 'utf8');
console.log('Contains scene-intro:', html.includes('id="scene-intro"'));
console.log('Contains scene-fail:', html.includes('id="scene-fail"'));
console.log('Contains scene-solution:', html.includes('id="scene-solution"'));
console.log('Contains scene-outro:', html.includes('id="scene-outro"'));
