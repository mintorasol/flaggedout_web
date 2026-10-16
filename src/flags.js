const countries = [
  ['Morocco', 'MA', '#c1272d', '#006233'], ['Algeria', 'DZ', '#006233', '#fff'], ['Tunisia', 'TN', '#e70013', '#fff'],
  ['Egypt', 'EG', '#ce1126', '#fff'], ['Nigeria', 'NG', '#008751', '#fff'], ['South Africa', 'ZA', '#007749', '#ffb81c'],
  ['Ghana', 'GH', '#ce1126', '#fcd116'], ['Kenya', 'KE', '#000', '#bb0000'], ['Ethiopia', 'ET', '#078930', '#fcd116'],
  ['Senegal', 'SN', '#00853f', '#fdef42'], ['United States', 'US', '#b22234', '#fff'], ['Canada', 'CA', '#d80621', '#fff'],
  ['Mexico', 'MX', '#006847', '#fff'], ['Brazil', 'BR', '#009b3a', '#ffdf00'], ['Argentina', 'AR', '#74acdf', '#fff'],
  ['United Kingdom', 'GB', '#012169', '#c8102e'], ['France', 'FR', '#0055a4', '#fff'], ['Germany', 'DE', '#000', '#dd0000'],
  ['Spain', 'ES', '#aa151b', '#f1bf00'], ['Portugal', 'PT', '#006600', '#ff0000'], ['Italy', 'IT', '#009246', '#fff'],
  ['Netherlands', 'NL', '#ae1c28', '#fff'], ['Sweden', 'SE', '#006aa7', '#fecc00'], ['Norway', 'NO', '#ba0c2f', '#fff'],
  ['Switzerland', 'CH', '#d52b1e', '#fff'], ['Ukraine', 'UA', '#0057b7', '#ffd700'], ['Greece', 'GR', '#0d5eaf', '#fff'],
  ['Poland', 'PL', '#fff', '#dc143c'], ['Turkey', 'TR', '#e30a17', '#fff'], ['Russia', 'RU', '#fff', '#0039a6'],
  ['Japan', 'JP', '#fff', '#bc002d'], ['China', 'CN', '#de2910', '#ffde00'], ['India', 'IN', '#ff9933', '#fff'],
  ['South Korea', 'KR', '#fff', '#cd2e3a'], ['Indonesia', 'ID', '#ce1126', '#fff'], ['Thailand', 'TH', '#a51931', '#fff'],
  ['Vietnam', 'VN', '#da251d', '#ff0'], ['Pakistan', 'PK', '#01411c', '#fff'], ['Saudi Arabia', 'SA', '#006c35', '#fff'],
  ['United Arab Emirates', 'AE', '#00732f', '#ff0000'], ['Israel', 'IL', '#fff', '#0038b8'], ['Australia', 'AU', '#012169', '#fff'],
  ['New Zealand', 'NZ', '#00247d', '#fff'], ['Colombia', 'CO', '#fcd116', '#003893'], ['Chile', 'CL', '#0039a6', '#fff'],
  ['Peru', 'PE', '#d91023', '#fff'], ['Uruguay', 'UY', '#fff', '#0038a8'], ['Jamaica', 'JM', '#009b3a', '#ffb81c'],
  ['Cameroon', 'CM', '#007a5e', '#ce1126'], ['Ivory Coast', 'CI', '#f77f00', '#fff'], ['Tanzania', 'TZ', '#1eb53a', '#fcd116'],
  ['Ireland', 'IE', '#169b62', '#fff'], ['Denmark', 'DK', '#c60c30', '#fff'], ['Belgium', 'BE', '#000', '#fae042'],
  ['Austria', 'AT', '#ed2939', '#fff'], ['Croatia', 'HR', '#ff0000', '#fff'], ['Serbia', 'RS', '#c6363c', '#0c4076'],
  ['Costa Rica', 'CR', '#002b7f', '#fff'], ['Cuba', 'CU', '#002a8f', '#fff'], ['Iceland', 'IS', '#003897', '#fff'],
  ['Qatar', 'QA', '#8a1538', '#fff'], ['Philippines', 'PH', '#0038a8', '#ce1126'], ['Malaysia', 'MY', '#010066', '#cc0001'],
  ['Afghanistan', 'AF', '#000', '#d32011'], ['Armenia', 'AM', '#d90012', '#0033a0'], ['Azerbaijan', 'AZ', '#00b5e2', '#ef3340'],
  ['Bangladesh', 'BD', '#006a4e', '#f42a41'], ['Bhutan', 'BT', '#ff4e12', '#ffcc00'], ['Brunei', 'BN', '#f7e017', '#000'],
  ['Cambodia', 'KH', '#032ea1', '#e00025'], ['Iraq', 'IQ', '#ce1126', '#fff'], ['Iran', 'IR', '#239f40', '#fff'],
  ['Jordan', 'JO', '#007a3d', '#fff'], ['Kazakhstan', 'KZ', '#00afca', '#f6c800'], ['Lebanon', 'LB', '#ed1c24', '#fff'],
  ['Mongolia', 'MN', '#c4272f', '#015197'], ['Myanmar', 'MM', '#fecb00', '#34b233'], ['Oman', 'OM', '#db161b', '#fff'],
  ['Sri Lanka', 'LK', '#8d153a', '#ffbe29'], ['Syria', 'SY', '#ce1126', '#fff'], ['Taiwan', 'TW', '#fe0000', '#000095'],
  ['Uzbekistan', 'UZ', '#1eb53a', '#0099b5'], ['Yemen', 'YE', '#ce1126', '#fff'], ['Botswana', 'BW', '#75aadb', '#000'],
  ['Burkina Faso', 'BF', '#ef2b2d', '#009e49'], ['DR Congo', 'CD', '#007fff', '#ce1021'], ['Mali', 'ML', '#14b53a', '#fcd116'],
  ['Namibia', 'NA', '#003580', '#009543'], ['Zambia', 'ZM', '#198a00', '#de2010'], ['Zimbabwe', 'ZW', '#006400', '#ffd200'],
  ['Uganda', 'UG', '#000', '#fcdc04'], ['Rwanda', 'RW', '#00a1de', '#fad201'], ['Mozambique', 'MZ', '#009739', '#000'],
  ['Angola', 'AO', '#cc092f', '#000'], ['Libya', 'LY', '#e70013', '#000'], ['Madagascar', 'MG', '#fc3d32', '#007e3a'],
  ['Haiti', 'HT', '#00209f', '#d21034'], ['Panama', 'PA', '#fff', '#da121a'], ['Ecuador', 'EC', '#ffdd00', '#034ea2'],
  ['Guatemala', 'GT', '#4997d0', '#fff'], ['Honduras', 'HN', '#0073cf', '#fff'], ['El Salvador', 'SV', '#0047ab', '#fff'],
  ['Paraguay', 'PY', '#d52b1e', '#fff'], ['Bolivia', 'BO', '#d52b1e', '#f9e300'], ['Dominican Republic', 'DO', '#002d62', '#ce1126'],
  ['Trinidad and Tobago', 'TT', '#ce1126', '#fff'], ['Cyprus', 'CY', '#fff', '#d57800'], ['Czechia', 'CZ', '#fff', '#d7141a'],
  ['Finland', 'FI', '#fff', '#003580'], ['Slovakia', 'SK', '#fff', '#0b4ea2'], ['Slovenia', 'SI', '#fff', '#ed1c24'],
  ['Luxembourg', 'LU', '#ed2939', '#fff']
];

