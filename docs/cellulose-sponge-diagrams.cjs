// Original editable diagrams. Run: node docs/cellulose-sponge-diagrams.cjs
// Design brief: soft colour cutaways, salt crystals -> connected pores;
// then wet sponge -> compressed sponge expelling water. No recipe or scale.
const fs = require('node:fs');
const path = require('node:path');
const out = path.join(__dirname, '../src/assets/cellulose-sponge');
fs.mkdirSync(out, {recursive:true});
const text = (x,y,s,size=27) => `<text x="${x}" y="${y}" font-size="${size}">${s}</text>`;
const arrow=(x,y,x2,y2,c='#537f91')=>`<path d="M${x} ${y} L${x2} ${y2}" stroke="${c}" stroke-width="7" fill="none" marker-end="url(#a)"/>`;
function wrap(title, body) {return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="680" viewBox="0 0 1200 680"><defs><marker id="a" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8" fill="#537f91"/></marker></defs><rect width="1200" height="680" fill="#f7f4ec"/><g font-family="Microsoft YaHei, sans-serif" fill="#34484e">${text(60,70,title,36)}${body}${text(60,638,'AI 辅助 SVG 示意 · 颜色、孔形与尺寸均经简化',21)}</g></svg>`;}
function block(x,y,w,h,pores=false,wet=false){
 let s=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20" fill="#e3bc72" stroke="#ac8952" stroke-width="3"/>`;
 const centers=[[.16,.25],[.46,.22],[.78,.28],[.25,.7],[.6,.68],[.88,.73]];
 if(pores) {
   s+=`<path d="M${x} ${y+h*.25} L${x+w*.16} ${y+h*.25} L${x+w*.46} ${y+h*.22} L${x+w*.78} ${y+h*.28} L${x+w} ${y+h*.28} M${x+w*.16} ${y+h*.25} L${x+w*.25} ${y+h*.7} L${x+w*.6} ${y+h*.68} L${x+w*.88} ${y+h*.73} L${x+w} ${y+h*.73} M${x+w*.46} ${y+h*.22} L${x+w*.6} ${y+h*.68}" stroke="${wet?'#80bacd':'#dcecef'}" stroke-width="${h*.065}" fill="none"/>`;
 }
 centers.forEach(([cx,cy],i)=>{
 const px=x+w*cx,py=y+h*cy,rx=w*(i%2?.09:.08),ry=h*.14;
 s+=`<path d="M${px-rx} ${py-ry*.5} L${px-rx*.3} ${py-ry} L${px+rx} ${py-ry*.3} L${px+rx*.8} ${py+ry} L${px-rx*.6} ${py+ry*.8} Z" fill="${pores?(wet?'#80bacd':'#dcecef'):'#fffaf0'}" stroke="${pores?'none':'#b9a889'}" stroke-width="2"/>`;
 });
 return s;
}
fs.writeFileSync(path.join(out,'pores.svg'),wrap('海绵的孔：先占住位置，再移走盐',`
${text(75,148,'① 混合料局部剖面',29)}${text(720,148,'② 再生、洗涤后的骨架',29)}
${block(75,205,395,270)}${block(720,205,395,270,true)}
${arrow(505,335,680,335)}${text(520,280,'加热再生',24)}${text(530,405,'再洗盐',24)}
${text(90,530,'白色：盐晶体',26)}${text(90,568,'黄色：晶体之间的黏稠料',24)}
${text(735,530,'浅蓝：腾出的连通孔隙',26)}${text(735,568,'黄色：留下的纤维素骨架',24)}
`));
fs.writeFileSync(path.join(out,'wringing.svg'),wrap('吸水与挤水：孔隙容纳水，也能排出水',`
${text(90,150,'① 润湿后，水进入孔隙',29)}${text(715,150,'② 挤压使孔隙变小',29)}
${block(100,250,370,250,true,true)}${block(725,330,370,130,true,true)}
${arrow(30,320,96,320)}${arrow(30,440,96,440)}
${arrow(525,375,655,375)}${text(530,325,'挤压',25)}
${arrow(910,220,910,315)}${arrow(910,565,910,477)}
${arrow(1100,380,1160,435)}${arrow(715,390,665,460)}
<path d="M1145 469 Q1117 504 1145 512 Q1173 504 1145 469 M680 491 Q655 524 680 532 Q705 524 680 491" fill="#80bacd"/>
${text(110,557,'连通孔隙中保留水',26)}${text(745,600,'上下受压，两侧排水',23)}
`));
