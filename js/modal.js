const recetas = document.querySelectorAll('.receta');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
const cerrar = document.getElementById('cerrarModal');

recetas.forEach(receta => {
  receta.addEventListener('click', () => {
    const pasos = receta.querySelector('.seccion-tutorial-pasos');
    modalBody.innerHTML = pasos.outerHTML;
    modal.classList.remove('hidden');
  });
});

cerrar.addEventListener('click', () => {
  modal.classList.add('hidden');
});

modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.add('hidden');
  }
});