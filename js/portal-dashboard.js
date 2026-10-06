/* =======================================================
   LÓGICA DE SESIÓN, DASHBOARD Y KATEX
   ======================================================= */

function iniciarSesion() {
    const matricula = document.getElementById('input-matricula').value.trim();
    const grupo = document.getElementById('input-grupo').value;

    if (matricula === "") {
        alert("⚠️ Por favor, ingresa tu matrícula para acceder.");
        return;
    }

    // Simulación temporal mientras enlazamos a Google Sheets
    const nombreSimulado = "Alumno Conalep"; 
    
    // Configurar Ficha de Identidad
    document.getElementById('welcome-name').innerText = `👤 Bienvenido, ${nombreSimulado}`;
    document.getElementById('lbl-nombre').innerText = `${nombreSimulado} (Matrícula: ${matricula})`;
    document.getElementById('lbl-grupo').innerText = `Grupo ${grupo}`;

    // Transición de Vistas
    document.getElementById('vista-login').classList.add('hidden');
    document.getElementById('vista-dashboard').classList.remove('hidden');
    document.getElementById('user-menu').classList.remove('hidden');
    
    // Animación de Barra de Progreso Curricular
    setTimeout(() => {
        document.getElementById('barra-avance').style.width = '50%';
        document.getElementById('lbl-porcentaje').innerText = '50%';
    }, 300);

    // Persistencia local
    sessionStorage.setItem('matriculaActiva', matricula);
    sessionStorage.setItem('grupoActivo', grupo);
    sessionStorage.setItem('nombreActivo', nombreSimulado);
}

function cerrarSesion() {
    sessionStorage.clear();
    document.getElementById('vista-dashboard').classList.add('hidden');
    document.getElementById('user-menu').classList.add('hidden');
    document.getElementById('vista-login').classList.remove('hidden');
    document.getElementById('input-matricula').value = "";
    document.getElementById('barra-avance').style.width = '0%';
}

// Auto-Login y Renderizado de Fórmulas Matemáticas (KaTeX) al cargar la página
document.addEventListener("DOMContentLoaded", function() {
    if (sessionStorage.getItem('matriculaActiva')) {
        document.getElementById('input-matricula').value = sessionStorage.getItem('matriculaActiva');
        document.getElementById('input-grupo').value = sessionStorage.getItem('grupoActivo');
        iniciarSesion(); 
    }

    // Inicializar KaTeX para el panel de Fundamentos
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
