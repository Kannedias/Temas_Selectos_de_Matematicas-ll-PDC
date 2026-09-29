// =======================================================
// CONTROL DE NAVEGACIÓN POR PESTAÑAS
// =======================================================
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

    // 4. Activar el botón presionado de forma segura
    const e = window.event;
    if (e && e.currentTarget) {
        e.currentTarget.classList.add('active');
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

// =======================================================
// CONTROLADOR DEL LABORATORIO CON TRAZABILIDAD Y FORMATO BETA
// =======================================================
function calcularLaboratorio() {
    const x1 = parseFloat(document.getElementById('lab-x1').value) || 0;
    const y1 = parseFloat(document.getElementById('lab-y1').value) || 0;
    const x2 = parseFloat(document.getElementById('lab-x2').value) || 0;
    const y2 = parseFloat(document.getElementById('lab-y2').value) || 0;

    if (typeof MathEngine === 'undefined' || !MathEngine.calcularSecuenciaRecta) {
        console.error("El motor MathEngine no está cargado correctamente.");
        return;
    }

    // Cálculo matemático de los 7 pasos
    const res = MathEngine.calcularSecuenciaRecta(x1, y1, x2, y2);

    // Renderizado de barra de parámetros clave y tarjetas
    renderizarResumenBarra(res, x1, y1, x2, y2);
    renderizarTarjetasPasoAPasoBeta(res, x1, y1, x2, y2);

    // Graficado en el lienzo interactivo
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

    if (window.renderMathInElement) {
        renderMathInElement(bar, { delimiters: [{left: "$", right: "$", display: false}] });
    }
}

function renderizarTarjetasPasoAPasoBeta(res, x1, y1, x2, y2) {
    const container = document.getElementById('pasos-container');
    if (!container) return;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const mVal = res.pendiente;
    const bVal = res.ordenadaOrigen;

    const x1Str = x1 < 0 ? `(${x1})` : `${x1}`;
    const y1Str = y1 < 0 ? `(${y1})` : `${y1}`;
    const x2Str = x2 < 0 ? `(${x2})` : `${x2}`;
    const y2Str = y2 < 0 ? `(${y2})` : `${y2}`;
    const dxStr = dx < 0 ? `(${dx.toFixed(2)})` : `${dx.toFixed(2)}`;
    const dyStr = dy < 0 ? `(${dy.toFixed(2)})` : `${dy.toFixed(2)}`;

    const tarjetasHTML = [
        // PASO 1
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <span style="background: #2563eb; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem;">1</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 0.98rem;">Paso 1: Vector Desplazamiento ($\\Delta \\vec{r}$)</h4>
            </div>
            <p style="font-size: 0.82rem; color: #475569; margin: 0 0 0.5rem 0;"><strong>Origen de datos:</strong> Punto $A(x_1 = ${x1}, y_1 = ${y1})$ y Punto $B(x_2 = ${x2}, y_2 = ${y2})$.</p>
            <div style="background: #f8fafc; padding: 0.6rem; border-radius: 6px; border: 1px solid #f1f5f9; text-align: center; margin-bottom: 0.5rem;">
                <span style="font-size: 0.78rem; color: #64748b;">Sustitución en $\\Delta \\vec{r} = \\Delta x \\hat{i} + \\Delta y \\hat{j}$:</span>
                $$\\Delta \\vec{r} = (${dx.toFixed(2)})\\hat{i} + (${dy.toFixed(2)})\\hat{j}$$
            </div>
            <ul style="font-size: 0.8rem; color: #475569; margin: 0 0 0.6rem 1rem; padding: 0;">
                <li>Cambio Horizontal ($\\Delta x$): $x_2 - x_1 = ${x2Str} - ${x1Str} = ${dx.toFixed(2)}$</li>
                <li>Cambio Vertical ($\\Delta y$): $y_2 - y_1 = ${y2Str} - ${y1Str} = ${dy.toFixed(2)}$</li>
            </ul>
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 0.5rem 0.75rem; border-radius: 6px;">
                <div style="font-size: 0.82rem; color: #1e40af; font-weight: bold;">Resultado obtenido: $\\Delta \\vec{r} = (${dx.toFixed(2)})\\hat{i} + (${dy.toFixed(2)})\\hat{j}$</div>
            </div>
        </div>
        `,
        // PASO 2
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <span style="background: #2563eb; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem;">2</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 0.98rem;">Paso 2: Magnitud del Desplazamiento ($|\\Delta \\vec{r}|$)</h4>
            </div>
            <div style="background: #f8fafc; padding: 0.6rem; border-radius: 6px; border: 1px solid #f1f5f9; text-align: center; margin-bottom: 0.5rem;">
                <span style="font-size: 0.78rem; color: #64748b;">Aplicando Teorema de Pitágoras:</span>
                $$|\\Delta \\vec{r}| = \\sqrt{${dxStr}^2 + ${dyStr}^2} = \\sqrt{${(dx*dx + dy*dy).toFixed(2)}} \\approx ${res.magnitud}$$
            </div>
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 0.5rem 0.75rem; border-radius: 6px;">
                <div style="font-size: 0.82rem; color: #1e40af; font-weight: bold;">Resultado obtenido: $|\\Delta \\vec{r}| = ${res.magnitud}$ unidades</div>
            </div>
        </div>
        `,
        // PASO 3
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <span style="background: #2563eb; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem;">3</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 0.98rem;">Paso 3: Dirección del Vector ($\\theta$)</h4>
            </div>
            <div style="background: #f8fafc; padding: 0.6rem; border-radius: 6px; border: 1px solid #f1f5f9; margin-bottom: 0.5rem; font-size: 0.8rem;">
                <strong>Análisis de cuadrante:</strong> El vector se ubica en el <strong>${res.direccion.cuadrante}</strong>.<br>
                1. Ángulo de referencia: $\\alpha = \\arctan\\left(\\left|\\frac{${dy.toFixed(2)}}{${dx.toFixed(2)}}\\right|\\right) = ${Math.abs(res.direccion.grados).toFixed(2)}^\\circ$<br>
                2. Ajuste por cuadrante: $\\theta = ${res.direccion.grados}^\\circ$
            </div>
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 0.5rem 0.75rem; border-radius: 6px;">
                <div style="font-size: 0.82rem; color: #1e40af; font-weight: bold;">Resultado obtenido: $\\theta = ${res.direccion.grados}^\\circ$</div>
            </div>
        </div>
        `,
        // PASO 4
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <span style="background: #2563eb; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem;">4</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 0.98rem;">Paso 4: Cálculo de la Pendiente ($m$)</h4>
            </div>
            <div style="background: #f8fafc; padding: 0.6rem; border-radius: 6px; border: 1px solid #f1f5f9; text-align: center; margin-bottom: 0.5rem;">
                <span style="font-size: 0.78rem; color: #64748b;">Sustitución en $m = \\frac{y_2 - y_1}{x_2 - x_1}$:</span>
                $$m = \\frac{${y2Str} - ${y1Str}}{${x2Str} - ${x1Str}} = \\frac{${dy.toFixed(2)}}{${dx.toFixed(2)}} = ${mVal}$$
            </div>
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 0.5rem 0.75rem; border-radius: 6px;">
                <div style="font-size: 0.82rem; color: #1e40af; font-weight: bold;">Resultado obtenido: $m = ${mVal}$</div>
            </div>
        </div>
        `,
        // PASO 5
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <span style="background: #2563eb; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem;">5</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 0.98rem;">Paso 5: Ecuación Punto-Pendiente</h4>
            </div>
            <div style="background: #f8fafc; padding: 0.6rem; border-radius: 6px; border: 1px solid #f1f5f9; text-align: center; margin-bottom: 0.5rem;">
                <span style="font-size: 0.78rem; color: #64748b;">Sustitución directa en $y - y_1 = m(x - x_1)$:</span>
                $$y - ${y1Str} = ${mVal} \\cdot (x - ${x1Str})$$
            </div>
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 0.5rem 0.75rem; border-radius: 6px;">
                <div style="font-size: 0.82rem; color: #1e40af; font-weight: bold;">Resultado obtenido: $${res.ecuaciones.puntoPendiente}$</div>
            </div>
        </div>
        `,
        // PASO 6
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <span style="background: #2563eb; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem;">6</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 0.98rem;">Paso 6: Forma Explícita ($y = mx + b$)</h4>
            </div>
            <div style="background: #f8fafc; padding: 0.6rem; border-radius: 6px; border: 1px solid #f1f5f9; text-align: center; margin-bottom: 0.5rem;">
                <span style="font-size: 0.78rem; color: #64748b;">Despeje paso a paso de $y$:</span>
                $$y = ${res.ecuaciones.explicita}$$
            </div>
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 0.5rem 0.75rem; border-radius: 6px;">
                <div style="font-size: 0.82rem; color: #1e40af; font-weight: bold;">Resultado obtenido: Ordenada al origen $b = ${bVal}$</div>
            </div>
        </div>
        `,
        // PASO 7
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <span style="background: #2563eb; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem;">7</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 0.98rem;">Paso 7: Forma General ($Ax + By + C = 0$)</h4>
            </div>
            <div style="background: #f8fafc; padding: 0.6rem; border-radius: 6px; border: 1px solid #f1f5f9; text-align: center; margin-bottom: 0.5rem;">
                <span style="font-size: 0.78rem; color: #64748b;">Alineación canónica:</span>
                $$${res.ecuaciones.general}$$
            </div>
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 0.5rem 0.75rem; border-radius: 6px;">
                <div style="font-size: 0.82rem; color: #1e40af; font-weight: bold;">Resultado obtenido: Ecuación General Formalizada</div>
            </div>
        </div>
        `
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

// =======================================================
// DIBUJO DEL PLANO CARTESIANO EN CANVAS
// =======================================================
function dibujarPlanoCartesianoLimpio(x1, y1, x2, y2, res) {
    const canvas = document.getElementById('planoCartesianoCanvas');
    if (!canvas) return;

    const rect = canvas.parentNode.getBoundingClientRect();
    canvas.width = rect.width || 600;
    canvas.height = 380;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const maxCoord = Math.max(Math.abs(x1), Math.abs(y1), Math.abs(x2), Math.abs(y2), 5) + 3;
    const scale = Math.min(width, height) / (maxCoord * 2);
    
    const cx = width / 2;
    const cy = height / 2;

    const toPx = (x) => cx + (x * scale);
    const toPy = (y) => cy - (y * scale);

    // Fondo
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Cuadrícula tenue
    ctx.strokeStyle = "#f1f5f9";
    ctx.lineWidth = 1;
    for (let x = -Math.floor(maxCoord); x <= Math.floor(maxCoord); x++) {
        ctx.beginPath(); ctx.moveTo(toPx(x), 0); ctx.lineTo(toPx(x), height); ctx.stroke();
    }
    for (let y = -Math.floor(maxCoord); y <= Math.floor(maxCoord); y++) {
        ctx.beginPath(); ctx.moveTo(0, toPy(y)); ctx.lineTo(width, toPy(y)); ctx.stroke();
    }

    // Ejes Cartesianos
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(width, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, height); ctx.stroke();

    // Triángulo de Pendiente (Naranja)
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(toPx(x1), toPy(y1));
    ctx.lineTo(toPx(x2), toPy(y1));
    ctx.lineTo(toPx(x2), toPy(y2));
    ctx.stroke();
    ctx.setLineDash([]);

    // Recta Principal (Azul)
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

    // Corte Eje Y (Verde)
    if (!res.esVertical && res.ordenadaOrigen !== "N/A") {
        const b = parseFloat(res.ordenadaOrigen);
        ctx.fillStyle = "#10b981";
        ctx.beginPath();
        ctx.arc(toPx(0), toPy(b), 5, 0, Math.PI * 2);
        ctx.fill();
    }

    // Punto A (Azul)
    ctx.fillStyle = "#084298";
    ctx.beginPath();
    ctx.arc(toPx(x1), toPy(y1), 6, 0, Math.PI * 2);
    ctx.fill();

    // Punto B (Rojo)
    ctx.fillStyle = "#dc3545";
    ctx.beginPath();
    ctx.arc(toPx(x2), toPy(y2), 6, 0, Math.PI * 2);
    ctx.fill();

    // Etiquetas
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText(`A(${x1}, ${y1})`, toPx(x1) + 8, toPy(y1) - 6);
    ctx.fillText(`B(${x2}, ${y2})`, toPx(x2) + 8, toPy(y2) - 6);
}

// =======================================================
// INICIALIZACIÓN AL CARGAR EL DOCUMENTO
// =======================================================
document.addEventListener("DOMContentLoaded", function() {
    // 1. Renderizado inicial de notación matemática en los componentes activos
    if (window.renderMathInElement) {
        renderMathInElement(document.body, {
            delimiters: [
                {left: "$$", right: "$$", display: true},
                {left: "$", right: "$", display: false}
            ],
            throwOnError: false
        });
    }

    // 2. Disparar cálculos del laboratorio al inicializar
    setTimeout(calcularLaboratorio, 200);
});
