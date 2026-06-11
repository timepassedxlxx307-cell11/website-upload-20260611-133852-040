(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');
    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function startAuto() {
            stopAuto();
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        function stopAuto() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startAuto();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                startAuto();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                startAuto();
            });
        }

        slider.addEventListener('mouseenter', stopAuto);
        slider.addEventListener('mouseleave', startAuto);
        showSlide(0);
        startAuto();
    }

    var input = document.querySelector('[data-search-input]');
    var typeSelect = document.querySelector('[data-type-select]');
    var sortSelect = document.querySelector('[data-sort-select]');
    var container = document.querySelector('[data-card-container]');
    var count = document.querySelector('[data-filter-count]');

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function runFilter() {
        if (!container) {
            return;
        }
        var cards = Array.prototype.slice.call(container.querySelectorAll('[data-card]'));
        var keyword = normalize(input ? input.value : '');
        var selectedType = normalize(typeSelect ? typeSelect.value : '');
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-type'),
                card.getAttribute('data-region'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-category'),
                card.getAttribute('data-tags')
            ].join(' '));
            var cardType = normalize(card.getAttribute('data-type'));
            var passKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var passType = !selectedType || cardType === selectedType;
            var pass = passKeyword && passType;
            card.classList.toggle('is-hidden', !pass);
            if (pass) {
                visible += 1;
            }
        });

        if (sortSelect) {
            var sortValue = sortSelect.value;
            var sorted = cards.slice().sort(function (a, b) {
                var ay = Number(a.getAttribute('data-year')) || 0;
                var by = Number(b.getAttribute('data-year')) || 0;
                var at = a.getAttribute('data-title') || '';
                var bt = b.getAttribute('data-title') || '';
                if (sortValue === 'year-desc') {
                    return by - ay || at.localeCompare(bt, 'zh-Hans-CN');
                }
                if (sortValue === 'year-asc') {
                    return ay - by || at.localeCompare(bt, 'zh-Hans-CN');
                }
                if (sortValue === 'title') {
                    return at.localeCompare(bt, 'zh-Hans-CN');
                }
                return 0;
            });
            sorted.forEach(function (card) {
                container.appendChild(card);
            });
        }

        if (count) {
            count.textContent = '当前显示 ' + visible + ' 部';
        }
    }

    if (input || typeSelect || sortSelect) {
        if (input) {
            input.addEventListener('input', runFilter);
        }
        if (typeSelect) {
            typeSelect.addEventListener('change', runFilter);
        }
        if (sortSelect) {
            sortSelect.addEventListener('change', runFilter);
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q && input) {
            input.value = q;
        }
        runFilter();
    }

    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('[data-play-button]');
        var started = false;

        function startPlayback() {
            if (!video) {
                return;
            }
            var src = video.getAttribute('data-m3u8');
            if (!src) {
                return;
            }
            if (!started) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                } else {
                    video.src = src;
                }
                started = true;
            }
            if (button) {
                button.classList.add('is-hidden');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', startPlayback);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (!started || video.paused) {
                    startPlayback();
                }
            });
        }
    });
})();
