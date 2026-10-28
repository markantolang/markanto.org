/* The hero code sample renders canonical from the start (for no-JS and
   reduced-motion). Once it scrolls into view, the last line snaps to the loose
   `__strong__` a person might type — the verdict reads non-canonical — then the
   formatter rewrites it to `**strong**` and the verdict clears. The caret is
   left in place, blinking. No-JS / reduced-motion: the canonical form and
   verdict are already there, with a dim static caret. */
(function () {
  var sample = document.querySelector('.hero .sample');
  if (!sample) return;
  var swap = sample.querySelector('.sample-swap');
  var verdict = sample.querySelector('.sample-verdict');
  if (!swap) return;

  var caret = document.createElement('span');
  caret.className = 'sample-caret';
  caret.setAttribute('aria-hidden', 'true');

  if (
    !('IntersectionObserver' in window) ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    swap.after(caret); // static, dimmed by CSS
    return;
  }

  var CANON = '**strong**';
  var LOOSE = '__strong__';

  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function typeStr(str, per) {
    return str.split('').reduce(function (p, ch) {
      return p.then(function () {
        swap.textContent += ch;
        return wait(per + Math.random() * 60);
      });
    }, Promise.resolve());
  }

  function eraseAll(per) {
    return new Promise(function (resolve) {
      (function back() {
        if (!swap.textContent.length) return resolve();
        swap.textContent = swap.textContent.slice(0, -1);
        setTimeout(back, per);
      })();
    });
  }

  function setVerdict(text, warn) {
    if (!verdict) return;
    verdict.textContent = text;
    verdict.classList.toggle('is-warn', !!warn);
  }

  function run() {
    // Snap straight to the loose form — no "canonical first" beat.
    swap.textContent = LOOSE;
    swap.after(caret);
    sample.classList.add('is-typing');
    setVerdict('NON-CANONICAL SURFACE', true);
    wait(1500)
      .then(function () { return eraseAll(60); })
      .then(function () { return wait(340); })
      .then(function () { return typeStr(CANON, 100); })
      .then(function () { return wait(450); })
      .then(function () {
        setVerdict('CANONICAL · 0 diagnostics', false);
        sample.classList.remove('is-typing'); // caret stays, keeps blinking
      });
  }

  var io = new IntersectionObserver(function (entries, obs) {
    if (!entries[0].isIntersecting) return;
    obs.disconnect();
    run();
  }, { threshold: 0.45 });

  io.observe(sample);
})();
