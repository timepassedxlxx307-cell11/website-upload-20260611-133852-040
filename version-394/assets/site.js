(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-main-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
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

        function play() {
            stop();
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

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                play();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
                play();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", play);
        show(0);
        play();
    }

    function setupSearch() {
        var input = document.querySelector(".js-search-input");
        if (!input) {
            return;
        }
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var emptyState = document.querySelector("[data-empty-state]");
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        if (initial) {
            input.value = initial;
        }

        function applyFilter() {
            var keyword = input.value.trim().toLowerCase();
            var visibleCount = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
                var visible = !keyword || text.indexOf(keyword) !== -1;
                card.classList.toggle("hidden-by-search", !visible);
                if (visible) {
                    visibleCount += 1;
                }
            });
            if (emptyState) {
                emptyState.classList.toggle("visible", visibleCount === 0);
            }
        }

        input.addEventListener("input", applyFilter);
        applyFilter();
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll(".js-player"));
        players.forEach(function (player) {
            var video = player.querySelector(".js-video");
            var button = player.querySelector(".js-play-button");
            var message = player.querySelector("[data-player-message]");
            var source = player.getAttribute("data-src") || "";
            var hls = null;
            var initialized = false;

            function showMessage(text) {
                if (!message) {
                    return;
                }
                message.textContent = text;
                message.classList.add("visible");
            }

            function hideMessage() {
                if (message) {
                    message.textContent = "";
                    message.classList.remove("visible");
                }
            }

            function initialize() {
                if (initialized || !video || !source) {
                    return;
                }
                initialized = true;
                hideMessage();
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    player.classList.add("is-ready");
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        player.classList.add("is-ready");
                    });
                    hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                        if (data && data.fatal) {
                            showMessage("视频暂时无法播放，请稍后重试");
                        }
                    });
                    return;
                }
                showMessage("当前环境暂时无法播放，请稍后重试");
            }

            function startPlayback() {
                initialize();
                if (!video) {
                    return;
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.then === "function") {
                    playPromise.then(function () {
                        player.classList.add("is-playing");
                        if (button) {
                            button.classList.add("hide-overlay");
                        }
                    }).catch(function () {
                        showMessage("点击播放器可继续播放");
                    });
                } else {
                    player.classList.add("is-playing");
                    if (button) {
                        button.classList.add("hide-overlay");
                    }
                }
            }

            if (!video) {
                return;
            }
            initialize();
            if (button) {
                button.addEventListener("click", startPlayback);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    startPlayback();
                }
            });
            video.addEventListener("play", function () {
                player.classList.add("is-playing");
                hideMessage();
            });
            video.addEventListener("pause", function () {
                player.classList.remove("is-playing");
            });
            video.addEventListener("error", function () {
                showMessage("视频暂时无法播放，请稍后重试");
            });
            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupSearch();
        setupPlayers();
    });
})();
