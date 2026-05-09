// Render de la home: 4 productos destacados
function iniciarPagina() {
	const contenedor = document.querySelector("#destacadosHome");
	if (!contenedor) return;

	// filter para quedarme con los destacados, sort por precio ascendente
	const destacados = productos
		.filter(p => p.categoria === "destacados")
		.sort((a, b) => a.precio - b.precio)
		.slice(0, 4);

	pintarLista(contenedor, destacados);
}
