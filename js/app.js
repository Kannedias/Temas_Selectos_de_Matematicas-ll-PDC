// =======================================================
// CONFIGURACIÓN DE CONEXIÓN
// =======================================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyCO1FHOxVxUSi1Z6QgMjttLXZ1WrNgBLBkjUNw5Lq0wK8UkdLJu68eVXp9qyNJoioa/exec";
// =======================================================
// BLOQUE 1: CONTROL DE NAVEGACIÓN POR PESTAÑAS
// =======================================================
function cambiarPestana(idPestana) {
    const contenidos = document.querySelectorAll('.tab-content');
    contenidos.forEach(content => content.classList.remove('active'));

    const botones = document.querySelectorAll('.nav-tab');
    botones.forEach(btn => {
        btn.style.borderBottom = '2px solid transparent';
        btn.classList.remove('active');
    });

    const pestanaSeleccionada = document.getElementById('sec-' + idPestana);
    if (pestanaSeleccionada) {
        pestanaSeleccionada.classList.add('active');
    }

    const e = window.event;
    if (e && e.currentTarget) {
        e.currentTarget.classList.add('active');
        e.currentTarget.style.borderBottom = '2px solid #a7f3d0';
    } else {
        const botonActivo = document.querySelector(`button[onclick="cambiarPestana('${idPestana}')"]`);
        if(botonActivo) {
            botonActivo.style.borderBottom = '2px solid #a7f3d0';
            botonActivo.classList.add('active');
        }
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
// BLOQUE 3: CONSTRUCTOR DE LAS 7 TARJETAS (DISEÑO LIMPIO Y UNIFICADO)
// =======================================================
function renderizarTarjetasPasoAPasoBeta(res, x1, y1, x2, y2) {
    const container = document.getElementById('pasos-container');
    if (!container) return;

    // --- VARIABLES DE FORMATO GLOBALES PARA LOS 7 PASOS ---
    const fmt = (num) => Number.isInteger(Number(num)) ? Number(num).toString() : Number(num).toFixed(2);
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dxFmt = fmt(dx);
    const dyFmt = fmt(dy);
    
    const x1Fmt = x1 < 0 ? `(${fmt(x1)})` : fmt(x1);
    const y1Fmt = y1 < 0 ? `(${fmt(y1)})` : fmt(y1);
    const x2Fmt = x2 < 0 ? `(${fmt(x2)})` : fmt(x2);
    const y2Fmt = y2 < 0 ? `(${fmt(y2)})` : fmt(y2);
    
    const mVal = res.esVertical ? "\\text{Indefinida}" : fmt(res.pendiente);
    const bVal = res.esVertical ? "N/A" : fmt(res.ordenadaOrigen);

    // Colores LaTeX para los puntos
    const cA = "\\textcolor{#2563eb}";
    const cB = "\\textcolor{#dc2626}";
    const strCoordA = `${cA}{${fmt(x1)}}, ${cA}{${fmt(y1)}}`;
    const strCoordB = `${cB}{${fmt(x2)}}, ${cB}{${fmt(y2)}}`;

    // --- ANÁLISIS DE CUADRANTE Y DIRECCIÓN (PASO 3) ---
    let analisisCuadrante = "";
    let calculoFormula = "";
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const angBase = res.direccion.anguloReferencia || "0";
    const angFinal = res.direccion.grados;

    if (dx === 0 && dy === 0) {
        analisisCuadrante = "Punto Nulo"; calculoFormula = `<p style="margin: 0; font-size: 0.95rem; text-align: center;">No hay dirección definida.</p>`;
    } else if (dx > 0 && dy >= 0) {
        analisisCuadrante = "Cuadrante I (+, +)";
        calculoFormula = `<p style="margin: 0 0 0.5rem 0; font-size: 0.95rem; text-align: center;">$$\\alpha = \\arctan(${fmt(absDy)}/${fmt(absDx)}) = ${angBase}^\\circ$$</p><p style="margin: 0; font-size: 0.95rem; text-align: center;">Directo: $$\\theta = \\alpha$$</p>`;
    } else if (dx < 0 && dy >= 0) {
        analisisCuadrante = "Cuadrante II (-, +)";
        calculoFormula = `<p style="margin: 0 0 0.5rem 0; font-size: 0.95rem; text-align: center;">$$\\alpha = \\arctan(${fmt(absDy)}/${fmt(absDx)}) = ${angBase}^\\circ$$</p><p style="margin: 0; font-size: 0.95rem; text-align: center;">$$\\theta = 180^\\circ - \\alpha = ${angFinal}^\\circ$$</p>`;
    } else if (dx < 0 && dy < 0) {
        analisisCuadrante = "Cuadrante III (-, -)";
        calculoFormula = `<p style="margin: 0 0 0.5rem 0; font-size: 0.95rem; text-align: center;">$$\\alpha = \\arctan(${fmt(absDy)}/${fmt(absDx)}) = ${angBase}^\\circ$$</p><p style="margin: 0; font-size: 0.95rem; text-align: center;">$$\\theta = 180^\\circ + \\alpha = ${angFinal}^\\circ$$</p>`;
    } else if (dx > 0 && dy < 0) {
        analisisCuadrante = "Cuadrante IV (+, -)";
        calculoFormula = `<p style="margin: 0 0 0.5rem 0; font-size: 0.95rem; text-align: center;">$$\\alpha = \\arctan(${fmt(absDy)}/${fmt(absDx)}) = ${angBase}^\\circ$$</p><p style="margin: 0; font-size: 0.95rem; text-align: center;">$$\\theta = 360^\\circ - \\alpha = ${angFinal}^\\circ$$</p>`;
    } else if (dx === 0) {
        analisisCuadrante = "Sobre Eje Y"; calculoFormula = `<p style="margin: 0; font-size: 0.95rem; text-align: center;">Directo por inspección: $$\\theta = ${angFinal}^\\circ$$</p>`;
    }

    // --- INYECCIÓN HTML DE LAS 7 TARJETAS LIMPIAS ---
    const tarjetasHTML = [
        // ==============================================
        // PASO 1: VECTOR DESPLAZAMIENTO (SIN i, j)
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
            <div class="contenedor-puntos" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem; margin-bottom: 1.25rem;">
                <div class="pill-punto-a" style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 0.35rem 0.8rem; border-radius: 20px; font-size: 0.85rem; color: #1e40af; display: inline-flex; align-items: center; gap: 0.4rem; white-space: nowrap;">
                    <span class="dot-a" style="background: #3b82f6; width: 10px; height: 10px; border-radius: 50%; display: inline-block; box-shadow: 0 0 4px rgba(59,130,246,0.4);"></span>
                    <strong>Punto A ($x_1, y_1$):</strong> $$\\textcolor{#2563eb}{${x1}}, \\textcolor{#2563eb}{${y1}}$$
                </div>
                <div class="pill-punto-b" style="background: #fef2f2; border: 1px solid #fecaca; padding: 0.35rem 0.8rem; border-radius: 20px; font-size: 0.85rem; color: #9f1239; display: inline-flex; align-items: center; gap: 0.4rem; white-space: nowrap;">
                    <span class="dot-b" style="background: #ef4444; width: 10px; height: 10px; border-radius: 50%; display: inline-block; box-shadow: 0 0 4px rgba(239,68,68,0.4);"></span>
                    <strong>Punto B ($x_2, y_2$):</strong> $$\\textcolor{#dc2626}{${x2}}, \\textcolor{#dc2626}{${y2}}$$
                </div>
            </div>

            <!-- Contenedor Compacto de Operaciones -->
            <div class="math-scrollable" style="background: #f8fafc; padding: 1.25rem 1rem; border-radius: 8px; margin-bottom: 1.25rem; overflow-x: auto; white-space: nowrap; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.25rem;">
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
            <div class="resultado-azul-destacado" style="background-color: #eff6ff; border-left: 5px solid #2563eb; color: #1e3a8a; padding: 1rem 1.25rem; border-radius: 4px; font-size: 0.95rem; font-weight: 600; display: flex; align-items: center;">
                <span><strong>Resultado:</strong> $\\Delta \\vec{r} = (${dx}, \\, ${dy})$</span>
            </div>
        </div>
        `,
        // PASO 2: MAGNITUD
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                <span style="background: #9333ea; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.85rem;">2</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 1.05rem;">Magnitud ($|\\Delta \\vec{r}|$)</h4>
            </div>
            
            <div style="text-align: center; margin-bottom: 1rem;">
                <p style="font-size: 0.95rem; color: #1e293b; margin: 0 0 0.25rem 0;">$$|\\Delta \\vec{r}| = \\sqrt{(\\Delta x)^2 + (\\Delta y)^2}$$</p>
                <p style="font-size: 0.8rem; color: #64748b; margin: 0; font-style: italic;">Teorema de Pitágoras</p>
            </div>

            <div style="border-top: 1px dashed #e2e8f0; border-bottom: 1px dashed #e2e8f0; padding: 0.75rem 0; margin-bottom: 1rem; display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
                <div style="font-size: 0.85rem; background: #faf5ff; padding: 4px 12px; border-radius: 20px; color: #6b21a8; border: 1px solid #e9d5ff;">$\\Delta x = ${dxFmt}$</div>
                <div style="font-size: 0.85rem; background: #faf5ff; padding: 4px 12px; border-radius: 20px; color: #6b21a8; border: 1px solid #e9d5ff;">$\\Delta y = ${dyFmt}$</div>
            </div>

            <div class="math-scrollable" style="background: transparent; padding: 0; margin-bottom: 1.25rem; border: none;">
                <p style="font-size: 0.85rem; color: #475569; margin: 0 0 0.5rem 0; text-align: left;"><strong>1. Sustituir valores:</strong></p>
                <p style="margin: 0 0 1rem 0; font-size: 0.95rem; text-align: center;">$$|\\Delta \\vec{r}| = \\sqrt{(${dxFmt})^2 + (${dyFmt})^2}$$</p>
                
                <p style="font-size: 0.85rem; color: #475569; margin: 0 0 0.5rem 0; text-align: left;"><strong>2. Resolver:</strong></p>
                <p style="margin: 0; font-size: 0.95rem; text-align: center;">$$|\\Delta \\vec{r}| = \\sqrt{${fmt(dx * dx)} + ${fmt(dy * dy)}} = \\sqrt{${fmt(dx * dx + dy * dy)}}$$</p>
            </div>

            <div style="background: #faf5ff; border-left: 4px solid #9333ea; color: #581c87; padding: 0.75rem; border-radius: 4px; font-size: 0.9rem; text-align: center;">
                <span><strong>Resultado:</strong> $|\\Delta \\vec{r}| = ${res.magnitud} \\text{ u}$</span>
            </div>
        </div>
        `,

        // PASO 3: DIRECCIÓN
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                <span style="background: #059669; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.85rem;">3</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 1.05rem;">Dirección ($\\theta$)</h4>
            </div>
            
            <div style="text-align: center; margin-bottom: 1rem;">
                <p style="font-size: 0.95rem; color: #1e293b; margin: 0;">$$\\theta = \\arctan\\left(\\frac{\\Delta y}{\\Delta x}\\right)$$</p>
            </div>

            <div style="border-top: 1px dashed #e2e8f0; border-bottom: 1px dashed #e2e8f0; padding: 0.75rem 0; margin-bottom: 1rem; display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
                <div style="font-size: 0.85rem; background: #ecfdf5; padding: 4px 12px; border-radius: 20px; color: #065f46; border: 1px solid #a7f3d0;">$\\Delta y = ${dyFmt}$</div>
                <div style="font-size: 0.85rem; background: #ecfdf5; padding: 4px 12px; border-radius: 20px; color: #065f46; border: 1px solid #a7f3d0;">$\\Delta x = ${dxFmt}$</div>
            </div>

            <div class="math-scrollable" style="background: transparent; padding: 0; margin-bottom: 1.25rem; border: none;">
                <p style="font-size: 0.85rem; color: #475569; margin: 0 0 0.5rem 0; text-align: left;"><strong>Análisis: ${analisisCuadrante}</strong></p>
                ${calculoFormula}
            </div>

            <div style="background: #ecfdf5; border-left: 4px solid #059669; color: #064e3b; padding: 0.75rem; border-radius: 4px; font-size: 0.9rem; text-align: center;">
                <span><strong>Resultado:</strong> $\\theta = ${res.direccion.grados}^\\circ$</span>
            </div>
        </div>
        `,

        // PASO 4: PENDIENTE
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                <span style="background: #d97706; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.85rem;">4</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 1.05rem;">Pendiente ($m$)</h4>
            </div>
            
            <div style="text-align: center; margin-bottom: 1rem;">
                <p style="font-size: 0.95rem; color: #1e293b; margin: 0;">$$m = \\frac{\\Delta y}{\\Delta x}$$</p>
            </div>

            <div style="border-top: 1px dashed #e2e8f0; border-bottom: 1px dashed #e2e8f0; padding: 0.75rem 0; margin-bottom: 1rem; display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
                <div style="font-size: 0.85rem; background: #fffbeb; padding: 4px 12px; border-radius: 20px; color: #92400e; border: 1px solid #fde68a;">$\\Delta y = ${dyFmt}$</div>
                <div style="font-size: 0.85rem; background: #fffbeb; padding: 4px 12px; border-radius: 20px; color: #92400e; border: 1px solid #fde68a;">$\\Delta x = ${dxFmt}$</div>
            </div>

            <div class="math-scrollable" style="background: transparent; padding: 0; margin-bottom: 1.25rem; border: none;">
                <p style="font-size: 0.85rem; color: #475569; margin: 0 0 0.5rem 0; text-align: left;"><strong>1. Sustituir:</strong></p>
                <p style="margin: 0; font-size: 0.95rem; text-align: center;">$$m = \\frac{${dyFmt}}{${dxFmt}}$$</p>
            </div>

            <div style="background: #fffbeb; border-left: 4px solid #d97706; color: #92400e; padding: 0.75rem; border-radius: 4px; font-size: 0.9rem; text-align: center;">
                <span><strong>Resultado:</strong> $m = ${mVal}$</span>
            </div>
        </div>
        `,

        // PASO 5: PUNTO-PENDIENTE
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                <span style="background: #4f46e5; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.85rem;">5</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 1.05rem;">Forma Punto-Pendiente</h4>
            </div>
            
            <div style="text-align: center; margin-bottom: 1rem;">
                <p style="font-size: 0.95rem; color: #1e293b; margin: 0;">$$y - y_1 = m(x - x_1)$$</p>
            </div>

            <div style="border-top: 1px dashed #e2e8f0; border-bottom: 1px dashed #e2e8f0; padding: 0.75rem 0; margin-bottom: 1rem; display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
                <div style="font-size: 0.85rem; background: #eef2ff; padding: 4px 12px; border-radius: 20px; color: #3730a3; border: 1px solid #c7d2fe;"><strong>Punto A:</strong> $$${strCoordA}$$</div>
                <div style="font-size: 0.85rem; background: #eef2ff; padding: 4px 12px; border-radius: 20px; color: #3730a3; border: 1px solid #c7d2fe;">$m = ${mVal}$</div>
            </div>

            <div class="math-scrollable" style="background: transparent; padding: 0; margin-bottom: 1.25rem; border: none;">
                <p style="font-size: 0.85rem; color: #475569; margin: 0 0 0.5rem 0; text-align: left;"><strong>1. Sustituir:</strong></p>
                <p style="margin: 0; font-size: 0.95rem; text-align: center;">$$y - ${cA}{${y1Fmt}} = ${mVal}(x - ${cA}{${x1Fmt}})$$</p>
            </div>

            <div style="background: #eef2ff; border-left: 4px solid #4f46e5; color: #312e81; padding: 0.75rem; border-radius: 4px; font-size: 0.9rem; text-align: center;">
                <span><strong>Resultado:</strong> $${res.ecuaciones.puntoPendiente}$</span>
            </div>
        </div>
        `,

        // PASO 6: FORMA EXPLÍCITA
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                <span style="background: #0d9488; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.85rem;">6</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 1.05rem;">Forma Explícita ($y = mx + b$)</h4>
            </div>
            
            <div style="text-align: center; margin-bottom: 1rem;">
                <p style="font-size: 0.8rem; color: #64748b; margin: 0;">💡 Despejamos la $y$ para obtener la ordenada al origen.</p>
            </div>

            <div style="border-top: 1px dashed #e2e8f0; border-bottom: 1px dashed #e2e8f0; padding: 0.75rem 0; margin-bottom: 1rem; text-align: center;">
                <p style="font-size: 0.85rem; color: #0f766e; margin: 0 0 0.5rem 0; font-style: italic;">A partir de la ecuación del Paso 5:</p>
                <p style="margin: 0; font-size: 0.95rem; color: #115e59;">$$y - ${y1Fmt} = ${mVal}(x - ${x1Fmt})$$</p>
            </div>

            <div class="math-scrollable" style="background: transparent; padding: 0; margin-bottom: 1.25rem; border: none;">
                <p style="font-size: 0.85rem; color: #475569; margin: 0 0 0.5rem 0; text-align: left;"><strong>1. Despeje de $y$:</strong></p>
                <p style="margin: 0; font-size: 0.95rem; text-align: center;">$$ ${res.ecuaciones.explicita} $$</p>
            </div>

            <div style="background: #f0fdfa; border-left: 4px solid #0d9488; color: #0f766e; padding: 0.75rem; border-radius: 4px; font-size: 0.9rem; text-align: center;">
                <span><strong>Resultado:</strong> Ordenada $b = ${bVal}$</span>
            </div>
        </div>
        `,

        // PASO 7: FORMA GENERAL
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                <span style="background: #e11d48; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.85rem;">7</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 1.05rem;">Forma General</h4>
            </div>
            
            <div style="text-align: center; margin-bottom: 1rem;">
                <p style="font-size: 0.95rem; color: #1e293b; margin: 0;">$$Ax + By + C = 0$$</p>
            </div>

            <div style="border-top: 1px dashed #e2e8f0; border-bottom: 1px dashed #e2e8f0; padding: 0.75rem 0; margin-bottom: 1rem; text-align: center;">
                <p style="font-size: 0.85rem; color: #9f1239; margin: 0 0 0.5rem 0; font-style: italic;">A partir de la ecuación del Paso 6:</p>
                <p style="margin: 0; font-size: 0.95rem; color: #881337;">$$${res.ecuaciones.explicita}$$</p>
            </div>

            <div class="math-scrollable" style="background: transparent; padding: 0; margin-bottom: 1.25rem; border: none;">
                <p style="font-size: 0.85rem; color: #475569; margin: 0 0 0.5rem 0; text-align: left;"><strong>1. Igualar a 0:</strong></p>
                <p style="margin: 0; font-size: 0.95rem; text-align: center;">$$${res.ecuaciones.general}$$</p>
            </div>

            <div style="background: #fff1f2; border-left: 4px solid #e11d48; color: #9f1239; padding: 0.75rem; border-radius: 4px; font-size: 0.9rem; text-align: center;">
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
// BLOQUE 4: DIBUJO DEL PLANO CARTESIANO (ANIMADO Y RESPONSIVO)
// ==============================================
let animacionPlano = null; 

function dibujarPlanoCartesianoLimpio(x1, y1, x2, y2, res) {
    const canvas = document.getElementById('planoCartesianoCanvas');
    if (!canvas) return;

    if (animacionPlano) {
        cancelAnimationFrame(animacionPlano);
        animacionPlano = null;
    }

    const rect = canvas.parentNode.getBoundingClientRect();
    canvas.width = rect.width || 600;
    canvas.height = rect.height || 350; 

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const maxCoord = Math.max(Math.abs(x1), Math.abs(y1), Math.abs(x2), Math.abs(y2), 5) + 3;
    const scale = Math.min(width, height) / (maxCoord * 2.2);
    const cx = width / 2;
    const cy = height / 2;

    const toPx = (x) => cx + (x * scale);
    const toPy = (y) => cy - (y * scale);

    let startTimestamp = null;
    const duracionAnim = 800; 

    function renderizarFrame(timestamp) {
        if (!startTimestamp) startTimestamp = timestamp;
        let progresoBruto = Math.min((timestamp - startTimestamp) / duracionAnim, 1);
        let p = 1 - Math.pow(1 - progresoBruto, 3); // Ease-out

        const chkPuntos = document.getElementById('chk-puntos');
        const chkTriangulo = document.getElementById('chk-triangulo');
        const chkMagnitud = document.getElementById('chk-magnitud');
        const chkAngulo = document.getElementById('chk-angulo');
        const chkPendiente = document.getElementById('chk-pendiente');
        const chkOrdenada = document.getElementById('chk-ordenada');

        const mostrarPuntos = chkPuntos ? chkPuntos.checked : true;
        const mostrarTriangulo = chkTriangulo ? chkTriangulo.checked : true;
        const mostrarMagnitud = chkMagnitud ? chkMagnitud.checked : true;
        const mostrarAngulo = chkAngulo ? chkAngulo.checked : true;
        const mostrarPendiente = chkPendiente ? chkPendiente.checked : true;
        const mostrarOrdenada = chkOrdenada ? chkOrdenada.checked : true;

        ctx.globalAlpha = 1;
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

        ctx.strokeStyle = "#2563eb";
        ctx.lineWidth = 3;
        ctx.beginPath();
        if (res.esVertical) {
            const hAnimada = height * p;
            ctx.moveTo(toPx(x1), (height - hAnimada) / 2);
            ctx.lineTo(toPx(x1), (height + hAnimada) / 2);
        } else {
            const m = parseFloat(res.pendiente);
            const b = parseFloat(res.ordenadaOrigen);
            const maxPxExtremo = (width / 2) / scale + 5; 
            const xMin = -maxPxExtremo;
            const xMax = maxPxExtremo;
            const xActual = xMin + (xMax - xMin) * p; 
            
            ctx.moveTo(toPx(xMin), toPy(m * xMin + b));
            ctx.lineTo(toPx(xActual), toPy(m * xActual + b));
        }
        ctx.stroke();

        ctx.globalAlpha = p; 

        if (mostrarTriangulo) {
            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = "#f59e0b"; 
            ctx.lineWidth = mostrarPendiente ? 3 : 2; 
            ctx.beginPath();
            ctx.moveTo(toPx(x1), toPy(y1));
            ctx.lineTo(toPx(x1 + (x2 - x1) * p), toPy(y1)); 
            ctx.lineTo(toPx(x2), toPy(y1 + (y2 - y1) * p)); 
            ctx.stroke();
            ctx.setLineDash([]);
            
            if (mostrarPendiente && !res.esVertical) {
                ctx.fillStyle = "#d97706";
                ctx.font = "bold 13px sans-serif";
                const mText = Number.isInteger(parseFloat(res.pendiente)) ? res.pendiente : parseFloat(res.pendiente).toFixed(2);
                ctx.fillText(`m = ${mText}`, toPx(x2) + (x2 > x1 ? 10 : -45), toPy(y1 + (y2-y1)/2));
            }
        }

        if (mostrarAngulo && !res.esVertical && (x2 - x1) !== 0) {
            const angRad = Math.atan2(y2 - y1, x2 - x1);
            ctx.beginPath();
            ctx.strokeStyle = "#10b981"; 
            ctx.lineWidth = 2;
            ctx.setLineDash([3, 3]);
            ctx.moveTo(toPx(x1), toPy(y1));
            ctx.lineTo(toPx(x1 + (maxCoord/3)), toPy(y1));
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.beginPath();
            const radioArco = 30;
            if(angRad > 0) { ctx.arc(toPx(x1), toPy(y1), radioArco, -angRad * p, 0); } 
            else { ctx.arc(toPx(x1), toPy(y1), radioArco, 0, -angRad * p); }
            ctx.stroke();

            ctx.fillStyle = "#047857";
            ctx.font = "bold 12px sans-serif";
            const angText = typeof res.direccion === 'object' ? res.direccion.grados : res.direccion;
            ctx.fillText(`θ = ${angText}°`, toPx(x1) + radioArco + 10, toPy(y1) - (angRad > 0 ? 15 : -15));
        }

        if (mostrarMagnitud) {
            const mx = (x1 + x2) / 2;
            const my = (y1 + y2) / 2;
            ctx.beginPath();
            ctx.arc(toPx(mx), toPy(my), 14, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#9333ea"; 
            ctx.stroke();
            ctx.fillStyle = "#7e22ce";
            ctx.font = "bold 12px sans-serif";
            ctx.fillText(`|Δr|= ${res.magnitud}`, toPx(mx) - 25, toPy(my) - 20);
        }

        if (mostrarOrdenada && !res.esVertical && res.ordenadaOrigen !== "N/A") {
            const b = parseFloat(res.ordenadaOrigen);
            ctx.fillStyle = "#0d9488"; 
            ctx.beginPath();
            ctx.arc(toPx(0), toPy(b), 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#ffffff";
            ctx.stroke();
            ctx.fillStyle = "#0f766e";
            ctx.font = "bold 12px sans-serif";
            ctx.fillText(`b(0, ${b})`, toPx(0) + 10, toPy(b) - 8);
        }

        if (mostrarPuntos) {
            ctx.fillStyle = "#2563eb";
            ctx.beginPath(); ctx.arc(toPx(x1), toPy(y1), 6, 0, Math.PI * 2); ctx.fill();
            ctx.lineWidth = 2; ctx.strokeStyle = "#ffffff"; ctx.stroke();

            ctx.fillStyle = "#dc2626";
            ctx.beginPath(); ctx.arc(toPx(x2), toPy(y2), 6, 0, Math.PI * 2); ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#0f172a";
            ctx.font = "bold 12px sans-serif";
            const offsetAx = x1 < x2 ? -45 : 12;
            const offsetBx = x2 < x1 ? -45 : 12;
            ctx.fillText(`A(${x1}, ${y1})`, toPx(x1) + offsetAx, toPy(y1) - 10);
            ctx.fillText(`B(${x2}, ${y2})`, toPx(x2) + offsetBx, toPy(y2) - 10);
        }

        if (progresoBruto < 1) {
            animacionPlano = requestAnimationFrame(renderizarFrame);
        } else {
            ctx.globalAlpha = 1;
            animacionPlano = null; 
        }
    }
    
    animacionPlano = requestAnimationFrame(renderizarFrame);
}

// =======================================================
// BLOQUE 5: MÓDULO DE RETOS Y EXAMEN (MODO SEGURO)
// =======================================================

// Variables globales para la memoria del examen
let retoActivo = null;
let solucionReto = null;
let intentosReto = 0; 
let inicioTiempoReto = null;

function iniciarRetoSeguro() {
    const nivel = document.getElementById('nivel-reto').value;
    
    // Obtenemos la matrícula (asumiendo que está en sessionStorage o usamos un default para pruebas)
    const matricula = sessionStorage.getItem('matriculaActiva') || "TEST-000";
    
    // 1. Candado Anti-Trampas: Bloqueamos las pestañas superiores
    const botonesNav = document.querySelectorAll('.nav-tab');
    botonesNav.forEach(btn => {
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.5';
    });
    
    // 2. Transición de UI (Ocultar config, mostrar examen)
    document.getElementById('panel-configuracion-reto').style.display = 'none';
    const zonaActiva = document.getElementById('zona-activa-reto');
    zonaActiva.style.display = 'block';
    
    // 3. Generar el Problema y registrar tiempo
    intentosReto++;
    const semilla = `${matricula}_Intento_${intentosReto}`;
    
    retoActivo = GeneratorEngine.generarReto(nivel, semilla);
    solucionReto = retoActivo.solucion;
    inicioTiempoReto = Date.now();
    
    // 4. Inyectar datos a la pantalla
    document.getElementById('titulo-nivel').innerText = `Nivel ${nivel} - Intento #${intentosReto}`;
    document.getElementById('planteamiento-problema').innerHTML = retoActivo.planteamientoHTML;
    
    // 5. Limpiar campos anteriores y ocultar feedback
    limpiarCamposReto();
    document.getElementById('feedback-reto-msg').innerHTML = "";
    document.getElementById('desglose-reto-container').innerHTML = "";
}

function limpiarCamposReto() {
    const campos = ['ans-vector', 'ans-magnitud', 'ans-direccion', 'ans-pendiente', 'ans-pp', 'ans-exp', 'ans-gen'];
    campos.forEach(id => {
        const el = document.getElementById(id);
        if(el) { el.value = ""; el.style.borderColor = "#cbd5e1"; }
    });
}

window.comprobarRespuesta = function(btnTarget) {
    if (!solucionReto || !inicioTiempoReto) { 
        alert("⚠️ El reto no ha sido iniciado. Haz clic en 'Iniciar Reto Seguro'."); 
        return; 
    }

    // 1. Calcular tiempo exacto transcurrido
    const tiempoSegundos = Math.floor((Date.now() - inicioTiempoReto) / 1000);
    const min = String(Math.floor(tiempoSegundos / 60)).padStart(2, '0');
    const seg = String(tiempoSegundos % 60).padStart(2, '0');
    const tiempoFormateado = `${min}:${seg}`;

    // 2. Motor de Tolerancia Matemática (+/- 0.05)
    let correctas = 0;
    let totalEvaluar = 4;
    const esCorrecto = (ingresado, real) => {
        if (!ingresado || isNaN(parseFloat(ingresado))) return false;
        return Math.abs(parseFloat(ingresado) - parseFloat(real)) <= 0.05;
    };

    // --- EVALUACIÓN DE LAS 4 CAJAS ---
    // A) Magnitud
    const inMag = document.getElementById('ans-magnitud');
    if (esCorrecto(inMag.value, solucionReto.magnitud)) { 
        inMag.style.borderColor = "#16a34a"; inMag.style.backgroundColor = "#dcfce7"; correctas++; 
    } else { inMag.style.borderColor = "#dc2626"; inMag.style.backgroundColor = "#fee2e2"; }

    // B) Dirección
    const inDir = document.getElementById('ans-direccion');
    if (esCorrecto(inDir.value, solucionReto.direccion.grados)) { 
        inDir.style.borderColor = "#16a34a"; inDir.style.backgroundColor = "#dcfce7"; correctas++; 
    } else { inDir.style.borderColor = "#dc2626"; inDir.style.backgroundColor = "#fee2e2"; }

    // C) Pendiente
    const inPen = document.getElementById('ans-pendiente');
    if (esCorrecto(inPen.value, solucionReto.pendiente)) { 
        inPen.style.borderColor = "#16a34a"; inPen.style.backgroundColor = "#dcfce7"; correctas++; 
    } else { inPen.style.borderColor = "#dc2626"; inPen.style.backgroundColor = "#fee2e2"; }
    
    // D) Vector Desplazamiento
    const inVec = document.getElementById('ans-vector');
    const vecLimpio = inVec.value.replace(/[()]/g, ''); 
    const vecPartes = vecLimpio.split(',').map(v => v.trim());
    const dxReal = retoActivo.puntos.x2 - retoActivo.puntos.x1;
    const dyReal = retoActivo.puntos.y2 - retoActivo.puntos.y1;
    
    if (vecPartes.length === 2 && esCorrecto(vecPartes[0], dxReal) && esCorrecto(vecPartes[1], dyReal)) {
        inVec.style.borderColor = "#16a34a"; inVec.style.backgroundColor = "#dcfce7"; correctas++;
    } else {
        inVec.style.borderColor = "#dc2626"; inVec.style.backgroundColor = "#fee2e2";
    }

    const feedbackMsg = document.getElementById('feedback-reto-msg');

    // 3. SI TODO ES CORRECTO -> BLOQUEAR, MOSTRAR DESGLOSE Y GUARDAR
    if (correctas === totalEvaluar) {
        // Bloquear casillas
        const inputs = document.querySelectorAll('.grid-respuestas input');
        inputs.forEach(input => { input.disabled = true; });

        // Apagar Escudo Anti-trampas para que puedan estudiar
        retoActivo = null; 

        // DETONAR EL DESGLOSE PASO A PASO AUTOMÁTICAMENTE
        if (typeof desglosarReto === 'function') {
            desglosarReto();
            const btnProceso = document.getElementById('btn-ver-proceso');
            if (btnProceso) {
                btnProceso.disabled = false;
                btnProceso.style.background = "#d97706";
                btnProceso.style.cursor = "pointer";
            }
        }

        // Obtener datos del alumno
        const nivel = document.getElementById('nivel-reto')?.value || "1";
        const matricula = sessionStorage.getItem('matriculaActiva') || sessionStorage.getItem('matriculaActiva') || "TEST-000";
        const nombre = sessionStorage.getItem('nombreActivo') || sessionStorage.getItem('nombreActivo') || "Alumno Prueba";
        const grupo = sessionStorage.getItem('grupoActivo') || sessionStorage.getItem('grupoActivo') || "000";
        
        // Estado de carga del botón
        const textoOriginal = btnTarget.innerText;
        btnTarget.innerText = "⏳ Guardando récord..."; 
        btnTarget.disabled = true;

        // Enviar a Google Sheets
        fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ 
                accion: "registrar_reto", 
                matricula: matricula, 
                nombre: nombre, 
                grupo: grupo, 
                nivel: nivel, 
                tiempo: tiempoFormateado,
                intentos: intentosReto 
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === "éxito") {
                feedbackMsg.innerHTML = `<span style="color: #166534;">🎉 ¡Reto Guardado Oficialmente! <br> ⏱️ Tiempo: ${tiempoFormateado} | 🔄 Intento #${intentosReto}</span>`;
            } else { 
                alert(`⚠️ Respuesta correcta, pero error al guardar: ${data.mensaje}`); 
            }
        })
        .catch(err => {
            console.error("Error Fetch:", err);
            alert("⚠️ Falló la conexión al guardar el tiempo en Sheets.");
        })
        .finally(() => { 
            btnTarget.innerText = textoOriginal; 
            btnTarget.disabled = false;
            inicioTiempoReto = null; 
        });

    } else {
        feedbackMsg.innerHTML = `<span style="color: #dc2626;">⚠️ Tienes ${correctas} de ${totalEvaluar} correctas. Revisa las casillas marcadas en rojo.</span>`;
    }
};

function desglosarReto() {
    if (!retoActivo) return;
    
    // Reutilizamos la función maestra del laboratorio para mostrar el paso a paso
    // Necesitamos inyectarlo en el contenedor del reto, no en el laboratorio
    const contenedorOriginal = document.getElementById('pasos-container');
    const contenedorReto = document.getElementById('desglose-reto-container');
    
    // Cambiamos temporalmente el ID de destino en la función original (Truco ninja)
    contenedorOriginal.id = "pasos-container-oculto";
    contenedorReto.id = "pasos-container";
    
    // Llamamos a la función con los puntos del reto activo
    renderizarTarjetasPasoAPasoBeta(retoActivo.solucion, retoActivo.puntos.x1, retoActivo.puntos.y1, retoActivo.puntos.x2, retoActivo.puntos.y2);
    
    // Devolvemos los IDs a la normalidad
    contenedorReto.id = "desglose-reto-container";
    contenedorOriginal.id = "pasos-container";
}

function anularReto() {
    // 1. Desbloquear las pestañas superiores
    const botonesNav = document.querySelectorAll('.nav-tab');
    botonesNav.forEach(btn => {
        btn.style.pointerEvents = 'auto';
        btn.style.opacity = '1';
    });
    
    // 2. Restaurar UI
    document.getElementById('zona-activa-reto').style.display = 'none';
    document.getElementById('panel-configuracion-reto').style.display = 'block';
    
    // 3. Limpiar memoria
    retoActivo = null;
    solucionReto = null;
}

// =======================================================
// BLOQUE 6: BLINDAJE ANTI-TRAMPAS (MODO SEGURO EXAMEN)
// =======================================================

// 1. Detectar cuando salen de la pestaña (PC/Mac/Navegadores)
document.addEventListener("visibilitychange", () => {
    // retoActivo no es null cuando hay un examen corriendo
    if (retoActivo && document.hidden) {
        alert("🚨 TRAMPA DETECTADA: Has abandonado la pestaña de evaluación. El reto será anulado.");
        anularReto();
    }
});

// 2. Detectar cuando minimizan el navegador o cambian de App (Celulares y PC)
window.addEventListener("blur", () => {
    if (retoActivo) {
        alert("🚨 TRAMPA DETECTADA: Has minimizado la pantalla o salido de la ventana. El reto será anulado.");
        anularReto();
    }
});

// 3. Bloquear Clic Derecho en toda la página si hay un reto activo
document.addEventListener('contextmenu', event => {
    if (retoActivo) {
        event.preventDefault();
    }
});

// 4. Bloquear atajos de copiado (Ctrl+C / Copiar en celular)
document.addEventListener('copy', event => {
    if (retoActivo) {
        event.preventDefault();
        alert("⚠️ El copiado de texto está deshabilitado en Modo Examen.");
    }
});
// =======================================================
// INICIALIZACIÓN
// =======================================================
document.addEventListener("DOMContentLoaded", function() {
    
    // 🛡️ CADENERO DE SESIÓN (ACTUALIZADO A MEMORIA FIJA)
    const matriculaGuardada = sessionStorage.getItem('matriculaActiva');
    
    // Si estamos en la página del laboratorio/retos y no hay matrícula...
    if (!matriculaGuardada && window.location.pathname.includes("unidad1_recta.html")) {
        alert("⚠️ No se detectó una sesión activa. Serás redirigido al portal principal para ingresar tu matrícula.");
        window.location.href = "index.html"; 
        return; // Detiene la carga de la página
    }

    // ... (El resto de tu código de KaTeX y Laboratorio sigue normal hacia abajo)

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
