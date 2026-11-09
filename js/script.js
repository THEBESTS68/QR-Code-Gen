const $=id=>document.getElementById(id);
const DEFAULTS={type:'url',dots:'square',cornersSquare:'square',cornersDot:'square',gradient:false,
 color1:'#000000',color2:'#000000',bg:'#ffffff',gradientType:'linear',rotation:270,
 logoSize:30,radius:0,margin:1,size:1000,format:'png'};
const PRESETS=[
 {name:'คลาสสิก',dots:'square',cornersSquare:'square',cornersDot:'square',gradient:false,color1:'#000000',color2:'#000000',bg:'#ffffff'},
 {name:'Sunset',dots:'rounded',cornersSquare:'extra-rounded',cornersDot:'dot',gradient:true,color1:'#ff6b4a',color2:'#8b5cf6',bg:'#ffffff',rotation:45},
 {name:'Ocean',dots:'dots',cornersSquare:'extra-rounded',cornersDot:'dot',gradient:true,color1:'#0ea5e9',color2:'#1e3a8a',bg:'#ffffff',rotation:90},
 {name:'Forest',dots:'classy-rounded',cornersSquare:'extra-rounded',cornersDot:'square',gradient:true,color1:'#16a34a',color2:'#14532d',bg:'#f7fdf8',rotation:135},
 {name:'Grape',dots:'extra-rounded',cornersSquare:'dot',cornersDot:'dot',gradient:true,color1:'#a855f7',color2:'#4c1d95',bg:'#ffffff',rotation:270,gradientType:'radial'},
 {name:'Night',dots:'rounded',cornersSquare:'extra-rounded',cornersDot:'dot',gradient:false,color1:'#f8fafc',color2:'#f8fafc',bg:'#111827'},
];
const MARGIN_LABELS=['ไม่มี','ปกติ','กว้าง','กว้างมาก'];
const PREVIEW_SIZE=600;

const state={...DEFAULTS};
let currentLogo=null;

