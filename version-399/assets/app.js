(function () {
    function closestForm(element) {
        return element.closest('[data-search-form]');
    }

    function getRoot(form) {
        return form.getAttribute('data-root') || './';
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initMobileMenu() {
        var button = document.querySelector('[data-mobile-menu-button]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('open');
            document.body.classList.toggle('menu-open', panel.classList.contains('open'));
        });
    }

    function initSearchForms() {
        document.addEventListener('submit', function (event) {
            var form = closestForm(event.target);
            if (!form) {
                return;
            }
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var query = input ? input.value.trim() : '';
            if (!query) {
                return;
            }
            window.location.href = getRoot(form) + 'index.html?q=' + encodeURIComponent(query);
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var previous = document.querySelector('[data-hero-prev]');
        var next = document.querySelector('[data-hero-next]');
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
        }
        if (previous) {
            previous.addEventListener('click', function () {
                show(current - 1);
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
            });
        }
        window.setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    function createResultCard(movie) {
        var article = document.createElement('article');
        article.className = 'movie-card';
        article.innerHTML = [
            '<a class="poster-wrap" href="' + movie.url + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
            '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="poster-mask"><span>播放</span></span>',
            '<span class="type-badge">' + escapeHtml(movie.type) + '</span>',
            '</a>',
            '<div class="card-body">',
            '<h2><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h2>',
            '<p class="card-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.genre) + '</p>',
            '<p class="card-line">' + escapeHtml(movie.line) + '</p>',
            '</div>'
        ].join('');
        return article;
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function initSearchResults() {
        var params = new URLSearchParams(window.location.search);
        var query = normalize(params.get('q'));
        var section = document.getElementById('searchResults');
        var target = document.querySelector('[data-search-results]');
        var title = document.getElementById('searchTitle');
        if (!query || !section || !target || !window.SEARCH_INDEX) {
            return;
        }
        var words = query.split(/\s+/).filter(Boolean);
        var results = window.SEARCH_INDEX.filter(function (movie) {
            var haystack = normalize([
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.tags,
                movie.line
            ].join(' '));
            return words.every(function (word) {
                return haystack.indexOf(word) !== -1;
            });
        }).slice(0, 80);
        title.textContent = '“' + params.get('q') + '”相关影片';
        target.innerHTML = '';
        results.forEach(function (movie) {
            target.appendChild(createResultCard(movie));
        });
        if (!results.length) {
            var empty = document.createElement('p');
            empty.className = 'card-line';
            empty.textContent = '没有找到完全匹配的影片，可以尝试更短的片名、地区或类型关键词。';
            target.appendChild(empty);
        }
        section.hidden = false;
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function initLocalFilter() {
        var input = document.querySelector('[data-filter-input]');
        var scope = document.querySelector('[data-filter-scope]');
        if (!input || !scope) {
            return;
        }
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search-text]'));
        input.addEventListener('input', function () {
            var query = normalize(input.value);
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search-text'));
                card.classList.toggle('hidden-card', query && text.indexOf(query) === -1);
            });
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('[data-player-toggle]');
            if (!video) {
                return;
            }
            var source = video.getAttribute('data-src') || (video.querySelector('source') ? video.querySelector('source').src : '');
            var hlsInstance = null;
            function bindSource() {
                if (!source || video.dataset.bound === 'true') {
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else if (video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL')) {
                    video.src = source;
                } else {
                    video.src = source;
                }
                video.dataset.bound = 'true';
            }
            function playVideo() {
                bindSource();
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {});
                }
            }
            if (button) {
                button.addEventListener('click', playVideo);
            }
            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                }
            });
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                player.classList.remove('is-playing');
            });
            video.addEventListener('error', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
            bindSource();
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initSearchForms();
        initHero();
        initSearchResults();
        initLocalFilter();
        initPlayers();
    });
})();
