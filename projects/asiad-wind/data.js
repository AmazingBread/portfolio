import{seeded}from'../../src/lib/data.js';
export function makeWindData(days=7){const random=seeded(207);const count=days*144;const end=Date.UTC(2026,9,29,0);return Array.from({length:count},(_,i)=>{const t=i/count;const pulse=Math.max(0,Math.sin(t*26)-.4);const speed=Math.max(0,pulse*2.2+random()*.22);return{date:new Date(end-(count-1-i)*600000),speed,gust:speed*2.8+random()*1.4,direction:(230+Math.sin(t*12)*50+random()*25)%360,gustDirection:(235+Math.cos(t*15)*55+random()*35)%360};});}
export function windVector(speed,direction,scale=1){const radians=(direction-90)*Math.PI/180;return{x:Math.cos(radians)*speed*scale,y:Math.sin(radians)*speed*scale};}
export function maxWind(rows,key){if(!rows.length)return null;return rows.reduce((max,row)=>row[key]>max[key]?row:max,rows[0]);}
