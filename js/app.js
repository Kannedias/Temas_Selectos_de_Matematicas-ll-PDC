// =======================================================
// BLOQUE 1: CONTROL DE NAVEGACIÓN Y PESTAÑAS (BLINDADO)
// =======================================================
function cambiarPestana(idPestana) {
    // 1. Ocultar todos los paneles
    const contenidos = document.querySelectorAll('.tab-content');
    contenidos.forEach(content => content.classList.remove('active'));

    // 2. Desactivar todos los botones del menú
    const botones = document.querySelectorAll('.nav-tab');
    botones.forEach(btn => btn.classList.remove('active'));

    // 3. Activar el panel seleccionado
    const pestanaSeleccionada = document.getElementById('sec-' + idPestana);
    if (pestanaSeleccionada) {
        pestanaSeleccionada.classList.add('active');
    }

    // 4. Activar el botón (usando captura segura)
    const e = window.event;
    if (e && e.currentTarget) {
        e.currentTarget.classList.add('active');
    }

    // 5. Renderizar KaTeX
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

// =======================================================
// BLOQUE 2: DISPARADOR PRINCIPAL DEL LABORATORIO
// =======================================================
function calcularLaboratorio() {
    const x1 = parseFloat(document.getElementById('lab-x1').value) || 0;
    const y1 = parseFloat(document.getElementById('lab-y1').value) || 0;
    const x2 = parseFloat(document.getElementById('lab-x2').value) || 0;
    const y2 = parseFloat(document.getElementById('lab-y2').value) || 0;

    if (typeof MathEngine === 'undefined' || !MathEngine.calcularSecuenciaRecta) {
        console.error("El motor MathEngine no está cargado.");
        return;
    }

    // LLamada al motor matemático
    const res = MathEngine.calcularSecuenciaRecta(x1, y1, x2, y2);

    renderizarResumenBarra(res, x1, y1, x2, y2);
    renderizarTarjetasPasoAPasoBeta(res, x1, y1, x2, y2);
    dibujarPlanoCartesianoLimpio(x1, y1, x2, y2, res);
}

function renderizarResumenBarra(res, x1, y1, x2, y2) {
    const bar = document.getElementById('resumen-grafica-bar');
    if (!bar) return;

    const mTexto = res.esVertical ? "Indefinida" : res.pendiente;
    const bTexto = res.esVertical ? "N/A" : `(0, ${res.ordenadaOrigen})`;

    bar.innerHTML = `
        <div><strong style="color: #084298;">Punto A:</strong> $A(${x1}, ${y1})$</div>
        <div><strong style="color: #842029;">Punto B:</strong> $B(${x2}, ${y2})$</div>
        <div><strong style="color: #d97706;">Pendiente ($m$):</strong> $${mTexto}$</div>
        <div><strong style="color: #059669;">Ordenada ($b$):</strong> $${bTexto}$</div>
        <div><strong style="color: #2563eb;">Ecuación:</strong> $${res.ecuaciones.explicita}$</div>
    `;
    if (window.renderMathInElement) { renderMathInElement(bar, { delimiters: [{left: "$", right: "$", display: false}] }); }
}

// =======================================================
// BLOQUE 3: CONSTRUCTOR DE LAS 7 TARJETAS (Desglose)
// =======================================================
function renderizarTarjetasPasoAPasoBeta(res, x1, y1, x2, y2) {
    const container = document.getElementById('pasos-container');
    if (!container) return;

    const dx = x2 - x1;
    const dy = y2 - y1;

    // --- INYECCIÓN HTML DE LAS TARJETAS ---
    const tarjetasHTML = [
       // ==============================================
        // PASO 1: VECTOR DESPLAZAMIENTO (CORREGIDO)
        // ==============================================
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                <span style="background: #2563eb; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.85rem;">1</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 1.05rem;">Vector Desplazamiento ($\\Delta \\vec{r}$)</h4>
            </div>
            
            <div style="text-align: center; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 2px solid #e2e8f0;">
                <p style="font-size: 0.85rem; color: #1e293b; margin: 0 0 0.4rem 0; font-weight: 700;">Sustitución en:</p>
                <p style="font-size: 0.95rem; color: #475569; margin: 0 0 0.5rem 0;">$$\\Delta \\vec{r} = (\\Delta x, \\Delta y)$$</p>
                <p style="font-size: 0.95rem; color: #1e293b; margin: 0;">$$\\Delta \\vec{r} = (\\textcolor{#dc2626}{x_2} - \\textcolor{#2563eb}{x_1}, \\, \\textcolor{#dc2626}{y_2} - \\textcolor{#2563eb}{y_1})$$</p>
            </div>

            <!-- Cajas Responsivas (Píldoras) -->
            <div class="contenedor-puntos">
                <div class="pill-punto-a">
                    <span class="dot-a"></span>
                    <strong>Punto A ($x_1, y_1$):</strong> $$\\textcolor{#2563eb}{${x1}}, \\textcolor{#2563eb}{${y1}}$$
                </div>
                <div class="pill-punto-b">
                    <span class="dot-b"></span>
                    <strong>Punto B ($x_2, y_2$):</strong> $$\\textcolor{#dc2626}{${x2}}, \\textcolor{#dc2626}{${y2}}$$
                </div>
            </div>

            <!-- Contenedor Compacto de Operaciones -->
            <div class="math-scrollable" style="text-align: center; padding: 0.75rem; display: flex; flex-direction: column; align-items: center; gap: 0.25rem;">
                <div style="width: 100%; max-width: 320px; text-align: left;">
                    <p style="font-size: 0.82rem; color: #475569; margin: 0 0 0.5rem 0; font-style: italic; background-color: #f1f5f9; padding: 6px 10px; border-radius: 4px; border-left: 3px solid #94a3b8;"><strong>1. Sustitución de valores:</strong> Reemplazamos las coordenadas respetando los signos.</p>
                </div>
                <p style="margin: 0 0 0.75rem 0; font-size: 0.95rem;">$$ \\Delta \\vec{r} = (\\textcolor{#dc2626}{${x2}} - (\\textcolor{#2563eb}{${x1}}), \\, \\textcolor{#dc2626}{${y2}} - (\\textcolor{#2563eb}{${y1}})) $$</p>
                
                <div style="width: 100%; max-width: 320px; text-align: left;">
                    <p style="font-size: 0.82rem; color: #475569; margin: 0 0 0.5rem 0; font-style: italic; background-color: #f1f5f9; padding: 6px 10px; border-radius: 4px; border-left: 3px solid #94a3b8;"><strong>2. Cálculo de incrementos:</strong> Obtenemos la distancia recorrida en cada eje.</p>
                </div>
                <p style="margin: 0 0 0.25rem 0; font-size: 0.95rem;">$$ \\Delta x = \\textcolor{#dc2626}{${x2}} - (\\textcolor{#2563eb}{${x1}}) = ${dx} $$</p>
                <p style="margin: 0; font-size: 0.95rem;">$$ \\Delta y = \\textcolor{#dc2626}{${y2}} - (\\textcolor{#2563eb}{${y1}}) = ${dy} $$</p>
            </div>

            <!-- Resultado Destacado -->
            <div class="resultado-azul-destacado">
                <span><strong>Resultado:</strong> $\\Delta \\vec{r} = (${dx}, \\, ${dy})$</span>
            </div>
        </div>
        `,
        `<div style="background: #ffffff; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <h4>4. Pendiente de la Recta ($m$)</h4>
            <p>$$m = ${res.pendiente}$$</p>
        </div>`,
        `<div style="background: #ffffff; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <h4>4. Pendiente de la Recta ($m$)</h4>
            <p>$$m = ${res.pendiente}$$</p>
        </div>`,
        `<div style="background: #ffffff; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <h4>5. Forma Punto-Pendiente</h4>
            <p>$$${res.ecuaciones.puntoPendiente}$$</p>
        </div>`,
        `<div style="background: #ffffff; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <h4>6. Forma Explícita ($y = mx + b$)</h4>
            <p>$$${res.ecuaciones.explicita}$$</p>
        </div>`,
        `<div style="background: #ffffff; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <h4>7. Forma General ($Ax + By + C = 0$)</h4>
            <p>$$${res.ecuaciones.general}$$</p>
        </div>`
    ];

    container.innerHTML = tarjetasHTML.join('');

    if (window.renderMathInElement) {
        renderMathInElement(container, {
            delimiters: [
                {left: "$$", right: "$$", display: true},
                {left: "$", right: "$", display: false}
            ],
            throwOnError: false
        });
    }
}

// ==============================================
// BLOQUE 4: DIBUJO DEL PLANO CARTESIANO EN CANVAS
// ==============================================
function dibujarPlanoCartesianoLimpio(x1, y1, x2, y2, res) {
    const canvas = document.getElementById('planoCartesianoCanvas');
    if (!canvas) return;

    const rect = canvas.parentNode.getBoundingClientRect();
    canvas.width = rect.width || 600;
    canvas.height = 420;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const maxCoord = Math.max(Math.abs(x1), Math.abs(y1), Math.abs(x2), Math.abs(y2), 5) + 3;
    const scale = Math.min(width, height) / (maxCoord * 2.2);
    
    const cx = width / 2;
    const cy = height / 2;

    const toPx = (x) => cx + (x * scale);
    const toPy = (y) => cy - (y * scale);

    // Fondo blanco
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Cuadrícula
    ctx.strokeStyle = "#f1f5f9";
    ctx.lineWidth = 1;
    for (let x = -Math.floor(maxCoord); x <= Math.floor(maxCoord); x++) {
        ctx.beginPath(); ctx.moveTo(toPx(x), 0); ctx.lineTo(toPx(x), height); ctx.stroke();
    }
    for (let y = -Math.floor(maxCoord); y <= Math.floor(maxCoord); y++) {
        ctx.beginPath(); ctx.moveTo(0, toPy(y)); ctx.lineTo(width, toPy(y)); ctx.stroke();
    }

    // Ejes X e Y
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(width, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, height); ctx.stroke();

    // Recta principal
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (res.esVertical) {
        ctx.moveTo(toPx(x1), 0);
        ctx.lineTo(toPx(x1), height);
    } else {
        const m = parseFloat(res.pendiente);
        const b = parseFloat(res.ordenadaOrigen);
        const xMin = -maxCoord * 2;
        const xMax = maxCoord * 2;
        ctx.moveTo(toPx(xMin), toPy(m * xMin + b));
        ctx.lineTo(toPx(xMax), toPy(m * xMax + b));
    }
    ctx.stroke();

    // Puntos A y B
    ctx.fillStyle = "#084298";
    ctx.beginPath();
    ctx.arc(toPx(x1), toPy(y1), 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#dc3545";
    ctx.beginPath();
    ctx.arc(toPx(x2), toPy(y2), 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText(`A(${x1}, ${y1})`, toPx(x1) + 12, toPy(y1) - 8);
    ctx.fillText(`B(${x2}, ${y2})`, toPx(x2) + 12, toPy(y2) - 8);
}

// =======================================================
// INICIALIZACIÓN
// =======================================================
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
    setTimeout(calcularLaboratorio, 200);
});
