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
// BLOQUE 3: CONSTRUCTOR DE LAS 7 TARJETAS (ULTRA COMPACTO)
// =======================================================
function renderizarTarjetasPasoAPasoBeta(res, x1, y1, x2, y2) {
    const container = document.getElementById('pasos-container');
    if (!container) return;

    // Variables de Formato y Cálculo Limpio
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

    // Análisis del Cuadrante (Paso 3)
    let analisisCuadrante = "";
    let calculoFormula = "";
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const angBase = res.direccion.anguloReferencia || "0";
    const angFinal = res.direccion.grados;

    if (dx === 0 && dy === 0) {
        analisisCuadrante = "Punto Nulo"; calculoFormula = `<li>No hay dirección definida.</li>`;
    } else if (dx > 0 && dy >= 0) {
        analisisCuadrante = "Cuadrante I (+, +)";
        calculoFormula = `<li>$\\alpha = \\arctan(${fmt(absDy)}/${fmt(absDx)}) = ${angBase}^\\circ$</li><li>Directo: $\\theta = \\alpha$</li>`;
    } else if (dx < 0 && dy >= 0) {
        analisisCuadrante = "Cuadrante II (-, +)";
        calculoFormula = `<li>$\\alpha = \\arctan(${fmt(absDy)}/${fmt(absDx)}) = ${angBase}^\\circ$</li><li>$\\theta = 180^\\circ - \\alpha = ${angFinal}^\\circ$</li>`;
    } else if (dx < 0 && dy < 0) {
        analisisCuadrante = "Cuadrante III (-, -)";
        calculoFormula = `<li>$\\alpha = \\arctan(${fmt(absDy)}/${fmt(absDx)}) = ${angBase}^\\circ$</li><li>$\\theta = 180^\\circ + \\alpha = ${angFinal}^\\circ$</li>`;
    } else if (dx > 0 && dy < 0) {
        analisisCuadrante = "Cuadrante IV (+, -)";
        calculoFormula = `<li>$\\alpha = \\arctan(${fmt(absDy)}/${fmt(absDx)}) = ${angBase}^\\circ$</li><li>$\\theta = 360^\\circ - \\alpha = ${angFinal}^\\circ$</li>`;
    } else if (dx === 0) {
        analisisCuadrante = "Sobre Eje Y"; calculoFormula = `<li>Directo por inspección: $\\theta = ${angFinal}^\\circ$</li>`;
    }

    // Inyección HTML de las 7 Tarjetas Ultra Compactas
    const tarjetasHTML = [
        // PASO 1
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

            <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 0.25rem 0.6rem; border-radius: 20px; font-size: 0.85rem; color: #1e40af; display: inline-flex; align-items: center; gap: 0.3rem;">
                    <span style="background: #3b82f6; width: 8px; height: 8px; border-radius: 50%;"></span>
                    <strong>A:</strong> $$\\textcolor{#2563eb}{${fmt(x1)}}, \\textcolor{#2563eb}{${fmt(y1)}}$$
                </div>
                <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 0.25rem 0.6rem; border-radius: 20px; font-size: 0.85rem; color: #9f1239; display: inline-flex; align-items: center; gap: 0.3rem;">
                    <span style="background: #ef4444; width: 8px; height: 8px; border-radius: 50%;"></span>
                    <strong>B:</strong> $$\\textcolor{#dc2626}{${fmt(x2)}}, \\textcolor{#dc2626}{${fmt(y2)}}$$
                </div>
            </div>

            <div style="padding: 0.5rem; display: flex; flex-direction: column; gap: 0.5rem; background: #f8fafc; border-radius: 6px; margin-bottom: 0.75rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; justify-content: center;">
                    <span style="font-size: 0.75rem; color: #475569; background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: 600;">1. Sustituir:</span>
                    <span style="font-size: 0.9rem; margin: 0;">$$ \\Delta \\vec{r} = (\\textcolor{#dc2626}{${fmt(x2)}} - \\textcolor{#2563eb}{${x1Fmt}}, \\, \\textcolor{#dc2626}{${fmt(y2)}} - \\textcolor{#2563eb}{${y1Fmt}}) $$</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; justify-content: center;">
                    <span style="font-size: 0.75rem; color: #475569; background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: 600;">2. Restar:</span>
                    <span style="font-size: 0.9rem; margin: 0;">$$ \\Delta x = ${dxFmt} \\quad \\text{y} \\quad \\Delta y = ${dyFmt} $$</span>
                </div>
            </div>

            <div style="background-color: #eff6ff; border-left: 5px solid #2563eb; color: #1e3a8a; padding: 0.75rem; border-radius: 4px; font-size: 0.9rem; font-weight: 600; text-align: center; margin-top: auto;">
                <strong>Resultado:</strong> $\\Delta \\vec{r} = (${dxFmt}, \\, ${dyFmt})$
            </div>
        </div>
        `,
        // ==============================================
        // PASO 2: MAGNITUD DEL DESPLAZAMIENTO 
        // ==============================================
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); display: flex; flex-direction: column; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 0.5rem;">
                <span style="background: #9333ea; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem;">2</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 1rem;">Magnitud ($|\\Delta \\vec{r}|$)</h4>
            </div>
            
            <div style="text-align: center; margin-bottom: 0.75rem;">
                <p style="font-size: 0.9rem; color: #475569; margin: 0;">$$|\\Delta \\vec{r}| = \\sqrt{(\\Delta x)^2 + (\\Delta y)^2}$$</p>
            </div>

            <div style="padding: 0.5rem; display: flex; flex-direction: column; gap: 0.5rem; background: #faf5ff; border-radius: 6px; margin-bottom: 0.75rem;">
                <!-- Origen de los datos -->
                <div style="width: 100%; text-align: center; margin-bottom: 0.25rem;">
                    <p style="font-size: 0.82rem; color: #6b21a8; margin: 0 0 0.25rem 0; font-style: italic;">Valores obtenidos en el Paso 1:</p>
                    <p style="margin: 0; font-size: 0.9rem; font-weight: 600; color: #581c87;">$$\\Delta x = ${dxFmt} \\quad \\text{y} \\quad \\Delta y = ${dyFmt}$$</p>
                </div>
                <hr style="border: 0; border-top: 1px dashed #d8b4fe; margin: 0.25rem 0;">

                <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; justify-content: center; margin-top: 0.25rem;">
                    <span style="font-size: 0.75rem; color: #6b21a8; background-color: #e9d5ff; padding: 2px 6px; border-radius: 4px; font-weight: 600;">1. Sustituir:</span>
                    <span style="font-size: 0.9rem; margin: 0;">$$|\\Delta \\vec{r}| = \\sqrt{(${dxFmt})^2 + (${dyFmt})^2}$$</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; justify-content: center;">
                    <span style="font-size: 0.75rem; color: #6b21a8; background-color: #e9d5ff; padding: 2px 6px; border-radius: 4px; font-weight: 600;">2. Cuadrados:</span>
                    <span style="font-size: 0.9rem; margin: 0;">$$|\\Delta \\vec{r}| = \\sqrt{${fmt(dx*dx)} + ${fmt(dy*dy)}} = \\sqrt{${fmt(dx*dx + dy*dy)}}$$</span>
                </div>
            </div>

            <div style="background-color: #faf5ff; border-left: 5px solid #9333ea; color: #581c87; padding: 0.75rem; border-radius: 4px; font-size: 0.9rem; font-weight: 600; text-align: center; margin-top: auto;">
                <strong>Resultado:</strong> $|\\Delta \\vec{r}| = ${res.magnitud} \\text{ u}$
            </div>
        </div>
        `,

        // ==============================================
        // PASO 3: DIRECCIÓN Y CUADRANTE
        // ==============================================
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); display: flex; flex-direction: column; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 0.5rem;">
                <span style="background: #059669; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem;">3</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 1rem;">Dirección ($\\theta$)</h4>
            </div>
            
            <div style="text-align: center; margin-bottom: 0.75rem;">
                <p style="font-size: 0.9rem; color: #475569; margin: 0;">$$\\theta = \\arctan\\left(\\frac{\\Delta y}{\\Delta x}\\right)$$</p>
            </div>

            <div style="padding: 0.5rem; display: flex; flex-direction: column; gap: 0.5rem; background: #ecfdf5; border-radius: 6px; margin-bottom: 0.75rem; font-size: 0.85rem;">
                <!-- Origen de los datos -->
                <div style="width: 100%; text-align: center; margin-bottom: 0.25rem;">
                    <p style="font-size: 0.82rem; color: #064e3b; margin: 0 0 0.25rem 0; font-style: italic;">Valores obtenidos en el Paso 1:</p>
                    <p style="margin: 0; font-size: 0.9rem; font-weight: 600; color: #065f46;">$$\\Delta y = ${dyFmt} \\quad \\text{y} \\quad \\Delta x = ${dxFmt}$$</p>
                </div>
                <hr style="border: 0; border-top: 1px dashed #a7f3d0; margin: 0.25rem 0;">
                
                <div style="text-align: center; margin-top: 0.25rem;">
                    <p style="margin: 0 0 0.5rem 0; color: #064e3b;"><strong>Análisis:</strong> ${analisisCuadrante}</p>
                    <ul style="margin: 0; padding-left: 1.2rem; line-height: 1.5; color: #065f46; text-align: left;">
                        ${calculoFormula}
                    </ul>
                </div>
            </div>

            <div style="background-color: #ecfdf5; border-left: 5px solid #059669; color: #064e3b; padding: 0.75rem; border-radius: 4px; font-size: 0.9rem; font-weight: 600; text-align: center; margin-top: auto;">
                <strong>Resultado:</strong> $\\theta = ${res.direccion.grados}^\\circ$
            </div>
        </div>
        `,

        // ==============================================
        // PASO 4: CÁLCULO DE LA PENDIENTE
        // ==============================================
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); display: flex; flex-direction: column; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 0.5rem;">
                <span style="background: #d97706; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem;">4</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 1rem;">Pendiente ($m$)</h4>
            </div>
            
            <div style="text-align: center; margin-bottom: 0.75rem;">
                <p style="font-size: 0.9rem; color: #475569; margin: 0;">$$m = \\frac{\\Delta y}{\\Delta x}$$</p>
            </div>

            <div style="padding: 0.5rem; display: flex; flex-direction: column; gap: 0.5rem; background: #fffbeb; border-radius: 6px; margin-bottom: 0.75rem;">
                <!-- Origen de los datos -->
                <div style="width: 100%; text-align: center; margin-bottom: 0.25rem;">
                    <p style="font-size: 0.82rem; color: #92400e; margin: 0 0 0.25rem 0; font-style: italic;">Valores obtenidos en el Paso 1:</p>
                    <p style="margin: 0; font-size: 0.9rem; font-weight: 600; color: #78350f;">$$\\Delta y = ${dyFmt} \\quad \\text{y} \\quad \\Delta x = ${dxFmt}$$</p>
                </div>
                <hr style="border: 0; border-top: 1px dashed #fde68a; margin: 0.25rem 0;">

                <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; justify-content: center; margin-top: 0.25rem;">
                    <span style="font-size: 0.75rem; color: #92400e; background-color: #fde68a; padding: 2px 6px; border-radius: 4px; font-weight: 600;">Sustituir:</span>
                    <span style="font-size: 0.9rem; margin: 0;">$$m = \\frac{${dyFmt}}{${dxFmt}}$$</span>
                </div>
            </div>

            <div style="background-color: #fffbeb; border-left: 5px solid #d97706; color: #92400e; padding: 0.75rem; border-radius: 4px; font-size: 0.9rem; font-weight: 600; text-align: center; margin-top: auto;">
                <strong>Resultado:</strong> $m = ${mVal}$
            </div>
        </div>
        `,

        // ==============================================
        // PASO 5: ECUACIÓN PUNTO-PENDIENTE
        // ==============================================
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); display: flex; flex-direction: column; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 0.5rem;">
                <span style="background: #4f46e5; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem;">5</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 1rem;">Forma Punto-Pendiente</h4>
            </div>
            
            <div style="text-align: center; margin-bottom: 0.75rem;">
                <p style="font-size: 0.9rem; color: #475569; margin: 0;">$$y - y_1 = m(x - x_1)$$</p>
            </div>

            <div style="padding: 0.5rem; display: flex; flex-direction: column; gap: 0.5rem; background: #eef2ff; border-radius: 6px; margin-bottom: 0.75rem;">
                <!-- Origen de los datos -->
                <div style="width: 100%; text-align: center; margin-bottom: 0.25rem;">
                    <p style="font-size: 0.82rem; color: #3730a3; margin: 0 0 0.25rem 0; font-style: italic;">Datos base (Punto A inicial y Pendiente del Paso 4):</p>
                    <p style="margin: 0; font-size: 0.9rem; font-weight: 600; color: #312e81;">$$A(\\textcolor{#2563eb}{${fmt(x1)}}, \\textcolor{#2563eb}{${fmt(y1)}}) \\quad \\text{y} \\quad m = ${mVal}$$</p>
                </div>
                <hr style="border: 0; border-top: 1px dashed #c7d2fe; margin: 0.25rem 0;">

                <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; justify-content: center; margin-top: 0.25rem;">
                    <span style="font-size: 0.75rem; color: #3730a3; background-color: #c7d2fe; padding: 2px 6px; border-radius: 4px; font-weight: 600;">Sustituir:</span>
                    <span style="font-size: 0.9rem; margin: 0;">$$y - \\textcolor{#2563eb}{${y1Fmt}} = ${mVal}(x - \\textcolor{#2563eb}{${x1Fmt}})$$</span>
                </div>
            </div>

            <div style="background-color: #eef2ff; border-left: 5px solid #4f46e5; color: #312e81; padding: 0.75rem; border-radius: 4px; font-size: 0.9rem; font-weight: 600; text-align: center; margin-top: auto;">
                <strong>Resultado:</strong> $${res.ecuaciones.puntoPendiente}$
            </div>
        </div>
        `,

       // ==============================================
        // PASO 6: FORMA EXPLÍCITA
        // ==============================================
        `
        <div class="card-aplicacion" style="background: #fff; padding: 1.1rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.03);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.6rem;">
                <span style="background: #2563eb; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem;">6</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 1rem;">Forma Explícita ($y = mx + b$)</h4>
            </div>
            <p class="txt-andamiaje">💡 Despejamos la $y$ para ver de forma transparente el cruce exacto en el eje vertical.</p>
            
            <div style="background: #f8fafc; padding: 0.6rem; border-radius: 6px; border: 1px solid #f1f5f9; text-align: center; margin-bottom: 0.8rem;">
                <p style="font-size: 0.82rem; color: #115e59; margin: 0 0 0.25rem 0; font-style: italic;">A partir de la ecuación del Paso 5:</p>
                <p style="margin: 0 0 0.5rem 0;">$$y - ${y1Str} = ${mVal}(x - ${x1Str})$$</p>
                
                <span style="font-size: 0.78rem; color: #64748b;">Despeje paso a paso de $y$:</span>
                <!-- AQUÍ SE ELIMINÓ EL DUPLICADO -->
                $$ ${res.ecuaciones.explicita} $$
            </div>
            
            <div class="resultado-destacado">
                <span>Ordenada al origen $b = ${bVal}$</span>
            </div>
        </div>
        `,

        // ==============================================
        // PASO 7: FORMA GENERAL
        // ==============================================
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); display: flex; flex-direction: column; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 0.5rem;">
                <span style="background: #e11d48; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem;">7</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 1rem;">Forma General</h4>
            </div>
            
            <div style="text-align: center; margin-bottom: 0.75rem;">
                <p style="font-size: 0.9rem; color: #475569; margin: 0;">$$Ax + By + C = 0$$</p>
            </div>

            <div style="padding: 0.5rem; display: flex; flex-direction: column; gap: 0.5rem; background: #fff1f2; border-radius: 6px; margin-bottom: 0.75rem;">
                <!-- Origen de los datos -->
                <div style="width: 100%; text-align: center; margin-bottom: 0.25rem;">
                    <p style="font-size: 0.82rem; color: #9f1239; margin: 0 0 0.25rem 0; font-style: italic;">A partir de la ecuación del Paso 6:</p>
                    <p style="margin: 0; font-size: 0.9rem; font-weight: 600; color: #881337;">$$y = ${res.ecuaciones.explicita}$$</p>
                </div>
                <hr style="border: 0; border-top: 1px dashed #fecdd3; margin: 0.25rem 0;">

                <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; justify-content: center; margin-top: 0.25rem;">
                    <span style="font-size: 0.75rem; color: #9f1239; background-color: #ffe4e6; padding: 2px 6px; border-radius: 4px; font-weight: 600;">Igualar a 0:</span>
                    <span style="font-size: 0.9rem; margin: 0;">$$${res.ecuaciones.general}$$</span>
                </div>
            </div>

            <div style="background-color: #fff1f2; border-left: 5px solid #e11d48; color: #881337; padding: 0.75rem; border-radius: 4px; font-size: 0.9rem; font-weight: 600; text-align: center; margin-top: auto;">
                <strong>Resultado:</strong> Ecuación Estándar
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

    // Leer estado de los checkboxes de capas
    const mostrarPuntos = document.getElementById('chk-puntos') ? document.getElementById('chk-puntos').checked : true;
    const mostrarTriangulo = document.getElementById('chk-triangulo') ? document.getElementById('chk-triangulo').checked : true;
    const mostrarMagnitud = document.getElementById('chk-magnitud') ? document.getElementById('chk-magnitud').checked : true;
    const mostrarAngulo = document.getElementById('chk-angulo') ? document.getElementById('chk-angulo').checked : true;
    const mostrarPendiente = document.getElementById('chk-pendiente') ? document.getElementById('chk-pendiente').checked : true;
    const mostrarOrdenada = document.getElementById('chk-ordenada') ? document.getElementById('chk-ordenada').checked : true;

    // Ajuste dinámico
    const rect = canvas.parentNode.getBoundingClientRect();
    canvas.width = rect.width || 600;
    canvas.height = 340;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const maxCoord = Math.max(Math.abs(x1), Math.abs(y1), Math.abs(x2), Math.abs(y2), 5) + 3;
    const scale = Math.min(width, height) / (maxCoord * 2.2);
    const cx = width / 2;
    const cy = height / 2;

    const toPx = (x) => cx + (x * scale);
    const toPy = (y) => cy - (y * scale);

    // Fondo y Cuadrícula
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

    // Ejes X e Y
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(width, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, height); ctx.stroke();

    // CAPA: Triángulo de Incrementos y Pendiente
    if (mostrarTriangulo) {
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = "#f59e0b"; // Ámbar
        ctx.lineWidth = mostrarPendiente ? 3 : 2; 
        ctx.beginPath();
        ctx.moveTo(toPx(x1), toPy(y1));
        ctx.lineTo(toPx(x2), toPy(y1)); // Horizontal Δx
        ctx.lineTo(toPx(x2), toPy(y2)); // Vertical Δy
        ctx.stroke();
        ctx.setLineDash([]);
        
        if (mostrarPendiente && !res.esVertical) {
            ctx.fillStyle = "#d97706";
            ctx.font = "bold 13px sans-serif";
            const mText = Number.isInteger(parseFloat(res.pendiente)) ? res.pendiente : parseFloat(res.pendiente).toFixed(2);
            ctx.fillText(`m = ${mText}`, toPx(x2) + (x2 > x1 ? 10 : -45), toPy(y1 + (y2-y1)/2));
        }
    }

    // LÍNEA PRINCIPAL (Siempre visible)
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (res.esVertical) {
        ctx.moveTo(toPx(x1), 0);
        ctx.lineTo(toPx(x1), height);
    } else {
        const m = parseFloat(res.pendiente);
        const b = parseFloat(res.ordenadaOrigen);
        ctx.moveTo(toPx(-maxCoord * 2), toPy(m * (-maxCoord * 2) + b));
        ctx.lineTo(toPx(maxCoord * 2), toPy(m * (maxCoord * 2) + b));
    }
    ctx.stroke();

    // CAPA: Ángulo de Inclinación
    if (mostrarAngulo && !res.esVertical && (x2 - x1) !== 0) {
        const angRad = Math.atan2(y2 - y1, x2 - x1);
        ctx.beginPath();
        ctx.strokeStyle = "#10b981"; // Verde
        ctx.lineWidth = 2;
        
        ctx.setLineDash([3, 3]);
        ctx.moveTo(toPx(x1), toPy(y1));
        ctx.lineTo(toPx(x1 + (maxCoord/3)), toPy(y1));
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.beginPath();
        const radioArco = 30;
        if(angRad > 0) { ctx.arc(toPx(x1), toPy(y1), radioArco, -angRad, 0); } 
        else { ctx.arc(toPx(x1), toPy(y1), radioArco, 0, -angRad); }
        ctx.stroke();

        ctx.fillStyle = "#047857";
        ctx.font = "bold 12px sans-serif";
        const angText = typeof res.direccion === 'object' ? res.direccion.grados : res.direccion;
        ctx.fillText(`θ = ${angText}°`, toPx(x1) + radioArco + 10, toPy(y1) - (angRad > 0 ? 15 : -15));
    }

    // CAPA: Magnitud del Vector
    if (mostrarMagnitud) {
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        ctx.beginPath();
        ctx.arc(toPx(mx), toPy(my), 14, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#9333ea"; // Morado
        ctx.stroke();
        
        ctx.fillStyle = "#7e22ce";
        ctx.font = "bold 12px sans-serif";
        ctx.fillText(`|Δr|= ${res.magnitud}`, toPx(mx) - 25, toPy(my) - 20);
    }

    // CAPA: Ordenada al Origen
    if (mostrarOrdenada && !res.esVertical && res.ordenadaOrigen !== "N/A") {
        const b = parseFloat(res.ordenadaOrigen);
        ctx.fillStyle = "#0d9488"; // Teal
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

    // CAPA: Puntos A y B
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

// =======================================================
// FUNCIONES VACÍAS PARA LOS RETOS (Para evitar errores de consola)
// =======================================================
function iniciarRetoSeguro() { console.log("Reto Seguro Iniciado"); }
function comprobarReto() { console.log("Comprobando Reto..."); }
function desglosarReto() { console.log("Desglosando Reto..."); }
function anularReto() { console.log("Reto Anulado."); }
