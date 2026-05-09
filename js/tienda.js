// Render de la tienda: 3 secciones + filtros + busqueda

function iniciarPagina() {
	const contNuevos = document.querySelector("#nuevosLanzamientos");
	const contShadow = document.querySelector("#shadowDestacados");
	const contTodos = document.querySelector("#todosLosPares");
	const inputBuscar = document.querySelector("#filtroBusqueda");
	const selectOrden = document.querySelector("#filtroOrden");

	// Si entro con ?buscar=algo en la URL, lo aplico al input
	const params = new URLSearchParams(window.location.search);
	const terminoUrl = params.get("buscar");
	if (terminoUrl && inputBuscar) {
		inputBuscar.value = terminoUrl;
	}

	function aplicarFiltros() {
		const termino = (inputBuscar?.value || "").toLowerCase().trim();
		const orden = selectOrden?.value || "default";

		// filter por nombre
		let filtrados = productos.filter(p => p.nombre.toLowerCase().includes(termino));

		// sort segun el criterio
		if (orden === "precio-asc") {
			filtrados = [...filtrados].sort((a, b) => a.precio - b.precio);
		} else if (orden === "precio-desc") {
			filtrados = [...filtrados].sort((a, b) => b.precio - a.precio);
		} else if (orden === "nombre") {
			filtrados = [...filtrados].sort((a, b) => a.nombre.localeCompare(b.nombre));
		}

		// Si hay un termino de busqueda, muestro un solo bloque con todos los resultados
		if (termino) {
			pintarLista(contTodos, filtrados);
			ocultarBloque(contNuevos);
			ocultarBloque(contShadow);
			cambiarTituloUnico(filtrados.length, termino);
			return;
		}

		// Sin termino: muestro las 3 secciones
		mostrarBloque(contNuevos);
		mostrarBloque(contShadow);
		restaurarTitulos();

		pintarLista(contNuevos, filtrados.filter(p => p.categoria === "destacados"));
		pintarLista(contShadow, filtrados.filter(p => p.categoria === "shadow"));
		pintarLista(contTodos, filtrados);
	}

	function ocultarBloque(cont) {
		if (!cont) return;
		const bloque = cont.closest(".bloque-tienda");
		if (bloque) bloque.style.display = "none";
	}

	function mostrarBloque(cont) {
		if (!cont) return;
		const bloque = cont.closest(".bloque-tienda");
		if (bloque) bloque.style.display = "";
	}

	function cambiarTituloUnico(cantidad, termino) {
		const titulo = document.querySelector("#tituloTodos");
		if (titulo) titulo.textContent = `Resultados para "${termino}" (${cantidad})`;
	}

	function restaurarTitulos() {
		const titulo = document.querySelector("#tituloTodos");
		if (titulo) titulo.textContent = "Todos los pares";
	}

	if (inputBuscar) inputBuscar.addEventListener("input", aplicarFiltros);
	if (selectOrden) selectOrden.addEventListener("change", aplicarFiltros);

	aplicarFiltros();
}
