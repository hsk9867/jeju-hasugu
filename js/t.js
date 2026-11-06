/* 제주 하수구 제왕 방문 통계 (자체 호스팅). 방문자는 서버가 발급한 익명 ID 쿠키(jh_vid)로 구분하고, 관리자로 로그인한 브라우저에는 삽입되지 않는다. */
(function () {
  if (navigator.webdriver) return;
  function send(e) {
    try {
      var d = { p: location.pathname, r: document.referrer || '', q: location.search || '', s: screen.width + 'x' + screen.height, l: navigator.language || '' };
      if (e) d.e = e;
      var body = JSON.stringify(d);
      if (navigator.sendBeacon) navigator.sendBeacon('/api/t', new Blob([body], { type: 'application/json' }));
      else fetch('/api/t', { method: 'POST', body: body, headers: { 'content-type': 'application/json' }, keepalive: true });
    } catch (err) {}
  }
  send();
  document.addEventListener('click', function (ev) {
    var t = ev.target;
    var a = t && t.closest ? t.closest('a') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var name = '';
    if (href.indexOf('tel:') === 0) name = 'tel';
    else if (href.indexOf('sms:') === 0) name = 'sms';
    else if (href === '#booking') name = 'booking';
    else if (href.indexOf('blog.naver.com') >= 0) name = 'blog';
    if (name) send(name);
  }, true);
  var form = document.getElementById('bookForm');
  if (form) form.addEventListener('submit', function () { send('reserve'); }, true);
})();
