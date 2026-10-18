// AI-assisted editable SVG; run: node docs/candle-diagrams.cjs
// Final drawing brief: vintage two-ink textbook diagrams, ivory paper,
// navy tools/wick, terracotta wax. Mold: three upright casting sections,
// bottom wick hole sealed, centered wick secured above open end, fill and
// cooling depression. Casting bottom becomes finished candle top.
// Burning: solid body, shallow melt pool, wick uptake, vapor combustion,
// heat returning to pool. No numerical dimensions or flame-zone claims.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const out = path.join(__dirname, '../src/assets/candle');
fs.mkdirSync(out, { recursive: true });
const ink='#243f52', red='#ad5139';
const text=(x,y,s,size=25)=>`<text x="${x}" y="${y}" font-size="${size}">${s}</text>`;
const line=(x,y,a,b,color=ink,arrow=false)=>`<path d="M${x} ${y}L${a} ${b}" fill="none" stroke="${color}" stroke-width="3" ${arrow?'marker-end="url(#arrow)"':''}/>`;
const base=(title,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="650" viewBox="0 0 1200 650"><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0L10 5L0 10" fill="${red}"/></marker><pattern id="hatch" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M0 12L12 0" stroke="${red}" stroke-width="1" opacity=".4"/></pattern></defs><rect width="1200" height="650" fill="#faf4e8"/><g font-family="Microsoft YaHei, sans-serif" fill="${ink}">${text(50,65,title,34)}${body}${text(50,615,'AI 辅助 SVG 示意 · 比例、收缩与颜色均为简化',20)}</g></svg>`;
let mold='';
for(let i=0;i<3;i++){
 const x=100+i*370;
 mold+=text(x-30,130,['① 空模定芯','② 液蜡包住芯','③ 冷却后补缩'][i],28);
 if(i===1) mold+=`<path d="M${x} 260H${x+180}V480H${x}Z" fill="${red}" opacity=".22"/>`;
 if(i===2) mold+=`<path d="M${x+5} 260Q${x+90} 350 ${x+175} 260V480H${x+5}Z" fill="url(#hatch)" stroke="${red}" stroke-width="3"/>`;
 mold+=`<path d="M${x} 220V480H${x+78}M${x+102} 480H${x+180}V220" fill="none" stroke="${ink}" stroke-width="7"/>`;
 mold+=line(x+90,193,x+90,492)+line(x-15,212,x+195,212);
 mold+=`<rect x="${x+67}" y="485" width="46" height="14" rx="4" fill="${ink}"/>`;
 if(i===0){mold+=text(x+15,185,'定芯杆',22)+text(x+110,355,'棉芯',22)+text(x+12,535,'孔外封住',22);}
 if(i===1){mold+=line(x+30,155,x+30,280,red,true)+text(x+35,390,'液态',24);}
 if(i===2){mold+=line(x+135,165,x+120,290,red,true)+text(x+175,185,'补蜡',22)+text(x+25,400,'已凝固',24);}
}
mold+=text(430,550,'下端 → 成品顶部；开口补蜡面 → 成品底面',24);
let burn=`<path d="M150 330Q300 355 450 330V525H150Z" fill="url(#hatch)" stroke="${ink}" stroke-width="4"/><ellipse cx="300" cy="333" rx="85" ry="18" fill="${red}" opacity=".35"/><path d="M300 520V275" stroke="${ink}" stroke-width="8"/><path d="M300 285C230 260 275 190 300 145C302 205 380 255 300 285Z" fill="${red}" opacity=".2" stroke="${red}" stroke-width="4"/>`;
burn+=text(55,130,'局部剖面',26)+text(180,468,'固体蜡',28)+text(55,290,'蜡池',24)+line(110,295,240,330);
burn+=line(322,325,322,280,red,true);
burn+=`<path d="M370 230Q495 260 410 328" fill="none" stroke="${red}" stroke-width="3" marker-end="url(#arrow)"/>`;
burn+=text(415,230,'热传回蜡面',23);
const labels=[['固体蜡受热','熔化成为液蜡'],['液蜡沿芯上行','纤维间隙帮助输送'],['芯端附近汽化','气态燃料参与燃烧']];
for(let i=0;i<3;i++){
 let y=145+i*135;
 burn+=`<rect x="650" y="${y}" width="490" height="96" rx="8" fill="none" stroke="${ink}" stroke-width="2"/>`+text(680,y+38,`${i+1}  ${labels[i][0]}`,28)+text(722,y+74,labels[i][1],23);
 if(i<2)burn+=line(895,y+101,895,y+127,red,true);
}
burn+=text(75,565,'蜡池只在顶面局部；芯贯穿蜡体。',23);
const images={'mold':base('蜡烛成形：先定芯，再浇蜡',mold),'burning':base('持续的火焰，靠液蜡沿芯供料',burn)};
(async()=>{for(const [name,svg] of Object.entries(images)){
 fs.writeFileSync(path.join(out,name+'.svg'),svg+'\n');
 await sharp(Buffer.from(svg)).resize(900).png().toFile(path.join(require('node:os').tmpdir(),'candle-'+name+'.png'));
}})().catch(e=>{console.error(e);process.exit(1)});
