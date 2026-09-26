/* Premium Effects: Typing + Scramble — no layout shift */
(function () {
  var CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';

  function typeText(el, text, speed) {
    if (!el) return;
    el.textContent = '';
    var i = 0;
    var cursor = document.querySelector('.typing-cursor');
    function tick() {
      if (i < text.length) {
        el.textContent += text.charAt(i++);
        setTimeout(tick, speed || 70);
      } else if (cursor) {
        cursor.classList.add('blink');
      }
    }
    tick();
  }

  function scrambleText(el, duration) {
    if (!el || el.getAttribute('data-done') === '1') return;
    el.setAttribute('data-done', '1');

    var original = el.innerHTML;

    // Lock dimensions BEFORE scrambling so nothing below moves
    var rect = el.getBoundingClientRect();
    var computed = window.getComputedStyle(el);
    el.style.width = rect.width + 'px';
    el.style.height = rect.height + 'px';
    el.style.display = computed.display === 'inline' ? 'inline-block' : computed.display;
    el.style.overflow = 'hidden';
    el.style.verticalAlign = 'top';

    var plain = original
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/<[^>]+>/g, '');
    var lines = plain.split('\n');
    var total = Math.floor((duration || 1300) / 28);
    var frame = 0;

    var id = setInterval(function () {
      frame++;
      var progress = frame / total;
      var html = '';
      for (var li = 0; li < lines.length; li++) {
        if (li > 0) html += '<br>';
        var line = lines[li];
        for (var i = 0; i < line.length; i++) {
          var ch = line[i];
          if (ch === ' ') {
            html += ' ';
          } else if (progress > (i / Math.max(line.length, 1)) * 0.88 + 0.08) {
            html += ch;
          } else {
            // Use same-width-ish chars; prefer letters of similar visual weight
            html += CHARS.charAt(Math.floor(Math.random() * 52)); // letters only for less width jump
          }
        }
      }
      el.innerHTML = html;
      if (frame >= total) {
        clearInterval(id);
        el.innerHTML = original;
        // Release lock after restore
        el.style.width = '';
        el.style.height = '';
        el.style.display = '';
        el.style.overflow = '';
        el.style.verticalAlign = '';
      }
    }, 28);
  }

  function onReady(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  onReady(function () {
    var typing = document.querySelector('.typing-text');
    if (typing) {
      var t = typing.getAttribute('data-text') || 'PORTOFOLIO';
      setTimeout(function () { typeText(typing, t, 70); }, 400);
    }

    var nodes = document.querySelectorAll('.scramble-text');
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            scrambleText(entry.target, 1400);
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2, rootMargin: '0px 0px -30px 0px' });
      nodes.forEach(function (n) { obs.observe(n); });
    } else {
      nodes.forEach(function (n, i) {
        setTimeout(function () { scrambleText(n, 1400); }, 600 + i * 200);
      });
    }

    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    var last = 0;
    var header = document.querySelector('.header');
    window.addEventListener('scroll', function () {
      if (!header) return;
      var y = window.pageYOffset || 0;
      if (y > last && y > 100) header.classList.add('header-hidden');
      else header.classList.remove('header-hidden');
      last = y;
    }, { passive: true });
  });
})();
