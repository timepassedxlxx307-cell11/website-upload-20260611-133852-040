(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    const menuButton = document.querySelector("[data-menu-button]");
    const mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
        document.body.classList.toggle("menu-open", mobileNav.classList.contains("is-open"));
      });
    }

    const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
    let activeSlide = 0;
    let heroTimer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      activeSlide = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeSlide);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeSlide);
      });
    }

    function startHero() {
      if (heroTimer) {
        window.clearInterval(heroTimer);
      }
      heroTimer = window.setInterval(function () {
        showSlide(activeSlide + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        const index = Number(dot.getAttribute("data-hero-dot"));
        showSlide(index);
        startHero();
      });
    });

    if (slides.length) {
      showSlide(0);
      startHero();
    }

    document.querySelectorAll("[data-movie-grid]").forEach(function (grid) {
      const cards = Array.from(grid.querySelectorAll(".movie-card"));
      const pageSize = Number(grid.getAttribute("data-page-size")) || cards.length;
      const section = grid.closest(".library-section") || document;
      const searchInput = section.querySelector("[data-search-input]");
      const filterButtons = Array.from(section.querySelectorAll("[data-filter]"));
      const loadMore = section.querySelector("[data-load-more]");
      const emptyState = section.querySelector("[data-empty-state]");
      let activeFilter = "all";
      let visibleLimit = pageSize;

      function cardMatches(card, query) {
        const title = card.getAttribute("data-title") || "";
        const region = card.getAttribute("data-region") || "";
        const type = card.getAttribute("data-type") || "";
        const year = card.getAttribute("data-year") || "";
        const category = card.getAttribute("data-category") || "";
        const content = [title, region, type, year, category].join(" ").toLowerCase();
        const filterMatch = activeFilter === "all" || content.indexOf(activeFilter.toLowerCase()) !== -1;
        const queryMatch = !query || content.indexOf(query) !== -1;
        return filterMatch && queryMatch;
      }

      function updateCards() {
        const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
        const matched = cards.filter(function (card) {
          return cardMatches(card, query);
        });

        cards.forEach(function (card) {
          card.style.display = "none";
        });

        matched.slice(0, visibleLimit).forEach(function (card) {
          card.style.display = "";
        });

        if (loadMore) {
          loadMore.classList.toggle("is-hidden", matched.length <= visibleLimit);
        }

        if (emptyState) {
          emptyState.classList.toggle("is-visible", matched.length === 0);
        }
      }

      if (searchInput) {
        searchInput.addEventListener("input", function () {
          visibleLimit = pageSize;
          updateCards();
        });
      }

      filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          activeFilter = button.getAttribute("data-filter") || "all";
          visibleLimit = pageSize;
          filterButtons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          updateCards();
        });
      });

      if (loadMore) {
        loadMore.addEventListener("click", function () {
          visibleLimit += pageSize;
          updateCards();
        });
      }

      updateCards();
    });
  });
}());
