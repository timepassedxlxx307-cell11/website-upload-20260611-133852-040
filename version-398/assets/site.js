(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initMobileMenu() {
    var button = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var grid = document.querySelector("[data-filter-grid]");
    if (!panel || !grid) {
      return;
    }
    var input = panel.querySelector("[data-filter-input]");
    var typeSelect = panel.querySelector("[data-filter-type]");
    var yearSelect = panel.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    var empty = document.querySelector("[data-filter-empty]");

    function apply() {
      var keyword = normalize(input && input.value);
      var type = normalize(typeSelect && typeSelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.tags
        ].join(" "));
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchType = !type || normalize(card.dataset.type).indexOf(type) !== -1;
        var matchYear = !year || normalize(card.dataset.year) === year;
        var show = matchKeyword && matchType && matchYear;
        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [input, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  }

  function initSearchPage() {
    var box = document.querySelector("[data-search-box]");
    var grid = document.querySelector("[data-search-results]");
    var status = document.querySelector("[data-search-status]");
    if (!box || !grid || !window.SITE_MOVIES) {
      return;
    }

    function card(movie) {
      return [
        "<article class="movie-card">",
        "  <a class="poster-wrap" href="" + movie.url + "" aria-label="观看" + movie.title + "">",
        "    <img src="" + movie.cover + "" alt="" + movie.title + "" loading="lazy" decoding="async">",
        "    <span class="poster-glow"></span>",
        "    <span class="duration-pill">" + movie.duration + "</span>",
        "    <span class="category-pill">" + movie.type + "</span>",
        "  </a>",
        "  <div class="movie-info">",
        "    <h3><a href="" + movie.url + "">" + movie.title + "</a></h3>",
        "    <p>" + movie.oneLine + "</p>",
        "    <div class="movie-meta"><span>" + movie.year + "</span><span>" + movie.region + "</span><span>" + movie.score + " 分</span></div>",
        "  </div>",
        "</article>"
      ].join("
");
    }

    function render() {
      var keyword = normalize(box.value);
      var source = window.SITE_MOVIES;
      var results = source.filter(function (movie) {
        if (!keyword) {
          return true;
        }
        return normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags,
          movie.oneLine
        ].join(" ")).indexOf(keyword) !== -1;
      }).slice(0, 120);
      grid.innerHTML = results.map(card).join("
");
      if (status) {
        status.textContent = keyword ? "找到 " + results.length + " 条相关影片" : "展示最新片库中的 120 条影片，可输入关键词继续筛选";
      }
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q) {
      box.value = q;
    }
    box.addEventListener("input", render);
    render();
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play-button]");
      if (!video) {
        return;
      }

      function playVideo() {
        var source = video.getAttribute("data-src");
        if (!source) {
          return;
        }
        player.classList.add("has-loaded");

        if (window.Hls && window.Hls.isSupported()) {
          if (!video.__hlsInstance) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: false
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video.__hlsInstance = hls;
          }
          video.play().catch(function () {});
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          if (!video.src) {
            video.src = source;
          }
          video.play().catch(function () {});
          return;
        }

        if (!video.src) {
          video.src = source;
        }
        video.play().catch(function () {});
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          playVideo();
        });
      }
      video.addEventListener("click", function () {
        if (!player.classList.contains("has-loaded")) {
          playVideo();
        }
      });
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        player.classList.remove("is-playing");
      });
    });
  }

  ready(function () {
    initMobileMenu();
    initHero();
    initFilters();
    initSearchPage();
    initPlayers();
  });
})();
