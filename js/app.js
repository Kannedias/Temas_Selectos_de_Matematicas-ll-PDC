// =======================================================
// VARIABLES GLOBALES DE SEGURIDAD Y RETO
// =======================================================
let retoActivo = false;
let tiempoInicio = 0;
let puntosActuales = { x1: 0, y1: 0, x2: 0, y2: 0 };

// =======================================================
// 1. CONTROL DE NAVEGACIÓN POR PESTAÑAS
// =======================================================
function cambiarPestana(idPestana) {
    if (retoActivo) {
        alert("⚠️ No puedes cambiar de pestaña mientras tienes un reto activo. Resuélvelo o cancélalo.");
        return;
    }

    const contenidos = document.querySelectorAll('.tab-content');
    contenidos.forEach(content => content.classList.remove('active'));

    const botones = document.querySelectorAll('.nav-tab');
    botones.forEach(btn => btn.classList.remove('active'));

    const pestanaSeleccionada = document.getElementById('sec-' + idPestana);
    if (pestanaSeleccionada) {
        pestanaSeleccionada.classList.add('active');
    }

    if (window.event && window.event.currentTarget) {
        window.event.currentTarget.classList.add('active');
    }

    renderizarMatematicas();
}

function renderizarMatematicas() {
    if (window.renderMathInElement) {
        renderMathInElement(document.body, {
            delimiters: [
                {left: "$$", right: "$$", display: true},
                {left: "$", right: "$", display: false}
            ],
            throwOnError: false
        });
    }
}

// Inicializar KaTeX al cargar
document.addEventListener("DOMContentLoaded", renderizarMatematicas);

// =======================================================
// 2. SISTEMA ANTI-TRAMPAS
// =======================================================
document.addEventListener("visibilitychange", () => {
    if (retoActivo && document.hidden) {
        alert("🚨 ADVERTENCIA: Has abandonado la pestaña durante un examen activo. El reto será invalidado.");
        anularRetoPorTrampa();
    }
});

document.addEventListener('contextmenu', event => {
    if(retoActivo) event.preventDefault();
});
document.addEventListener('copy', event => {
    if(retoActivo) {
        event.preventDefault();
        alert("Copiar contenido no está permitido en Modo Reto.");
    }
});

// =======================================================
// 3. LÓGICA DE RETOS (2 NIVELES)
// =======================================================
function iniciarReto() {
    const nivel = document.getElementById('nivel-reto').value;
    
    retoActivo = true;
    document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.add('locked'));
    document.getElementById('panel-configuracion-reto').style.display = 'none';
    document.getElementById('zona-activa-reto').style.display = 'block';
    document.getElementById('desglose-paso-a-paso').innerHTML = ''; 
    limpiarCampos();

    tiempoInicio = Date.now();
    generarNuevoProblemaLogica(nivel);
}

function generarNuevoProblema() {
    if(confirm("¿Estás seguro de descartar este problema e iniciar uno nuevo? El tiempo se reiniciará.")) {
        const nivel = document.getElementById('nivel-reto').value;
        limpiarCampos();
        document.getElementById('desglose-paso-a-paso').innerHTML = '';
        tiempoInicio = Date.now();
        generarNuevoProblemaLogica(nivel);
    }
}

function generarNuevoProblemaLogica(nivel) {
    document.getElementById('titulo-nivel').innerText = nivel === "1" ? "Nivel 1: Destreza Directa" : "Nivel 2: Contexto Narrativo";
    
    puntosActuales.x1 = Math.floor(Math.random() * 21) - 10;
    puntosActuales.y1 = Math.floor(Math.random() * 21) - 10;
    puntosActuales.x2 = Math.floor(Math.random() * 21) - 10;
    puntosActuales.y2 = Math.floor(Math.random() * 21) - 10;

    const cajaPlanteamiento = document.getElementById('planteamiento-problema');

    if (nivel === "1") {
        cajaPlanteamiento.innerHTML = `Calcula los parámetros para la recta formada por: <strong>Punto A(${puntosActuales.x1}, ${puntosActuales.y1})</strong> y <strong>Punto B(${puntosActuales.x2}, ${puntosActuales.y2})</strong>.`;
    } else {
        cajaPlanteamiento.innerHTML = `Un dron despega desde la base en <strong>(${puntosActuales.x1}, ${puntosActuales.y1})</strong> y se desplaza en línea recta hasta interceptar un objetivo en <strong>(${puntosActuales.x2}, ${puntosActuales.y2})</strong>. Determina los datos de su trayectoria.`;
    }
    
    document.getElementById('feedback-resultado').innerText = "";
    renderizarMatematicas();
}

function comprobarRespuesta() {
    const tiempoFin = Date.now();
    const segundosTardados = Math.floor((tiempoFin - tiempoInicio) / 1000);
    const minutos = Math.floor(segundosTardados / 60);
    const segundos = segundosTardados % 60;

    const feedback = document.getElementById('feedback-resultado');
    feedback.style.color = "#059669";
    feedback.innerHTML = `¡Comprobación finalizada! ⏱️ Tiempo invertido: ${minutos}m ${segundos}s. <br><br> (Aquí se conectará la validación final con MathEngine).`;
}

function verProcesoDesglose() {
    const contenedor = document.getElementById('desglose-paso-a-paso');
    contenedor.innerHTML = `
    <div style="background: white; padding: 15px; border: 1px solid #cbd5e1; border-radius: 8px;">
        <h4 style="margin-top:0; color: #dc2626;">Modo Revisión: Desglose Didáctico</h4>
        <p><strong>Punto A:</strong> (${puntosActuales.x1}, ${puntosActuales.y1}) | <strong>Punto B:</strong> (${puntosActuales.x2}, ${puntosActuales.y2})</p>
        <p><em>(Aquí se inyectarán las 7 tarjetas didácticas de MathEngine generadas para estos puntos, para que analices el procedimiento exacto).</em></p>
    </div>`;
}

function anularRetoPorTrampa() {
    retoActivo = false;
    document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('locked'));
    document.getElementById('panel-configuracion-reto').style.display = 'block';
    document.getElementById('zona-activa-reto').style.display = 'none';
    limpiarCampos();
}

function limpiarCampos() {
    document.querySelectorAll('.grid-respuestas input').forEach(input => input.value = '');
    document.getElementById('feedback-resultado').innerText = "";
}
