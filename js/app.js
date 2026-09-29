// CONTROL DE NAVEGACIÓN POR PESTAÑAS
function cambiarPestana(idPestana) {
    // 1. Ocultar todos los contenidos de las pestañas
    const contenidos = document.querySelectorAll('.tab-content');
    contenidos.forEach(content => content.classList.remove('active'));

    // 2. Desactivar el estado activo en todos los botones
    const botones = document.querySelectorAll('.nav-tab');
    botones.forEach(btn => btn.classList.remove('active'));

    // 3. Mostrar la pestaña seleccionada
    const pestanaSeleccionada = document.getElementById('sec-' + idPestana);
    if (pestanaSeleccionada) {
        pestanaSeleccionada.classList.add('active');
    }

    // 4. Activar el botón presionado
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    // 5. Re-renderizar expresiones en KaTeX al cambiar de sección
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

// INICIALIZACIÓN AL CARGAR EL DOCUMENTO
document.addEventListener("DOMContentLoaded", function() {
    // Renderizado inicial de notación matemática mediante KaTeX
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
