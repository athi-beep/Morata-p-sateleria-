/* ==========================================================================
   MORATA PASTELERÍA — Carrito de la tienda (sin frameworks)
   · Estado en memoria + localStorage (clave "morata.cart.v1").
   · Solo se guardan {id, qty}: nombre, precio e imagen salen siempre de
     MORATA_PRODUCTS, así un precio viejo nunca queda "pegado".
   · "Finalizar pedido" abre WhatsApp con un mensaje prearmado. No hay
     pagos, no se pide ningún dato de tarjeta y no se confirma ninguna compra.
   · Panel lateral accesible: role="dialog", foco atrapado, Escape, retorno
     del foco, bloqueo de scroll del fondo.
   Expone window.MorataCart = { add, open, close, format }.
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'morata.cart.v1';
  var MAX_QTY = 99;
  var WA_NUMBER = '5491126352428';          // el mismo número ya configurado en el sitio

  var products = window.MORATA_PRODUCTS || [];
  var byId = {};
  products.forEach(function (p) { byId[p.id] = p; });

  var drawer   = document.getElementById('cart');
  var overlay  = document.getElementById('cartOverlay');
  if (!drawer || !overlay) return;

  var elList     = document.getElementById('cartList');
  var elEmpty    = document.getElementById('cartEmpty');
  var elFoot     = document.getElementById('cartFoot');
  var elTotal    = document.getElementById('cartTotal');
  var elSub      = document.getElementById('cartSub');
  var elCheckout = document.getElementById('cartCheckout');
  var elClose    = document.getElementById('cartClose');
  var elLive     = document.getElementById('cartLive');
  var navBtn     = document.getElementById('cartBtn');
  var root       = document.documentElement;

  var items = [];            // [{ id, qty }]
  var isOpen = false;
  var lastTrigger = null;

  /* ---------- Utilidades ---------- */
  // Formato argentino: $10.000 (separador de miles con punto, determinista)
  function format(n) {
    return '$' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  function plural(n) { return n === 1 ? '1 producto' : n + ' productos'; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function icon(id) { return '<svg class="ico" aria-hidden="true"><use href="#' + id + '"/></svg>'; }

  /* ---------- Persistencia (tolerante a errores / modo privado) ---------- */
  function load() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      var seen = {}, out = [];
      arr.forEach(function (it) {
        if (!it || !byId[it.id] || seen[it.id]) return;       // id desconocido o duplicado
        var q = parseInt(it.qty, 10);
        if (!(q > 0)) return;                                  // evita 0, negativos y NaN
        seen[it.id] = true;
        out.push({ id: it.id, qty: Math.min(q, MAX_QTY) });
      });
      return out;
    } catch (e) { return []; }
  }
  function save() {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (e) { /* sin storage: el carrito sigue funcionando en memoria */ }
  }

  /* ---------- Cálculos ---------- */
  function find(id) {
    for (var i = 0; i < items.length; i++) if (items[i].id === id) return items[i];
    return null;
  }
  function count() { return items.reduce(function (s, it) { return s + it.qty; }, 0); }
  function total() { return items.reduce(function (s, it) { return s + byId[it.id].price * it.qty; }, 0); }

  /* ---------- Operaciones ---------- */
  function add(id) {
    var p = byId[id]; if (!p) return;
    var it = find(id);
    if (it) { if (it.qty < MAX_QTY) it.qty++; }
    else items.push({ id: id, qty: 1 });
    save(); render();
    bump();
    announce(p.name + ' agregado al carrito. Tenés ' + plural(count()) + '.');
  }
  function setQty(id, qty) {
    var it = find(id); if (!it) return;
    it.qty = Math.max(1, Math.min(MAX_QTY, qty));
    save(); render();
  }
  function remove(id) {
    var p = byId[id];
    items = items.filter(function (it) { return it.id !== id; });
    save(); render();
    if (p) announce(p.name + ' eliminado del carrito.');
  }

  /* ---------- Mensaje de WhatsApp ---------- */
  function waMessage() {
    var lines = ['Hola Morata! Quiero consultar por estos productos de la tienda:', ''];
    items.forEach(function (it) {
      var p = byId[it.id];
      lines.push('• ' + p.name + ' · Cantidad: ' + it.qty + ' · Subtotal: ' + format(p.price * it.qty));
    });
    lines.push('', 'Total: ' + format(total()), '', '¿Me confirman disponibilidad y cómo puedo retirarlo o recibirlo?');
    return lines.join('\n');
  }
  function waUrl() {
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(waMessage());
  }

  /* ---------- Accesibilidad: anuncios ---------- */
  function announce(msg) {
    if (!elLive) return;
    elLive.textContent = '';
    window.setTimeout(function () { elLive.textContent = msg; }, 40);
  }

  /* ---------- Render ---------- */
  function bump() {
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
    });
  }

  function rowHTML(it) {
    var p = byId[it.id];
    var atMin = it.qty <= 1, atMax = it.qty >= MAX_QTY;
    return '' +
      '<li class="ci" data-id="' + p.id + '">' +
        '<img class="ci-img" src="' + p.img + '-thumb.webp" alt="" width="80" height="' + (p.h === p.w ? 80 : 100) + '" loading="lazy" decoding="async" style="object-position:' + p.pos + '">' +
        '<div class="ci-info">' +
          '<p class="ci-name">' + esc(p.name) + '</p>' +
          '<p class="ci-unit">' + format(p.price) + ' c/u</p>' +
          '<div class="ci-qty" role="group" aria-label="Cantidad de ' + esc(p.name) + '">' +
            '<button class="ci-btn" type="button" data-act="dec" data-id="' + p.id + '" aria-label="Disminuir cantidad de ' + esc(p.name) + '"' + (atMin ? ' aria-disabled="true"' : '') + '>' + icon('i-minus') + '</button>' +
            '<span class="ci-n" aria-label="' + it.qty + ' unidades">' + it.qty + '</span>' +
            '<button class="ci-btn" type="button" data-act="inc" data-id="' + p.id + '" aria-label="Aumentar cantidad de ' + esc(p.name) + '"' + (atMax ? ' aria-disabled="true"' : '') + '>' + icon('i-plus') + '</button>' +
          '</div>' +
        '</div>' +
        '<div class="ci-side">' +
          '<button class="ci-rm" type="button" data-act="rm" data-id="' + p.id + '" aria-label="Eliminar ' + esc(p.name) + ' del carrito">' + icon('i-trash') + '</button>' +
          '<p class="ci-sub"><span class="sr-only">Subtotal: </span>' + format(p.price * it.qty) + '</p>' +
        '</div>' +
      '</li>';
  }

  function render() {
    var n = count();

    // Contadores (nav + sección tienda) y etiqueta accesible del botón del nav
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = n > 99 ? '99+' : String(n);
      el.hidden = n === 0;
    });
    document.querySelectorAll('[data-cart-open]').forEach(function (el) {
      el.setAttribute('aria-label', 'Abrir carrito, ' + plural(n));
    });

    // Recordar qué control tenía el foco para devolvérselo tras redibujar
    var active = document.activeElement, keep = null;
    if (active && elList.contains(active) && active.getAttribute('data-act')) {
      keep = { act: active.getAttribute('data-act'), id: active.getAttribute('data-id') };
    }
    var ids = items.map(function (it) { return it.id; });
    var prevIds = (elList.getAttribute('data-ids') || '').split(',').filter(Boolean);

    elList.innerHTML = items.map(rowHTML).join('');
    elList.setAttribute('data-ids', ids.join(','));

    elSub.textContent = plural(n);
    elTotal.textContent = format(total());
    elEmpty.hidden = n > 0;
    elList.hidden = n === 0;
    elFoot.hidden = n === 0;
    elCheckout.setAttribute('href', n ? waUrl() : '#');

    if (keep && isOpen) {
      var target = elList.querySelector('[data-act="' + keep.act + '"][data-id="' + keep.id + '"]');
      if (!target && keep.act === 'rm') {
        // se eliminó el producto: foco al siguiente (o anterior) botón de eliminar
        var idx = prevIds.indexOf(keep.id);
        var nextId = ids[idx] || ids[idx - 1];
        target = nextId ? elList.querySelector('[data-act="rm"][data-id="' + nextId + '"]') : null;
      }
      if (target) target.focus({ preventScroll: true });
      else if (n === 0) {
        var back = elEmpty.querySelector('a, button'); (back || elClose).focus({ preventScroll: true });
      }
    }
  }

  /* ---------- Panel lateral ---------- */
  function closeNavMenu() {
    // El menú mobile del nav (main.js) se cierra con la clase .open
    var nav = document.getElementById('nav'), tg = document.getElementById('navToggle');
    if (nav && nav.classList.contains('open')) {
      nav.classList.remove('open');
      if (tg) { tg.setAttribute('aria-expanded', 'false'); tg.setAttribute('aria-label', 'Abrir menú'); }
    }
  }

  function open(trigger) {
    if (isOpen) return;
    isOpen = true;
    lastTrigger = trigger || document.activeElement;
    closeNavMenu();
    drawer.classList.add('open');
    overlay.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    root.classList.add('cart-open');
    if (navBtn) navBtn.setAttribute('aria-expanded', 'true');
    elClose.focus({ preventScroll: true });
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    root.classList.remove('cart-open');
    if (navBtn) navBtn.setAttribute('aria-expanded', 'false');
    var t = lastTrigger;
    lastTrigger = null;
    if (t && t.focus && document.contains(t)) t.focus({ preventScroll: true });
  }

  function focusables() {
    return Array.prototype.filter.call(
      drawer.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
      function (el) { return el.getClientRects().length > 0 && !el.closest('[hidden]'); }
    );
  }

  /* ---------- Eventos ---------- */
  document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-cart-open]');
    if (opener) { e.preventDefault(); open(opener); }
  });
  overlay.addEventListener('click', close);
  elClose.addEventListener('click', close);
  drawer.querySelectorAll('[data-cart-close]').forEach(function (b) { b.addEventListener('click', close); });

  elList.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    var id = b.getAttribute('data-id'), act = b.getAttribute('data-act'), it = find(id);
    if (!it) return;
    if (act === 'inc') { if (b.getAttribute('aria-disabled') !== 'true') setQty(id, it.qty + 1); }
    else if (act === 'dec') { if (b.getAttribute('aria-disabled') !== 'true') setQty(id, it.qty - 1); }
    else if (act === 'rm') remove(id);
  });

  // "Finalizar pedido" sin productos no debe navegar
  elCheckout.addEventListener('click', function (e) {
    if (!items.length) e.preventDefault();
  });

  document.addEventListener('keydown', function (e) {
    if (!isOpen) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key === 'Tab') {
      var f = focusables(); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (!drawer.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    }
  });
  document.addEventListener('focusin', function (e) {
    if (isOpen && !drawer.contains(e.target)) { var f = focusables(); if (f.length) f[0].focus(); }
  });

  // Sincroniza varias pestañas abiertas
  window.addEventListener('storage', function (e) {
    if (e.key === STORAGE_KEY) { items = load(); render(); }
  });

  /* ---------- Inicio: recuperar carrito guardado ---------- */
  items = load();
  render();

  window.MorataCart = { add: add, open: open, close: close, format: format };
})();