/* ---------- Content ---------- */
function wifiEscape(s){return s.replace(/([\\;,:"])/g,'\\$1')}
function getData(){
 switch(state.type){
  case 'url':{
   let v=$('urlInput').value.trim();
   if(v && !/^[a-z][a-z0-9+.-]*:/i.test(v)) v='https://'+v;
   return v;
  }
  case 'text':return $('textInput').value;
  case 'wifi':{
   const ssid=$('wifiSsid').value.trim();
   if(!ssid) return '';
   const sec=$('wifiSec').value;
   const pass=sec==='nopass'?'':$('wifiPass').value;
   return `WIFI:T:${sec};S:${wifiEscape(ssid)};${pass?`P:${wifiEscape(pass)};`:''};`;
  }
  case 'email':{
   const to=$('emailTo').value.trim();
   if(!to) return '';
   const q=[];
   if($('emailSubject').value.trim()) q.push('subject='+encodeURIComponent($('emailSubject').value.trim()));
   if($('emailBody').value.trim()) q.push('body='+encodeURIComponent($('emailBody').value.trim()));
   return 'mailto:'+to+(q.length?'?'+q.join('&'):'');
  }
  case 'phone':{
   const p=$('phoneInput').value.replace(/[^\d+]/g,'');
   return p?'tel:'+p:'';
  }
 }
 return '';
}
function describeData(){
 const d=getData();
 if(!d) return '';
 if(state.type==='wifi') return 'Wi‑Fi: '+$('wifiSsid').value.trim();
 return d;
}

/* ---------- QR config ---------- */
function makeConfig(size){
 const data=getData()||' ';
 const fill=state.gradient
  ?{gradient:{type:state.gradientType,rotation:state.rotation*Math.PI/180,colorStops:[{offset:0,color:state.color1},{offset:1,color:state.color2}]}}
  :{color:state.color1,gradient:undefined};
 return {
  width:size,height:size,type:'canvas',data,
  margin:Math.round(size*[0,.04,.08,.12][state.margin]),
  image:currentLogo||undefined,
  qrOptions:{errorCorrectionLevel:currentLogo?'H':'Q'},
  dotsOptions:{type:state.dots,...fill},
  cornersSquareOptions:{type:state.cornersSquare,...fill},
  cornersDotOptions:{type:state.cornersDot,...fill},
  backgroundOptions:{color:state.bg},
  imageOptions:{crossOrigin:'anonymous',hideBackgroundDots:true,imageSize:state.logoSize/100,margin:Math.round(size*.008)}
 };
}

const qr=new QRCodeStyling(makeConfig(PREVIEW_SIZE));
qr.append($('qrCanvas'));

let frame=0;
function scheduleUpdate(){
 $('liveText').textContent='กำลังอัปเดต…';$('liveText').classList.add('busy');
 cancelAnimationFrame(frame);
 frame=requestAnimationFrame(update);
}
function update(){
 qr.update(makeConfig(PREVIEW_SIZE));
 requestAnimationFrame(()=>{
  const el=document.querySelector('#qrCanvas canvas');
  if(el) el.style.borderRadius=(state.radius/1000*100)+'%';
 });
 syncUI();
 const hasData=!!getData();
 $('encodedText').textContent=hasData?describeData():'ยังไม่มีข้อมูล — กรอกในขั้นที่ 1';
 $('encoded').title=describeData();
 ['downloadBtn','downloadBtnMobile','copyBtn'].forEach(id=>$(id).disabled=!hasData);
 $('liveText').textContent=hasData?'พร้อมสแกน':'รอข้อมูล';
 $('liveText').classList.toggle('busy',!hasData);
 $('qrStage').classList.toggle('empty',!hasData);
}

/* ---------- UI sync ---------- */
function syncUI(){
 document.querySelectorAll('#dotChips .chip').forEach(c=>c.setAttribute('aria-pressed',c.dataset.value===state.dots));
 document.querySelectorAll('#presets .preset').forEach((b,i)=>b.setAttribute('aria-pressed',matchesPreset(PRESETS[i])));
 $('cornersSquareType').value=state.cornersSquare;
 $('cornersDotType').value=state.cornersDot;
 $('modeSolid').setAttribute('aria-pressed',!state.gradient);
 $('modeGradient').setAttribute('aria-pressed',state.gradient);
 $('color2Field').hidden=!state.gradient;
 $('gradientFields').hidden=!state.gradient;
 $('color1Label').textContent=state.gradient?'สีเริ่มต้น':'สี QR';
 $('color1').value=state.color1;$('color2').value=state.color2;$('bgColor').value=state.bg;
 $('color1Hex').textContent=state.color1.toUpperCase();
 $('color2Hex').textContent=state.color2.toUpperCase();
 $('bgColorHex').textContent=state.bg.toUpperCase();
 $('gradientType').value=state.gradientType;
 $('gradientRotation').value=state.rotation;$('rotationValue').textContent=state.rotation+'°';
 $('logoSize').value=state.logoSize;$('logoSizeValue').textContent=state.logoSize+'%';
 $('logoSize').disabled=!currentLogo;
 $('canvasRadius').value=state.radius;$('radiusValue').textContent=state.radius+' px';
 $('margin').value=state.margin;$('marginValue').textContent=MARGIN_LABELS[state.margin];
 $('sizeSelect').value=state.size;
 $('formatSelect').value=state.format;
 checkContrast();
}
function matchesPreset(p){
 return ['dots','cornersSquare','cornersDot','gradient','color1','bg'].every(k=>p[k]===state[k])
  && (!p.gradient || p.color2===state.color2);
}

/* Contrast check — QR scanners need dark-on-light with enough contrast */
function luminance(hex){
 const c=[1,3,5].map(i=>parseInt(hex.substr(i,2),16)/255).map(v=>v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4));
 return .2126*c[0]+.7152*c[1]+.0722*c[2];
}
function checkContrast(){
 const fgs=state.gradient?[state.color1,state.color2]:[state.color1];
 const lb=luminance(state.bg);
 const worst=Math.min(...fgs.map(f=>{const l=luminance(f);return (Math.max(l,lb)+.05)/(Math.min(l,lb)+.05)}));
 const inverted=fgs.some(f=>luminance(f)>lb);
 let msg='';
 if(worst<3) msg='สี QR กับพื้นหลังใกล้กันเกินไป อาจสแกนไม่ติด ลองใช้สีเข้มบนพื้นสว่าง';
 else if(inverted) msg='QR สีอ่อนบนพื้นเข้ม — กล้องบางรุ่นอาจสแกนไม่ติด ควรทดสอบสแกนก่อนนำไปใช้';
 $('contrastAlert').hidden=!msg;
 $('contrastText').textContent=msg;
}

/* ---------- Toast ---------- */
let toastTimer;
function toast(msg,isError){
 const t=$('toast');
 t.textContent=msg;t.classList.toggle('error',!!isError);t.classList.add('show');
 clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2400);
}

/* ---------- Events: content ---------- */
document.querySelectorAll('.tab').forEach(tab=>{
 tab.addEventListener('click',()=>{
  state.type=tab.dataset.type;
  document.querySelectorAll('.tab').forEach(t=>t.setAttribute('aria-selected',t===tab));
  document.querySelectorAll('.tab-panel').forEach(p=>p.hidden=p.dataset.panel!==state.type);
  const first=document.querySelector(`.tab-panel[data-panel="${state.type}"] input,.tab-panel[data-panel="${state.type}"] textarea`);
  if(first && window.matchMedia('(min-width:621px)').matches) first.focus();
  scheduleUpdate();
 });
});
['urlInput','textInput','wifiSsid','wifiPass','emailTo','emailSubject','emailBody','phoneInput'].forEach(id=>$(id).addEventListener('input',scheduleUpdate));
$('wifiSec').addEventListener('change',()=>{
 $('wifiPass').disabled=$('wifiSec').value==='nopass';
 scheduleUpdate();
});
$('textInput').addEventListener('input',()=>{$('textCount').textContent=$('textInput').value.length+' / 900'});
$('pwToggle').addEventListener('click',()=>{
 const show=$('wifiPass').type==='password';
 $('wifiPass').type=show?'text':'password';
 $('pwToggle').textContent=show?'ซ่อน':'แสดง';
 $('pwToggle').setAttribute('aria-label',show?'ซ่อนรหัสผ่าน':'แสดงรหัสผ่าน');
});

/* ---------- Events: style ---------- */
const presetWrap=$('presets');
PRESETS.forEach(p=>{
 const b=document.createElement('button');
 b.type='button';b.className='preset';
 const sw=p.gradient?`linear-gradient(135deg,${p.color1},${p.color2})`:p.color1;
 b.innerHTML=`<span class="swatch" style="background:${sw};outline:3px solid ${p.bg};outline-offset:-5px"></span>${p.name}`;
 b.addEventListener('click',()=>applyPreset(p));
 presetWrap.appendChild(b);
});
function applyPreset(p){
 Object.assign(state,{gradientType:'linear',rotation:DEFAULTS.rotation},p);
 delete state.name;
 scheduleUpdate();
}
document.querySelectorAll('#dotChips .chip').forEach(c=>c.addEventListener('click',()=>{state.dots=c.dataset.value;scheduleUpdate()}));
$('modeSolid').addEventListener('click',()=>{state.gradient=false;scheduleUpdate()});
$('modeGradient').addEventListener('click',()=>{
 state.gradient=true;
 if(state.color2===state.color1) state.color2=state.color1==='#000000'?'#8b5cf6':'#000000';
 scheduleUpdate();
});
$('swapColors').addEventListener('click',()=>{
 const bg=state.bg;state.bg=state.color1;state.color1=bg;state.color2=bg;
 state.gradient=false;
 scheduleUpdate();
});
const bind=(id,key,cast=v=>v)=>$(id).addEventListener('input',e=>{state[key]=cast(e.target.value);scheduleUpdate()});
bind('cornersSquareType','cornersSquare');
bind('cornersDotType','cornersDot');
bind('color1','color1');
bind('color2','color2');
bind('bgColor','bg');
bind('gradientType','gradientType');
bind('gradientRotation','rotation',Number);
bind('logoSize','logoSize',Number);
bind('canvasRadius','radius',Number);
bind('margin','margin',Number);
bind('sizeSelect','size',Number);
bind('formatSelect','format');

$('randomBtn').addEventListener('click',()=>{
 const hue=Math.floor(Math.random()*360);
 const hsl=(h,s,l)=>{l/=100;const a=s*Math.min(l,1-l)/100;const f=n=>{const k=(n+h/30)%12;return Math.round(255*(l-a*Math.max(-1,Math.min(k-3,9-k,1)))).toString(16).padStart(2,'0')};return '#'+f(0)+f(8)+f(4)};
 const pick=a=>a[Math.floor(Math.random()*a.length)];
 Object.assign(state,{
  dots:pick(['square','dots','rounded','extra-rounded','classy','classy-rounded']),
  cornersSquare:pick(['square','dot','extra-rounded']),cornersDot:pick(['square','dot']),
  gradient:true,color1:hsl(hue,80,45),color2:hsl((hue+50)%360,75,28),bg:'#ffffff',
  gradientType:pick(['linear','radial']),rotation:pick([0,45,90,135,180,225,270,315])
 });
 scheduleUpdate();
});

/* ---------- Logo ---------- */
const logoInput=$('logoInput'),logoDropZone=$('logoDropZone');
function resetLogoUI(){
 logoDropZone.classList.remove('file-ready','error');
 $('logoThumb').textContent='⬆';
 $('logoDropTitle').textContent='เลือกไฟล์โลโก้';
 $('logoName').textContent='ลากไฟล์มาวาง หรือคลิกเพื่อเลือก • PNG / JPG / WEBP / SVG';
 $('removeLogo').hidden=true;
}
function setLogoFile(file){
 if(!file){
  currentLogo=null;logoInput.value='';resetLogoUI();scheduleUpdate();return;
 }
 if(!/^image\/(png|jpeg|webp|svg\+xml)$/.test(file.type)){
  logoDropZone.classList.remove('file-ready');logoDropZone.classList.add('error');
  $('logoDropTitle').textContent='ไฟล์ไม่รองรับ';
  $('logoName').textContent='กรุณาใช้ PNG, JPG, WEBP หรือ SVG';
  return;
 }
 const reader=new FileReader();
 reader.onload=ev=>{
  currentLogo=ev.target.result;
  logoDropZone.classList.remove('error');logoDropZone.classList.add('file-ready');
  $('logoThumb').innerHTML='';
  const img=new Image();img.src=currentLogo;img.alt='';$('logoThumb').appendChild(img);
  $('logoDropTitle').textContent='ใส่โลโก้แล้ว ✓';
  $('logoName').textContent=file.name;
  $('removeLogo').hidden=false;
  scheduleUpdate();
 };
 reader.readAsDataURL(file);
}
logoInput.addEventListener('change',e=>setLogoFile(e.target.files[0]));
$('removeLogo').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();setLogoFile(null)});
['dragenter','dragover'].forEach(n=>logoDropZone.addEventListener(n,e=>{e.preventDefault();logoDropZone.classList.add('dragover')}));
['dragleave','drop'].forEach(n=>logoDropZone.addEventListener(n,e=>{e.preventDefault();logoDropZone.classList.remove('dragover')}));
logoDropZone.addEventListener('drop',e=>setLogoFile(e.dataTransfer.files&&e.dataTransfer.files[0]));
logoDropZone.addEventListener('keydown',e=>{
 if(e.target!==logoDropZone) return;
 if(e.key==='Enter'||e.key===' '){e.preventDefault();logoInput.click()}
});
window.addEventListener('dragover',e=>e.preventDefault());
window.addEventListener('drop',e=>{if(!logoDropZone.contains(e.target)) e.preventDefault()});

