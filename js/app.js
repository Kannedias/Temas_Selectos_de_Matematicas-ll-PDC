// =======================================================
// BLOQUE 1: CONTROL DE NAVEGACIÓN POR PESTAÑAS (SEGURA)
// =======================================================
function cambiarPestana(idPestana) {
    // 1. Ocultar todos los contenidos
    const contenidos = document.querySelectorAll('.tab-content');
    contenidos.forEach(content => content.classList.remove('active'));

    // 2. Quitar el estado activo en todos los botones
    const botones = document.querySelectorAll('.nav-tab');
    botones.forEach(btn => btn.classList.remove('active'));

    // 3. Mostrar la pestaña seleccionada
    const pestanaSeleccionada = document.getElementById('sec-' + idPestana);
    if (pestanaSeleccionada) {
        pestanaSeleccionada.classList.add('active');
    }

    // 4. Activar el botón presionado (MÉTODO BLINDADO SIN USAR 'EVENT')
    const botonActivo = document.querySelector(`button[onclick="cambiarPestana('${idPestana}')"]`);
    if (botonActivo) {
        botonActivo.classList.add('active');
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

    // Llama al math-engine (El cerebro)
    const res = MathEngine.calcularSecuenciaRecta(x1, y1, x2, y2);

    // Llama a las funciones que "Pintan" el HTML
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
// BLOQUE 3: CONSTRUCTOR DE LAS 7 TARJETAS (AQUÍ ESTÁ LA EXPLICACIÓN)
// =======================================================
function renderizarTarjetasPasoAPasoBeta(res, x1, y1, x2, y2) {
    const container = document.getElementById('pasos-container');
    if (!container) return;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const mVal = res.pendiente;
    const bVal = res.ordenadaOrigen;

    // Colores para trazar visualmente de dónde viene cada número en KaTeX
    const cA = "\\textcolor{#2563eb}"; // Azul para Origen A
    const cB = "\\textcolor{#dc2626}"; // Rojo para Destino B

    // Formateo seguro para paréntesis (si es negativo, lo envuelve en paréntesis con su color)
    const x1F = x1 < 0 ? `(${cA}{${x1}})` : `${cA}{${x1}}`;
    const y1F = y1 < 0 ? `(${cA}{${y1}})` : `${cA}{${y1}}`;
    const x2F = x2 < 0 ? `(${cB}{${x2}})` : `${cB}{${x2}}`;
    const y2F = y2 < 0 ? `(${cB}{${y2}})` : `${cB}{${y2}}`;

    // --- ANÁLISIS DINÁMICO DEL PASO 3 ---
    let analisisCuadrante = "";
    let calculoFormula = "";
    
    // Evita crasheos si se olvidaron de actualizar math-engine.js
    const anguloBase = (res.direccion && res.direccion.anguloReferencia) ? res.direccion.anguloReferencia : "0.00";
    
    if (dx === 0 && dy === 0) {
        analisisCuadrante = "El vector es nulo, no tiene dirección definida.";
    } else if (dx > 0 && dy >= 0) {
        analisisCuadrante = `Como $\\Delta x > 0$ y $\\Delta y \\geq 0$, el vector se ubica en el <strong>primer cuadrante</strong>.`;
        calculoFormula = `
            <li>Se halla el ángulo de referencia: $$ \\alpha = \\arctan\\left(\\left|\\frac{${dy.toFixed(2)}}{${dx.toFixed(2)}}\\right|\\right) = ${anguloBase}^\\circ $$</li>
            <li>Al estar en el 1er cuadrante, es directo: $$ \\theta = ${res.direccion.grados}^\\circ $$</li>`;
    } else if (dx < 0 && dy >= 0) {
        analisisCuadrante = `Como $\\Delta x < 0$ y $\\Delta y \\geq 0$, el vector se ubica en el <strong>segundo cuadrante</strong>.`;
        calculoFormula = `
            <li>Se halla el ángulo de referencia: $$ \\alpha = \\arctan\\left(\\left|\\frac{${dy.toFixed(2)}}{${dx.toFixed(2)}}\\right|\\right) = ${anguloBase}^\\circ $$</li>
            <li>Ajuste para el 2do cuadrante ($180^\\circ - \\alpha$): $$ \\theta = 180^\\circ - ${anguloBase}^\\circ = ${res.direccion.grados}^\\circ $$</li>`;
    } else if (dx < 0 && dy < 0) {
        analisisCuadrante = `Como $\\Delta x < 0$ y $\\Delta y < 0$, el vector se ubica en el <strong>tercer cuadrante</strong>.`;
        calculoFormula = `
            <li>Se halla el ángulo de referencia: $$ \\alpha = \\arctan\\left(\\left|\\frac{${dy.toFixed(2)}}{${dx.toFixed(2)}}\\right|\\right) = ${anguloBase}^\\circ $$</li>
            <li>Ajuste para el 3er cuadrante ($180^\\circ + \\alpha$): $$ \\theta = 180^\\circ + ${anguloBase}^\\circ = ${res.direccion.grados}^\\circ $$</li>`;
    } else if (dx > 0 && dy < 0) {
        analisisCuadrante = `Como $\\Delta x > 0$ y $\\Delta y < 0$, el vector se ubica en el <strong>cuarto cuadrante</strong>.`;
        calculoFormula = `
            <li>Se halla el ángulo de referencia: $$ \\alpha = \\arctan\\left(\\left|\\frac{${dy.toFixed(2)}}{${dx.toFixed(2)}}\\right|\\right) = ${anguloBase}^\\circ $$</li>
            <li>Ajuste para el 4to cuadrante ($360^\\circ - \\alpha$): $$ \\theta = 360^\\circ - ${anguloBase}^\\circ = ${res.direccion.grados}^\\circ $$</li>`;
    } else if (dx === 0) {
        analisisCuadrante = `Como $\\Delta x = 0$, el vector se encuentra directamente sobre el <strong>eje vertical</strong>.`;
        calculoFormula = `<li>La división por cero está indefinida. Por posición en el eje: $$ \\theta = ${res.direccion.grados}^\\circ $$</li>`;
    }

    // --- INYECCIÓN HTML DE LAS TARJETAS ---
    const tarjetasHTML = [
        // PASO 1
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <span style="background: #2563eb; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.85rem;">1</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 1rem;">Vector Desplazamiento ($\\Delta \\vec{r}$)</h4>
            </div>
            <p style="font-size: 0.85rem; color: #475569; margin: 0 0 0.75rem 0;"><strong>Sustitución en:</strong> $\\Delta \\vec{r} = \\Delta x \\hat{i} + \\Delta y \\hat{j}$</p>
            <div style="background: #f8fafc; padding: 0.75rem; border-radius: 6px; border: 1px solid #f1f5f9; text-align: center; margin-bottom: 0.75rem; font-size: 0.95rem;">
                $$ \\Delta x = ${x2F} - ${x1F} = ${dx.toFixed(2)} $$
                $$ \\Delta y = ${y2F} - ${y1F} = ${dy.toFixed(2)} $$
            </div>
            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 0.75rem; border-radius: 4px;">
                <div style="font-size: 0.9rem; color: #1e40af; font-weight: bold;">Resultado: $\\Delta \\vec{r} = (${dx.toFixed(2)})\\hat{i} + (${dy.toFixed(2)})\\hat{j}$</div>
            </div>
        </div>
        `,
        // PASO 2
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <span style="background: #2563eb; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.85rem;">2</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 1rem;">Magnitud del Desplazamiento ($|\\Delta \\vec{r}|$)</h4>
            </div>
            <p style="font-size: 0.85rem; color: #475569; margin: 0 0 0.75rem 0;"><strong>Aplicando Teorema de Pitágoras:</strong></p>
            <div style="background: #f8fafc; padding: 0.75rem; border-radius: 6px; border: 1px solid #f1f5f9; text-align: center; margin-bottom: 0.75rem; font-size: 0.95rem;">
                $$|\\Delta \\vec{r}| = \\sqrt{(${dx.toFixed(2)})^2 + (${dy.toFixed(2)})^2} \\approx ${res.magnitud}$$
            </div>
            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 0.75rem; border-radius: 4px;">
                <div style="font-size: 0.9rem; color: #1e40af; font-weight: bold;">Resultado: $|\\Delta \\vec{r}| = ${res.magnitud}$ unidades</div>
            </div>
        </div>
        `,
        // PASO 3
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <span style="background: #2563eb; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.85rem;">3</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 1rem;">Dirección del Vector ($\\theta$)</h4>
            </div>
            <div style="background: #f8fafc; padding: 0.75rem; border-radius: 6px; border: 1px solid #f1f5f9; margin-bottom: 0.75rem; font-size: 0.85rem;">
                <p style="margin-bottom: 0.5rem;"><strong>Análisis de cuadrante:</strong> ${analisisCuadrante}</p>
                <ul style="margin: 0; padding-left: 1.2rem; line-height: 1.6;">
                    ${calculoFormula}
                </ul>
            </div>
            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 0.75rem; border-radius: 4px;">
                <div style="font-size: 0.9rem; color: #1e40af; font-weight: bold;">Resultado final: $\\theta = ${res.direccion.grados}^\\circ$</div>
            </div>
        </div>
        `,
        // PASO 4
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <span style="background: #2563eb; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.85rem;">4</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 1rem;">Pendiente de la Recta ($m$)</h4>
            </div>
            <p style="font-size: 0.85rem; color: #475569; margin: 0 0 0.75rem 0;"><strong>Sustitución en:</strong> $m = \\frac{y_2 - y_1}{x_2 - x_1}$</p>
            <div style="background: #f8fafc; padding: 0.75rem; border-radius: 6px; border: 1px solid #f1f5f9; text-align: center; margin-bottom: 0.75rem; font-size: 0.95rem;">
                $$m = \\frac{${y2F} - ${y1F}}{${x2F} - ${x1F}} = \\frac{${dy.toFixed(2)}}{${dx.toFixed(2)}} = ${mVal}$$
            </div>
            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 0.75rem; border-radius: 4px;">
                <div style="font-size: 0.9rem; color: #1e40af; font-weight: bold;">Resultado: $m = ${mVal}$</div>
            </div>
        </div>
        `,
        // PASO 5
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <span style="background: #2563eb; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.85rem;">5</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 1rem;">Forma Punto-Pendiente</h4>
            </div>
            <p style="font-size: 0.85rem; color: #475569; margin: 0 0 0.75rem 0;"><strong>Sustituyendo Punto A y m en:</strong> $y - y_1 = m(x - x_1)$</p>
            <div style="background: #f8fafc; padding: 0.75rem; border-radius: 6px; border: 1px solid #f1f5f9; text-align: center; margin-bottom: 0.75rem; font-size: 0.95rem;">
                $$y - ${y1F} = ${mVal} \\cdot (x - ${x1F})$$
            </div>
            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 0.75rem; border-radius: 4px;">
                <div style="font-size: 0.9rem; color: #1e40af; font-weight: bold;">Resultado: $${res.ecuaciones.puntoPendiente}$</div>
            </div>
        </div>
        `,
        // PASO 6
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <span style="background: #2563eb; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.85rem;">6</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 1rem;">Forma Explícita ($y = mx + b$)</h4>
            </div>
            <p style="font-size: 0.85rem; color: #475569; margin: 0 0 0.75rem 0;"><strong>Despejando la "y":</strong></p>
            <div style="background: #f8fafc; padding: 0.75rem; border-radius: 6px; border: 1px solid #f1f5f9; text-align: center; margin-bottom: 0.75rem; font-size: 0.95rem;">
                $$y = ${res.ecuaciones.explicita}$$
            </div>
            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 0.75rem; border-radius: 4px;">
                <div style="font-size: 0.9rem; color: #1e40af; font-weight: bold;">Ordenada al origen $b = ${bVal}$</div>
            </div>
        </div>
        `,
        // PASO 7
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <span style="background: #2563eb; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.85rem;">7</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 1rem;">Forma General ($Ax + By + C = 0$)</h4>
            </div>
            <p style="font-size: 0.85rem; color: #475569; margin: 0 0 0.75rem 0;"><strong>Alineación canónica e igualación a cero:</strong></p>
            <div style="background: #f8fafc; padding: 0.75rem; border-radius: 6px; border: 1px solid #f1f5f9; text-align: center; margin-bottom: 0.75rem; font-size: 0.95rem;">
                $$${res.ecuaciones.general}$$
            </div>
            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 0.75rem; border-radius: 4px;">
                <div style="font-size: 0.9rem; color: #1e40af; font-weight: bold;">Ecuación General Formalizada</div>
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
