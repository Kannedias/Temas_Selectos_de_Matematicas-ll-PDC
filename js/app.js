// FUNCIONALIDAD DE PESTAÑAS
function cambiarPestana(idPestana) {
    // Ocultar todos los contenidos de pestañas
    const contenidos = document.querySelectorAll('.tab-content');
    contenidos.forEach(content => content.classList.remove('active'));

    // Desactivar todos los botones de navegación
    const botones = document.querySelectorAll('.nav-tab');
    botones.forEach(btn => btn.classList.remove('active'));

    // Mostrar la pestaña seleccionada
    const pestanaSeleccionada = document.getElementById('sec-' + idPestana);
    if (pestanaSeleccionada) {
        pestanaSeleccionada.classList.add('active');
    }

    // Activar el botón correspondiente
    event.currentTarget.classList.add('active');
}

// INICIALIZACIÓN DE KATEX Y COMPONENTES AL CARGAR LA PÁGINA
document.addEventListener("DOMContentLoaded", function() {
    // Renderizar notaciones matemáticas de KaTeX automáticamente
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
