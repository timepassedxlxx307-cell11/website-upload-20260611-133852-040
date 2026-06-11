(function () {
  var root = document.documentElement;
  var navButton = document.querySelector('.nav-toggle');
  var mainNav = document.querySelector('.main-nav');
  var navSearch = document.querySelector('.nav-search');

  if (navButton && mainNav && navSearch) {
    navButton.addEventListener('click', function () {
      mainNav.classList.toggle('is-open');
      navSearch.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      if (timer || slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        stop();
        show(Number(dot.getAttribute('data-slide')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function textOf(card) {
    return [
      card.getAttribute('data-title') || '',
      card.getAttribute('data-region') || '',
      card.getAttribute('data-type') || '',
      card.getAttribute('data-year') || '',
      card.getAttribute('data-tags') || '',
      card.getAttribute('data-category') || '',
      card.textContent || ''
    ].join(' ').toLowerCase();
  }

  function initFilters() {
    var scope = document.querySelector('.search-scope');
    var bar = document.querySelector('[data-filter-bar]');
    if (!scope || !bar) {
      return;
    }

    var input = bar.querySelector('.movie-search-input');
    var selects = Array.prototype.slice.call(bar.querySelectorAll('.movie-filter-select'));
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .ranking-item'));
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input && query) {
      input.value = query;
    }

    function filter() {
      var q = input ? input.value.trim().toLowerCase() : '';
      var active = {};

      selects.forEach(function (select) {
        if (select.value) {
          active[select.getAttribute('data-filter')] = select.value;
        }
      });

      cards.forEach(function (card) {
        var ok = true;
        if (q && textOf(card).indexOf(q) === -1) {
          ok = false;
        }
        Object.keys(active).forEach(function (key) {
          var value = card.getAttribute('data-' + key) || '';
          if (value !== active[key]) {
            ok = false;
          }
        });
        card.classList.toggle('is-hidden-by-filter', !ok);
      });
    }

    if (input) {
      input.addEventListener('input', filter);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', filter);
    });
    filter();
  }

  function initPlayers() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    cards.forEach(function (card) {
      var video = card.querySelector('.player-video');
      var button = card.querySelector('.player-play');
      var message = card.querySelector('.player-error');
      if (!video) {
        return;
      }

      var stream = video.getAttribute('data-stream');

      function setMessage(value) {
        if (message) {
          message.textContent = value || '';
        }
      }

      function attach() {
        if (!stream) {
          setMessage('播放暂时不可用，请稍后重试');
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setMessage('播放暂时不可用，请稍后重试');
            }
          });
          return;
        }

        video.src = stream;
      }

      function toggle() {
        if (video.paused) {
          var promise = video.play();
          if (promise && promise.catch) {
            promise.catch(function () {
              setMessage('点击画面即可继续播放');
            });
          }
        } else {
          video.pause();
        }
      }

      attach();

      if (button) {
        button.addEventListener('click', toggle);
      }

      video.addEventListener('click', function (event) {
        if (event.target === video) {
          toggle();
        }
      });

      video.addEventListener('play', function () {
        card.classList.add('is-playing');
        setMessage('');
      });

      video.addEventListener('pause', function () {
        card.classList.remove('is-playing');
      });

      video.addEventListener('error', function () {
        setMessage('播放暂时不可用，请稍后重试');
      });
    });
  }

  initHero();
  initFilters();
  initPlayers();
})();
