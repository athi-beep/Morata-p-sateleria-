/* ==========================================================================
   MORATA PASTELERÍA — Sección "La experiencia Morata" (video)
   · Autoplay silencioso solo si el navegador lo permite y el usuario no
     pidió reducir el movimiento (prefers-reduced-motion).
   · Se reproduce únicamente mientras la sección está a la vista.
   · Botón reproducir/pausar accesible por teclado.
   · Si el video no carga, queda la imagen de portada sin romper el diseño.
   ========================================================================== */
(function () {
  'use strict';

  var frame = document.getElementById('vidFrame');
  var video = document.getElementById('expVideo');
  var btn   = document.getElementById('vidToggle');
  if (!frame || !video || !btn) return;

  var label = btn.querySelector('.vid-ctl-t');
  var iconUse = btn.querySelector('use');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var userPaused = false;     // el usuario pausó a mano: no reanudar solo al volver a la vista
  var inView = false;

  video.muted = true;         // garantiza el silencio (necesario para el autoplay)

  function paint() {
    var playing = !video.paused && !video.ended;
    btn.setAttribute('aria-pressed', String(playing));
    btn.setAttribute('aria-label', playing ? 'Pausar video' : 'Reproducir video');
    if (label) label.textContent = playing ? 'Pausar' : 'Reproducir';
    if (iconUse) iconUse.setAttribute('href', playing ? '#i-pause' : '#i-play');
  }

  function fail() {
    frame.classList.add('is-failed');   // CSS: oculta el <video> y los controles; se ve el póster
    btn.hidden = true;
  }

  function tryPlay() {
    var p = video.play();
    if (p && typeof p.catch === 'function') p.catch(function () { paint(); });  // autoplay bloqueado → queda el botón
  }

  video.addEventListener('play', paint);
  video.addEventListener('pause', paint);
  video.addEventListener('ended', paint);
  video.addEventListener('error', fail);
  var src = video.querySelector('source');
  if (src) src.addEventListener('error', fail);

  btn.addEventListener('click', function () {
    if (video.paused) { userPaused = false; tryPlay(); }
    else { userPaused = true; video.pause(); }
  });

  // Reproducir solo cuando la sección está visible
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        inView = en.isIntersecting;
        if (inView) {
          if (!userPaused && !reduce.matches && video.paused) tryPlay();
        } else if (!video.paused) {
          video.pause();                // ahorra batería y datos fuera de pantalla
        }
      });
    }, { threshold: 0.35 }).observe(frame);
  } else if (!reduce.matches) {
    tryPlay();
  }

  // Si el usuario activa "reducir movimiento" mientras mira la página, se pausa
  var onReduce = function () { if (reduce.matches && !video.paused) { video.pause(); } };
  if (reduce.addEventListener) reduce.addEventListener('change', onReduce);
  else if (reduce.addListener) reduce.addListener(onReduce);

  paint();
})();
