(function () {
    function initMoviePlayer(options) {
        var video = document.querySelector(options.videoSelector || '#movie-video');
        var overlay = document.querySelector('[data-player-overlay]');
        var playButton = document.querySelector('[data-player-toggle]');
        var muteButton = document.querySelector('[data-player-mute]');
        var fullButton = document.querySelector('[data-player-fullscreen]');
        var errorBox = document.querySelector('[data-player-error]');
        var streamUrl = options.streamUrl;
        var hls = null;

        if (!video || !streamUrl) {
            return;
        }

        function showError(message) {
            if (errorBox) {
                errorBox.textContent = message;
                errorBox.classList.add('show');
            }
        }

        function setOverlay(hidden) {
            if (overlay) {
                overlay.classList.toggle('hidden', hidden);
            }
        }

        function syncButtons() {
            if (playButton) {
                playButton.textContent = video.paused ? '播放' : '暂停';
            }
            if (muteButton) {
                muteButton.textContent = video.muted ? '开声' : '静音';
            }
        }

        function attachStream() {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        showError('视频加载失败，请稍后重试');
                    }
                });
                return;
            }
            showError('此设备暂时无法播放该视频');
        }

        function play() {
            var result = video.play();
            if (result && typeof result.then === 'function') {
                result.then(function () {
                    setOverlay(true);
                    syncButtons();
                }).catch(function () {
                    setOverlay(false);
                });
            } else {
                setOverlay(true);
                syncButtons();
            }
        }

        function togglePlay() {
            if (video.paused) {
                play();
            } else {
                video.pause();
                syncButtons();
            }
        }

        attachStream();
        syncButtons();

        if (overlay) {
            overlay.addEventListener('click', play);
        }
        if (playButton) {
            playButton.addEventListener('click', togglePlay);
        }
        if (muteButton) {
            muteButton.addEventListener('click', function () {
                video.muted = !video.muted;
                syncButtons();
            });
        }
        if (fullButton) {
            fullButton.addEventListener('click', function () {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (video.requestFullscreen) {
                    video.requestFullscreen();
                }
            });
        }
        video.addEventListener('click', togglePlay);
        video.addEventListener('play', function () {
            setOverlay(true);
            syncButtons();
        });
        video.addEventListener('pause', function () {
            syncButtons();
        });
        video.addEventListener('error', function () {
            showError('视频加载失败，请稍后重试');
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();
