(function () {
  'use strict';

  /* 막힌 곳 탭 */
  document.querySelectorAll('[data-tabs]').forEach(function (root) {
    var btns = root.querySelectorAll('.tabs__btn');
    var panels = root.querySelectorAll('.tabpanel');
    function activate(i) {
      btns.forEach(function (b, j) {
        var on = i === j;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      panels.forEach(function (p, j) {
        var on = i === j;
        p.classList.toggle('is-on', on);
        if (on) p.removeAttribute('hidden'); else p.setAttribute('hidden', '');
      });
    }
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () { activate(i); });
      b.addEventListener('keydown', function (e) {
        var n = i;
        if (e.key === 'ArrowRight') n = (i + 1) % btns.length;
        else if (e.key === 'ArrowLeft') n = (i - 1 + btns.length) % btns.length;
        else return;
        e.preventDefault();
        activate(n);
        btns[n].focus();
      });
    });
  });

  /* 등장 효과 */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* 숫자 카운트업 */
  var counters = document.querySelectorAll('[data-count]');
  function runCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var dur = 900, start = null;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if (counters.length && !reduce && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCount(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { el.textContent = '0'; cio.observe(el); });
  }

  /* 갤러리 순차 등장 인덱스 */
  document.querySelectorAll('.gallery__item').forEach(function (el, i) { el.style.setProperty('--i', i); });

  /* 하단 고정 바: 마지막 CTA 구간에서는 숨김 */
  var bbar = document.querySelector('.bbar');
  var hideAt = document.querySelector('[data-hide-bbar]');
  if (bbar && hideAt && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      bbar.classList.toggle('is-hidden', entries[0].isIntersecting);
    }, { threshold: 0.25 }).observe(hideAt);
  }

  /* 작업 영상: 화면에 보일 때만 재생 */
  var vid = document.querySelector('.clip--video video');
  if (vid && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { var p = vid.play(); if (p && p.catch) p.catch(function () {}); }
        else vid.pause();
      });
    }, { threshold: 0.2 }).observe(vid);
  }
})();
