(function () {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let heroIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, current) {
      slide.classList.toggle('active', current === heroIndex);
    });

    dots.forEach(function (dot, current) {
      dot.classList.toggle('active', current === heroIndex);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      const index = Number(dot.getAttribute('data-hero-dot')) || 0;
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(heroIndex + 1);
    }, 5200);
  }

  const searchInput = document.querySelector('[data-search-input]');
  const clearButton = document.querySelector('[data-search-clear]');
  const cards = Array.from(document.querySelectorAll('[data-card]'));
  const empty = document.querySelector('[data-search-empty]');

  function applySearch() {
    if (!searchInput || !cards.length) {
      return;
    }

    const keyword = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach(function (card) {
      const text = (card.getAttribute('data-search-text') || card.textContent || '').toLowerCase();
      const matched = !keyword || text.indexOf(keyword) !== -1;
      card.classList.toggle('hide', !matched);
      if (matched) {
        visibleCount += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('show', visibleCount === 0);
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', applySearch);
  }

  if (clearButton && searchInput) {
    clearButton.addEventListener('click', function () {
      searchInput.value = '';
      applySearch();
      searchInput.focus();
    });
  }
})();
