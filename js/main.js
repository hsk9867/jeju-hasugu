(function () {
  'use strict';

  /* 모바일 메뉴 토글 */
  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* 스크롤 시 메뉴바 상단 고정 */
  var navWrap = document.getElementById('navWrap');
  var header = document.querySelector('.header');
  if (navWrap && header) {
    var navTop = 0;
    function measure() {
      if (!navWrap.classList.contains('is-fixed')) navTop = navWrap.offsetTop;
    }
    function onScroll() {
      if (window.scrollY > navTop) navWrap.classList.add('is-fixed');
      else navWrap.classList.remove('is-fixed');
    }
    measure();
    window.addEventListener('resize', function () { navWrap.classList.remove('is-fixed'); measure(); onScroll(); });
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* 섹션 등장 효과 */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var targets = document.querySelectorAll('.board, .post-item, .case, .area__box, .about .container, .section-title');
  targets.forEach(function (el) { el.classList.add('wow'); });
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* 메인 영상: 재생 보장 (일부 브라우저 자동재생 실패 대비) */
  document.querySelectorAll('.visual__grid video').forEach(function (v) {
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  });
})();
