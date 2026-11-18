/* ==========================================================================
   MORATA PASTELERÍA — Catálogo de la tienda (solo datos)
   Productos conceptuales para el prototipo académico (Contenidos y
   Creatividad I, UP). No representan inventario real confirmado.

   Campos:
   · id        identificador estable (se guarda en localStorage)
   · name      nombre mostrado en la tarjeta, el carrito y el mensaje
   · price     precio en pesos argentinos (número entero)
   · category  "cafe-dulces" | "accesorios"  → filtros de la tienda
   · tag       etiqueta editorial sobre el nombre
   · desc      descripción breve
   · img       ruta base de la imagen (sin sufijo ni extensión):
               {img}.webp (1000 px) · {img}-640.webp · {img}-thumb.webp
   · w / h     dimensiones intrínsecas de {img}.webp (evitan saltos de diseño)
   · pos       object-position para el encuadre 4:5 de la tarjeta
               (las tres fotos cuadradas se recortan solo en los costados,
               sin tocar el envase)
   · alt       texto alternativo de la fotografía
   ========================================================================== */
window.MORATA_PRODUCTS = [
  {
    id: '01', name: 'Morata House Blend Coffee', price: 10000,
    category: 'cafe-dulces', tag: 'Café',
    desc: 'Café de especialidad para disfrutar cada mañana a tu manera.',
    img: 'assets/img/ecommerce/01-house-blend', w: 1000, h: 1250, pos: '50% 50%',
    alt: 'Bolsa de Morata House Blend Coffee junto a una taza de café con latte art y granos de café sobre la mesa'
  },
  {
    id: '02', name: 'Cookies GF Chocolate Chips', price: 6300,
    category: 'cafe-dulces', tag: 'Cookies GF',
    desc: 'Cookies artesanales con chips de chocolate y una textura irresistible.',
    img: 'assets/img/ecommerce/02-cookies-chocolate-chips', w: 1000, h: 1000, pos: '60% 50%',
    alt: 'Paquete de Cookies GF Chocolate Chips de Morata con una cookie entera y otra partida al frente'
  },
  {
    id: '03', name: 'Cookies GF Full Chocolate', price: 6300,
    category: 'cafe-dulces', tag: 'Cookies GF',
    desc: 'Chocolate intenso, textura suave y un sabor que invita a repetir.',
    img: 'assets/img/ecommerce/03-cookies-full-chocolate', w: 1000, h: 1000, pos: '16% 50%',
    alt: 'Paquete marrón de Cookies GF Full Chocolate de Morata junto a una pila de cookies de chocolate y una partida al medio'
  },
  {
    id: '04', name: 'Cookies GF Limón', price: 6300,
    category: 'cafe-dulces', tag: 'Cookies GF',
    desc: 'Cookies delicadas con notas cítricas y el equilibrio justo de dulzura.',
    img: 'assets/img/ecommerce/04-cookies-limon', w: 1000, h: 1000, pos: '60% 50%',
    alt: 'Paquete de Cookies GF Limón de Morata con limones frescos y una pila de cookies doradas al frente'
  },
  {
    id: '05', name: 'Mermelada de Frutilla', price: 6000,
    category: 'cafe-dulces', tag: 'Mermeladas',
    desc: 'Frutillas seleccionadas y sabor artesanal en cada cucharada.',
    img: 'assets/img/ecommerce/05-mermelada-frutilla', w: 1000, h: 1250, pos: '50% 50%',
    alt: 'Frasco de Mermelada de Frutilla de Morata con una frutilla cortada y una cuchara con mermelada'
  },
  {
    id: '06', name: 'Mermelada de Durazno', price: 6000,
    category: 'cafe-dulces', tag: 'Mermeladas',
    desc: 'Suave, frutal y perfecta para acompañar tus desayunos.',
    img: 'assets/img/ecommerce/06-mermelada-durazno', w: 1000, h: 1250, pos: '50% 50%',
    alt: 'Frasco de Mermelada de Durazno de Morata junto a duraznos frescos y una cuchara con mermelada'
  },
  {
    id: '07', name: 'Mermelada de Manzana', price: 6000,
    category: 'cafe-dulces', tag: 'Mermeladas',
    desc: 'Una combinación delicada y reconfortante para cada momento.',
    img: 'assets/img/ecommerce/07-mermelada-manzana', w: 1000, h: 1250, pos: '50% 50%',
    alt: 'Frasco de Mermelada de Manzana de Morata con manzanas frescas y una cuchara con mermelada'
  },
  {
    id: '08', name: 'Delantal Morata', price: 20000,
    category: 'accesorios', tag: 'Accesorios',
    desc: 'Nuestro universo artesanal, también en tu cocina.',
    img: 'assets/img/ecommerce/08-delantal', w: 1000, h: 1250, pos: '50% 50%',
    alt: 'Delantal Morata color crema con cintas lavanda colgado de una percha de madera'
  },
  {
    id: '09', name: 'Mug Portátil Morata', price: 18000,
    category: 'accesorios', tag: 'Accesorios',
    desc: 'Tu café favorito, a donde vayas.',
    img: 'assets/img/ecommerce/09-mug-portatil', w: 1000, h: 1250, pos: '50% 50%',
    alt: 'Mug portátil Morata color crema con tapa marrón, junto a granos de café y una medialuna'
  }
];

/* Filtros de la tienda: valor del botón → etiqueta */
window.MORATA_FILTERS = [
  { value: 'todos',        label: 'Todos' },
  { value: 'cafe-dulces',  label: 'Café y dulces' },
  { value: 'accesorios',   label: 'Accesorios' }
];
