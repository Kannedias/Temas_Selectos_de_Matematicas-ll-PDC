// CONTROL DE NAVEGACIÓN POR PESTAÑAS
function cambiarPestana(idPestana) {
  const contenidos = document.querySelectorAll('.tab-content');
  contenidos.forEach(content => content.classList.remove('active'));

  const botones = document.querySelectorAll('.nav-tab');
  botones.forEach(btn => btn.classList.remove('active'));

  const pestanaSeleccionada = document.getElementById('sec-' + idPestana);
  if (pestanaSeleccionada) {
    pestanaSeleccionada.classList.add('active');
  }

  if (event && event.currentTarget) {
    event.currentTarget.classList.add('active');
  }

  // Re-renderizar KaTeX dinámicamente si hay fórmulas en la nueva pestaña
  if (window.renderMathInElement) {
    renderMathInElement(pestanaSeleccionada || document.body, {
      delimiters: [
        {left: "$$", right: "$$", display: true},
        {left: "$", right: "$", display: false}
      ],
      throwOnError: false
    });
  }
}

// INICIALIZACIÓN
document.addEventListener("DOMContentLoaded", function() {
  if (window.renderMathInElement) {
    renderMathInElement(document.body, {
      delimiters: [
        {left: "$$", right: "$$", display: true},
        {left: "$", right: "$", display: false}
      ],
      throwOnError: false
    });
  }
});
