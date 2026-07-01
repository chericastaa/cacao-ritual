/* carrito de compras con localStorage */

const CARRITO_KEY = 'cacao_carrito';

/* SweetAlert2 helpers (mismo estilo que León) */
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: '#f7f0e8',
  color: '#1a0800',
  iconColor: '#c9962a'
});

function alertaExito(titulo, texto) {
  return Swal.fire({
    title: titulo,
    text: texto,
    icon: 'success',
    confirmButtonColor: '#c9962a',
    background: '#f7f0e8',
    color: '#1a0800',
    iconColor: '#c9962a'
  });
}

function alertaConfirmacion(titulo, texto, confirmText) {
  return Swal.fire({
    title: titulo,
    text: texto,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#c9962a',
    cancelButtonColor: '#7b1d2e',
    confirmButtonText: confirmText || 'Sí, continuar',
    cancelButtonText: 'Cancelar',
    background: '#f7f0e8',
    color: '#1a0800',
    iconColor: '#c9962a'
  });
}

function getItems() {
  return JSON.parse(localStorage.getItem(CARRITO_KEY) || '[]');
}

function saveItems(items) {
  localStorage.setItem(CARRITO_KEY, JSON.stringify(items));
  actualizarBadge();
  renderCarrito();
}

function agregarItem(producto) {
  const items = getItems();
  const existente = items.find(i => i.id === producto.id);
  if (existente) {
    existente.cantidad += 1;
  } else {
    items.push({ ...producto, cantidad: 1 });
  }
  saveItems(items);
  Toast.fire({ icon: 'success', title: `"${producto.nombre}" agregado al carrito` });
}

function eliminarItem(id) {
  const item = getItems().find(i => i.id === id);
  saveItems(getItems().filter(i => i.id !== id));
  if (item) Toast.fire({ icon: 'success', title: `"${item.nombre}" eliminado` });
}

function actualizarCantidad(id, cantidad) {
  if (cantidad <= 0) { eliminarItem(id); return; }
  saveItems(getItems().map(i => i.id === id ? { ...i, cantidad } : i));
}

async function vaciarCarrito(mostrarAlerta) {
  if (mostrarAlerta) {
    const res = await alertaConfirmacion('¿Vaciar carrito?', 'Se quitarán todos los productos.', 'Sí, vaciar');
    if (!res.isConfirmed) return;
  }
  localStorage.removeItem(CARRITO_KEY);
  actualizarBadge();
  renderCarrito();
  Toast.fire({ icon: 'success', title: 'Carrito vaciado' });
}

function parsePrecio(str) {
  return Number(String(str).replace(/[^0-9]/g, ''));
}

function getTotal() {
  return getItems().reduce((acc, i) => acc + parsePrecio(i.precio) * i.cantidad, 0);
}

function getCantidadTotal() {
  return getItems().reduce((acc, i) => acc + i.cantidad, 0);
}

function actualizarBadge() {
  const badge = document.querySelector('.carrito-badge');
  if (!badge) return;
  const cant = getCantidadTotal();
  badge.textContent = cant;
  badge.style.display = cant > 0 ? 'flex' : 'none';
}

function abrirCarrito() {
  const overlay = document.getElementById('carrito-overlay');
  if (overlay) {
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    renderCarrito();
  }
}

