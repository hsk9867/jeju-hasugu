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
  /* 5) 슬라이더 — 자동 넘김 + 손으로 넘기기(터치·마우스 드래그) + 버튼·점 */
  $$('[data-slider]').forEach(function(root){
    var track=root.querySelector('.slider__track'),items=$$('.slider__track > *',root),dots=root.querySelector('.slider__dots');
    var prev=root.querySelector('[data-prev]'),next=root.querySelector('[data-next]');
    var interval=parseInt(root.getAttribute('data-interval'),10)||4500,timer=null,idx=0,paused=false;
    if(!track||!items.length)return;
    items.forEach(function(_,i){var dot=d.createElement('i');dot.addEventListener('click',function(){go(i);restart();});dots.appendChild(dot);});
    function perView(){var w=items[0].getBoundingClientRect().width;return Math.max(1,Math.round(track.clientWidth/(w+12)));}
    function current(){var w=items[0].getBoundingClientRect().width+12;return Math.round(track.scrollLeft/w);}
    function paint(){idx=current();$$('i',dots).forEach(function(x,i){x.classList.toggle('on',i===idx);});}
    /* 부드럽게 미끄러지듯 이동 — 스냅을 잠시 끄고 rAF로 가감속 */
    var anim=null;
    function slideTo(left,dur){if(anim)clearTimeout(anim);var from=track.scrollLeft,dist=left-from;if(Math.abs(dist)<1)return;
      dur=dur||Math.min(1400,Math.max(700,Math.abs(dist)*1.1));var t0=null;track.classList.add('is-anim');
      function step(){var ts=performance.now();if(t0===null)t0=ts;var p=Math.min(1,(ts-t0)/dur);var e=p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;track.scrollLeft=from+dist*e;
        if(p<1){anim=setTimeout(step,16);}else{anim=null;track.classList.remove('is-anim');}}
      anim=setTimeout(step,16);}
    function go(i){var n=items.length,pv=perView(),max=Math.max(0,n-pv);if(i>max)i=0;if(i<0)i=max;var w2=items[0].getBoundingClientRect().width+12;slideTo(i*w2);idx=i;}
    function tick(){if(paused||d.hidden)return;go(current()+1);}
    function restart(){clearInterval(timer);timer=setInterval(tick,interval);}
    track.addEventListener('scroll',function(){w.requestAnimationFrame(paint);},{passive:true});
    if(prev)prev.addEventListener('click',function(){go(current()-1);restart();});
    if(next)next.addEventListener('click',function(){go(current()+1);restart();});
    root.addEventListener('mouseenter',function(){paused=true;});root.addEventListener('mouseleave',function(){paused=false;});
    track.addEventListener('touchstart',function(){paused=true;},{passive:true});track.addEventListener('touchend',function(){paused=false;restart();},{passive:true});
    var down=false,sx=0,sl=0,moved=false;
    track.addEventListener('touchstart',function(){if(anim){clearTimeout(anim);anim=null;track.classList.remove('is-anim');}},{passive:true});
    track.addEventListener('mousedown',function(e){down=true;moved=false;sx=e.pageX;sl=track.scrollLeft;if(anim){clearTimeout(anim);anim=null;track.classList.remove('is-anim');}track.classList.add('is-drag');e.preventDefault();});
    w.addEventListener('mousemove',function(e){if(!down)return;var dx=e.pageX-sx;if(Math.abs(dx)>3)moved=true;track.scrollLeft=sl-dx;});
    w.addEventListener('mouseup',function(){if(!down)return;down=false;track.classList.remove('is-drag');go(current());restart();});
    track.addEventListener('click',function(e){if(moved){e.preventDefault();e.stopPropagation();moved=false;}},true);
    if(!reduce){restart();}
    paint();
  });
  /* 6) 방문 예약 폼 — 서버 주소(BOOKING_ENDPOINT)가 비어 있으면 문자 앱/복사로 전달 */
  var BOOKING_ENDPOINT='';/* 예약 접수 서버가 생기면 주소를 넣으세요 (POST JSON) */
  var PHONE='010-2001-1030',PHONE_RAW='01020011030';
  var form=d.getElementById('bookForm');
  if(form){
    var chips=d.getElementById('typeChips'),errEl=d.getElementById('formErr'),done=d.getElementById('bookDone'),doneDesc=d.getElementById('bookDoneDesc'),selType='';
    $$('button',chips).forEach(function(b){b.addEventListener('click',function(){selType=b.textContent.trim();$$('button',chips).forEach(function(x){var on=x===b;x.classList.toggle('is-on',on);x.setAttribute('aria-pressed',on?'true':'false');});});});
    var dateIn=form.querySelector('[name=date]');if(dateIn){var t=new Date();dateIn.min=t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0');}
    var phoneIn=form.querySelector('[name=phone]');
    phoneIn.addEventListener('input',function(){var n=phoneIn.value.replace(/\D/g,'').slice(0,11);phoneIn.value=n.length>7?n.replace(/(\d{3})(\d{3,4})(\d{4})/,'$1-$2-$3'):n.length>3?n.replace(/(\d{3})(\d+)/,'$1-$2'):n;});
    function showErr(m){errEl.textContent=m;errEl.hidden=false;errEl.scrollIntoView({block:'center',behavior:'smooth'});}
    function finish(desc){form.hidden=true;done.hidden=false;if(desc)doneDesc.textContent=desc;done.scrollIntoView({block:'center',behavior:'smooth'});}
    form.addEventListener('submit',function(e){
      e.preventDefault();errEl.hidden=true;var f=form.elements;if(f.website.value)return;
      var data={kind:'예약',interest:selType,place:f.place.value,date:f.date.value,time:f.time.value,region:f.region.value.trim(),name:f.name.value.trim()||'성함 미입력',phone:f.phone.value.trim(),memo:f.memo.value.trim(),agree:f.agree.checked,page:location.href};
      if(!data.interest)return showErr('어떤 증상인지 선택해 주세요.');
      if(!data.region)return showErr('지역을 입력해 주세요. (예: 제주시 노형동)');
      if(!/^01[016789]-?\d{3,4}-?\d{4}$/.test(data.phone))return showErr('연락처를 정확히 입력해 주세요. (예: 010-0000-0000)');
      if(!data.agree)return showErr('개인정보 수집 · 이용에 동의해 주세요.');
      var btn=d.getElementById('bookSubmit');btn.disabled=true;btn.textContent='전송 중…';
      var lines=['[방문 예약] 제주하수구제왕 싹뚜러','증상: '+data.interest,'장소: '+(data.place||'-'),'희망: '+(data.date||'가능한 빨리')+' '+data.time,'지역: '+data.region,'성함: '+data.name,'연락처: '+data.phone];
      if(data.memo)lines.push('메모: '+data.memo);
      var text=lines.join('\n');
      function reset(){btn.disabled=false;btn.textContent='예약 신청하기';}
      if(BOOKING_ENDPOINT){
        fetch(BOOKING_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
          .then(function(r){if(!r.ok)throw new Error('전송에 실패했습니다.');return r.json().catch(function(){return{};});})
          .then(function(){reset();finish('확인 후 바로 전화드리겠습니다. 급하시면 지금 전화 주세요.');})
          .catch(function(err){reset();showErr((err.message||'전송에 실패했습니다.')+' 급하시면 '+PHONE+'로 전화 주세요.');});
      }else{
        var ua=navigator.userAgent,isMobile=/Android|iPhone|iPad|iPod/i.test(ua),sep=/iPhone|iPad|iPod/i.test(ua)?'&':'?';
        reset();
        if(isMobile){location.href='sms:'+PHONE_RAW+sep+'body='+encodeURIComponent(text);finish('문자 앱이 열렸습니다. 내용을 확인하고 전송 버튼을 눌러 주세요.\n확인 후 바로 전화드리겠습니다.');}
        else{if(navigator.clipboard){navigator.clipboard.writeText(text).catch(function(){});}finish('예약 내용이 복사되었습니다. 문자로 '+PHONE+'에 보내 주시거나, 지금 전화 주세요.\n\n'+text);}
      }
    });
    d.getElementById('bookAgain').addEventListener('click',function(){done.hidden=true;form.hidden=false;form.scrollIntoView({block:'start',behavior:'smooth'});});
  }
})();
