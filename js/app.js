// ===========================================================
// Shadokicks - Lógica principal del ecommerce
// ===========================================================

// Calculo la ruta base segun donde estoy parado para que el fetch
// y las imagenes funcionen tanto en index.html como en /pages/*.
const RUTA_BASE = window.location.pathname.includes("/pages/") ? "../" : "./";

// Clave que uso en localStorage para persistir el carrito entre paginas
const CLAVE_CARRITO = "shadokicks_carrito";

// Estado en memoria
let productos = [];
let carrito = cargarCarrito();

// -----------------------------------------------------------
// Helpers de localStorage para el carrito
// -----------------------------------------------------------
function cargarCarrito() {
	const data = localStorage.getItem(CLAVE_CARRITO);
	if (!data) return [];
	try {
		return JSON.parse(data);
	} catch (e) {
		return [];
	}
}

function guardarCarrito() {
	localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
}

// -----------------------------------------------------------
// Notificaciones con SweetAlert2 (libreria externa)
// -----------------------------------------------------------
function notificar(titulo, icono = "success") {
	Swal.fire({
		toast: true,
		position: "top-end",
		icon: icono,
		title: titulo,
		showConfirmButton: false,
		timer: 2000,
		timerProgressBar: true
	});
}

// -----------------------------------------------------------
// Fetch del JSON con todos los productos
// -----------------------------------------------------------
async function obtenerProductos() {
	if (productos.length > 0) return productos;
	try {
		const respuesta = await fetch(RUTA_BASE + "data/productos.json");
		if (!respuesta.ok) throw new Error("No se pudo cargar el catalogo");
		productos = await respuesta.json();
		return productos;
	} catch (error) {
		notificar("Error al cargar los productos", "error");
		return [];
	}
}

// -----------------------------------------------------------
// Render de tarjetas de producto (se reutiliza en home y tienda)
// -----------------------------------------------------------
function plantillaTarjeta(producto) {
	return `
		<article class="tarjeta-producto ${producto.fondo}" data-aos="fade-up" data-aos-duration="800">
			<a href="${RUTA_BASE}pages/producto.html?id=${producto.id}" class="link-tarjeta" aria-label="Ver ${producto.nombre}">
				<div class="tarjeta-encabezado">
					<div class="precio-tarjeta">$${producto.precio}</div>
					<div class="logo-tarjeta">
						<img src="${RUTA_BASE}imagenes/logo.png" alt="Shadokicks">
					</div>
				</div>
				<div class="tarjeta-cuerpo">
					<img class="producto" src="${RUTA_BASE}${producto.imagen}" alt="${producto.nombre}">
				</div>
			</a>
			<div class="tarjeta-pie">
				<div class="pie-interno">
					<button type="button" class="btn-anadir" data-id="${producto.id}">Añadir al carrito</button>
				</div>
			</div>
		</article>
	`;
}

function pintarLista(contenedor, lista) {
	if (!contenedor) return;
	if (lista.length === 0) {
		contenedor.innerHTML = `<p class="sin-resultados">No encontramos productos.</p>`;
		return;
	}
	contenedor.innerHTML = lista.map(plantillaTarjeta).join("");
}

// -----------------------------------------------------------
// Carrito: agregar, quitar, total, render
// -----------------------------------------------------------
function agregarAlCarrito(idProducto, talleSeleccionado = null) {
	const producto = productos.find(p => p.id === idProducto);
	if (!producto) return;

	// Si ya esta en el carrito, sumo cantidad
	const existente = carrito.find(item => item.id === idProducto && item.talle === talleSeleccionado);
	if (existente) {
		existente.cantidad += 1;
	} else {
		carrito.push({
			id: producto.id,
			nombre: producto.nombre,
			precio: producto.precio,
			imagen: producto.imagen,
			talle: talleSeleccionado,
			cantidad: 1
		});
	}
	guardarCarrito();
	actualizarBadgeCarrito();
	renderCarrito();
	notificar(`Agregaste "${producto.nombre}" al carrito`);
}

function quitarDelCarrito(idProducto, talle) {
	carrito = carrito.filter(item => !(item.id === idProducto && item.talle === talle));
	guardarCarrito();
	actualizarBadgeCarrito();
	renderCarrito();
}

