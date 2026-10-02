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

    // Colores institucionales de KaTeX
    const cA = "\\textcolor{#2563eb}"; // Azul
    const cB = "\\textcolor{#dc2626}"; // Rojo

    // Formateador sin ceros redundantes (ej: 6.00 a 6)
    const fmt = (num) => Number(num).toString();

    // Formateo para las cajas superiores: Reducimos el espacio después de la coma
    const strCoordA = `${cA}{${fmt(x1)}},${cA}{${fmt(y1)}}`;
    const strCoordB = `${cB}{${fmt(x2)}},${cB}{${fmt(y2)}}`;

    // Formateo seguro para la sustitución con colores
    const x1Fmt = x1 < 0 ? `(${cA}{${fmt(x1)}})` : `${cA}{${fmt(x1)}}`;
    const y1Fmt = y1 < 0 ? `(${cA}{${fmt(y1)}})` : `${cA}{${fmt(y1)}}`;
    const x2Fmt = x2 < 0 ? `(${cB}{${fmt(x2)}})` : `${cB}{${fmt(x2)}}`;
    const y2Fmt = y2 < 0 ? `(${cB}{${fmt(y2)}})` : `${cB}{${fmt(y2)}}`;
    const dxFmt = fmt(dx);
    const dyFmt = fmt(dy);

    // --- INYECCIÓN HTML DE LAS TARJETAS ---
    const tarjetasHTML = [
// ==============================================
        // PASO 1: VECTOR DESPLAZAMIENTO 
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
                <p style="font-size: 0.95rem; color: #1e293b; margin: 0;">$$\\Delta \\vec{r} = (${cB}{x_2} - ${cA}{x_1}, \\, ${cB}{y_2} - ${cA}{y_1})$$</p>
            </div>

            <!-- Cajas Responsivas (Píldoras) -->
            <div class="contenedor-puntos">
                <div class="pill-punto-a">
                    <span class="dot-a"></span>
                    <strong>Punto A ($x_1, y_1$):</strong> $$${strCoordA}$$
                </div>
                <div class="pill-punto-b">
                    <span class="dot-b"></span>
                    <strong>Punto B ($x_2, y_2$):</strong> $$${strCoordB}$$
                </div>
            </div>

            <!-- Contenedor Compacto de Operaciones -->
            <div class="math-scrollable" style="text-align: center; padding: 0.75rem; display: flex; flex-direction: column; align-items: center; gap: 0.25rem;">
                <div style="width: 100%; max-width: 320px; text-align: left;">
                    <p style="font-size: 0.82rem; color: #475569; margin: 0 0 0.5rem 0;"><strong>1. Sustitución de valores:</strong> Reemplazamos las coordenadas respetando los signos.</p>
                </div>
                <p style="margin: 0 0 0.75rem 0; font-size: 0.95rem;">$$ \\Delta \\vec{r} = (${x2Fmt} - ${x1Fmt}, \\, ${y2Fmt} - ${y1Fmt}) $$</p>
                
                <div style="width: 100%; max-width: 320px; text-align: left;">
                    <p style="font-size: 0.82rem; color: #475569; margin: 0 0 0.5rem 0;"><strong>2. Cálculo de incrementos:</strong> Obtenemos la distancia recorrida en cada eje.</p>
                </div>
                <p style="margin: 0 0 0.25rem 0; font-size: 0.95rem;">$$ \\Delta x = ${x2Fmt} - ${x1Fmt} = ${dxFmt} $$</p>
                <p style="margin: 0; font-size: 0.95rem;">$$ \\Delta y = ${y2Fmt} - ${y1Fmt} = ${dyFmt} $$</p>
            </div>

            <!-- Resultado Destacado con Nuevo Color -->
            <div class="resultado-exito-destacado">
                <span><strong>Resultado:</strong> $\\Delta \\vec{r} = (${dxFmt}, \\, ${dyFmt})$</span>
            </div>
        </div>
        `,
        // ==============================================
        // PASO 2: MAGNITUD DEL DESPLAZAMIENTO 
        // ==============================================
        `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                <span style="background: #2563eb; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.85rem;">2</span>
                <h4 style="margin: 0; color: #1e293b; font-size: 1.05rem;">Magnitud del Desplazamiento ($|\\Delta \\vec{r}|$)</h4>
            </div>
            
            <div style="text-align: center; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 2px solid #e2e8f0;">
                <p style="font-size: 0.95rem; color: #1e293b; margin: 0 0 0.4rem 0;">$$|\\Delta \\vec{r}| = \\sqrt{(\\Delta x)^2 + (\\Delta y)^2}$$</p>
                <p style="font-size: 0.85rem; color: #64748b; margin: 0; font-style: italic;">Aplicando Teorema de Pitágoras</p>
            </div>

            <!-- Texto explicativo -->
            <div style="text-align: center; margin-bottom: 1rem;">
                <p style="font-size: 0.85rem; color: #475569; margin: 0;">Se sustituyen los valores obtenidos:</p>
            </div>

            <!-- Cajas Responsivas de Delta X y Delta Y (Píldoras) -->
            <div class="contenedor-puntos" style="gap: 1.5rem;">
                <div class="pill-delta">
                    <span class="dot-dx"></span>
                    <span>$\\Delta x = ${dxFmt}$</span>
                </div>
                <div class="pill-delta">
                    <span class="dot-dy"></span>
                    <span>$\\Delta y = ${dyFmt}$</span>
                </div>
            </div>

            <!-- Contenedor Compacto de Operaciones -->
            <div class="math-scrollable" style="text-align: center; padding: 0.75rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
                <p style="margin: 0 0 0.5rem 0; font-size: 0.95rem;">$$|\\Delta \\vec{r}| = \\sqrt{(${dxFmt})^2 + (${dyFmt})^2}$$</p>
                <p style="margin: 0; font-size: 0.95rem;">$$|\\Delta \\vec{r}| = \\sqrt{${fmt(dx * dx)} + ${fmt(dy * dy)}} = \\sqrt{${fmt(dx * dx + dy * dy)}}$$</p>
            </div>

            <!-- Resultado Destacado con Nuevo Color -->
            <div class="resultado-exito-destacado">
                <span><strong>Resultado:</strong> $|\\Delta \\vec{r}| = ${res.magnitud} \\text{ unidades}$</span>
            </div>
        </div>
        `,
        // ==============================================
        // PASO 3: DIRECCIÓN DEL VECTOR (DINÁMICO Y BLINDADO)
        // ==============================================
        (function() {
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);
            const valFraccion = absDx === 0 ? 0 : (absDy / absDx);
            const strFraccion = Number.isInteger(valFraccion) ? valFraccion.toString() : valFraccion.toFixed(3);
            const anguloBase = (Math.atan2(absDy, absDx) * (180 / Math.PI)).toFixed(2);
            const anguloFinal = (res && res.direccion) ? res.direccion.grados : anguloBase;
            
            let analisisCuadrante = "";
            let calculoFormula = "";
            
            if (dx === 0 && dy === 0) {
                analisisCuadrante = "El vector es nulo, no tiene dirección definida.";
                calculoFormula = `<p style="margin: 0; font-size: 0.95rem;">$$\\theta = 0^\\circ$$</p>`;
            } else if (dx > 0 && dy >= 0) {
                analisisCuadrante = `Como ambas componentes son positivas ($\\Delta x > 0$ y $\\Delta y \\geq 0$), el vector se encuentra ubicado en el <strong>primer cuadrante</strong>.`;
                calculoFormula = `
                    <div style="width: 100%; text-align: left;">
                        <p style="font-size: 0.85rem; color: #475569; margin: 0 0 0.5rem 0;"><strong>a.</strong> Se determina el ángulo de referencia ($\\alpha$) evaluando la división:</p>
                    </div>
                    <p style="margin: 0 0 0.5rem 0; font-size: 0.95rem;">$$\\alpha = \\arctan\\left(\\frac{${absDy}}{${absDx}}\\right) = \\arctan(${strFraccion}) = ${anguloBase}^\\circ$$</p>
                    <div style="width: 100%; text-align: left; background-color: #fef3c7; border-left: 3px solid #f59e0b; padding: 0.5rem; border-radius: 4px; margin-bottom: 0.75rem;">
                        <p style="font-size: 0.8rem; color: #92400e; margin: 0;">💡 <strong>Tip de Calculadora:</strong> Presiona <strong>SHIFT</strong> + <strong>tan</strong> ($\\tan^{-1}$) seguido de <strong>${strFraccion}</strong> para comprobar el ángulo base.</p>
                    </div>
                    <div style="width: 100%; text-align: left;">
                        <p style="font-size: 0.85rem; color: #475569; margin: 0 0 0.5rem 0;"><strong>b.</strong> Al estar en el primer cuadrante, el ángulo calculado es el definitivo:</p>
                    </div>
                    <p style="margin: 0; font-size: 0.95rem;">$$\\theta = ${anguloFinal}^\\circ$$</p>`;
            } else if (dx < 0 && dy >= 0) {
                analisisCuadrante = `Como $\\Delta x < 0$ y $\\Delta y \\geq 0$, el vector se encuentra ubicado en el <strong>segundo cuadrante</strong>.`;
                calculoFormula = `
                    <div style="width: 100%; text-align: left;">
                        <p style="font-size: 0.85rem; color: #475569; margin: 0 0 0.5rem 0;"><strong>a.</strong> Se determina el ángulo de referencia en positivo:</p>
                    </div>
                    <p style="margin: 0 0 0.5rem 0; font-size: 0.95rem;">$$\\alpha = \\arctan\\left(\\frac{${absDy}}{${absDx}}\\right) = \\arctan(${strFraccion}) = ${anguloBase}^\\circ$$</p>
                    <div style="width: 100%; text-align: left; background-color: #fef3c7; border-left: 3px solid #f59e0b; padding: 0.5rem; border-radius: 4px; margin-bottom: 0.75rem;">
                        <p style="font-size: 0.8rem; color: #92400e; margin: 0;">💡 <strong>Tip de Calculadora:</strong> Presiona <strong>SHIFT</strong> + <strong>tan</strong> ($\\tan^{-1}$) seguido de <strong>${strFraccion}</strong> para comprobar el ángulo base.</p>
                    </div>
                    <div style="width: 100%; text-align: left;">
                        <p style="font-size: 0.85rem; color: #475569; margin: 0 0 0.5rem 0;"><strong>b.</strong> Al estar en el segundo cuadrante, se ajusta sumando $180^\\circ$ al ángulo original:</p>
                    </div>
                    <p style="margin: 0; font-size: 0.95rem;">$$\\theta = 180^\\circ - ${anguloBase}^\\circ = ${anguloFinal}^\\circ$$</p>`;
            } else if (dx < 0 && dy < 0) {
                analisisCuadrante = `Como ambas componentes son negativas ($\\Delta x < 0$ y $\\Delta y < 0$), el vector se encuentra ubicado en el <strong>tercer cuadrante</strong>.`;
                calculoFormula = `
                    <div style="width: 100%; text-align: left;">
                        <p style="font-size: 0.85rem; color: #475569; margin: 0 0 0.5rem 0;"><strong>a.</strong> Se determina el ángulo de referencia en positivo:</p>
                    </div>
                    <p style="margin: 0 0 0.5rem 0; font-size: 0.95rem;">$$\\alpha = \\arctan\\left(\\frac{${absDy}}{${absDx}}\\right) = \\arctan(${strFraccion}) = ${anguloBase}^\\circ$$</p>
                    <div style="width: 100%; text-align: left; background-color: #fef3c7; border-left: 3px solid #f59e0b; padding: 0.5rem; border-radius: 4px; margin-bottom: 0.75rem;">
                        <p style="font-size: 0.8rem; color: #92400e; margin: 0;">💡 <strong>Tip de Calculadora:</strong> Presiona <strong>SHIFT</strong> + <strong>tan</strong> ($\\tan^{-1}$) seguido de <strong>${strFraccion}</strong> para comprobar el ángulo base.</p>
                    </div>
                    <div style="width: 100%; text-align: left;">
                        <p style="font-size: 0.85rem; color: #475569; margin: 0 0 0.5rem 0;"><strong>b.</strong> Al estar en el tercer cuadrante, el ángulo se ajusta sumando $180^\\circ$:</p>
                    </div>
                    <p style="margin: 0; font-size: 0.95rem;">$$\\theta = 180^\\circ + ${anguloBase}^\\circ = ${anguloFinal}^\\circ$$</p>`;
            } else if (dx > 0 && dy < 0) {
                analisisCuadrante = `Como $\\Delta x > 0$ y $\\Delta y < 0$, el vector se encuentra ubicado en el <strong>cuarto cuadrante</strong>.`;
                calculoFormula = `
                    <div style="width: 100%; text-align: left;">
                        <p style="font-size: 0.85rem; color: #475569; margin: 0 0 0.5rem 0;"><strong>a.</strong> Se determina el ángulo de referencia en positivo:</p>
                    </div>
                    <p style="margin: 0 0 0.5rem 0; font-size: 0.95rem;">$$\\alpha = \\arctan\\left(\\frac{${absDy}}{${absDx}}\\right) = \\arctan(${strFraccion}) = ${anguloBase}^\\circ$$</p>
                    <div style="width: 100%; text-align: left; background-color: #fef3c7; border-left: 3px solid #f59e0b; padding: 0.5rem; border-radius: 4px; margin-bottom: 0.75rem;">
                        <p style="font-size: 0.8rem; color: #92400e; margin: 0;">💡 <strong>Tip de Calculadora:</strong> Presiona <strong>SHIFT</strong> + <strong>tan</strong> ($\\tan^{-1}$) seguido de <strong>${strFraccion}</strong> para comprobar el ángulo base.</p>
                    </div>
                    <div style="width: 100%; text-align: left;">
                        <p style="font-size: 0.85rem; color: #475569; margin: 0 0 0.5rem 0;"><strong>b.</strong> Al estar en el cuarto cuadrante, se ajusta restando de $360^\\circ$:</p>
                    </div>
                    <p style="margin: 0; font-size: 0.95rem;">$$\\theta = 360^\\circ - ${anguloBase}^\\circ = ${anguloFinal}^\\circ$$</p>`;
            } else if (dx === 0) {
                analisisCuadrante = `Como $\\Delta x = 0$, el vector se encuentra directamente sobre el <strong>eje Y</strong>.`;
                calculoFormula = `
                    <div style="width: 100%; text-align: left;">
                        <p style="font-size: 0.85rem; color: #475569; margin: 0 0 0.5rem 0;">Al estar sobre el eje, la dirección es directa por inspección:</p>
                    </div>
                    <p style="margin: 0; font-size: 0.95rem;">$$\\theta = ${anguloFinal}^\\circ$$</p>`;
            }

            return `
            <div class="card-aplicacion" style="background: #ffffff; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                    <span style="background: #2563eb; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.85rem;">3</span>
                    <h4 style="margin: 0; color: #1e293b; font-size: 1.05rem;">Dirección del Vector ($\\theta$)</h4>
                </div>
                
                <div style="text-align: center; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 2px solid #e2e8f0;">
                    <p style="font-size: 0.95rem; color: #1e293b; margin: 0;">$$\\theta = \\arctan\\left(\\frac{\\Delta y}{\\Delta x}\\right)$$</p>
                </div>

                <div style="text-align: center; margin-bottom: 1rem;">
                    <p style="font-size: 0.85rem; color: #475569; margin: 0;">Se retoman los incrementos calculados:</p>
                </div>

                <div class="contenedor-puntos" style="justify-content: center; gap: 1.5rem; margin-bottom: 1rem; display: flex; flex-wrap: wrap;">
                    <div class="pill-delta">
                        <span class="dot-dx"></span>
                        <span>$\\Delta x = ${dxFmt}$</span>
                    </div>
                    <div class="pill-delta">
                        <span class="dot-dy"></span>
                        <span>$\\Delta y = ${dyFmt}$</span>
                    </div>
                </div>

                <div class="math-scrollable" style="padding: 0.75rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
                    <div style="width: 100%; background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem; text-align: left;">
                        <p style="font-size: 0.85rem; color: #1e3a8a; margin: 0;"><strong>Análisis de cuadrante:</strong> ${analisisCuadrante}</p>
                    </div>
                    <div style="width: 100%; display: flex; flex-direction: column; align-items: center;">
                        ${calculoFormula}
                    </div>
                </div>

                <div class="resultado-exito-destacado">
                    <span><strong>Resultado final:</strong> $\\theta = ${anguloFinal}^\\circ$</span>
                </div>
            </div>
            `;
        })(),
        // ==============================================
        // PASO 4 AL 7: ESTÁTICOS / LIMPIOS 
        // ==============================================
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
// BLOQUE 4: DIBUJO DEL PLANO CARTESIANO EN CANVAS
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
