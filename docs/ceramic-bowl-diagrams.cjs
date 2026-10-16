// Reproducible AI-assisted SVG diagrams; run from project root.
const fs = require('node:fs');
const dir = 'src/assets/ceramic-bowl';
fs.mkdirSync(dir, { recursive: true });
const start = title => `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="680" viewBox="0 0 1200 680"><title>${title}</title><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#508c9d"/></marker></defs><rect width="1200" height="680" rx="28" fill="#faf7f1"/><g font-family="Microsoft YaHei, sans-serif" fill="#30494a">`;
const text = (x,y,t,size=24) => `<text x="${x}" y="${y}" font-size="${size}">${t}</text>`;
const arrow = (x,y,x2,y2) => `<path d="M${x} ${y}L${x2} ${y2}" fill="none" stroke="#508c9d" stroke-width="4" marker-end="url(#arrow)"/>`;
const shell = 'M45 0 Q65 155 150 155 Q235 155 255 0 L234 0 Q215 131 150 131 Q85 131 66 0Z';
let a = start('泥浆怎样在石膏模里留下空心碗');
a += text(60,70,'一盆浆，怎样留下一个空心壳？',38);
a += text(60,112,'石膏模排浆注浆 · 纵向剖面示意',23);
for (let i=0;i<3;i++) {
 const x=65+i*390;
 a += `<g transform="translate(${x} 220)">`;
 // The mold cavity follows the outer profile of the cast wall.
 a += `<path d="M0 -20H45V0Q65 155 150 155Q235 155 255 0V-20H300V210H0Z" fill="#e5dac5"/>`;
 if(i===0) a += '<path d="M45 0H255Q235 155 150 155Q65 155 45 0Z" fill="#96b6c3"/>';
 else {
  a += `<path d="${shell}" fill="#c48765"/>`;
  if(i===1) a += '<path d="M66 0H234Q215 131 150 131Q85 131 66 0Z" fill="#96b6c3"/>';
 }
 a += '</g>';
 a += text(x,175,['1  注入泥浆','2  靠壁形成湿坯层','3  排出余浆后'][i],27);
 a += text(x,480,['腔内装满流动的浆','水进入模具，颗粒留下','中央空了，薄壳留下'][i],24);
}
a += arrow(505,275,470,300)+arrow(705,275,740,300)+arrow(605,365,605,410);
a += text(505,523,'蓝箭头：水分移动',22);
a += text(965,285,'空腔',27);
a += '<rect x="70" y="560" width="24" height="24" fill="#e5dac5"/>'+text(108,581,'石膏模');
a += '<rect x="270" y="560" width="24" height="24" fill="#96b6c3"/>'+text(308,581,'流动泥浆');
a += '<rect x="500" y="560" width="24" height="24" fill="#c48765"/>'+text(538,581,'湿坯层');
a += text(70,632,'AI 辅助 SVG 示意 · 壁厚放大 · 右图是排浆后状态，实际须倾斜模具',21)+'</g></svg>';
fs.writeFileSync(`${dir}/casting.svg`,a);
let b=start('电窑的热源与碗表面在烧成前后的变化');
b+=text(60,70,'热量从哪里来？釉层怎样变？',38);
b+=text(60,112,'左：电窑剖面　右：碗壁表面局部放大',23);
b+='<rect x="70" y="178" width="480" height="355" rx="20" fill="#bac7c8"/><rect x="90" y="198" width="440" height="315" rx="12" fill="#e5dac5"/><rect x="132" y="225" width="356" height="245" fill="#f5ebe1"/><rect x="70" y="153" width="480" height="30" rx="10" fill="#bac7c8"/>';
for(let y=245;y<455;y+=40) b+=`<path d="M118 ${y}h18m348 0h18" stroke="#c9785b" stroke-width="9"/>`;
b+='<rect x="165" y="413" width="290" height="16" fill="#8d9e98"/><rect x="190" y="429" width="18" height="41" fill="#8d9e98"/><rect x="412" y="429" width="18" height="41" fill="#8d9e98"/>';
b+=`<g transform="translate(160 263)"><path d="${shell}" fill="#efe3cd" stroke="#8d9e98" stroke-width="2"/></g>`;
b+=text(170,240,'碗在窑内原位受热',20)+text(75,580,'侧壁电热元件',22)+text(325,580,'窑板与支柱',22);
b+=arrow(160,550,124,445)+arrow(405,550,420,450);
const labels=['素烧后：多孔坯体','施釉后：粉料附着','釉烧后：釉与坯结合'];
for(let i=0;i<3;i++) {
 const y=205+i*130;
 b+=text(625,y,labels[i],25);
 b+=`<rect x="630" y="${y+20}" width="470" height="54" rx="6" fill="${i===2?'#d7bc98':'#e3c7a6'}"/>`;
 if(i<2) for(let j=0;j<9;j++) b+=`<circle cx="${655+j*48}" cy="${y+49}" r="5" fill="#faf7f1"/>`;
 if(i===1) for(let j=0;j<47;j++) b+=`<circle cx="${635+j*10}" cy="${y+20}" r="5" fill="#88b3b1"/>`;
 if(i===2) b+=`<rect x="630" y="${y+14}" width="470" height="11" rx="4" fill="#88b3b1"/>`;
}
b+=text(630,605,'青绿色为釉；未烧时并非光滑玻璃层',22);
b+=text(65,650,'AI 辅助 SVG 示意 · 釉厚与孔隙放大 · 电路、测温与通风结构省略',20)+'</g></svg>';
fs.writeFileSync(`${dir}/firing.svg`,b);
