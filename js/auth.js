// ===========================================================
// Login / Registro de usuarios (simulado con localStorage)
// ===========================================================

const CLAVE_USUARIOS = "shadokicks_usuarios";
const CLAVE_SESION = "shadokicks_sesion";

function obtenerUsuarios() {
	const data = localStorage.getItem(CLAVE_USUARIOS);
	if (!data) return [];
	try {
		return JSON.parse(data);
	} catch (e) {
		return [];
	}
}

function guardarUsuarios(usuarios) {
	localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
}

function usuarioActivo() {
	const data = localStorage.getItem(CLAVE_SESION);
	if (!data) return null;
	try {
		return JSON.parse(data);
	} catch (e) {
		return null;
	}
}

function setSesion(usuario) {
	localStorage.setItem(CLAVE_SESION, JSON.stringify({
		nombre: usuario.nombre,
		email: usuario.email
	}));
}

function registrarUsuario(nombre, email, password) {
	const usuarios = obtenerUsuarios();
	// find para chequear si el email ya existe
	const existente = usuarios.find(u => u.email === email);
	if (existente) {
		return { ok: false, error: "Ya existe una cuenta con ese email" };
	}
	// "Hasheo" basico con btoa para no guardar la contraseña en texto plano
	const nuevo = { nombre, email, password: btoa(password) };
	usuarios.push(nuevo);
	guardarUsuarios(usuarios);
	setSesion(nuevo);
	return { ok: true };
}

function iniciarSesionUsuario(email, password) {
	const usuarios = obtenerUsuarios();
	const u = usuarios.find(u => u.email === email && u.password === btoa(password));
	if (!u) return { ok: false, error: "Email o contraseña incorrectos" };
	setSesion(u);
	return { ok: true };
}

function cerrarSesion() {
	localStorage.removeItem(CLAVE_SESION);
}

// -----------------------------------------------------------
// Modales con SweetAlert2 (login + registro)
// -----------------------------------------------------------
async function abrirModalLogin() {
	const { value: datos } = await Swal.fire({
		title: "Iniciar sesión",
		html: `
			<input id="login-email" class="swal2-input" placeholder="Email" type="email">
			<input id="login-password" class="swal2-input" placeholder="Contraseña" type="password">
			<p class="swal-link-cambio">
				¿No tenés cuenta? <a href="#" id="link-registro">Registrate</a>
			</p>
		`,
		focusConfirm: false,
		showCancelButton: true,
		confirmButtonText: "Ingresar",
		cancelButtonText: "Cancelar",
		didOpen: () => {
			document.getElementById("link-registro").addEventListener("click", (ev) => {
				ev.preventDefault();
				Swal.close();
				setTimeout(abrirModalRegistro, 200);
			});
		},
		preConfirm: () => {
			const email = document.getElementById("login-email").value.trim();
			const password = document.getElementById("login-password").value;
			if (!email || !password) {
				Swal.showValidationMessage("Completá todos los campos");
				return false;
			}
			return { email, password };
		}
	});

	if (!datos) return;

	const res = iniciarSesionUsuario(datos.email, datos.password);
	if (!res.ok) {
		Swal.fire({ icon: "error", title: "Error", text: res.error });
		return;
	}

	const u = usuarioActivo();
	notificar(`Bienvenido de nuevo, ${u.nombre.split(" ")[0]}`, "success");
	actualizarHeaderAuth();
}

async function abrirModalRegistro() {
	const { value: datos } = await Swal.fire({
		title: "Crear cuenta",
		html: `
			<input id="reg-nombre" class="swal2-input" placeholder="Nombre completo">
			<input id="reg-email" class="swal2-input" placeholder="Email" type="email">
			<input id="reg-password" class="swal2-input" placeholder="Contraseña (mín. 6 caracteres)" type="password">
			<p class="swal-link-cambio">
				¿Ya tenés cuenta? <a href="#" id="link-login">Iniciá sesión</a>
			</p>
		`,
		focusConfirm: false,
		showCancelButton: true,
		confirmButtonText: "Crear cuenta",
		cancelButtonText: "Cancelar",
		didOpen: () => {
			document.getElementById("link-login").addEventListener("click", (ev) => {
				ev.preventDefault();
				Swal.close();
				setTimeout(abrirModalLogin, 200);
			});
		},
		preConfirm: () => {
			const nombre = document.getElementById("reg-nombre").value.trim();
			const email = document.getElementById("reg-email").value.trim();
			const password = document.getElementById("reg-password").value;
			if (!nombre || !email || !password) {
				Swal.showValidationMessage("Completá todos los campos");
				return false;
			}
			if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
				Swal.showValidationMessage("El email no es válido");
				return false;
			}
			if (password.length < 6) {
				Swal.showValidationMessage("La contraseña debe tener al menos 6 caracteres");
				return false;
			}
			return { nombre, email, password };
		}
	});

	if (!datos) return;

	const res = registrarUsuario(datos.nombre, datos.email, datos.password);
	if (!res.ok) {
		Swal.fire({ icon: "error", title: "Error", text: res.error });
		return;
	}

	notificar(`Cuenta creada. ¡Bienvenido ${datos.nombre.split(" ")[0]}!`, "success");
	actualizarHeaderAuth();
}

// -----------------------------------------------------------
// Render del header segun el estado de sesion
// -----------------------------------------------------------
function actualizarHeaderAuth() {
	const u = usuarioActivo();
	const linkBoton = document.querySelector(".boton-login");
	if (!linkBoton) return;
	if (u) {
		linkBoton.textContent = `Hola, ${u.nombre.split(" ")[0]}`;
		linkBoton.classList.add("usuario-logueado");
	} else {
		linkBoton.textContent = "Iniciar sesión";
		linkBoton.classList.remove("usuario-logueado");
	}
}

// -----------------------------------------------------------
// Inicializacion: delegacion de eventos sobre el boton
// -----------------------------------------------------------
function inicializarAuth() {
	actualizarHeaderAuth();

	document.addEventListener("click", (ev) => {
		const enlace = ev.target.closest(".boton-login, .boton-icono-iniciar");
		if (!enlace) return;
		ev.preventDefault();

		const u = usuarioActivo();
		if (u) {
			// Si ya esta logueado, ofrezco cerrar sesion
			Swal.fire({
				title: `Hola, ${u.nombre}`,
				html: `<p>Sesión activa: <b>${u.email}</b></p>`,
				icon: "info",
				showCancelButton: true,
				confirmButtonText: "Cerrar sesión",
				cancelButtonText: "Volver"
			}).then((res) => {
				if (res.isConfirmed) {
					cerrarSesion();
					actualizarHeaderAuth();
					notificar("Sesión cerrada", "info");
				}
			});
		} else {
			abrirModalLogin();
		}
	});
}
