/* Adds the orbiting star particles to every .sparkle-button.
   They only animate while the button is hovered/focused (see styles.css). */
(function(){
'use strict';
const COUNT=12;
const STAR='<path d="M6.937 3.846L7.75 1L8.563 3.846C8.77313 4.58114 9.1671 5.25062 9.70774 5.79126C10.2484 6.3319 10.9179 6.72587 11.653 6.936L14.5 7.75L11.654 8.563C10.9189 8.77313 10.2494 9.1671 9.70874 9.70774C9.1681 10.2484 8.77413 10.9179 8.564 11.653L7.75 14.5L6.937 11.654C6.72687 10.9189 6.3329 10.2494 5.79226 9.70874C5.25162 9.1681 4.58214 8.77413 3.847 8.564L1 7.75L3.846 6.937C4.58114 6.72687 5.25062 6.3329 5.79126 5.79226C6.3319 5.25162 6.72587 4.58214 6.936 3.847L6.937 3.846Z"/>';
const rand=(min,max)=>Math.floor(Math.random()*(max-min+1)+min);
const orbit=()=>(Math.random()>.5?-1:1)*rand(300,800)+'%';

document.querySelectorAll('.sparkle-button').forEach(wrap=>{
 const pen=document.createElement('span');
 pen.className='particle-pen';
 pen.setAttribute('aria-hidden','true');
 let html='';
 for(let i=0;i<COUNT;i++){
  const style=
   '--x:'+rand(20,80)+';--y:'+rand(20,80)+';'+
   '--duration:'+rand(6,20)+';--delay:'+rand(1,10)+';'+
   '--alpha:'+rand(40,90)/100+';--size:'+rand(40,90)/100+';'+
   '--origin-x:'+orbit()+';--origin-y:'+orbit();
  html+='<svg class="particle" viewBox="0 0 15 15" style="'+style+'">'+STAR+'</svg>';
 }
 pen.innerHTML=html;
 wrap.appendChild(pen);
});
})();
