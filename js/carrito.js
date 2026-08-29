// 1. Cargar productos desde LocalStorage
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// 2. Función para calcular el total con REDUCE
function obtenerTotalCalculado() {
  return carrito.reduce((acumulado, producto) => {
    let precioLimpio = String(producto.precio).replace(/[^0-9.-]+/g, "");
    let valorNumerico = parseFloat(precioLimpio) || 0;
    return acumulado + valorNumerico;
  }, 0);
}

function calcularYMostrarTotal() {
  const total = obtenerTotalCalculado();
  const elementoTotal = document.getElementById("total-carrito");
  if (elementoTotal) {
    elementoTotal.textContent = total.toLocaleString("es-AR");
  }
}

// 3. Renderizar productos en pantalla (CON RUTA DE IMAGEN CORREGIDA)
function imprimirCarritoEnHTML() {
  const contenedor = document.getElementById("carrito");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  if (carrito.length === 0) {
    contenedor.innerHTML = "<p class='carrito-vacio-msg'>Tu carrito está vacío.</p>";
    calcularYMostrarTotal();
    return;
  }

  carrito.forEach((producto, indice) => {
    // 💡 AJUSTE DE RUTA: cambia el inicio ./img/ por ../img/ para salir de la carpeta pages/
    const rutaImagen = producto.imagen ? producto.imagen.replace("./img/", "../img/") : "";

    const card = document.createElement("article");
    card.classList.add("card");

    card.innerHTML = `
      <img src="${rutaImagen}" alt="${producto.nombre}" class="card-img" />
      <h3>${producto.nombre}</h3>
      <p>${producto.descripcion}</p>
      <p><strong>$${producto.precio}</strong></p>
      <button class="btn-eliminar" data-indice="${indice}">Eliminar</button>
    `;

    contenedor.appendChild(card);
  });

  // Eventos de eliminación individual
  const botonesEliminar = contenedor.querySelectorAll(".btn-eliminar");
  botonesEliminar.forEach((boton) => {
    boton.addEventListener("click", (e) => {
      const indiceAEliminar = Number(e.target.getAttribute("data-indice"));
      eliminarDelCarrito(indiceAEliminar);
    });
  });

  calcularYMostrarTotal();
}

// 4. Eliminar producto individual
function eliminarDelCarrito(indice) {
  carrito.splice(indice, 1);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  imprimirCarritoEnHTML();
}

// 5. Vaciar carrito completo
function vaciarCarrito() {
  carrito = [];
  localStorage.removeItem("carrito");
  localStorage.setItem("carrito", JSON.stringify([]));
  imprimirCarritoEnHTML();
}

// 6. SIMULADOR DE FINALIZAR COMPRA CON ESTILOS SWEETALERT2
function finalizarCompra() {
  const totalPagar = obtenerTotalCalculado();

  if (carrito.length === 0) {
    Swal.fire({
      icon: "info",
      title: "El carrito está vacío",
      text: "Agregá productos antes de realizar tu compra.",
      confirmButtonColor: "#222",
      customClass: {
        popup: "swal2-styled-popup"
      }
    });
    return;
  }

  Swal.fire({
    title: "¿Confirmar tu compra?",
    html: `<p style="font-size: 1.1em;">El total a pagar es: <strong style="color: #2e7d32;">$${totalPagar.toLocaleString("es-AR")}</strong></p>`,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#2e7d32",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, abonar ahora",
    cancelButtonText: "Cancelar",
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "Procesando pago",
        text: "Verificando tu transacción...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        didOpen: () => {
          Swal.showLoading();
        }
      }).then(() => {
        const ordenNum = Math.floor(100000 + Math.random() * 900000);

        Swal.fire({
          icon: "success",
          title: "¡Compra realizada con éxito!",
          html: `
            <p>¡Gracias por tu compra en el Tour Merch!</p>
            <p style="margin-top: 10px; font-weight: bold; color: #555;">Orden #${ordenNum}</p>
          `,
          confirmButtonColor: "#222",
          confirmButtonText: "Entendido"
        });

        vaciarCarrito();
      });
    }
  });
}

// 7. Eventos al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  imprimirCarritoEnHTML();

  const botonVaciar = document.getElementById("btn-vaciar");
  if (botonVaciar) {
    botonVaciar.addEventListener("click", () => {
      if (carrito.length === 0) return;

      Swal.fire({
        title: "¿Vaciar carrito?",
        text: "Se eliminarán todos los productos seleccionados.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#666",
        confirmButtonText: "Sí, vaciar",
        cancelButtonText: "Cancelar",
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          vaciarCarrito();

          Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 2000
          }).fire({
            icon: "info",
            title: "El carrito fue vaciado"
          });
        }
      });
    });
  }

  const botonComprar = document.getElementById("btn-comprar");
  if (botonComprar) {
    botonComprar.addEventListener("click", finalizarCompra);
  }
});
