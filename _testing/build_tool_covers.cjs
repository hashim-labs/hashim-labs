const fs = require('fs');
const sharp = require('sharp');
// Actual app screenshots inside one consistent, neutral project-cover system.
(async () => {
  for (const [slug,title,tag] of [
    ['trace-lab','TraceLab','API CONTRACT EXPLORER'],
    ['flow-lab','FlowLab','AUTOMATION PLAYGROUND'],
    ['fallback-atlas','Fallback Atlas','DEPENDENCY & CONTINUITY WORKSPACE'],
    ['scope-lens','ScopeLens','SCOPE & CAPACITY WORKSPACE'],
  ]) {
    const frame = `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="960"><rect width="1440" height="960" fill="#141a23"/><path d="M0 170H1440" stroke="#ffffff0d"/><text x="88" y="98" font-family="Arial,sans-serif" font-size="54" font-weight="600" letter-spacing="-2" fill="#e2e8f0">${title}</text><text x="92" y="140" font-family="Arial,sans-serif" font-size="12" letter-spacing="3" fill="#8e9eb5">${tag.replaceAll('&','&amp;')}</text><rect x="88" y="192" width="1264" height="800" rx="12" fill="#080c12" stroke="#ffffff20"/><circle cx="114" cy="212" r="4" fill="#6e7a8b"/><circle cx="130" cy="212" r="4" fill="#6e7a8b"/><circle cx="146" cy="212" r="4" fill="#6e7a8b"/><rect x="500" y="204" width="440" height="16" rx="4" fill="#ffffff08"/></svg>`;
    const shot = await sharp(`artifacts/${slug}-screen.png`).resize(1264,730,{fit:'contain',background:'#0b0e13'}).toBuffer();
    await sharp(Buffer.from(frame)).composite([{input:shot,left:88,top:230}]).webp({quality:89}).toFile(`public/images/${slug}-showcase.webp`);
  }
  console.log('Four neutral screenshot covers saved.');
})();
