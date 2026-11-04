(function () {
  'use strict';

  var PHONE = '010-2001-1030';
  var PHONE_RAW = '01020011030';
  /* 예약 전송 서버가 생기면 주소를 넣으세요 (POST JSON). 비어 있으면 문자 앱으로 내용을 전달합니다. */
  var BOOKING_ENDPOINT = '';
  /* 카카오톡 채널 주소가 생기면 넣으세요 (예: https://pf.kakao.com/_xxxxx/chat). 비어 있으면 예약 폼으로 이동합니다. */
  var KAKAO_URL = '';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ---------- 모바일 메뉴 ---------- */
  var toggle = $('#navToggle'), menu = $('#menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $$('a', menu).forEach(function (a) {
      a.addEventListener('click', function () { menu.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); });
    });
  }

  /* ---------- 스크롤 시 메뉴바 고정 ---------- */
  var navWrap = $('#navWrap');
  if (navWrap) {
    var navTop = 0;
    function measure() { if (!navWrap.classList.contains('is-fixed')) navTop = navWrap.offsetTop; }
    function onScroll() { navWrap.classList.toggle('is-fixed', window.scrollY > navTop); }
    measure();
    window.addEventListener('resize', function () { navWrap.classList.remove('is-fixed'); measure(); onScroll(); });
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 카카오톡 버튼 ---------- */
  var kakao = $('#kakaoBtn');
  if (kakao && KAKAO_URL) { kakao.href = KAKAO_URL; kakao.target = '_blank'; kakao.rel = 'noopener'; }

  /* ---------- 메인 2x2 영상 재생 보장 ---------- */
  $$('.visual__grid video').forEach(function (v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); });

  /* ---------- 소개 영상 ---------- */
  var introV = $('#introPlayer video'), introBtn = $('#introPlay');
  if (introV && introBtn) {
    introBtn.addEventListener('click', function () {
      introV.muted = false; introV.controls = true;
      var p = introV.play(); if (p && p.catch) p.catch(function () { introV.muted = true; introV.play(); });
      introBtn.classList.add('is-off');
    });
    introV.addEventListener('pause', function () { if (!introV.ended) return; introBtn.classList.remove('is-off'); });
  }

  /* ---------- 현장 사진: 탭 필터 · 더 보기 · 크게 보기 ---------- */
  var WORKS = window.WORKS || [];
  var CATS = ['변기 막힘', '싱크대 막힘', '하수구 막힘', '맨홀 · 고압 세척', '출동 현장 · 장비'];
  var tabsEl = $('#workTabs'), gridEl = $('#workGrid'), moreBtn = $('#workMore'), countEl = $('#workCount');
  var curCat = '', shown = 12, filtered = WORKS.slice();
  var PAGE = 12;

  function buildTabs() {
    var html = '<button role="tab" aria-selected="true" class="is-on" data-cat="">전체<small>' + WORKS.length + '</small></button>';
    CATS.forEach(function (c) {
      var n = WORKS.filter(function (w) { return w[1] === c; }).length;
      html += '<button role="tab" aria-selected="false" data-cat="' + c + '">' + c + '<small>' + n + '</small></button>';
    });
    tabsEl.innerHTML = html;
    $$('button', tabsEl).forEach(function (b) {
      b.addEventListener('click', function () { setCat(b.getAttribute('data-cat')); });
    });
  }
  function setCat(cat) {
    curCat = cat; shown = PAGE;
    filtered = cat ? WORKS.filter(function (w) { return w[1] === cat; }) : WORKS.slice();
    $$('button', tabsEl).forEach(function (b) {
      var on = b.getAttribute('data-cat') === cat;
      b.classList.toggle('is-on', on); b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    render();
  }
  function render() {
    var list = filtered.slice(0, shown);
    gridEl.innerHTML = list.map(function (w, i) {
      return '<button class="works__item" type="button" data-i="' + i + '" aria-label="' + w[1] + ' 사진 크게 보기">' +
        '<img src="img/w/' + w[0] + '-s.webp" srcset="img/w/' + w[0] + '-s.webp 640w, img/w/' + w[0] + '-m.webp 1100w" sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw" alt="" loading="lazy" decoding="async">' +
        '<span>' + w[1] + '</span></button>';
    }).join('');
    $$('.works__item', gridEl).forEach(function (b) {
      b.addEventListener('click', function () { openLb(parseInt(b.getAttribute('data-i'), 10)); });
    });
    var left = filtered.length - shown;
    moreBtn.hidden = left <= 0;
    countEl.textContent = Math.min(shown, filtered.length) + ' / ' + filtered.length;
  }
  if (tabsEl && gridEl && WORKS.length) {
    buildTabs(); render();
    moreBtn.addEventListener('click', function () { shown += PAGE; render(); });
    $$('.post-item[data-cat]').forEach(function (a) {
      a.addEventListener('click', function () { setCat(a.getAttribute('data-cat')); });
    });
  }

  /* 크게 보기 */
  var lb = $('#lb'), lbImg = $('#lbImg'), lbCap = $('#lbCap'), lbIdx = 0;
  function showLb(i) {
    lbIdx = (i + filtered.length) % filtered.length;
    var w = filtered[lbIdx];
    lbImg.src = 'img/w/' + w[0] + '-m.webp';
    lbCap.textContent = w[1] + ' · ' + (lbIdx + 1) + ' / ' + filtered.length;
  }
  function openLb(i) { showLb(i); lb.hidden = false; document.body.style.overflow = 'hidden'; }
  function closeLb() { lb.hidden = true; document.body.style.overflow = ''; }
  if (lb) {
    $('#lbX').addEventListener('click', closeLb);
    $('#lbPrev').addEventListener('click', function () { showLb(lbIdx - 1); });
    $('#lbNext').addEventListener('click', function () { showLb(lbIdx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') closeLb();
      else if (e.key === 'ArrowLeft') showLb(lbIdx - 1);
      else if (e.key === 'ArrowRight') showLb(lbIdx + 1);
    });
    var tx = null;
    lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; tx = null;
      if (dx > 50) showLb(lbIdx - 1); else if (dx < -50) showLb(lbIdx + 1);
    });
  }

  /* ---------- 현장 영상: 보일 때 로드·재생, 가장 잘 보이는 하나만 재생 ---------- */
  var clips = $$('.clip video');
  if (clips.length && 'IntersectionObserver' in window) {
    var ratios = new Map(), playing = null;
    function pick() {
      var best = null, bestR = 0;
      ratios.forEach(function (r, v) { if (r > bestR) { bestR = r; best = v; } });
      if (bestR < 0.5) best = null;
      if (best !== playing) {
        if (playing) playing.pause();
        playing = best;
        if (playing) { var p = playing.play(); if (p && p.catch) p.catch(function () {}); }
      }
    }
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting && !v.src && v.getAttribute('data-src')) { v.src = v.getAttribute('data-src'); v.load(); }
        ratios.set(v, en.intersectionRatio);
      });
      pick();
    }, { threshold: [0, .25, .5, .75, 1] });
    clips.forEach(function (v) {
      vio.observe(v);
      v.addEventListener('click', function () { if (v.paused) { v.play(); } else { v.pause(); } });
    });
  }

  /* ---------- 후기 ---------- */
  var REV = window.REVIEWS || [], revEl = $('#revGrid');
  if (revEl && REV.length) {
    revEl.innerHTML = REV.map(function (r) {
      return '<blockquote class="kt wow">' +
        '<header class="kt__top"><b>' + r.name + ' 고객님</b><span>' + r.area + ' · ' + r.type + '</span></header>' +
        '<div class="kt__body"><div class="kt__row"><span class="kt__ava" aria-hidden="true">' + r.ava + '</span><div><p class="kt__name">' + r.name + '</p>' +
        '<div class="kt__line"><p class="kt__b">' + r.msg + '</p><time>' + r.t1 + '</time></div></div></div>' +
        '<div class="kt__line kt__line--me"><time>' + r.t2 + '</time><p class="kt__b kt__b--me">' + r.reply + '</p></div></div></blockquote>';
    }).join('');
  }

  /* ---------- 방문 예약 폼 ---------- */
  var form = $('#bookForm'), chips = $('#typeChips'), errEl = $('#formErr'), done = $('#bookDone'), doneDesc = $('#bookDoneDesc');
  var selType = '';
  if (form) {
    $$('button', chips).forEach(function (b) {
      b.addEventListener('click', function () {
        selType = b.textContent.trim();
        $$('button', chips).forEach(function (x) { var on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      });
    });
    var dateIn = form.querySelector('[name=date]');
    if (dateIn) { var t = new Date(); dateIn.min = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0'); }
    var phoneIn = form.querySelector('[name=phone]');
    phoneIn.addEventListener('input', function () {
      var d = phoneIn.value.replace(/\D/g, '').slice(0, 11);
      phoneIn.value = d.length > 7 ? d.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3') : d.length > 3 ? d.replace(/(\d{3})(\d+)/, '$1-$2') : d;
    });
    function showErr(m) { errEl.textContent = m; errEl.hidden = false; errEl.scrollIntoView({ block: 'center', behavior: 'smooth' }); }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      errEl.hidden = true;
      var f = form.elements;
      if (f.website.value) return; /* 스팸 봇 */
      var data = {
        kind: '예약', interest: selType, place: f.place.value, date: f.date.value, time: f.time.value,
        region: f.region.value.trim(), name: f.name.value.trim() || '성함 미입력', phone: f.phone.value.trim(),
        memo: f.memo.value.trim(), agree: f.agree.checked, page: location.href
      };
      if (!data.interest) return showErr('어떤 증상인지 선택해 주세요.');
      if (!data.region) return showErr('지역을 입력해 주세요. (예: 제주시 노형동)');
      if (!/^01[016789]-?\d{3,4}-?\d{4}$/.test(data.phone)) return showErr('연락처를 정확히 입력해 주세요. (예: 010-0000-0000)');
      if (!data.agree) return showErr('개인정보 수집 · 이용에 동의해 주세요.');

      var btn = $('#bookSubmit'); btn.disabled = true; btn.textContent = '전송 중…';
      var lines = ['[방문 예약] 제주하수구제왕 싹뚜러', '증상: ' + data.interest, '장소: ' + (data.place || '-'), '희망: ' + (data.date || '가능한 빨리') + ' ' + data.time, '지역: ' + data.region, '성함: ' + data.name, '연락처: ' + data.phone];
      if (data.memo) lines.push('메모: ' + data.memo);
      var text = lines.join('\n');

      function finish(desc) {
        form.hidden = true; done.hidden = false; if (desc) doneDesc.textContent = desc;
        done.scrollIntoView({ block: 'center', behavior: 'smooth' });
        btn.disabled = false; btn.textContent = '예약 신청하기';
      }

      if (BOOKING_ENDPOINT) {
        fetch(BOOKING_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
          .then(function (r) { if (!r.ok) throw new Error('전송에 실패했습니다.'); return r.json().catch(function () { return {}; }); })
          .then(function () { finish('확인 후 바로 전화드리겠습니다. 급하시면 지금 전화 주세요.'); })
          .catch(function (err) { btn.disabled = false; btn.textContent = '예약 신청하기'; showErr((err.message || '전송에 실패했습니다.') + ' 급하시면 ' + PHONE + '로 전화 주세요.'); });
      } else {
        /* 서버가 없을 때: 문자 앱으로 예약 내용을 보냅니다 */
        var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        var sep = /iPhone|iPad|iPod/i.test(navigator.userAgent) ? '&' : '?';
        if (isMobile) {
          location.href = 'sms:' + PHONE_RAW + sep + 'body=' + encodeURIComponent(text);
          finish('문자 앱이 열렸습니다. 내용을 확인하고 전송 버튼을 눌러 주세요.\n확인 후 바로 전화드리겠습니다.');
        } else {
          var copied = false;
          if (navigator.clipboard) { navigator.clipboard.writeText(text).then(function () { copied = true; }).catch(function () {}); }
          finish('예약 내용이 복사되었습니다. 문자로 ' + PHONE + '에 보내 주시거나, 지금 전화 주세요.\n\n' + text);
        }
      }
    });
    $('#bookAgain').addEventListener('click', function () { done.hidden = true; form.hidden = false; form.scrollIntoView({ block: 'start', behavior: 'smooth' }); });
  }

  /* ---------- 핵심 숫자 카운트업 ---------- */
  var counters = $$('[data-count]');
  function runCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var from = parseInt(el.getAttribute('data-from') || '0', 10);
    var dur = 1100, start = null;
    var wrap = el.parentNode;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (target - from) * eased);
      if (p < 1) requestAnimationFrame(tick);
      else if (wrap.classList.contains('stat__num--zero')) {
        wrap.classList.add('is-pop');
        setTimeout(function () { wrap.classList.remove('is-pop'); wrap.classList.add('is-done'); }, 1100);
      }
    }
    requestAnimationFrame(tick);
  }
  if (counters.length) {
    if (reduce || !('IntersectionObserver' in window)) {
      counters.forEach(function (el) { el.textContent = el.getAttribute('data-count'); if (el.parentNode.classList.contains('stat__num--zero')) el.parentNode.classList.add('is-done'); });
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { runCount(en.target); cio.unobserve(en.target); } });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { el.textContent = el.getAttribute('data-from') || '0'; cio.observe(el); });
    }
  }

  /* ---------- FAQ ---------- */
  $$('.faq__item button').forEach(function (b) {
    b.addEventListener('click', function () {
      var it = b.parentNode, open = it.classList.toggle('is-open');
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* ---------- 섹션 등장 효과 ---------- */
  var targets = $$('.board, .stat, .gshow__img, .gshow__text, .intro__text, .intro__player, .post-item, .svc-list, .proc__visual, .steps li, .gear__item, .section-title, .clip, .kt, .book__info, .book__card, .areas, .faq, .about, .about .container');
  targets.forEach(function (el) { el.classList.add('wow'); });
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    targets.forEach(function (el) { io.observe(el); });
    /* 후기 카드는 동적으로 생성되므로 다시 관찰 */
    $$('.kt').forEach(function (el) { el.classList.add('wow'); io.observe(el); });
  }
})();
