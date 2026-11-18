/* Morata Pastelería — interacciones del sitio (sin frameworks) */

// ── Logo: href="/" original. Abierto localmente (file://) vuelve al inicio de la página.
(function(){
  const logo = document.getElementById('navLogo');
  if(logo && location.protocol === 'file:'){
    logo.addEventListener('click', e=>{ e.preventDefault(); window.scrollTo({top:0,behavior:'smooth'}); });
  }
})();

// ── Nav: estado compacto al scrollear + menú mobile ──────────────────────
(function(){
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('nav-menu');
  const onScroll = ()=> nav.classList.toggle('compact', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  function setOpen(open){
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  }
  toggle.addEventListener('click', ()=> setOpen(!nav.classList.contains('open')));
  menu.querySelectorAll('a').forEach(a=> a.addEventListener('click', ()=> setOpen(false)));
  document.addEventListener('click', e=>{ if(!nav.contains(e.target)) setOpen(false); });
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') setOpen(false); });
})();

// ── Tabs de la carta ──────────────────────────────────────────────────────
function setTab(btn,id){
  document.querySelectorAll('.tb').forEach(b=>{ b.classList.remove('on'); b.setAttribute('aria-selected','false'); });
  document.querySelectorAll('.tp').forEach(p=>p.classList.remove('on'));
  btn.classList.add('on'); btn.setAttribute('aria-selected','true');
  document.getElementById('tab-'+id).classList.add('on');
}

// ── Scroll reveals ────────────────────────────────────────────────────────
(function(){
  const els = document.querySelectorAll('.rv');
  if(!('IntersectionObserver' in window)){ els.forEach(el=>el.classList.add('vis')); return; }
  const observer = new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('vis'); observer.unobserve(e.target); } });
  },{threshold:0.12, rootMargin:'0px 0px -40px 0px'});
  els.forEach(el=>observer.observe(el));
})();

// ── Modal ─────────────────────────────────────────────────────────────────
let lastFocus = null;
function openModal(path){
  lastFocus = document.activeElement;
  document.getElementById('mo').classList.add('open');
  document.body.style.overflow='hidden';
  if(path==='encargo') setStep('encargo');
  else if(path==='pregunta') setStep('pregunta');
  else setStep('choose');
  const c = document.querySelector('#mo .mcl'); c && c.focus();
}
function closeModal(){
  const mo = document.getElementById('mo');
  if(!mo.classList.contains('open')) return;
  mo.classList.remove('open');
  document.body.style.overflow='';
  if(lastFocus && lastFocus.focus) lastFocus.focus();
}
document.getElementById('mo').addEventListener('click',e=>{if(e.target===e.currentTarget)closeModal();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});

function setStep(step){
  document.querySelectorAll('.mst').forEach(s=>s.classList.remove('on'));
  document.getElementById('ms-'+step).classList.add('on');
}

// Tarjetas de encargo (div role=button): teclado Enter / Espacio
document.querySelectorAll('.inq-c[role="button"]').forEach(card=>{
  card.addEventListener('keydown', e=>{
    if(e.key==='Enter' || e.key===' '){ e.preventDefault(); card.click(); }
  });
});

// ── Quick chips (preguntas) ───────────────────────────────────────────────
const preguntas=[
  {label:'¿Cuáles son los horarios?',msg:'Hola Morata! ¿Cuáles son los horarios de atención?'},
  {label:'¿Hacen delivery?',msg:'Hola Morata! ¿Hacen delivery a domicilio?'},
  {label:'¿Están en PedidosYa?',msg:'Hola Morata! ¿Puedo pedir por PedidosYa?'},
  {label:'¿Tienen opciones sin TACC?',msg:'Hola Morata! ¿Cuáles son los productos sin TACC?'},
  {label:'¿Cómo llego al local?',msg:'Hola Morata! ¿Cómo llego al local en Villa Rosa?'},
  {label:'¿Hay estacionamiento?',msg:'Hola Morata! ¿Hay estacionamiento disponible?'},
  {label:'Otra pregunta',msg:'Hola Morata! Quería consultarles algo.'},
];
const chipsEl=document.getElementById('chips-preguntas');
preguntas.forEach(q=>{
  const c=document.createElement('button'); c.type='button'; c.className='chip'; c.textContent=q.label;
  c.onclick=()=>{window.open('https://wa.me/5491126352428?text='+encodeURIComponent(q.msg),'_blank');closeModal();};
  chipsEl.appendChild(c);
});

// ── Encargo form → WhatsApp ───────────────────────────────────────────────
function sendEncargo(){
  const tipo=document.getElementById('f-tipo').value;
  const fecha=document.getElementById('f-fecha').value||'(a confirmar)';
  const nombre=document.getElementById('f-nombre').value||'(no indicado)';
  const tel=document.getElementById('f-tel').value||'(no indicado)';
  const prefs=document.getElementById('f-prefs').value||'(sin preferencias especificadas)';
  const tacc=document.getElementById('f-tacc').checked?'Sí':'No';
  const msg=`Hola Morata! 🎂 Quiero hacer un encargo personalizado.
Producto: ${tipo}
Fecha: ${fecha}
Preferencias: ${prefs}
Sin TACC: ${tacc}
Nombre: ${nombre}
Teléfono: ${tel}`;
  window.open('https://wa.me/5491126352428?text='+encodeURIComponent(msg),'_blank');
  closeModal();
}

// ── Tilt suave en cards de producto (solo mouse) ──────────────────────────
if(window.matchMedia('(hover: hover) and (pointer: fine)').matches){
  document.querySelectorAll('.pcard, .feature').forEach(card=>{
    card.addEventListener('mousemove',e=>{
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      card.style.transform=`perspective(1000px) rotateX(${-y*4}deg) rotateY(${x*6}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave',()=>{ card.style.transform=''; });
  });
}