/* ---------- Export ---------- */
function roundedRect(ctx,x,y,w,h,r){
 r=Math.max(0,Math.min(r,Math.min(w,h)/2));
 ctx.beginPath();
 ctx.moveTo(x+r,y);
 ctx.arcTo(x+w,y,x+w,y+h,r);
 ctx.arcTo(x+w,y+h,x,y+h,r);
 ctx.arcTo(x,y+h,x,y,r);
 ctx.arcTo(x,y,x+w,y,r);
 ctx.closePath();
}
async function renderBlob(format){
 const size=state.size;
 const exporter=new QRCodeStyling(makeConfig(size));
 const raw=await exporter.getRawData('png');
 const bmp=await createImageBitmap(raw);
 const canvas=document.createElement('canvas');
 canvas.width=size;canvas.height=size;
 const ctx=canvas.getContext('2d');
 if(format==='jpeg'){ctx.fillStyle='#ffffff';ctx.fillRect(0,0,size,size)}
 // Rounded corners scale with the export size so the file matches the preview.
 ctx.save();
 roundedRect(ctx,0,0,size,size,state.radius/1000*size);
 ctx.clip();
 ctx.drawImage(bmp,0,0,size,size);
 ctx.restore();
 return new Promise(res=>canvas.toBlob(res,'image/'+format,.95));
}
function fileName(ext){return 'QR CodeGen By DBC.'+ext}
async function download(){
 if(!getData()){toast('กรอกข้อมูลก่อนดาวน์โหลด',true);return}
 try{
  let blob;
  if(state.format==='svg'){
   const exporter=new QRCodeStyling({...makeConfig(state.size),type:'svg'});
   blob=await exporter.getRawData('svg');
  }else{
   blob=await renderBlob(state.format);
  }
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=fileName(state.format==='jpeg'?'jpg':state.format);
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  toast('ดาวน์โหลดแล้ว ✓');
 }catch(err){
  console.error(err);toast('ดาวน์โหลดไม่สำเร็จ ลองใหม่อีกครั้ง',true);
 }
}
$('downloadBtn').addEventListener('click',download);
$('downloadBtnMobile').addEventListener('click',download);
$('copyBtn').addEventListener('click',async()=>{
 if(!navigator.clipboard||!window.ClipboardItem){toast('เบราว์เซอร์นี้ไม่รองรับการคัดลอกรูป',true);return}
 try{
  await navigator.clipboard.write([new ClipboardItem({'image/png':renderBlob('png')})]);
  toast('คัดลอกรูปแล้ว วางได้เลย ✓');
 }catch(err){
  console.error(err);toast('คัดลอกไม่สำเร็จ',true);
 }
});