function star(ctx, x, y, outer, inner, points = 5) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 ? inner : outer;
    const angle = -Math.PI / 2 + i * Math.PI / points;
    const px = x + Math.cos(angle) * radius, py = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath(); ctx.fill();
}

export function createFlagTexture(THREE, code, index = 0) {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const entry = countries.find((c) => c[1] === code) || countries[index % countries.length];
  const [name, id, primary, secondary] = entry;
  ctx.fillStyle = primary; ctx.fillRect(0, 0, 512, 256);
  const stripes = (colors, horizontal = true) => colors.forEach((color, i) => {
    ctx.fillStyle = color;
    if (horizontal) ctx.fillRect(0, i * 256 / colors.length, 512, 256 / colors.length + 1);
    else ctx.fillRect(i * 512 / colors.length, 0, 512 / colors.length + 1, 256);
  });

  if (['US','CA','MX','MY','LR','GR','TH','RU','NL','DE','ES','AT','HU','BG','HR','RS','AR','UY','CO','BE','RO','IE','IT','FR','NG','PE','CL','PL','ID','JP','KR','BR','PT','ZA','AE','KW','QA','SD'].includes(id)) {
    const designs = {
      US: () => { stripes(Array.from({length:13}, (_,i)=>i%2?'#fff':'#b22234')); ctx.fillStyle='#3c3b6e';ctx.fillRect(0,0,220,140);ctx.fillStyle='#fff';for(let r=0;r<5;r++)for(let c=0;c<6;c++)star(ctx,18+c*35+(r%2)*16,16+r*27,6,2.5); },
      CA: () => { ctx.fillStyle='#d80621';ctx.fillRect(0,0,512,256);ctx.fillStyle='#fff';ctx.fillRect(128,0,256,256);ctx.fillStyle='#d80621';ctx.beginPath();ctx.moveTo(256,46);ctx.lineTo(277,91);ctx.lineTo(310,77);ctx.lineTo(300,111);ctx.lineTo(335,116);ctx.lineTo(285,151);ctx.lineTo(294,187);ctx.lineTo(256,171);ctx.lineTo(218,187);ctx.lineTo(227,151);ctx.lineTo(177,116);ctx.lineTo(212,111);ctx.lineTo(202,77);ctx.lineTo(235,91);ctx.closePath();ctx.fill(); },
      MX: () => { stripes(['#006847','#fff','#ce1126'],false);ctx.fillStyle='#8b5a2b';ctx.beginPath();ctx.arc(256,128,22,0,Math.PI*2);ctx.fill();ctx.fillStyle='#277447';ctx.beginPath();ctx.arc(256,118,28,Math.PI,0);ctx.fill(); },
      MY: () => { stripes(Array.from({length:14},(_,i)=>i%2?'#fff':'#cc0001'));ctx.fillStyle='#010066';ctx.fillRect(0,0,245,140);ctx.fillStyle='#ffcc00';ctx.beginPath();ctx.arc(82,69,42,0,Math.PI*2);ctx.fill();ctx.fillStyle='#010066';ctx.beginPath();ctx.arc(96,58,34,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffcc00';star(ctx,143,69,26,10,14); },
      LR: () => { stripes(Array.from({length:11},(_,i)=>i%2?'#fff':'#bf0a30'));ctx.fillStyle='#002868';ctx.fillRect(0,0,190,116);ctx.fillStyle='#fff';star(ctx,95,58,37,15); },
      GR: () => { stripes(Array.from({length:9},(_,i)=>i%2?'#fff':'#0d5eaf'));ctx.fillStyle='#0d5eaf';ctx.fillRect(0,0,210,142);ctx.fillStyle='#fff';ctx.fillRect(82,0,39,142);ctx.fillRect(0,52,210,39); },
      TH: () => stripes(['#a51931','#fff','#2d2a4a','#2d2a4a','#fff','#a51931']),
      RU: () => stripes(['#fff','#0039a6','#d52b1e']), NL: () => stripes(['#ae1c28','#fff','#21468b']),
      DE: () => stripes(['#000','#dd0000','#ffce00']), ES: () => stripes(['#aa151b','#f1bf00','#aa151b']),
      AT: () => stripes(['#ed2939','#fff','#ed2939']), HU: () => stripes(['#ce2939','#fff','#477050']),
      BG: () => stripes(['#fff','#00966e','#d62612']), HR: () => stripes(['#ff0000','#fff','#171796']),
      RS: () => stripes(['#c6363c','#0c4076','#fff']), AR: () => { stripes(['#74acdf','#fff','#74acdf']);ctx.fillStyle='#f6b40e';ctx.beginPath();ctx.arc(256,128,28,0,Math.PI*2);ctx.fill(); },
      UY: () => { stripes(['#fff','#fff','#0038a8','#fff','#fff','#0038a8','#fff','#fff','#0038a8']);ctx.fillStyle='#fff';ctx.fillRect(0,0,140,115);ctx.fillStyle='#f6b40e';ctx.beginPath();ctx.arc(70,58,29,0,Math.PI*2);ctx.fill(); },
      CO: () => stripes(['#fcd116','#fcd116','#003893','#ce1126']),
      BE: () => stripes(['#000','#fae042','#ed2939'],false), RO: () => stripes(['#002b7f','#fcd116','#ce1126'],false),
      IE: () => stripes(['#169b62','#fff','#ff883e'],false), IT: () => stripes(['#009246','#fff','#ce2b37'],false),
      FR: () => stripes(['#0055a4','#fff','#ef4135'],false), NG: () => stripes(['#008751','#fff','#008751'],false),
      PE: () => stripes(['#d91023','#fff','#d91023'],false), CL: () => { stripes(['#fff','#d52b1e']);ctx.fillStyle='#0039a6';ctx.fillRect(0,0,125,128);ctx.fillStyle='#fff';star(ctx,62,62,36,15); },
      PL: () => stripes(['#fff','#dc143c']), ID: () => stripes(['#ce1126','#fff']), JP: () => {ctx.fillStyle='#fff';ctx.fillRect(0,0,512,256);ctx.fillStyle='#bc002d';ctx.beginPath();ctx.arc(256,128,70,0,Math.PI*2);ctx.fill();},
      KR: () => {ctx.fillStyle='#fff';ctx.fillRect(0,0,512,256);ctx.fillStyle='#cd2e3a';ctx.beginPath();ctx.arc(256,128,59,Math.PI,0);ctx.fill();ctx.fillStyle='#0047a0';ctx.beginPath();ctx.arc(256,128,59,0,Math.PI);ctx.fill();},
      BR: () => {ctx.fillStyle='#009b3a';ctx.fillRect(0,0,512,256);ctx.fillStyle='#ffdf00';ctx.beginPath();ctx.moveTo(256,34);ctx.lineTo(465,128);ctx.lineTo(256,222);ctx.lineTo(47,128);ctx.fill();ctx.fillStyle='#002776';ctx.beginPath();ctx.arc(256,128,62,0,Math.PI*2);ctx.fill();},
      PT: () => stripes(['#006600','#ff0000'],false), ZA: () => {stripes(['#de3831','#fff']);ctx.fillStyle='#002395';ctx.fillRect(0,130,512,126);ctx.fillStyle='#ffb81c';ctx.beginPath();ctx.moveTo(0,22);ctx.lineTo(232,128);ctx.lineTo(0,234);ctx.lineTo(0,195);ctx.lineTo(155,128);ctx.lineTo(0,61);ctx.fill();ctx.fillStyle='#007749';ctx.beginPath();ctx.moveTo(0,52);ctx.lineTo(167,128);ctx.lineTo(0,204);ctx.lineTo(0,165);ctx.lineTo(84,128);ctx.lineTo(0,91);ctx.fill();},
      AE: () => {stripes(['#00732f','#fff','#000']);ctx.fillStyle='#ff0000';ctx.fillRect(0,0,100,256);},
      KW: () => {stripes(['#007a3d','#fff','#ce1126']);ctx.fillStyle='#000';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(105,40);ctx.lineTo(105,216);ctx.lineTo(0,256);ctx.fill();},
      QA: () => {ctx.fillStyle='#8a1538';ctx.fillRect(0,0,512,256);ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(0,0);for(let y=0;y<256;y+=32){ctx.lineTo(110,y+16);ctx.lineTo(0,y+32);}ctx.closePath();ctx.fill();},
      SD: () => {stripes(['#d21034','#fff','#000']);ctx.fillStyle='#007229';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(175,128);ctx.lineTo(0,256);ctx.fill();}
    };
    if (designs[id]) designs[id]();
  } else if (['MA','TN','TR','DZ','EG','GH','CN','VN','CM','CI','SN','ET','IN','SA','IL','PH','JM','TZ','KE','NP','CH','DK','NO','SE','IS','GB','NZ','AU','PK'].includes(id)) {
    if (id === 'MA' || id === 'TN' || id === 'TR') {
      ctx.fillStyle=primary;ctx.fillRect(0,0,512,256);ctx.strokeStyle=secondary;ctx.lineWidth=10;
      if(id==='MA'){ctx.fillStyle=secondary;star(ctx,256,128,48,21);}
      else {ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(256,128,65,0,Math.PI*2);ctx.fill();ctx.fillStyle=primary;ctx.beginPath();ctx.arc(278,120,52,0,Math.PI*2);ctx.fill();ctx.fillStyle='#e30a17';star(ctx,298,128,25,10);}
    } else if (id==='DZ') {ctx.fillStyle='#fff';ctx.fillRect(0,0,256,256);ctx.fillStyle='#006233';ctx.fillRect(256,0,256,256);ctx.fillStyle='#d21034';ctx.beginPath();ctx.arc(256,128,57,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(277,113,47,0,Math.PI*2);ctx.fill();ctx.fillStyle='#d21034';star(ctx,299,128,26,11);}
    else if (id==='EG') {stripes(['#ce1126','#fff','#000']);ctx.fillStyle='#c09300';ctx.beginPath();ctx.arc(256,128,22,0,Math.PI*2);ctx.fill();}
    else if (id==='PK') {ctx.fillStyle='#01411c';ctx.fillRect(0,0,512,256);ctx.fillStyle='#fff';ctx.fillRect(0,0,95,256);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(276,128,63,0,Math.PI*2);ctx.fill();ctx.fillStyle='#01411c';ctx.beginPath();ctx.arc(300,111,51,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';star(ctx,333,112,24,10);}
    else if (id==='IN') {stripes(['#ff9933','#fff','#138808']);ctx.fillStyle='#000080';ctx.strokeStyle='#000080';ctx.lineWidth=4;ctx.beginPath();ctx.arc(256,128,32,0,Math.PI*2);ctx.stroke();for(let i=0;i<24;i++){ctx.beginPath();ctx.moveTo(256,96);ctx.lineTo(256,160);ctx.stroke();ctx.rotate(Math.PI/12);}}
    else if (id==='CN') {ctx.fillStyle='#de2910';ctx.fillRect(0,0,512,256);ctx.fillStyle='#ffde00';star(ctx,115,75,48,20);star(ctx,200,40,17,7);star(ctx,225,78,17,7);star(ctx,225,120,17,7);star(ctx,199,155,17,7);}
    else if (id==='GH') {stripes(['#ce1126','#fcd116','#006b3f']);ctx.fillStyle='#000';star(ctx,256,128,30,13);}
    else if (id==='VN') {ctx.fillStyle='#da251d';ctx.fillRect(0,0,512,256);ctx.fillStyle='#ff0';star(ctx,256,128,65,27);}
    else if (id==='ET') {stripes(['#078930','#fcd116','#da121a']);ctx.fillStyle='#0f47af';ctx.beginPath();ctx.arc(256,128,44,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fcd116';star(ctx,256,128,30,13);}
    else if (id==='SA') {ctx.fillStyle='#006c35';ctx.fillRect(0,0,512,256);ctx.fillStyle='#fff';ctx.fillRect(125,162,265,9);ctx.fillRect(170,172,172,5);}
    else if (id==='IL') {ctx.fillStyle='#fff';ctx.fillRect(0,0,512,256);ctx.fillStyle='#0038b8';ctx.fillRect(0,45,512,22);ctx.fillRect(0,189,512,22);ctx.strokeStyle='#0038b8';ctx.lineWidth=8;for(const y of [103,153]){ctx.beginPath();ctx.moveTo(256,y-22);ctx.lineTo(286,y+28);ctx.lineTo(226,y+28);ctx.closePath();ctx.stroke();}}
    else if (id==='JM') {ctx.fillStyle='#009b3a';ctx.fillRect(0,0,512,256);ctx.fillStyle='#ffb81c';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(44,0);ctx.lineTo(512,212);ctx.lineTo(512,256);ctx.lineTo(468,256);ctx.lineTo(0,44);ctx.fill();ctx.beginPath();ctx.moveTo(512,0);ctx.lineTo(468,0);ctx.lineTo(0,212);ctx.lineTo(0,256);ctx.lineTo(44,256);ctx.lineTo(512,44);ctx.fill();ctx.fillStyle='#000';ctx.fillRect(0,0,512,23);ctx.fillRect(0,233,512,23);}
    else if (id==='GB' || id==='AU' || id==='NZ') {ctx.fillStyle=id==='GB'?'#012169':'#012169';ctx.fillRect(0,0,512,256);ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(45,0);ctx.lineTo(512,220);ctx.lineTo(512,256);ctx.lineTo(467,256);ctx.lineTo(0,36);ctx.fill();ctx.beginPath();ctx.moveTo(512,0);ctx.lineTo(467,0);ctx.lineTo(0,220);ctx.lineTo(0,256);ctx.lineTo(45,256);ctx.lineTo(512,36);ctx.fill();ctx.fillStyle='#c8102e';ctx.fillRect(0,104,512,48);ctx.fillRect(228,0,56,256);ctx.fillStyle='#fff';ctx.fillRect(0,113,512,30);ctx.fillRect(237,0,38,256);if(id!=='GB'){ctx.fillStyle='#fff';for(const [x,y] of [[350,75],[430,145],[340,200],[465,65]])star(ctx,x,y,8,3);}}
    else if (id==='CH') {ctx.fillStyle='#d52b1e';ctx.fillRect(0,0,512,256);ctx.fillStyle='#fff';ctx.fillRect(220,65,72,126);ctx.fillRect(193,92,126,72);}
    else if (['DK','NO','SE','IS'].includes(id)) {const base={DK:'#c60c30',NO:'#ba0c2f',SE:'#006aa7',IS:'#003897'}[id];ctx.fillStyle=base;ctx.fillRect(0,0,512,256);ctx.fillStyle='#fff';ctx.fillRect(140,0,74,256);ctx.fillRect(0,91,512,74);if(id!=='DK'){ctx.fillStyle=id==='SE'?'#fecc00':'#003897';if(id==='NO')ctx.fillStyle='#00205b';if(id==='IS')ctx.fillStyle='#d72828';ctx.fillRect(159,0,36,256);ctx.fillRect(0,110,512,36);}}
    else if (id==='NP') {ctx.fillStyle='#dc143c';ctx.fillRect(100,0,310,256);ctx.fillStyle='#003893';ctx.beginPath();ctx.moveTo(100,0);ctx.lineTo(336,104);ctx.lineTo(100,104);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(100,103);ctx.lineTo(378,246);ctx.lineTo(100,246);ctx.closePath();ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(168,67,20,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(175,180,28,0,Math.PI*2);ctx.fill();}
    else if (id==='PH') {stripes(['#0038a8','#ce1126']);ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(200,128);ctx.lineTo(0,256);ctx.fill();ctx.fillStyle='#fcd116';star(ctx,85,128,29,12);ctx.beginPath();ctx.arc(42,128,8,0,Math.PI*2);ctx.fill();}
    else if (id==='TZ') {ctx.fillStyle='#1eb53a';ctx.fillRect(0,0,512,256);ctx.fillStyle='#00a3dd';ctx.fillRect(0,110,512,146);ctx.fillStyle='#fcd116';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(512,0);ctx.lineTo(0,256);ctx.fill();ctx.beginPath();ctx.moveTo(512,0);ctx.lineTo(512,256);ctx.lineTo(0,256);ctx.fill();ctx.fillStyle='#000';ctx.beginPath();ctx.moveTo(0,74);ctx.lineTo(512,188);ctx.lineTo(512,213);ctx.lineTo(0,99);ctx.fill();}
    else {stripes([primary,secondary,primary]);}
  } else {
    stripes([primary, secondary, primary]);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return { texture, name };
}

export function getCountries() { return countries.map(([name, code]) => ({ name, code })); }
