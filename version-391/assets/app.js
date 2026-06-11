(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initSearchAndFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
    inputs.forEach(function (input) {
      var root = input.closest("main") || document;
      var scope = root.querySelector("[data-search-scope]") || root;
      var items = Array.prototype.slice.call(scope.querySelectorAll("[data-search-item]"));
      var chips = Array.prototype.slice.call(root.querySelectorAll("[data-filter-value]"));
      var activeFilter = "all";

      function apply() {
        var keyword = input.value.trim().toLowerCase();
        items.forEach(function (item) {
          var text = (item.getAttribute("data-title") || item.textContent || "").toLowerCase();
          var type = item.getAttribute("data-type") || "";
          var matchText = !keyword || text.indexOf(keyword) !== -1;
          var matchFilter = activeFilter === "all" || type === activeFilter;
          item.classList.toggle("is-hidden-by-search", !matchText);
          item.classList.toggle("is-hidden-by-filter", !matchFilter);
        });
      }

      input.addEventListener("input", apply);
      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          activeFilter = chip.getAttribute("data-filter-value") || "all";
          chips.forEach(function (other) {
            other.classList.toggle("active", other === chip);
          });
          apply();
        });
      });
    });
  }

  window.initPlayer = function (streamUrl) {
    ready(function () {
      var video = document.querySelector("[data-player]");
      var cover = document.querySelector(".player-cover");
      if (!video || !streamUrl) {
        return;
      }

      function attachSource() {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          return;
        }
        video.src = streamUrl;
      }

      function play() {
        if (cover) {
          cover.classList.add("is-hidden");
        }
        video.setAttribute("controls", "controls");
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {
            if (cover) {
              cover.classList.remove("is-hidden");
            }
          });
        }
      }

      attachSource();
      if (cover) {
        cover.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
    });
  };

  ready(function () {
    initNavigation();
    initHero();
    initSearchAndFilters();
  });
})();
