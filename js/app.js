// ==========================================
// VARIABLES GLOBALES
// ==========================================
let retoActivo = false;
let tiempoInicio = 0;
let puntosActuales = { x1: 0, y1: 0, x2: 0, y2: 0 };
let rectaChartInstance = null;

// ==========================================
// 1. CONTROL DE PESTAÑAS Y RENDERIZADO
// ==========================================
window.cambiarPestana = function(idPestana) {
    if (retoActivo) {
        alert("⚠️ No puedes cambiar de pestaña con un reto activo. Resuélvelo o cancélalo.");
        return;
    }
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById('sec-' + idPestana).classList.add('active');
    if (window.event && window.event.currentTarget) {
        window.event.currentTarget.classList.add('active');
    }
    
    if (window.renderMathInElement) {
        renderMathInElement(document.body, {
            delimiters: [
                {left: "$$", right: "$$", display: true},
                {left: "$", right: "$", display: false}
            ],
            throwOnError: false
        });
    }
    
    // Auto-calcular Laboratorio al entrar a la pestaña si no hay gráfica
    if (idPestana === 'laboratorio' && !rectaChartInstance) {
        window.calcularLaboratorio();
    }
};

// ==========================================
// 2. SISTEMA ANTI-TRAMPAS
// ==========================================
document.addEventListener("visibilitychange", () => {
    if (retoActivo && document.hidden) {
        alert("🚨 ADVERTENCIA: Has abandonado la pestaña. El reto será invalidado.");
        anularRetoPorTrampa();
    }
});

document.addEventListener('contextmenu', event => { if(retoActivo) event.preventDefault(); });
document.addEventListener('copy', event => {
    if(retoActivo) { event.preventDefault(); alert("Copiado bloqueado en Modo Reto."); }
});

// ==========================================
// 3. LOGICA DEL MÓDULO DE RETOS
// ==========================================
window.iniciarReto = function() {
    const nivel = document.getElementById('nivel-reto').value;
    retoActivo = true;
    document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.add('locked'));
    document.getElementById('panel-configuracion-reto').classList.add('hidden');
    document.getElementById('zona-activa-reto').classList.remove('hidden');
    
    limpiarCampos();
    tiempoInicio = Date.now();
    generarNuevoProblemaLogica(nivel);
};

window.generarNuevoProblema = function() {
    if(confirm("¿Descartar este problema e iniciar uno nuevo?")) {
        const nivel = document.getElementById('nivel-reto').value;
        limpiarCampos();
        tiempoInicio = Date.now();
        generarNuevoProblemaLogica(nivel);
    }
};

function generarNuevoProblemaLogica(nivel) {
    document.getElementById('titulo-nivel').innerText = nivel === "1" ? "Nivel 1: Destreza Directa" : "Nivel 2: Contexto Narrativo";
    
    puntosActuales.x1 = Math.floor(Math.random() * 21) - 10;
    puntosActuales.y1 = Math.floor(Math.random() * 21) - 10;
    puntosActuales.x2 = Math.floor(Math.random() * 21) - 10;
    puntosActuales.y2 = Math.floor(Math.random() * 21) - 10;

    const cajaPlanteamiento = document.getElementById('planteamiento-problema');
    if (nivel === "1") {
        cajaPlanteamiento.innerHTML = `Analiza la recta entre: <strong>A(${puntosActuales.x1}, ${puntosActuales.y1})</strong> y <strong>B(${puntosActuales.x2}, ${puntosActuales.y2})</strong>.`;
    } else {
        cajaPlanteamiento.innerHTML = `Un dron despega desde <strong>(${puntosActuales.x1}, ${puntosActuales.y1})</strong> interceptando su objetivo en <strong>(${puntosActuales.x2}, ${puntosActuales.y2})</strong>. Determina sus parámetros.`;
    }
    
    if (window.renderMathInElement) renderMathInElement(cajaPlanteamiento);
}

window.comprobarRespuesta = function() {
    const tiempoFin = Date.now();
    const segs = Math.floor((tiempoFin - tiempoInicio) / 1000);
    const feedback = document.getElementById('feedback-resultado');
    feedback.style.color = "#059669";
    feedback.innerHTML = `¡Comprobación finalizada! ⏱️ Tiempo: ${Math.floor(segs/60)}m ${segs%60}s. (Conectando validación con MathEngine...)`;
    
    // Aquí se invocarían las validaciones desde math-engine.js usando puntosActuales
};

