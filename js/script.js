// 1. Inicializar el carrito desde LocalStorage
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// 2. Función para calcular la suma con REDUCE
function calcularYMostrarTotal() {
  console.log("--- INICIANDO CÁLCULO DEL TOTAL ---");
  console.log("Contenido actual del carrito:", carrito);

  const total = carrito.reduce((acumulado, producto, indice) => {
    // Extraemos el valor del precio probando distintas alternativas de nombres comunes
    let precioRaw = producto.precio !== undefined ? producto.precio : producto.price;
    
    // Limpiamos el texto eliminando signos de peso, puntos de miles o espacios
    let precioLimpio = String(precioRaw).replace(/[^0-9.-]+/g, "");
    let valorNumerico = parseFloat(precioLimpio) || 0;

    console.log(`Producto #${indice + 1}: "${producto.nombre}" | Precio original:`, precioRaw, `| Convertido a número:`, valorNumerico);

    return acumulado + valorNumerico;
  }, 0);

  console.log("Total final calculado:", total);

  // Actualizamos el DOM
  const elementoTotal = document.getElementById("total-carrito");
  if (elementoTotal) {
    elementoTotal.textContent = total;
  } else {
    console.error("❌ ERROR: No se encontró el elemento HTML con id='total-carrito'");
  }
}

// 3. Función para agregar productos al carrito
function agregarAlCarrito(producto) {
  carrito.push(producto);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  
  // Recalculamos la suma inmediatamente
  calcularYMostrarTotal();
}

// 4. Renderizar productos en el HTML
function imprimirProductosEnHTML(array) {
  const contenedor = document.getElementById("productos");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  array.forEach((producto) => {
    const card = document.createElement("article");
    card.classList.add("card");

    card.innerHTML = `
      <img src="${producto.imagen}" alt="${producto.nombre}" class="card-img" />
      <h3>${producto.nombre}</h3>
      <p>${producto.descripcion}</p>
      <p><strong>$${producto.precio}</strong></p>
      <button class="card-boton" data-id="${producto.id}">Agregar al carrito</button>
    `;

    contenedor.appendChild(card);
  });

  // Asignación de eventos a botones
  const botones = contenedor.querySelectorAll(".card-boton");
  botones.forEach((boton) => {
    boton.addEventListener("click", (e) => {
      const idSeleccionado = Number(e.target.getAttribute("data-id"));
      const productoEncontrado = array.find((p) => p.id === idSeleccionado);

      if (productoEncontrado) {
        Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        }).fire({
          icon: "success",
          title: `Agregaste ${productoEncontrado.nombre} al carrito`,
        });

        agregarAlCarrito(productoEncontrado);
      }
    });
  });
}

// 5. Fetch inicial
fetch("./data/productos.json")
  .then((response) => response.json())
  .then((data) => {
    imprimirProductosEnHTML(data);
    calcularYMostrarTotal();
  })
  .catch((error) => {
    console.error("Error al cargar productos:", error);
  });