function cambiarCantidad(idProducto, talle, delta) {
	const item = carrito.find(i => i.id === idProducto && i.talle === talle);
	if (!item) return;
	item.cantidad += delta;
	if (item.cantidad <= 0) {
		quitarDelCarrito(idProducto, talle);
		return;
	}
	guardarCarrito();
	actualizarBadgeCarrito();
	renderCarrito();
}

function vaciarCarrito() {
	carrito = [];
	guardarCarrito();
	actualizarBadgeCarrito();
	renderCarrito();
}

function calcularTotal() {
	// reduce para sumar precio * cantidad de cada item
	return carrito.reduce((acum, item) => acum + item.precio * item.cantidad, 0);
}

function cantidadTotalItems() {
	return carrito.reduce((acum, item) => acum + item.cantidad, 0);
}

// -----------------------------------------------------------
// Render del carrito (offcanvas Bootstrap)
// -----------------------------------------------------------
function actualizarBadgeCarrito() {
	const badge = document.querySelector(".badge-carrito");
	if (!badge) return;
	const total = cantidadTotalItems();
	badge.textContent = total;
	badge.style.display = total > 0 ? "inline-block" : "none";
}

function renderCarrito() {
	const lista = document.getElementById("listaCarrito");
	const totalEl = document.getElementById("totalCarrito");
	const btnPagar = document.getElementById("btnFinalizar");
	if (!lista || !totalEl) return;

	if (carrito.length === 0) {
		lista.innerHTML = `<p class="carrito-vacio">Tu carrito está vacío.</p>`;
		totalEl.textContent = "$0";
		if (btnPagar) btnPagar.disabled = true;
		return;
	}

	lista.innerHTML = carrito.map(item => `
		<div class="item-carrito">
			<img src="${RUTA_BASE}${item.imagen}" alt="${item.nombre}">
			<div class="item-info">
				<p class="item-nombre">${item.nombre}</p>
				<p class="item-talle">${item.talle ? "Talle " + item.talle : ""}</p>
				<p class="item-precio">$${item.precio} x ${item.cantidad}</p>
				<div class="item-acciones">
					<button class="btn-cant" data-accion="restar" data-id="${item.id}" data-talle="${item.talle}">−</button>
					<span>${item.cantidad}</span>
					<button class="btn-cant" data-accion="sumar" data-id="${item.id}" data-talle="${item.talle}">+</button>
					<button class="btn-quitar" data-id="${item.id}" data-talle="${item.talle}">Quitar</button>
				</div>
			</div>
		</div>
	`).join("");

	totalEl.textContent = "$" + calcularTotal();
	if (btnPagar) btnPagar.disabled = false;
}

// -----------------------------------------------------------
// Checkout: simula la finalizacion de compra con SweetAlert
// -----------------------------------------------------------
async function finalizarCompra() {
	if (carrito.length === 0) return;

	const { value: datos } = await Swal.fire({
		title: "Finalizar compra",
		html: `
			<input id="swal-nombre" class="swal2-input" placeholder="Nombre completo">
			<input id="swal-email" class="swal2-input" placeholder="Email" type="email">
			<input id="swal-direccion" class="swal2-input" placeholder="Dirección de envío">
		`,
		focusConfirm: false,
		showCancelButton: true,
		confirmButtonText: "Pagar",
		cancelButtonText: "Cancelar",
		preConfirm: () => {
			const nombre = document.getElementById("swal-nombre").value.trim();
			const email = document.getElementById("swal-email").value.trim();
			const direccion = document.getElementById("swal-direccion").value.trim();
			if (!nombre || !email || !direccion) {
				Swal.showValidationMessage("Completá todos los campos");
				return false;
			}
			if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
				Swal.showValidationMessage("El email no es válido");
				return false;
			}
			return { nombre, email, direccion };
		}
	});

	if (!datos) return;

	// Simulo procesamiento del pago con un delay
	Swal.fire({
		title: "Procesando pago...",
		allowOutsideClick: false,
		didOpen: () => Swal.showLoading()
	});

	await new Promise(resolve => setTimeout(resolve, 1500));

	const numeroOrden = "SK-" + Date.now().toString().slice(-6);
	const total = calcularTotal();

	await Swal.fire({
		icon: "success",
		title: "¡Compra confirmada!",
		html: `
			<p>Gracias <b>${datos.nombre}</b>, recibimos tu pedido.</p>
			<p><b>Orden:</b> ${numeroOrden}</p>
			<p><b>Total:</b> $${total}</p>
			<p>Te enviamos los detalles a <b>${datos.email}</b>.</p>
		`,
		confirmButtonText: "Cerrar"
	});

	vaciarCarrito();
	const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById("carritoOffcanvas"));
	if (offcanvas) offcanvas.hide();
}