window.verProcesoDesglose = function() {
    document.getElementById('desglose-paso-a-paso').innerHTML = `
        <div class="card bg-white mt-4" style="border: 2px solid #dc2626;">
            <h4 style="color:#dc2626;">Modo Revisión (Puntos A(${puntosActuales.x1}, ${puntosActuales.y1}) y B(${puntosActuales.x2}, ${puntosActuales.y2}))</h4>
            <p><em>Inyectando tarjetas de math-engine.js para análisis de errores...</em></p>
        </div>`;
};

function anularRetoPorTrampa() {
    retoActivo = false;
    document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('locked'));
    document.getElementById('panel-configuracion-reto').classList.remove('hidden');
    document.getElementById('zona-activa-reto').classList.add('hidden');
    limpiarCampos();
}

function limpiarCampos() {
    document.querySelectorAll('.grid-respuestas input').forEach(input => input.value = '');
    document.getElementById('feedback-resultado').innerHTML = '';
    document.getElementById('desglose-paso-a-paso').innerHTML = '';
}

// ==========================================
// 4. LÓGICA DEL LABORATORIO Y GRÁFICAS (Chart.js)
// ==========================================
window.calcularLaboratorio = function() {
    const x1 = parseFloat(document.getElementById('lab-x1').value);
    const y1 = parseFloat(document.getElementById('lab-y1').value);
    const x2 = parseFloat(document.getElementById('lab-x2').value);
    const y2 = parseFloat(document.getElementById('lab-y2').value);
    
    if(isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) return;

    // Conectar con procesarMetodologiaCompleta de math-engine.js si existe
    let m = null, b = null;
    if (window.procesarMetodologiaCompleta) {
        const calc = window.procesarMetodologiaCompleta(x1, y1, x2, y2);
        if (!calc.esVertical) { m = calc.m_red; b = calc.b_red; }
        
        // Renderizar las 7 tarjetas en el desglose
        const contenedor = document.getElementById('desglose-laboratorio');
        contenedor.innerHTML = `<div class="grid-2">${window.construirHTML7TarjetasEstructuraExacta(x1, y1, x2, y2, calc, "lab-")}</div>`;
        if (window.renderizar7TarjetasKaTeX) window.renderizar7TarjetasKaTeX(x1, y1, x2, y2, calc, "lab-");
        renderMathInElement(contenedor);
    } else {
        // Cálculo de respaldo solo para gráfica si el motor no ha cargado
        const dx = x2 - x1; const dy = y2 - y1;
        if(dx !== 0) { m = dy/dx; b = y1 - (m * x1); }
    }

    graficarRectaGenerica('planoCartesianoCanvas', x1, y1, x2, y2, m, b);
};

function graficarRectaGenerica(canvasId, x1, y1, x2, y2, m, b) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    if (rectaChartInstance) rectaChartInstance.destroy();

    let datosLinea = m === null ? [{x: x1, y: -10}, {x: x1, y: 10}] : [{x: -10, y: m * (-10) + b}, {x: 10, y: m * 10 + b}];

    rectaChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                { label: 'Recta', data: datosLinea, borderColor: '#2563eb', borderWidth: 2, pointRadius: 0 },
                { label: 'Vector', data: [{x: x1, y: y1}, {x: x2, y: y1}, {x: x2, y: y2}], borderColor: '#f59e0b', borderDash: [5, 5], pointRadius: 0 },
                { label: 'Puntos A y B', data: [{x: x1, y: y1}, {x: x2, y: y2}], backgroundColor: '#dc2626', type: 'scatter', pointRadius: 6 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { zoom: { pan: { enabled: true, mode: 'xy' }, zoom: { wheel: { enabled: true }, mode: 'xy' } } },
            scales: {
                x: { type: 'linear', min: -10, max: 10, grid: { color: '#e5e7eb' } },
                y: { type: 'linear', min: -10, max: 10, grid: { color: '#e5e7eb' } }
            }
        }
    });
}

window.resetearZoom = function(chartCanvasId) {
    if (chartCanvasId === 'planoCartesianoCanvas' && rectaChartInstance) rectaChartInstance.resetZoom();
};

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
    if (window.renderMathInElement) {
        renderMathInElement(document.body, { delimiters: [{left: "$$", right: "$$", display: true}, {left: "$", right: "$", display: false}] });
    }
});
