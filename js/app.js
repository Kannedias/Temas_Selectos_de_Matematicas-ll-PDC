// =======================================================
// BLOQUE 1: CONTROL DE NAVEGACIÓN POR PESTAÑAS (SEGURA)
// =======================================================
function cambiarPestana(idPestana) {
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
// BLOQUE 3: CONSTRUCTOR DE LAS 7 TARJETAS
// =======================================================
function renderizarTarjetasPasoAPasoBeta(res, x1, y1, x2, y2) {
    const container = document.getElementById('pasos-container');
    if (!container) return;

    const dx = x2 - x1;
    const dy = y2 - y1;

    // Colores institucionales para trazar visualmente de dónde viene cada número
    const cA = "\\textcolor{#2563eb}"; // Azul para Origen A
    const cB = "\\textcolor{#dc2626}"; // Rojo para Destino B

    // Función limpiadora: Convierte 6.00 en 6, pero respeta si fuera 2.5
    const fmt = (num) => Number(num).toString();

    // Formateo seguro para el Paso 1 (envuelve en paréntesis los negativos y aplica color)
    const x1Fmt = x1 < 0 ? `(${cA}{${fmt(x1)}})` : `${cA}{${fmt(x1)}}`;
    const y1Fmt = y1 < 0 ? `(${cA}{${fmt(y1)}})` : `${cA}{${fmt(y1)}}`;
    const x2Fmt = x2 < 0 ? `(${cB}{${fmt(x2)}})` : `${cB}{${fmt(x2)}}`;
    const y2Fmt = y2 < 0 ? `(${cB}{${fmt(y2)}})` : `${cB}{${fmt(y2)}}`;
    const dxFmt = fmt(dx);
    const dyFmt = fmt(dy);

    // --- INYECCIÓN HTML DE LAS TARJETAS ---
    const tarjetasHTML = [
        // ==============================================
        // PASO 1: VECTOR DESPLAZAMIENTO (DINÁMICO)
        // ==============================================
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                <span style="background: #2563eb; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.85rem;">1</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 1rem;">Vector Desplazamiento ($\\Delta \\vec{r}$)</h4>
            </div>
            
            <div style="text-align: center; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 2px solid #e2e8f0;">
                <p style="font-size: 0.9rem; color: #475569; margin: 0 0 0.5rem 0;"><strong>Sustitución en:</strong> $$\\Delta \\vec{r} = \\Delta x \\hat{i} + \\Delta y \\hat{j}$$</p>
            </div>

            <div style="display: flex; gap: 1rem; margin-bottom: 1.25rem;">
                <div class="caja-datos-a">
                    <span style="font-size: 0.75rem; color: #1e40af; display: block; margin-bottom: 0.2rem; text-transform: uppercase;"><strong>Punto A</strong></span>
                    $$${cA}{${fmt(x1)}}, ${cA}{${fmt(y1)}}$$
                </div>
                <div class="caja-datos-b">
                    <span style="font-size: 0.75rem; color: #9f1239; display: block; margin-bottom: 0.2rem; text-transform: uppercase;"><strong>Punto B</strong></span>
                    $$${cB}{${fmt(x2)}}, ${cB}{${fmt(y2)}}$$
                </div>
            </div>

            <div style="background: #f8fafc; padding: 1rem; border-radius: 6px; border: 1px solid #f1f5f9; text-align: center; margin-bottom: 1rem; font-size: 1.05rem;">
                $$ \\Delta \\vec{r} = (${x2Fmt} - ${x1Fmt})\\hat{i} \\quad + \\quad (${y2Fmt} - ${y1Fmt})\\hat{j} $$
                $$ \\Delta x = ${x2Fmt} - ${x1Fmt} = ${dxFmt} $$
                $$ \\Delta y = ${y2Fmt} - ${y1Fmt} = ${dyFmt} $$
            </div>

            <div class="resultado-azul-destacado">
                <span><strong>Resultado:</strong> $\\Delta \\vec{r} = (${dxFmt})\\hat{i} + (${dyFmt})\\hat{j}$</span>
            </div>
        </div>
        `,
        // ==============================================
        // PASO 2 AL 7: ESTÁTICOS / LIMPIOS 
        // ==============================================
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                <span style="background: #2563eb; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.85rem;">2</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 1rem;">Magnitud del Desplazamiento ($|\\Delta \\vec{r}|$)</h4>
            </div>
            <div style="background: #f8fafc; padding: 1rem; border-radius: 6px; border: 1px solid #f1f5f9; text-align: center;">
                $$|\\Delta \\vec{r}| = \\sqrt{(\\Delta x)^2 + (\\Delta y)^2}$$
            </div>
        </div>
        `,
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                <span style="background: #2563eb; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.85rem;">3</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 1rem;">Dirección del Vector ($\\theta$)</h4>
            </div>
            <div style="background: #f8fafc; padding: 1rem; border-radius: 6px; border: 1px solid #f1f5f9; text-align: center;">
                $$\\theta = \\arctan\\left(\\frac{\\Delta y}{\\Delta x}\\right)$$
            </div>
        </div>
        `,
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                <span style="background: #2563eb; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.85rem;">4</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 1rem;">Pendiente de la Recta ($m$)</h4>
            </div>
            <div style="background: #f8fafc; padding: 1rem; border-radius: 6px; border: 1px solid #f1f5f9; text-align: center;">
                $$m = \\frac{y_2 - y_1}{x_2 - x_1}$$
            </div>
        </div>
        `,
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                <span style="background: #2563eb; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.85rem;">5</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 1rem;">Forma Punto-Pendiente</h4>
            </div>
            <div style="background: #f8fafc; padding: 1rem; border-radius: 6px; border: 1px solid #f1f5f9; text-align: center;">
                $$y - y_1 = m(x - x_1)$$
            </div>
        </div>
        `,
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                <span style="background: #2563eb; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.85rem;">6</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 1rem;">Forma Explícita ($y = mx + b$)</h4>
            </div>
            <div style="background: #f8fafc; padding: 1rem; border-radius: 6px; border: 1px solid #f1f5f9; text-align: center;">
                $$y = mx + b$$
            </div>
        </div>
        `,
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); grid-column: 1 / -1;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                <span style="background: #2563eb; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.85rem;">7</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 1rem;">Forma General ($Ax + By + C = 0$)</h4>
            </div>
            <div style="background: #f8fafc; padding: 1rem; border-radius: 6px; border: 1px solid #f1f5f9; text-align: center;">
                $$Ax + By + C = 0$$
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
// BLOQUE 4: DIBUJO DEL PLANO CARTESIANO EN CANVAS (NO TOCAR)
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

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "#f1f5f9";
    ctx.lineWidth = 1;
    for (let x = -Math.floor(maxCoord); x <= Math.floor(maxCoord); x++) {
        ctx.beginPath(); ctx.moveTo(toPx(x), 0); ctx.lineTo(toPx(x), height); ctx.stroke();
    }
    for (let y = -Math.floor(maxCoord); y <= Math.floor(maxCoord); y++) {
        ctx.beginPath(); ctx.moveTo(0, toPy(y)); ctx.lineTo(width, toPy(y)); ctx.stroke();
    }

    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(width, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, height); ctx.stroke();

    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(toPx(x1), toPy(y1));
    ctx.lineTo(toPx(x2), toPy(y1));
    ctx.lineTo(toPx(x2), toPy(y2));
    ctx.stroke();
    ctx.setLineDash([]);

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

    if (!res.esVertical && res.ordenadaOrigen !== "N/A") {
        const b = parseFloat(res.ordenadaOrigen);
        ctx.fillStyle = "#10b981";
        ctx.beginPath();
        ctx.arc(toPx(0), toPy(b), 5, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.fillStyle = "#084298";
    ctx.beginPath();
    ctx.arc(toPx(x1), toPy(y1), 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#dc3545";
    ctx.beginPath();
    ctx.arc(toPx(x2), toPy(y2), 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText(`A(${x1}, ${y1})`, toPx(x1) + 8, toPy(y1) - 6);
    ctx.fillText(`B(${x2}, ${y2})`, toPx(x2) + 8, toPy(y2) - 6);
}

// =======================================================
// BLOQUE 5: INICIALIZACIÓN
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
