(function () {
  const video = document.getElementById('player-video');
  const shade = document.querySelector('[data-player-shade]');

  if (!video) {
    return;
  }

  const stream = video.getAttribute('data-stream');
  let hlsReady = false;

  function bindVideo() {
    if (!stream || hlsReady) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      hlsReady = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      hlsReady = true;
      return;
    }

    video.src = stream;
    hlsReady = true;
  }

  function startVideo() {
    bindVideo();

    if (shade) {
      shade.classList.add('hidden');
    }

    const result = video.play();

    if (result && typeof result.catch === 'function') {
      result.catch(function () {
        if (shade) {
          shade.classList.remove('hidden');
        }
      });
    }
  }

  if (shade) {
    shade.addEventListener('click', startVideo);
  }

  video.addEventListener('play', function () {
    if (shade) {
      shade.classList.add('hidden');
    }
  });

  video.addEventListener('click', function () {
    if (video.paused) {
      startVideo();
    }
  });
})();