// -----------------------------------------------------------
// Buscador del header (filtra y redirige a tienda)
// -----------------------------------------------------------
function inicializarBuscador() {
	const inputs = document.querySelectorAll(".campo-busqueda");
	const botones = document.querySelectorAll(".boton-buscar");

	inputs.forEach(input => {
		input.addEventListener("keydown", (ev) => {
			if (ev.key === "Enter") {
				ev.preventDefault();
				redirigirBusqueda(input.value);
			}
		});
	});

	botones.forEach(btn => {
		btn.addEventListener("click", () => {
			const input = btn.parentElement.querySelector(".campo-busqueda");
			if (input) redirigirBusqueda(input.value);
		});
	});
}

function redirigirBusqueda(termino) {
	const limpio = termino.trim();
	if (!limpio) return;
	window.location.href = RUTA_BASE + "pages/tienda.html?buscar=" + encodeURIComponent(limpio);
}

// -----------------------------------------------------------
// Delegacion de eventos: botones "Añadir al carrito"
// y acciones dentro del carrito (sumar/restar/quitar)
// -----------------------------------------------------------
function inicializarEventosCarrito() {
	document.addEventListener("click", (ev) => {
		// Botones "Añadir al carrito" en tarjetas (sin talle)
		const btnAdd = ev.target.closest(".btn-anadir[data-id]");
		if (btnAdd && !btnAdd.dataset.detalle) {
			ev.preventDefault();
			const id = parseInt(btnAdd.dataset.id, 10);
			agregarAlCarrito(id);
			abrirCarrito();
			return;
		}

		// Sumar / restar
		const btnCant = ev.target.closest(".btn-cant");
		if (btnCant) {
			const id = parseInt(btnCant.dataset.id, 10);
			const talleRaw = btnCant.dataset.talle;
			const talle = talleRaw === "null" ? null : parseInt(talleRaw, 10);
			cambiarCantidad(id, talle, btnCant.dataset.accion === "sumar" ? 1 : -1);
			return;
		}

		// Quitar item
		const btnQuitar = ev.target.closest(".btn-quitar");
		if (btnQuitar) {
			const id = parseInt(btnQuitar.dataset.id, 10);
			const talleRaw = btnQuitar.dataset.talle;
			const talle = talleRaw === "null" ? null : parseInt(talleRaw, 10);
			quitarDelCarrito(id, talle);
			return;
		}

		// Vaciar carrito
		if (ev.target.closest("#btnVaciar")) {
			if (carrito.length === 0) return;
			Swal.fire({
				title: "¿Vaciar carrito?",
				text: "Se eliminarán todos los productos",
				icon: "warning",
				showCancelButton: true,
				confirmButtonText: "Sí, vaciar",
				cancelButtonText: "Cancelar"
			}).then((res) => {
				if (res.isConfirmed) {
					vaciarCarrito();
					notificar("Carrito vaciado", "info");
				}
			});
			return;
		}

		// Finalizar compra
		if (ev.target.closest("#btnFinalizar")) {
			finalizarCompra();
		}
	});
}

function abrirCarrito() {
	const el = document.getElementById("carritoOffcanvas");
	if (!el) return;
	const oc = bootstrap.Offcanvas.getOrCreateInstance(el);
	oc.show();
}

// -----------------------------------------------------------
// Inicializacion comun a todas las paginas
// -----------------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
	await obtenerProductos();
	actualizarBadgeCarrito();
	renderCarrito();
	inicializarBuscador();
	inicializarEventosCarrito();

	// Disparo el init especifico de la pagina si existe
	if (typeof iniciarPagina === "function") {
		iniciarPagina();
	}

	if (typeof AOS !== "undefined") {
		AOS.init({ once: true, easing: "ease-out-cubic" });
	}
});
