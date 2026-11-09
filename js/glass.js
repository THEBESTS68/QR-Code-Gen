/* Liquid Glass effects + background control.
   Everything here is event-driven: no animation loop runs on its own. */
(function(){
'use strict';

const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
// Refraction through `backdrop-filter:url(#svg)` only renders in Chromium (Chrome, Edge, Opera...)
const canRefract=!!window.chrome&&CSS.supports('backdrop-filter','url(#x)');
const SVG_NS='http://www.w3.org/2000/svg';

/* ---------- 1. Background: pause when the tab is hidden ---------- */
const syncPause=()=>document.documentElement.classList.toggle('fx-paused',document.hidden);
document.addEventListener('visibilitychange',syncPause);
syncPause();

/* ---------- 2. Specular highlight that follows the pointer ---------- */
// One delegated listener, at most one style write per frame.
const GLASS='.btn,.swap-btn';
let pending=null,raf=0;
document.addEventListener('pointermove',e=>{
 if(e.pointerType!=='mouse')return;
 const el=e.target.closest&&e.target.closest(GLASS);
 if(!el)return;
 pending={el,x:e.clientX,y:e.clientY};
 if(!raf)raf=requestAnimationFrame(()=>{
  raf=0;
  const {el,x,y}=pending,r=el.getBoundingClientRect();
  el.style.setProperty('--mx',(x-r.left)+'px');
  el.style.setProperty('--my',(y-r.top)+'px');
 });
},{passive:true});

/* ---------- 3. Liquid Glass lens ---------- */
let svgRoot=null,lensCount=0;
function ensureSvgRoot(){
 if(svgRoot)return svgRoot;
 svgRoot=document.createElementNS(SVG_NS,'svg');
 svgRoot.setAttribute('aria-hidden','true');
 svgRoot.setAttribute('width','0');svgRoot.setAttribute('height','0');
 svgRoot.style.cssText='position:absolute;width:0;height:0;overflow:hidden';
 document.body.appendChild(svgRoot);
 return svgRoot;
}

const SCALE=48; // max displacement range in px (map value 0..255 -> -24..+24 px)

// Builds a displacement map for a pill of w×h: content is pulled toward the
// center (a gentle magnifier), and much more strongly inside the curved bezel
// near the edge, which is what gives the "liquid" refracted rim.
function buildMap(w,h,radius){
 const c=document.createElement('canvas');c.width=w;c.height=h;
 const ctx=c.getContext('2d'),img=ctx.createImageData(w,h),d=img.data;
 const cx=w/2,cy=h/2,r=Math.min(radius,cx,cy);
 const bezel=Math.min(r,12),edgePush=Math.min(h*.3,10),zoom=1-1/1.1;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const px=x+.5-cx,py=y+.5-cy;
  const qx=Math.abs(px)-(cx-r),qy=Math.abs(py)-(cy-r);
  // signed distance to the rounded-rect edge (negative = inside)
  const ox=Math.max(qx,0),oy=Math.max(qy,0);
  const sd=Math.hypot(ox,oy)+Math.min(Math.max(qx,qy),0)-r;
  let vx=0,vy=0;
  if(sd<0){
   const depth=-sd;
   // outward normal of the nearest edge
   let nx,ny;
   if(qx>0&&qy>0){const l=Math.hypot(qx,qy)||1;nx=Math.sign(px)*qx/l;ny=Math.sign(py)*qy/l}
   else if(qx>qy){nx=Math.sign(px);ny=0}else{nx=0;ny=Math.sign(py)}
   const t=depth<bezel?1-depth/bezel:0,s=t*t*edgePush;
   // vertical bend kept softer so Thai vowel/tone marks stay readable
   vx=-nx*s-px*zoom;vy=(-ny*s-py*zoom)*.45;
  }
  const i=(y*w+x)*4;
  d[i]=Math.max(0,Math.min(255,128+vx/SCALE*255));
  d[i+1]=Math.max(0,Math.min(255,128+vy/SCALE*255));
  d[i+2]=128;d[i+3]=255;
 }
 ctx.putImageData(img,0,0);
 return c.toDataURL();
}

function createFilter(id){
 const f=document.createElementNS(SVG_NS,'filter');
 f.id=id;
 f.setAttribute('filterUnits','userSpaceOnUse');
 f.setAttribute('x','-40');f.setAttribute('y','-40');
 f.setAttribute('width','2000');f.setAttribute('height','400');
 f.setAttribute('color-interpolation-filters','sRGB');
 // Neutral grey under the map, so anything outside it is left undisplaced
 f.innerHTML=
  '<feFlood flood-color="rgb(128,128,128)" result="neutral"/>'+
  '<feImage result="img" x="0" y="0" preserveAspectRatio="none"/>'+
  '<feComposite in="img" in2="neutral" operator="over" result="map"/>'+
  '<feDisplacementMap in="SourceGraphic" in2="map" scale="'+SCALE+'" xChannelSelector="R" yChannelSelector="G" result="bent"/>'+
  '<feColorMatrix in="bent" type="saturate" values="1.35"/>';
 ensureSvgRoot().appendChild(f);
 return f.querySelector('feImage');
}

function attachLens(container,activeSelector,attr){
 if(!container)return;
 container.classList.add('has-lens');
 const lens=document.createElement('span');
 lens.className='glass-lens';lens.setAttribute('aria-hidden','true');
 container.appendChild(lens);

 let feImage=null,mapKey='';
 if(canRefract){
  const id='glass-lens-'+(lensCount++);
  feImage=createFilter(id);
  lens.style.backdropFilter='url(#'+id+')';
 }

 let last=null;
 function place(animate){
  const el=container.querySelector(activeSelector);
  if(!el||!el.offsetWidth)return;
  const w=el.offsetWidth,h=el.offsetHeight;
  if(animate&&last&&last!==el&&!reduceMotion.matches){
   lens.classList.remove('moving');void lens.offsetWidth;lens.classList.add('moving');
  }
  last=el;
  lens.style.translate=el.offsetLeft+'px '+el.offsetTop+'px';
  lens.style.width=w+'px';lens.style.height=h+'px';
  if(feImage){
   const key=w+'x'+h;
   if(key!==mapKey){
    mapKey=key;
    const radius=parseFloat(getComputedStyle(lens).borderTopLeftRadius)||10;
    feImage.setAttribute('width',w);feImage.setAttribute('height',h);
    feImage.setAttribute('href',buildMap(w,h,radius));
   }
  }
 }
 lens.addEventListener('animationend',()=>lens.classList.remove('moving'));

 // react to script.js changing the selection
 new MutationObserver(()=>place(true))
  .observe(container,{subtree:true,attributes:true,attributeFilter:[attr]});
 // keep in place when fonts load / the layout resizes
 new ResizeObserver(()=>place(false)).observe(container);

 place(false);
 requestAnimationFrame(()=>requestAnimationFrame(()=>lens.classList.add('ready')));
}

attachLens(document.querySelector('.tabs'),'.tab[aria-selected="true"]','aria-selected');
attachLens(document.querySelector('.segmented'),'button[aria-pressed="true"]','aria-pressed');
})();
