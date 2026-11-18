/* ==========================================================================
   MELTED CHOCOLATE — shader WebGL original ("Melted Chocolate.html")
   Integrado dentro del HERO (#hero). El fragment shader, los colores,
   la iluminación, el suavizado del mouse (0.07), las ondas por click
   (máx. 8) y el cursor de chocolate son los del archivo original.
   Cambios únicamente de integración:
   · el canvas mide el hero (no la ventana) → el sitio hace scroll normal;
   · coordenadas del puntero relativas al hero;
   · el cursor de chocolate solo aparece sobre zonas libres del hero
     (en links/botones vuelve el cursor normal);
   · el render se pausa cuando el hero no está en pantalla (performance).
   ========================================================================== */
(function(){
  const hero   = document.getElementById('hero');
  const canvas = document.getElementById('gl');
  const cur    = document.getElementById('cur');
  if(!hero || !canvas) return;

  const gl = canvas.getContext('webgl', {antialias:false, alpha:false})
          || canvas.getContext('experimental-webgl');
  if (!gl){ hero.classList.add('no-webgl'); return; }

  /* ---- shaders (idénticos al original) ---- */
  const VERT = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  const FRAG = `
precision highp float;
uniform vec2  u_res;
uniform float u_t;
uniform vec2  u_m;      // smoothed mouse (device px, y-up)
uniform vec3  u_rip[8]; // click ripples: x,y,startTime
uniform int   u_rN;

const vec3 VOID  = vec3(0.060, 0.020, 0.006);
const vec3 DEEP  = vec3(0.200, 0.085, 0.030);
const vec3 MILK  = vec3(0.450, 0.240, 0.096);
const vec3 CREST = vec3(0.700, 0.420, 0.190);
const vec3 SHEEN = vec3(0.980, 0.870, 0.680);

vec2 toUV(vec2 px){ return (px - 0.5*u_res) / u_res.y; }

float wave(vec2 p){
  float w = 0.;
  vec2 m = toUV(u_m);

  // 1. Cursor source — always rippling outward, stronger near cursor
  float dm = length(p - m);
  w += sin(dm * 22. - u_t * 3.2) * exp(-dm * 1.4) * 0.72;

  // 2. Three slow ambient sources (keep surface alive when still)
  for (int i=0;i<3;i++){
    float fi = float(i);
    vec2 s = vec2(sin(u_t*0.14+fi*2.09)*0.68, cos(u_t*0.11+fi*1.57)*0.46);
    float ds = length(p - s);
    w += sin(ds*13. - u_t*1.1 - fi*2.1) * exp(-ds*1.55) * 0.24;
  }

  // 3. Click waves — slow-spreading, long-lived
  for (int i=0;i<8;i++){
    if (i>=u_rN) break;
    vec2 c   = toUV(u_rip[i].xy);
    float age = u_t - u_rip[i].z;
    float dc  = length(p - c);
    float env = exp(-dc*0.85) * exp(-age*0.70) * smoothstep(0.,0.22,age);
    w += sin(dc*17. - age*7.5) * env * 1.5;
  }
  return w;
}

void main(){
  vec2 uv = toUV(gl_FragCoord.xy);
  float h = wave(uv);

  float e  = 0.007;
  float hx = wave(uv+vec2(e,0.)) - wave(uv-vec2(e,0.));
  float hy = wave(uv+vec2(0.,e)) - wave(uv-vec2(0.,e));
  vec3  N  = normalize(vec3(-hx*6.5, -hy*6.5, 1.));

  vec3 L1 = normalize(vec3( 0.45,  0.70, 1.15));
  vec3 L2 = normalize(vec3(-0.75,  0.25, 0.80));
  vec3 V  = vec3(0., 0., 1.);

  float diff  = max(dot(N, L1), 0.) * 0.65 + max(dot(N, L2), 0.) * 0.20;
  float spec1 = pow(max(dot(reflect(-L1,N), V), 0.), 32.);
  float spec2 = pow(max(dot(reflect(-L2,N), V), 0.), 10.) * 0.35;

  float v = h * 0.26 + 0.5;
  v = clamp(v, 0., 1.);

  vec3 col = VOID;
  col = mix(col, DEEP,  smoothstep(0.18, 0.40, v));
  col = mix(col, MILK,  smoothstep(0.38, 0.64, v));
  col = mix(col, CREST, smoothstep(0.62, 0.90, v));

  col *= 0.48 + 0.65 * diff;

  col += SHEEN * spec1 * 1.30;
  col += SHEEN * spec2 * 0.50;

  col += SHEEN * smoothstep(0.82, 1.0, v) * 0.18;

  col *= 1. - 0.26 * dot(uv, uv);

  gl_FragColor = vec4(clamp(col, 0., 1.), 1.);
}`;

  function sh(type, src){
    const s=gl.createShader(type); gl.shaderSource(s,src); gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){ console.error(gl.getShaderInfoLog(s)); return null; }
    return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if(!gl.getProgramParameter(prog,gl.LINK_STATUS)){
    console.error(gl.getProgramInfoLog(prog)); hero.classList.add('no-webgl'); return;
  }

  const loc = {
    a:     gl.getAttribLocation(prog,'a'),
    u_res: gl.getUniformLocation(prog,'u_res'),
    u_t:   gl.getUniformLocation(prog,'u_t'),
    u_m:   gl.getUniformLocation(prog,'u_m'),
    u_rip: gl.getUniformLocation(prog,'u_rip'),
    u_rN:  gl.getUniformLocation(prog,'u_rN'),
  };

  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW);

  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const DPR = Math.min(window.devicePixelRatio||1, coarse ? 1.5 : 2);
  let W=1, H=1, rect = hero.getBoundingClientRect();
  function resize(){
    rect = hero.getBoundingClientRect();
    const w = hero.clientWidth, h = hero.clientHeight;
    W=Math.max(1,Math.floor(w*DPR)); H=Math.max(1,Math.floor(h*DPR));
    canvas.width=W; canvas.height=H;
    canvas.style.width=w+'px'; canvas.style.height=h+'px';
    gl.viewport(0,0,W,H);
  }
  resize();
  if('ResizeObserver' in window){ new ResizeObserver(resize).observe(hero); }
  addEventListener('resize', resize);

  /* ---- mouse — heavily smoothed so it never twitches ---- */
  let tgt=[W/2,H/2], mouse=[W/2,H/2];
  let cx=0, cy=0;
  addEventListener('pointermove', e=>{
    rect = hero.getBoundingClientRect();
    cx=e.clientX; cy=e.clientY;
    tgt[0]=(e.clientX-rect.left)*DPR; tgt[1]=(rect.height-(e.clientY-rect.top))*DPR;
    // cursor de chocolate: solo con mouse y sobre zonas libres del hero
    if(cur){
      const onFree = e.pointerType==='mouse' && e.target===canvas;
      cur.classList.toggle('on', onFree);
    }
  }, {passive:true});
  hero.addEventListener('pointerleave', ()=>cur && cur.classList.remove('on'));

  /* ---- click ripples ---- */
  const RIP_MAX=8, rips=[], ripData=new Float32Array(RIP_MAX*3);
  const t0=performance.now(); const now=()=>(performance.now()-t0)/1000;

  canvas.addEventListener('pointerdown', e=>{
    rect = hero.getBoundingClientRect();
    rips.push({x:(e.clientX-rect.left)*DPR, y:(rect.height-(e.clientY-rect.top))*DPR, t:now()});
    if(rips.length>RIP_MAX) rips.shift();
    if(e.pointerType!=='mouse'){ // en touch la onda también "sigue" al dedo
      tgt[0]=(e.clientX-rect.left)*DPR; tgt[1]=(rect.height-(e.clientY-rect.top))*DPR;
    }
    cur && cur.classList.add('down');
  }, {passive:true});
  addEventListener('pointerup', ()=>cur && cur.classList.remove('down'));

  /* ---- parallax suave de la foto del hero (del index original) ---- */
  const heroImg = document.getElementById('heroImg');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  let mx=0, my=0;
  if(fine){
    document.addEventListener('mousemove', e=>{
      mx=(e.clientX/window.innerWidth-0.5)*12;
      my=(e.clientY/window.innerHeight-0.5)*-8;
    }, {passive:true});
  }

  /* ---- render loop (pausado fuera de pantalla) ---- */
  let inView = true, pageOn = !document.hidden, raf = 0;
  const isOn = ()=> inView && pageOn;
  function render(){
    mouse[0] += (tgt[0]-mouse[0]) * 0.07;
    mouse[1] += (tgt[1]-mouse[1]) * 0.07;

    if(cur){ cur.style.transform = `translate3d(${cx}px,${cy}px,0)`; }

    const t = now();
    const rn = rips.length;
    for(let i=0;i<rn;i++){
      ripData[i*3]=rips[i].x; ripData[i*3+1]=rips[i].y; ripData[i*3+2]=rips[i].t;
    }

    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.enableVertexAttribArray(loc.a);
    gl.vertexAttribPointer(loc.a,2,gl.FLOAT,false,0,0);
    gl.uniform2f(loc.u_res, W, H);
    gl.uniform1f(loc.u_t, t);
    gl.uniform2f(loc.u_m, mouse[0], mouse[1]);
    if(rn>0) gl.uniform3fv(loc.u_rip, ripData);
    gl.uniform1i(loc.u_rN, rn);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if(heroImg && fine){
      heroImg.style.transform = `perspective(1200px) rotateY(${mx*0.25}deg) rotateX(${my*0.25}deg) translate3d(${mx*0.6}px,${my*0.6}px,0)`;
    }
    raf = isOn() ? requestAnimationFrame(render) : 0;
  }
  function start(){ if(!raf && isOn()){ raf = requestAnimationFrame(render); } }

  if('IntersectionObserver' in window){
    new IntersectionObserver(entries=>{
      inView = entries[0].isIntersecting; start();
    }, {threshold:0}).observe(hero);
  }
  document.addEventListener('visibilitychange', ()=>{
    pageOn = !document.hidden; start();
  });
  start();
})();
