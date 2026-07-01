/* manejo de sesión con localStorage */

const AUTH_KEY = 'cacao_usuario';
const USERS_KEY = 'cacao_usuarios';

function getUsuarios() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

function getUsuario() {
  return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null');
}

function registrar(nombre, email, password) {
  const usuarios = getUsuarios();
  if (usuarios.find(u => u.email === email)) {
    throw new Error('Ya existe una cuenta con ese email');
  }
  const nuevo = { id: Date.now(), nombre, email, password };
  usuarios.push(nuevo);
  localStorage.setItem(USERS_KEY, JSON.stringify(usuarios));
  const sesion = { id: nuevo.id, nombre, email };
  localStorage.setItem(AUTH_KEY, JSON.stringify(sesion));
  return sesion;
}

function login(email, password) {
  const usuarios = getUsuarios();
  const usuario = usuarios.find(u => u.email === email && u.password === password);
  if (!usuario) throw new Error('Email o contraseña incorrectos');
  const sesion = { id: usuario.id, nombre: usuario.nombre, email: usuario.email };
  localStorage.setItem(AUTH_KEY, JSON.stringify(sesion));
  return sesion;
}

function logout() {
  localStorage.removeItem(AUTH_KEY);
  if (typeof Swal !== 'undefined') {
    Swal.mixin({
      toast: true, position: 'top-end', showConfirmButton: false, timer: 2500,
      background: '#f7f0e8', color: '#1a0800', iconColor: '#c9962a'
    }).fire({ icon: 'success', title: 'Sesión cerrada correctamente' });
  }
  actualizarNavbarAuth();
}

function actualizarNavbarAuth() {
  const usuario = getUsuario();
  const iconos = document.querySelector('.navbar__iconos');
  if (!iconos) return;

  const existente = iconos.querySelector('.navbar__usuario');
  if (existente) existente.remove();

  const el = document.createElement('div');
  el.className = 'navbar__usuario';

  if (usuario) {
    el.innerHTML = `
      <span class="navbar__usuario-nombre">
        <i class="fa-solid fa-user"></i> ${usuario.nombre.split(' ')[0]}
      </span>
      <button type="button" class="navbar__logout" onclick="logout()" title="Cerrar sesión">
        <i class="fa-solid fa-right-from-bracket"></i>
      </button>
    `;
  } else {
    el.innerHTML = `
      <a href="login.html" class="navbar__login" title="Iniciar sesión">
        <i class="fa-solid fa-user"></i>
      </a>
    `;
  }

  iconos.insertBefore(el, iconos.firstChild);
}

document.addEventListener('DOMContentLoaded', actualizarNavbarAuth);