/* ---------- Reset ---------- */
$('resetBtn').addEventListener('click',()=>{
 Object.assign(state,DEFAULTS);
 $('urlInput').value='https://google.com';
 ['textInput','wifiSsid','wifiPass','emailTo','emailSubject','emailBody','phoneInput'].forEach(id=>$(id).value='');
 $('textCount').textContent='0 / 900';
 document.querySelector('.tab[data-type="url"]').click();
 setLogoFile(null);
 toast('รีเซ็ตค่าแล้ว');
});

/* ---------- Theme ---------- */
const themeToggle=$('themeToggle');
function applyTheme(theme){
 document.body.classList.toggle('light',theme==='light');
 themeToggle.title=theme==='light'?'เปลี่ยนเป็นโหมดมืด':'เปลี่ยนเป็นโหมดสว่าง';
 themeToggle.setAttribute('aria-label',themeToggle.title);
 try{localStorage.setItem('qrStudioTheme',theme)}catch(e){}
}
let savedTheme=null;
try{savedTheme=localStorage.getItem('qrStudioTheme')}catch(e){}
applyTheme(savedTheme||(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'));
themeToggle.addEventListener('click',()=>{
 // replay the press animation (see .theme-switch.switching in styles.css)
 themeToggle.classList.remove('switching');void themeToggle.offsetWidth;themeToggle.classList.add('switching');
 applyTheme(document.body.classList.contains('light')?'dark':'light');
});
themeToggle.addEventListener('animationend',e=>{if(e.animationName==='ts-press')themeToggle.classList.remove('switching')});

update();
