// =======================================================
// BLOQUE 1 Y SEGURIDAD: CONTROL DE PESTAÑAS BLINDADO
// =======================================================
let retoActivo = false;
let tiempoInicioReto = 0;
let puntosRetoActual = { x1: 0, y1: 0, x2: 0, y2: 0 };

function cambiarPestana(idPestana) {
    if (retoActivo) {
        alert("⚠️ Tienes un examen en curso. Resuélvelo o cancélalo antes de cambiar de sección.");
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

    const botonActivo = document.querySelector(`button[onclick="cambiarPestana('${idPestana}')"]`);
    if (botonActivo) {
        botonActivo.classList.add('active');
    }

    if (window.renderMathInElement) {
        renderMathInElement(pestanaSeleccionada || document.body, {
            delimiters: [ {left: "$$", right: "$$", display: true}, {left: "$", right: "$", display: false} ],
            throwOnError: false
        });
    }
}

// Eventos Anti-Trampas
document.addEventListener("visibilitychange", () => {
    if (retoActivo && document.hidden) {
        alert("🚨 ADVERTENCIA: Has abandonado la pestaña durante un examen activo. Evaluación invalidada.");
        anularReto();
    }
});
document.addEventListener('contextmenu', event => { if(retoActivo) event.preventDefault(); });
document.addEventListener('copy', event => { if(retoActivo) { event.preventDefault(); alert("Copiado bloqueado en examen."); } });


// =======================================================
// BLOQUE 2: DISPARADOR PRINCIPAL DEL LABORATORIO
// =======================================================
function calcularLaboratorio() {
    const x1 = parseFloat(document.getElementById('lab-x1').value) || 0;
    const y1 = parseFloat(document.getElementById('lab-y1').value) || 0;
    const x2 = parseFloat(document.getElementById('lab-x2').value) || 0;
    const y2 = parseFloat(document.getElementById('lab-y2').value) || 0;

    if (typeof MathEngine === 'undefined') return;

    const res = MathEngine.calcularSecuenciaRecta(x1, y1, x2, y2);
    
    // Inyectamos en el contenedor original del laboratorio
    renderizarTarjetasPasoAPasoBeta(res, x1, y1, x2, y2, 'pasos-container');
    dibujarPlanoCartesianoLimpio(x1, y1, x2, y2, res);
}

// =======================================================
// BLOQUE 3: CONSTRUCTOR DE LAS 7 TARJETAS (OPTIMIZADO)
// Nota: Se añadió el parámetro 'targetContainerId' para reutilizarlo en Retos
// =======================================================
function renderizarTarjetasPasoAPasoBeta(res, x1, y1, x2, y2, targetContainerId) {
    const container = document.getElementById(targetContainerId);
    if (!container) return;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const cA = "\\textcolor{#2563eb}"; 
    const cB = "\\textcolor{#dc2626}"; 
    const fmt = (num) => Number(num).toString();

    const x1Fmt = x1 < 0 ? `(${cA}{${fmt(x1)}})` : `${cA}{${fmt(x1)}}`;
    const y1Fmt = y1 < 0 ? `(${cA}{${fmt(y1)}})` : `${cA}{${fmt(y1)}}`;
    const x2Fmt = x2 < 0 ? `(${cB}{${fmt(x2)}})` : `${cB}{${fmt(x2)}}`;
    const y2Fmt = y2 < 0 ? `(${cB}{${fmt(y2)}})` : `${cB}{${fmt(y2)}}`;

    let htmlCartas = "";
    
    // Tarjeta 1
    htmlCartas += `
    <div class="card-aplicacion" style="background: #ffffff; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
        <h4 style="margin: 0; color: #1e293b; font-size: 1.05rem;">1. Vector Desplazamiento ($\\Delta \\vec{r}$)</h4>
        <p style="margin: 10px 0; font-size: 0.95rem;">$$ \\Delta \\vec{r} = (${x2Fmt} - ${x1Fmt}, \\, ${y2Fmt} - ${y1Fmt}) $$</p>
        <div style="background-color: #ecfdf5; border-left: 5px solid #10b981; padding: 10px; color: #065f46;">
            <strong>Resultado:</strong> $\\Delta \\vec{r} = (${dx}, \\, ${dy})$
        </div>
    </div>`;

    // Tarjeta 2
    htmlCartas += `
    <div class="card-aplicacion" style="background: #ffffff; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
        <h4 style="margin: 0; color: #1e293b; font-size: 1.05rem;">2. Magnitud ($|\\Delta \\vec{r}|$)</h4>
        <p style="margin: 10px 0; font-size: 0.95rem;">$$|\\Delta \\vec{r}| = \\sqrt{(${dx})^2 + (${dy})^2} = \\sqrt{${dx*dx + dy*dy}}$$</p>
        <div style="background-color: #ecfdf5; border-left: 5px solid #10b981; padding: 10px; color: #065f46;">
            <strong>Resultado:</strong> $|\\Delta \\vec{r}| = ${res.magnitud}$
        </div>
    </div>`;

    // Tarjeta 3
    htmlCartas += `
    <div class="card-aplicacion" style="background: #ffffff; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
        <h4 style="margin: 0; color: #1e293b; font-size: 1.05rem;">3. Dirección ($\\theta$)</h4>
        <p style="margin: 10px 0; font-size: 0.95rem;">Cuadrante: ${res.direccion.cuadrante}</p>
        <div style="background-color: #ecfdf5; border-left: 5px solid #10b981; padding: 10px; color: #065f46;">
            <strong>Resultado final:</strong> $\\theta = ${res.direccion.grados}^\\circ$
        </div>
    </div>`;

    // Tarjeta 4, 5, 6 y 7 fusionadas en resumen matemático directo para optimizar
    htmlCartas += `
    <div class="card-aplicacion" style="background: #ffffff; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); grid-column: 1 / -1;">
        <h4 style="margin: 0 0 10px 0; color: #1e293b; font-size: 1.05rem;">Parámetros de la Recta</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
            <div style="background: #f8fafc; padding: 10px; border-radius: 4px;"><strong>4. Pendiente (m):</strong> $$m = ${res.pendiente}$$</div>
            <div style="background: #f8fafc; padding: 10px; border-radius: 4px;"><strong>5. Pto-Pendiente:</strong> $$${res.ecuaciones.puntoPendiente}$$</div>
            <div style="background: #f8fafc; padding: 10px; border-radius: 4px;"><strong>6. Explícita:</strong> $$${res.ecuaciones.explicita}$$</div>
            <div style="background: #f8fafc; padding: 10px; border-radius: 4px;"><strong>7. General:</strong> $$${res.ecuaciones.general}$$</div>
        </div>
    </div>`;

    container.innerHTML = htmlCartas;

    if (window.renderMathInElement) {
        renderMathInElement(container, {
            delimiters: [ {left: "$$", right: "$$", display: true}, {left: "$", right: "$", display: false} ]
        });
    }
}

// =======================================================
// BLOQUE 4: DIBUJO DEL PLANO CARTESIANO EN CANVAS (MANTENIDO INTACTO)
// =======================================================
function dibujarPlanoCartesianoLimpio(x1, y1, x2, y2, res) {
    const canvas = document.getElementById('planoCartesianoCanvas');
    if (!canvas) return;
    
    // (Tu código original de dibujo del canvas se mantiene aquí tal cual)
    const rect = canvas.parentNode.getBoundingClientRect();
    canvas.width = rect.width || 600;
    canvas.height = 380;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const maxCoord = Math.max(Math.abs(x1), Math.abs(y1), Math.abs(x2), Math.abs(y2), 5) + 3;
    const scale = Math.min(width, height) / (maxCoord * 2.2);
    const cx = width / 2; const cy = height / 2;
    const toPx = (x) => cx + (x * scale);
    const toPy = (y) => cy - (y * scale);

    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(width, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, height); ctx.stroke();

    ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 3;
    ctx.beginPath();
    if (res.esVertical) {
        ctx.moveTo(toPx(x1), 0); ctx.lineTo(toPx(x1), height);
    } else {
        const m = parseFloat(res.pendiente); const b = parseFloat(res.ordenadaOrigen);
        const xMin = -maxCoord * 2; const xMax = maxCoord * 2;
        ctx.moveTo(toPx(xMin), toPy(m * xMin + b)); ctx.lineTo(toPx(xMax), toPy(m * xMax + b));
    }
    ctx.stroke();

    ctx.fillStyle = "#084298"; ctx.beginPath(); ctx.arc(toPx(x1), toPy(y1), 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#dc3545"; ctx.beginPath(); ctx.arc(toPx(x2), toPy(y2), 6, 0, Math.PI * 2); ctx.fill();
}

// =======================================================
// BLOQUE 6: LÓGICA DEL MÓDULO DE RETOS (NUEVO)
// =======================================================
function iniciarRetoSeguro() {
    const nivel = document.getElementById('nivel-reto').value;
    retoActivo = true;
    document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.add('locked'));
    
    document.getElementById('panel-configuracion-reto').style.display = 'none';
    document.getElementById('zona-activa-reto').style.display = 'block';
    document.getElementById('desglose-reto-container').innerHTML = '';
    document.getElementById('feedback-reto-msg').innerHTML = '';
    
    document.querySelectorAll('#zona-activa-reto input').forEach(inp => inp.value = '');

    tiempoInicioReto = Date.now();
    puntosRetoActual.x1 = Math.floor(Math.random() * 17) - 8;
    puntosRetoActual.y1 = Math.floor(Math.random() * 17) - 8;
    puntosRetoActual.x2 = Math.floor(Math.random() * 17) - 8;
    puntosRetoActual.y2 = Math.floor(Math.random() * 17) - 8;
    
    // Evitar que sean el mismo punto
    if(puntosRetoActual.x1 === puntosRetoActual.x2) puntosRetoActual.x2 += 2;

    const cajaPlanteamiento = document.getElementById('planteamiento-problema');
    
    if (nivel === "1") {
        document.getElementById('titulo-nivel').innerText = "Nivel 1: Destreza Numérica Directa";
        cajaPlanteamiento.innerHTML = `Calcula los parámetros matemáticos para la trayectoria delimitada por los puntos: <strong>A(${puntosRetoActual.x1}, ${puntosRetoActual.y1})</strong> y <strong>B(${puntosRetoActual.x2}, ${puntosRetoActual.y2})</strong>.`;
    } else {
        document.getElementById('titulo-nivel').innerText = "Nivel 2: Contextualización Intermedia";
        cajaPlanteamiento.innerHTML = `Un brazo robótico de ensamblaje en una banda de producción industrial se mueve en línea recta. Su sensor de origen lo ubica en la coordenada <strong>(${puntosRetoActual.x1}, ${puntosRetoActual.y1})</strong> y debe soldar una pieza en la coordenada final <strong>(${puntosRetoActual.x2}, ${puntosRetoActual.y2})</strong>.<br><br>Determina el vector de desplazamiento necesario, la magnitud del brazo y la ecuación general del riel guía.`;
    }
}

function comprobarReto() {
    if(!retoActivo) return;
    const tiempoFin = Date.now();
    const segs = Math.floor((tiempoFin - tiempoInicioReto) / 1000);
    const feedback = document.getElementById('feedback-reto-msg');
    
    feedback.className = "reto-completado";
    feedback.innerHTML = `⏱️ ¡Evaluación finalizada en ${Math.floor(segs/60)}m ${segs%60}s! Toca "Ver Proceso a Detalle" para comparar tus respuestas con el motor matemático.`;
}

function desglosarReto() {
    if(typeof MathEngine !== 'undefined') {
        const res = MathEngine.calcularSecuenciaRecta(puntosRetoActual.x1, puntosRetoActual.y1, puntosRetoActual.x2, puntosRetoActual.y2);
        // Reutilizamos el motor del bloque 3, pero apuntando al contenedor del Reto
        renderizarTarjetasPasoAPasoBeta(res, puntosRetoActual.x1, puntosRetoActual.y1, puntosRetoActual.x2, puntosRetoActual.y2, 'desglose-reto-container');
    }
}

function anularReto() {
    retoActivo = false;
    document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('locked'));
    document.getElementById('panel-configuracion-reto').style.display = 'block';
    document.getElementById('zona-activa-reto').style.display = 'none';
}

// Inicialización global
document.addEventListener("DOMContentLoaded", function() {
    if (window.renderMathInElement) {
        renderMathInElement(document.body, { delimiters: [ {left: "$$", right: "$$", display: true}, {left: "$", right: "$", display: false} ] });
    }
    setTimeout(calcularLaboratorio, 200);
});