function cerrarCarrito() {
  const overlay = document.getElementById('carrito-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

async function finalizarCompra() {
  const usuario = JSON.parse(localStorage.getItem('cacao_usuario') || 'null');
  if (!usuario) {
    const res = await alertaConfirmacion(
      'Inicio de sesión requerido',
      'Para finalizar tu compra de Cacao Ritual, debés iniciar sesión o registrarte.',
      'Iniciar Sesión / Registrarse'
    );
    if (res.isConfirmed) {
      cerrarCarrito();
      window.location.href = 'login.html';
    }
    return;
  }
  await alertaExito(
    '¡Compra Finalizada!',
    `Hola ${usuario.nombre}, tu pedido fue procesado. Nos pondremos en contacto a la brevedad para coordinar la entrega.`
  );
  vaciarCarrito(false);
  cerrarCarrito();
}

function renderCarrito() {
  const cuerpo = document.getElementById('carrito-cuerpo');
  const footer = document.getElementById('carrito-footer');
  if (!cuerpo) return;

  const items = getItems();

  if (items.length === 0) {
    cuerpo.innerHTML = `
      <div class="carrito-vacio">
        <i class="fa-solid fa-bag-shopping"></i>
        <p>Tu carrito está vacío.</p>
      </div>
    `;
    if (footer) footer.style.display = 'none';
    return;
  }

  if (footer) footer.style.display = 'block';

  cuerpo.innerHTML = `
    <div class="carrito-lista">
      ${items.map(item => `
        <div class="carrito-item">
          <div class="carrito-item__imagen">
            <img src="${item.imagen}" alt="${item.nombre}">
          </div>
          <div class="carrito-item__info">
            <h4>${item.nombre}</h4>
            <p class="carrito-item__precio">${item.precio}</p>
            <div class="carrito-item__controles">
              <button type="button" class="carrito-btn-cant" onclick="actualizarCantidad(${item.id}, ${item.cantidad - 1})">-</button>
              <span class="carrito-cantidad">${item.cantidad}</span>
              <button type="button" class="carrito-btn-cant" onclick="actualizarCantidad(${item.id}, ${item.cantidad + 1})">+</button>
            </div>
          </div>
          <button type="button" class="carrito-btn-eliminar" onclick="eliminarItem(${item.id})" title="Eliminar">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </div>
      `).join('')}
    </div>
  `;

  const totalEl = document.getElementById('carrito-total-valor');
  if (totalEl) totalEl.textContent = '$' + getTotal().toLocaleString('es-AR');
}

function inyectarDrawer() {
  const drawer = document.createElement('div');
  drawer.id = 'carrito-overlay';
  drawer.className = 'carrito-overlay hidden';
  drawer.innerHTML = `
    <div class="carrito-container">
      <div class="carrito-header">
        <h2>Tu Carrito</h2>
        <button type="button" class="carrito-cerrar" onclick="cerrarCarrito()" aria-label="Cerrar carrito">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div class="carrito-cuerpo" id="carrito-cuerpo"></div>
      <div class="carrito-footer" id="carrito-footer" style="display:none">
        <div class="carrito-total">
          <span>Total:</span>
          <span class="carrito-total-valor" id="carrito-total-valor">$0</span>
        </div>
        <div class="carrito-acciones">
          <button type="button" class="btn btn--acento" onclick="finalizarCompra()" style="flex:1">Finalizar Compra</button>
          <button type="button" class="btn btn--oscuro" onclick="vaciarCarrito(true)" style="padding:13px 20px" title="Vaciar carrito">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(drawer);

  drawer.addEventListener('click', (e) => { if (e.target === drawer) cerrarCarrito(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarCarrito(); });

  const bagIcon = document.querySelector('.navbar__iconos .fa-bag-shopping');
  if (bagIcon) {
    const wrapper = document.createElement('span');
    wrapper.className = 'carrito-icon-wrapper';
    bagIcon.parentNode.insertBefore(wrapper, bagIcon);
    wrapper.appendChild(bagIcon);
    const badge = document.createElement('span');
    badge.className = 'carrito-badge';
    badge.style.display = 'none';
    wrapper.appendChild(badge);
    wrapper.addEventListener('click', abrirCarrito);
  }

  actualizarBadge();
  renderCarrito();
}

function conectarBotonesAgregar() {
  document.querySelectorAll('.btn-agregar').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('[data-id]');
      if (!card) return;
      agregarItem({
        id: parseInt(card.dataset.id),
        nombre: card.dataset.nombre,
        precio: card.dataset.precio,
        imagen: card.dataset.imagen
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  inyectarDrawer();
  conectarBotonesAgregar();
});
