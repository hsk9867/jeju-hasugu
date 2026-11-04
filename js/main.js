(function(){
  'use strict';
  var d=document,w=window;
  function $$(s,r){return Array.prototype.slice.call((r||d).querySelectorAll(s));}
  /* 0) 메인 2x2 영상 재생 보장 */
  $$('.vgrid video').forEach(function(v){var p=v.play();if(p&&p.catch)p.catch(function(){});});
  /* 1) 등장 효과 — JS가 있을 때만 숨겼다가 보이면 표시 */
  var rv=$$('.reveal');
  if(!('IntersectionObserver' in w)){rv.forEach(function(e){e.classList.add('in');});}
  else{var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}});},{threshold:.12,rootMargin:'0px 0px -40px 0px'});rv.forEach(function(e){io.observe(e);});}
  /* 2) 막힌 곳 탭 — JS 없으면 전부 펼쳐 보임 */
  $$('[data-tabs]').forEach(function(root){
    var btns=$$('[role=tab]',root),panels=$$('[role=tabpanel]',root);
    function sel(i,focus){btns.forEach(function(b,j){var on=j===i;b.classList.toggle('on',on);b.setAttribute('aria-selected',on?'true':'false');b.tabIndex=on?0:-1;});
      panels.forEach(function(p,j){p.hidden=j!==i;});if(focus)btns[i].focus();}
    btns.forEach(function(b,i){b.addEventListener('click',function(){sel(i);});
      b.addEventListener('keydown',function(e){if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();sel((i+(e.key==='ArrowRight'?1:btns.length-1))%btns.length,true);}});});
    sel(0);
  });
  /* 3) 하단 고정 바 — 첫 화면 전화 버튼·마지막 전화 영역이 보이면 숨김 */
  var bbar=d.querySelector('.bbar'),hideT=$$('[data-hide-bbar]');
  if(bbar&&hideT.length&&'IntersectionObserver' in w){var vis=[];
    var io2=new IntersectionObserver(function(en){en.forEach(function(x){var i=vis.indexOf(x.target);if(x.isIntersecting&&i<0)vis.push(x.target);if(!x.isIntersecting&&i>-1)vis.splice(i,1);});bbar.classList.toggle('is-hidden',vis.length>0);},{threshold:.2});
    hideT.forEach(function(t){io2.observe(t);});}
  /* 4) 현장 영상 — 화면에 보일 때만 재생 (움직임 줄이기 설정이면 자동재생 안 함) */
  var vids=$$('video[data-autoplay]'),reduce=w.matchMedia&&w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(vids.length){
    if(reduce||!('IntersectionObserver' in w)){vids.forEach(function(v){v.controls=true;});}
    else{var io3=new IntersectionObserver(function(en){en.forEach(function(x){var v=x.target;
      if(x.isIntersecting){v.preload='auto';var p=v.play();if(p&&p.catch)p.catch(function(){v.controls=true;});}else{v.pause();}});},{threshold:.35});
      vids.forEach(function(v){io3.observe(v);});}
  }
})();
