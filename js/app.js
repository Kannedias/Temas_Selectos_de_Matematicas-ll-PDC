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
        // PASO 1: VECTOR DESPLAZAMIENTO (ULTRA COMPACTO)
        // ==============================================
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); display: flex; flex-direction: column; justify-content: space-between;">
            
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 0.5rem;">
                <span style="background: #2563eb; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem;">1</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 1rem;">Vector Desplazamiento ($\\Delta \\vec{r}$)</h4>
            </div>
            
            <div style="text-align: center; margin-bottom: 0.75rem;">
                <p style="font-size: 0.9rem; color: #475569; margin: 0 0 0.25rem 0;">$$\\Delta \\vec{r} = (\\Delta x, \\Delta y)$$</p>
                <p style="font-size: 0.9rem; color: #1e293b; margin: 0;">$$\\Delta \\vec{r} = (\\textcolor{#dc2626}{x_2} - \\textcolor{#2563eb}{x_1}, \\, \\textcolor{#dc2626}{y_2} - \\textcolor{#2563eb}{y_1})$$</p>
            </div>

            <!-- Cajas Responsivas (Píldoras) -->
            <div class="contenedor-puntos" style="margin-bottom: 0.75rem; gap: 0.5rem;">
                <div class="pill-punto-a" style="padding: 0.25rem 0.6rem;">
                    <span class="dot-a" style="width: 8px; height: 8px;"></span>
                    <strong>A:</strong> $$\\textcolor{#2563eb}{${x1}}, \\textcolor{#2563eb}{${y1}}$$
                </div>
                <div class="pill-punto-b" style="padding: 0.25rem 0.6rem;">
                    <span class="dot-b" style="width: 8px; height: 8px;"></span>
                    <strong>B:</strong> $$\\textcolor{#dc2626}{${x2}}, \\textcolor{#dc2626}{${y2}}$$
                </div>
            </div>

            <!-- Contenedor ULTRA Compacto de Operaciones (En la misma línea) -->
            <div class="math-scrollable" style="padding: 0.5rem; display: flex; flex-direction: column; gap: 0.5rem; background: #f8fafc; border-radius: 6px; margin-bottom: 0.75rem;">
                
                <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; justify-content: center;">
                    <span style="font-size: 0.75rem; color: #475569; background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: 600;">1. Sustituir:</span>
                    <span style="font-size: 0.9rem; margin: 0;">$$ \\Delta \\vec{r} = (\\textcolor{#dc2626}{${x2}} - (\\textcolor{#2563eb}{${x1}}), \\, \\textcolor{#dc2626}{${y2}} - (\\textcolor{#2563eb}{${y1}})) $$</span>
                </div>
                
                <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; justify-content: center;">
                    <span style="font-size: 0.75rem; color: #475569; background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: 600;">2. Restar:</span>
                    <span style="font-size: 0.9rem; margin: 0;">$$ \\Delta x = ${dx} \\quad \\text{y} \\quad \\Delta y = ${dy} $$</span>
                </div>

            </div>

            <!-- Resultado Destacado -->
            <div class="resultado-azul-destacado" style="padding: 0.75rem; margin-top: auto;">
                <span><strong>Resultado:</strong> $\\Delta \\vec{r} = (${dx}, \\, ${dy})$</span>
            </div>
        </div>
        `,
        // ==============================================
        // PASO 2: MAGNITUD DEL DESPLAZAMIENTO 
        // ==============================================
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); display: flex; flex-direction: column; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 0.5rem;">
                <span style="background: #2563eb; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem;">2</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 1rem;">Magnitud ($|\\Delta \\vec{r}|$)</h4>
            </div>
            
            <div style="text-align: center; margin-bottom: 0.75rem;">
                <p style="font-size: 0.9rem; color: #475569; margin: 0;">$$|\\Delta \\vec{r}| = \\sqrt{(\\Delta x)^2 + (\\Delta y)^2}$$</p>
            </div>

            <div class="math-scrollable" style="padding: 0.5rem; display: flex; flex-direction: column; gap: 0.5rem; background: #f8fafc; border-radius: 6px; margin-bottom: 0.75rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; justify-content: center;">
                    <span style="font-size: 0.75rem; color: #475569; background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: 600;">1. Sustituir:</span>
                    <span style="font-size: 0.9rem; margin: 0;">$$|\\Delta \\vec{r}| = \\sqrt{(${dxFmt})^2 + (${dyFmt})^2}$$</span>
                </div>
                
                <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; justify-content: center;">
                    <span style="font-size: 0.75rem; color: #475569; background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: 600;">2. Calcular:</span>
                    <span style="font-size: 0.9rem; margin: 0;">$$|\\Delta \\vec{r}| = \\sqrt{${fmt(dx*dx)} + ${fmt(dy*dy)}} = \\sqrt{${fmt(dx*dx + dy*dy)}}$$</span>
                </div>
            </div>

            <div class="resultado-azul-destacado" style="padding: 0.75rem; margin-top: auto;">
                <span><strong>Resultado:</strong> $|\\Delta \\vec{r}| = ${res.magnitud} \\text{ u}$</span>
            </div>
        </div>
        `,

        // ==============================================
        // PASO 3: DIRECCIÓN Y CUADRANTE
        // ==============================================
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); display: flex; flex-direction: column; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 0.5rem;">
                <span style="background: #2563eb; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem;">3</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 1rem;">Dirección ($\\theta$)</h4>
            </div>
            
            <div style="text-align: center; margin-bottom: 0.75rem;">
                <p style="font-size: 0.9rem; color: #475569; margin: 0;">$$\\theta = \\arctan\\left(\\frac{\\Delta y}{\\Delta x}\\right)$$</p>
            </div>

            <div class="math-scrollable" style="padding: 0.5rem; display: flex; flex-direction: column; gap: 0.5rem; background: #f8fafc; border-radius: 6px; margin-bottom: 0.75rem; font-size: 0.85rem;">
                <p style="margin: 0; color: #1e293b; text-align: center;"><strong>Cuadrante:</strong> ${analisisCuadrante}</p>
                <ul style="margin: 0; padding-left: 1.2rem; line-height: 1.4; color: #475569;">
                    ${calculoFormula}
                </ul>
            </div>

            <div class="resultado-azul-destacado" style="padding: 0.75rem; margin-top: auto;">
                <span><strong>Resultado:</strong> $\\theta = ${res.direccion.grados}^\\circ$</span>
            </div>
        </div>
        `,

        // ==============================================
        // PASO 4: CÁLCULO DE LA PENDIENTE
        // ==============================================
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); display: flex; flex-direction: column; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 0.5rem;">
                <span style="background: #2563eb; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem;">4</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 1rem;">Pendiente ($m$)</h4>
            </div>
            
            <div style="text-align: center; margin-bottom: 0.75rem;">
                <p style="font-size: 0.9rem; color: #475569; margin: 0;">$$m = \\frac{\\Delta y}{\\Delta x}$$</p>
            </div>

            <div class="math-scrollable" style="padding: 0.5rem; display: flex; flex-direction: column; gap: 0.5rem; background: #f8fafc; border-radius: 6px; margin-bottom: 0.75rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; justify-content: center;">
                    <span style="font-size: 0.75rem; color: #475569; background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: 600;">1. Sustituir:</span>
                    <span style="font-size: 0.9rem; margin: 0;">$$m = \\frac{${dyFmt}}{${dxFmt}}$$</span>
                </div>
            </div>

            <div class="resultado-azul-destacado" style="padding: 0.75rem; margin-top: auto;">
                <span><strong>Resultado:</strong> $m = ${mVal}$</span>
            </div>
        </div>
        `,

        // ==============================================
        // PASO 5: ECUACIÓN PUNTO-PENDIENTE
        // ==============================================
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); display: flex; flex-direction: column; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 0.5rem;">
                <span style="background: #2563eb; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem;">5</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 1rem;">Forma Punto-Pendiente</h4>
            </div>
            
            <div style="text-align: center; margin-bottom: 0.75rem;">
                <p style="font-size: 0.9rem; color: #475569; margin: 0;">$$y - y_1 = m(x - x_1)$$</p>
            </div>

            <div class="math-scrollable" style="padding: 0.5rem; display: flex; flex-direction: column; gap: 0.5rem; background: #f8fafc; border-radius: 6px; margin-bottom: 0.75rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; justify-content: center;">
                    <span style="font-size: 0.75rem; color: #475569; background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: 600;">Sustituir $A$ y $m$:</span>
                    <span style="font-size: 0.9rem; margin: 0;">$$y - ${y1Fmt} = ${mVal}(x - ${x1Fmt})$$</span>
                </div>
            </div>

            <div class="resultado-azul-destacado" style="padding: 0.75rem; margin-top: auto;">
                <span><strong>Resultado:</strong> $${res.ecuaciones.puntoPendiente}$</span>
            </div>
        </div>
        `,

        // ==============================================
        // PASO 6: FORMA EXPLÍCITA
        // ==============================================
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); display: flex; flex-direction: column; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 0.5rem;">
                <span style="background: #2563eb; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem;">6</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 1rem;">Forma Explícita ($y = mx + b$)</h4>
            </div>
            
            <div style="text-align: center; margin-bottom: 0.75rem;">
                <p style="font-size: 0.9rem; color: #475569; margin: 0;">$$y = mx + b$$</p>
            </div>

            <div class="math-scrollable" style="padding: 0.5rem; display: flex; flex-direction: column; gap: 0.5rem; background: #f8fafc; border-radius: 6px; margin-bottom: 0.75rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; justify-content: center;">
                    <span style="font-size: 0.75rem; color: #475569; background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: 600;">Despejar $y$:</span>
                    <span style="font-size: 0.9rem; margin: 0;">$$y = ${res.ecuaciones.explicita}$$</span>
                </div>
            </div>

            <div class="resultado-azul-destacado" style="padding: 0.75rem; margin-top: auto;">
                <span><strong>Ordenada ($b$):</strong> ${bVal}</span>
            </div>
        </div>
        `,

        // ==============================================
        // PASO 7: FORMA GENERAL
        // ==============================================
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); display: flex; flex-direction: column; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 0.5rem;">
                <span style="background: #2563eb; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem;">7</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 1rem;">Forma General</h4>
            </div>
            
            <div style="text-align: center; margin-bottom: 0.75rem;">
                <p style="font-size: 0.9rem; color: #475569; margin: 0;">$$Ax + By + C = 0$$</p>
            </div>

            <div class="math-scrollable" style="padding: 0.5rem; display: flex; flex-direction: column; gap: 0.5rem; background: #f8fafc; border-radius: 6px; margin-bottom: 0.75rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; justify-content: center;">
                    <span style="font-size: 0.75rem; color: #475569; background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: 600;">Igualar a 0:</span>
                    <span style="font-size: 0.9rem; margin: 0;">$$${res.ecuaciones.general}$$</span>
                </div>
            </div>

            <div class="resultado-azul-destacado" style="padding: 0.75rem; margin-top: auto;">
                <span><strong>Resultado:</strong> Ecuación Estándar</span>
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
