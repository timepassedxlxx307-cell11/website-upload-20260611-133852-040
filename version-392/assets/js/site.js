(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-site-menu]");

    if (menuButton && menu) {
      menuButton.addEventListener("click", function () {
        menu.classList.toggle("is-open");
        document.body.classList.toggle("menu-open", menu.classList.contains("is-open"));
      });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }

        timer = window.setInterval(function () {
          show(index + 1);
        }, 5600);
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          restart();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          restart();
        });
      }

      restart();
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-search-input]")).forEach(function (input) {
      var container = input.closest(".section-shell") || document;
      var cards = Array.prototype.slice.call(container.querySelectorAll("[data-search-card]"));
      var empty = container.querySelector("[data-empty-state]");
      var chips = Array.prototype.slice.call(container.querySelectorAll("[data-filter-chip]"));
      var activeFilter = "all";
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");

      if (query && !input.value) {
        input.value = query;
      }

      function cardText(card) {
        return normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.year,
          card.dataset.category,
          card.dataset.tags,
          card.textContent
        ].join(" "));
      }

      function apply() {
        var terms = normalize(input.value).split(/\s+/).filter(Boolean);
        var visible = 0;

        cards.forEach(function (card) {
          var text = cardText(card);
          var matchesQuery = terms.every(function (term) {
            return text.indexOf(term) !== -1;
          });
          var matchesChip = activeFilter === "all" || text.indexOf(normalize(activeFilter)) !== -1;
          var showCard = matchesQuery && matchesChip;

          card.classList.toggle("is-hidden-card", !showCard);

          if (showCard) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      input.addEventListener("input", apply);

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          activeFilter = chip.getAttribute("data-filter-chip") || "all";
          chips.forEach(function (item) {
            item.classList.toggle("is-active", item === chip);
          });
          apply();
        });
      });

      apply();
    });

    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (player) {
      var source = player.getAttribute("data-src");
      var video = player.querySelector("video");
      var cover = player.querySelector("[data-player-cover]");
      var loaded = false;
      var hls = null;

      function hideCover() {
        if (cover) {
          cover.classList.add("is-hidden");
        }
      }

      function attachSource() {
        if (loaded || !video || !source) {
          return;
        }

        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      function startPlayback() {
        attachSource();
        hideCover();

        if (video) {
          var playPromise = video.play();

          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
              if (cover) {
                cover.classList.remove("is-hidden");
              }
            });
          }
        }
      }

      if (cover) {
        cover.addEventListener("click", startPlayback);
      }

      if (video) {
        video.addEventListener("play", hideCover);
        video.addEventListener("click", function () {
          if (!loaded || video.paused) {
            startPlayback();
          }
        });
      }

      window.addEventListener("pagehide", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  });
})();
