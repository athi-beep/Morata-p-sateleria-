/* ==========================================================================
   MORATA PASTELERÍA — Tienda: render de tarjetas, filtros y feedback
   Los datos vienen de products.js; el carrito, de cart.js.
   ========================================================================== */
(function () {
  'use strict';

  var grid = document.getElementById('shopGrid');
  var filtersEl = document.getElementById('shopFilters');
  var status = document.getElementById('shopStatus');
  var products = window.MORATA_PRODUCTS || [];
  if (!grid || !products.length) return;

  var fmt = (window.MorataCart && window.MorataCart.format) || function (n) { return '$' + n; };
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function icon(id) { return '<svg class="ico" aria-hidden="true"><use href="#' + id + '"/></svg>'; }

  /* ---------- Tarjetas ---------- */
  var delays = ['', ' d1', ' d2'];
  grid.innerHTML = products.map(function (p, i) {
    return '' +
      '<article class="scard rv' + delays[i % 3] + '" data-id="' + p.id + '" data-cat="' + p.category + '">' +
        '<div class="scard-img">' +
          '<img src="' + p.img + '.webp"' +
              ' srcset="' + p.img + '-640.webp 640w, ' + p.img + '.webp 1000w"' +
              ' sizes="(min-width:1024px) 31vw, (min-width:360px) 46vw, 92vw"' +
              ' alt="' + esc(p.alt) + '" width="' + p.w + '" height="' + p.h + '"' +
              ' loading="lazy" decoding="async" style="object-position:' + p.pos + '">' +
        '</div>' +
        '<div class="scard-b">' +
          '<p class="p-tag">' + esc(p.tag) + '</p>' +
          '<h3 class="p-name">' + esc(p.name) + '</h3>' +
          '<p class="p-desc">' + esc(p.desc) + '</p>' +
          '<div class="scard-foot">' +
            '<p class="p-price"><span class="sr-only">Precio: </span>' + fmt(p.price) + '</p>' +
            '<button class="btn btn-choco btn-sm scard-add" type="button" data-add="' + p.id + '" aria-label="Agregar al carrito: ' + esc(p.name) + '">' +
              '<span class="scard-add-ico">' + icon('i-plus') + '</span>' +
              '<span class="scard-add-t">Agregar al carrito</span>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</article>';
  }).join('');

  /* ---------- Filtros ---------- */
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.scard'));
  function applyFilter(value) {
    var shown = 0;
    cards.forEach(function (c) {
      var match = value === 'todos' || c.getAttribute('data-cat') === value;
      var wasHidden = c.hidden;
      c.hidden = !match;
      if (match) {
        shown++;
        c.classList.add('vis');                       // si estaba por revelarse, ya queda visible
        if (wasHidden) {                              // microanimación solo al reaparecer
          c.classList.remove('s-in'); void c.offsetWidth; c.classList.add('s-in');
        }
      }
    });
    if (filtersEl) {
      filtersEl.querySelectorAll('[data-filter]').forEach(function (b) {
        var on = b.getAttribute('data-filter') === value;
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', String(on));
      });
    }
    if (status) status.textContent = 'Mostrando ' + shown + (shown === 1 ? ' producto' : ' productos') + '.';
  }
  if (filtersEl) {
    filtersEl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-filter]'); if (!b) return;
      applyFilter(b.getAttribute('data-filter'));
    });
  }

  /* ---------- Agregar al carrito + feedback visual ---------- */
  var timers = {};
  grid.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-add]'); if (!btn) return;
    var id = btn.getAttribute('data-add');
    if (window.MorataCart) window.MorataCart.add(id);
    btn.classList.add('is-added');
    btn.querySelector('.scard-add-t').textContent = 'Agregado';
    btn.querySelector('.scard-add-ico').innerHTML = icon('i-check');
    window.clearTimeout(timers[id]);
    timers[id] = window.setTimeout(function () {
      btn.classList.remove('is-added');
      btn.querySelector('.scard-add-t').textContent = 'Agregar al carrito';
      btn.querySelector('.scard-add-ico').innerHTML = icon('i-plus');
    }, 1700);
  });

  applyFilter('todos');
})();
