// Render de la pagina de detalle de producto

function iniciarPagina() {
	const params = new URLSearchParams(window.location.search);
	const id = parseInt(params.get("id"), 10) || 1;

	const producto = productos.find(p => p.id === id);
	if (!producto) {
		document.querySelector(".pagina-producto").innerHTML =
			`<div class="container py-5"><h2>Producto no encontrado</h2></div>`;
		return;
	}

	// Actualizo el titulo de la pestaña
	document.title = producto.nombre + " | Shadokicks";

	// Imagen principal
	const img = document.querySelector("#productoImagen");
	if (img) {
		img.src = RUTA_BASE + producto.imagen;
		img.alt = producto.nombre;
	}

	// Nombre, precio, descripcion
	document.querySelector("#productoNombre").textContent = producto.nombre;
	document.querySelector("#productoPrecio").textContent = "$" + producto.precio;
	document.querySelector("#productoDescripcion").textContent = producto.descripcion;

	// Render de los talles
	const cont = document.querySelector("#talles");
	cont.innerHTML = producto.talles
		.map(t => `<button type="button" class="btn btn-outline-primary talle-btn" data-talle="${t}">${t}</button>`)
		.join("");

	let talleSeleccionado = null;
	cont.addEventListener("click", (ev) => {
		const btn = ev.target.closest(".talle-btn");
		if (!btn) return;
		cont.querySelectorAll(".talle-btn").forEach(b => b.classList.remove("activo"));
		btn.classList.add("activo");
		talleSeleccionado = parseInt(btn.dataset.talle, 10);
	});

	// Boton añadir al carrito (este pide talle)
	const btnAdd = document.querySelector("#btnAddDetalle");
	btnAdd.addEventListener("click", (ev) => {
		ev.preventDefault();
		if (!talleSeleccionado) {
			notificar("Elegí un talle antes de continuar", "warning");
			return;
		}
		agregarAlCarrito(producto.id, talleSeleccionado);
		abrirCarrito();
	});

	// Productos relacionados: 3 al azar excluyendo el actual
	const cont2 = document.querySelector("#productosRelacionados");
	if (cont2) {
		const otros = productos.filter(p => p.id !== producto.id);
		// map para asignar un orden aleatorio y luego sort
		const aleatorios = otros
			.map(p => ({ p, r: Math.random() }))
			.sort((a, b) => a.r - b.r)
			.slice(0, 3)
			.map(x => x.p);
		pintarLista(cont2, aleatorios);
	}
}
