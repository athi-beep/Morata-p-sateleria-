# Morata Pastelería

**Masa madre. Hecho a mano.**

Sitio web one-page de **Morata Pastelería**, pastelería artesanal de Villa Rosa, Pilar (Buenos Aires).
Proyecto Integrador Final de **Contenidos y Creatividad I** — **Universidad de Palermo**.

🔗 **Sitio publicado:** https://silly-wisp-fc1aae.netlify.app

---

## Sobre el proyecto

Morata Pastelería elabora tortas, pastelería y panificados con masa madre, de forma artesanal.
El sitio presenta la marca, sus productos y su carta, y facilita el pedido por WhatsApp.
En la etapa final (M3) se incorporaron una sección de video cinematográfico, una tienda de 9 productos y un carrito de compras funcional.

## Tecnologías utilizadas

- **HTML5** semántico y accesible
- **CSS3** (diseño responsive, variables, animaciones)
- **JavaScript** (vanilla, sin frameworks ni librerías externas)
- **WebGL / shader** para efectos visuales (`js/shader.js`)
- **localStorage** para guardar el carrito
- Imágenes optimizadas en **JPG** y **WebP** (varias resoluciones)
- Video **MP4** con póster
- Tipografías locales **WOFF2**: Cormorant Garamond e Inter
- Publicación en **Netlify**

## Funcionalidades

- **Inicio (hero)** con la propuesta de la marca.
- **Productos estrella**: lo más pedido por los clientes.
- **La experiencia Morata**: video 16:9 con reproducción automática silenciosa, botón Reproducir/Pausar accesible por teclado, respeta `prefers-reduced-motion`, se pausa fuera de pantalla y muestra una imagen de portada si el video no carga.
- **Tortas**: catálogo de tortas con fotografías.
- **Cómo pedir**: tres pasos por WhatsApp.
- **Carta completa** de productos.
- **Tienda**: 9 productos con filtros (Todos / Café y dulces / Accesorios), precios en formato argentino y botón "Agregar al carrito" con respuesta visual.
- **Carrito**: panel lateral (pantalla completa en celular) con miniaturas, cantidades +/−, eliminar, subtotales y total. Se guarda en el navegador, se cierra con la X, el fondo o Escape, y gestiona el foco para la accesibilidad.
- **Finalizar pedido**: abre WhatsApp con el mensaje armado (productos, cantidades y total). No incluye pagos.
- **Reseñas**: 5.0 ★ en Google.
- **Pedidos por encargo** y llamado a la acción final.
- **Diseño responsive** para escritorio, tablet y celular, con menú hamburguesa.

## Estructura del proyecto

```
index.html                 página principal
css/styles.css             estilos
js/main.js                 interacciones generales
js/shader.js               efecto visual (shader)
js/products.js             datos del catálogo de la tienda
js/shop.js                 tarjetas y filtros de la tienda
js/cart.js                 carrito y envío del pedido por WhatsApp
js/video.js                control del video
assets/img/                imágenes, logo y favicon
assets/img/tortas/         fotos de tortas
assets/img/productos/      fotos de productos
assets/img/ecommerce/      fotos de la tienda (WebP)
assets/video/              video y póster
assets/fonts/              tipografías
```

## Cómo verlo en tu computadora

1. Descargá el repositorio (botón verde **Code → Download ZIP**) y descomprimilo.
2. Abrí `index.html` con doble clic en cualquier navegador. No requiere instalación: todas las rutas son relativas.

## Notas

- Los productos de la tienda son **conceptuales** (prototipo académico); la página lo aclara.
- Para cambiar precios o textos de la tienda, editá solo `js/products.js`.

---

Proyecto académico · Universidad de Palermo · Contenidos y Creatividad I · 2026
