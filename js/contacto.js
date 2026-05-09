// Validacion del formulario de contacto

function iniciarPagina() {
	const form = document.querySelector("#formContacto");
	if (!form) return;

	form.addEventListener("submit", (ev) => {
		ev.preventDefault();

		const nombre = form.querySelector("#nombre").value.trim();
		const email = form.querySelector("#email").value.trim();
		const mensaje = form.querySelector("#mensaje").value.trim();

		if (!nombre || !email || !mensaje) {
			notificar("Completá todos los campos", "warning");
			return;
		}

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			notificar("El email no es válido", "error");
			return;
		}

		Swal.fire({
			icon: "success",
			title: "¡Mensaje enviado!",
			text: `Gracias ${nombre}, te respondemos a la brevedad.`,
			confirmButtonText: "Cerrar"
		});

		form.reset();
	});
}
