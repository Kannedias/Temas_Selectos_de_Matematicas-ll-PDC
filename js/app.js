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

// CONSTRUCTOR DE TARJETAS CON KATEX LIMPIO Y ESPACIADO SIMÉTRICO
        function construirHTML7TarjetasEstructuraExacta(x1, y1, x2, y2, calc, prefix = "") {
            let { dx, dy, mag_red, ang_red, m_exacta, m_red, val_distributiva, b_red, str_y1_p2, str_x1_p2, str_val_distr, signo_y1_al_despejar } = calc;

            // --- INICIO LÓGICA DINÁMICA PASO 3 (Estructura de Capturas) ---
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);
            const valFraccion = absDx === 0 ? 0 : (absDy / absDx);
            const strFraccion = Number.isInteger(valFraccion) ? valFraccion.toString() : valFraccion.toFixed(3);
            const anguloBaseRad = Math.abs(Math.atan(dy / (dx === 0 ? 1 : dx)));
            const anguloBase = (anguloBaseRad * (180 / Math.PI)).toFixed(2);
            
            let analisisCuadrante = "";
            let calculoFormula = "";
            
            if (dx === 0 && dy === 0) {
                analisisCuadrante = "El vector es nulo, no tiene dirección definida.";
                calculoFormula = `<p style="margin: 0; font-size: 0.95rem;">$$\\theta = 0^\\circ$$</p>`;
            } else {
                if (dx > 0 && dy >= 0) {
                    analisisCuadrante = `Como ambas componentes son positivas ($\\Delta x > 0$ y $\\Delta y > 0$), el vector se encuentra ubicado en el <strong>primer cuadrante</strong>.`;
                    calculoFormula = `
                        <div style="width: 100%; text-align: left;">
                            <p style="font-size: 0.85rem; color: #475569; margin: 0 0 0.5rem 0;"><strong>a.</strong> Se determina el ángulo con la función trigonométrica:</p>
                        </div>
                        <p style="margin: 0 0 1rem 0; font-size: 0.95rem;">$$\\theta = \\arctan\\left(\\frac{${dy}}{${dx}}\\right)$$</p>
                        <div style="width: 100%; text-align: left;">
                            <p style="font-size: 0.85rem; color: #475569; margin: 0 0 0.5rem 0;"><strong>b.</strong> Al estar en el primer cuadrante, el ángulo calculado es el definitivo:</p>
                        </div>
                        <p style="margin: 0; font-size: 0.95rem;">$$\\theta = \\arctan(${strFraccion}) = ${ang_red}^\\circ$$</p>`;
                } else if (dx < 0 && dy >= 0) {
                    analisisCuadrante = `Como $\\Delta x < 0$ y $\\Delta y > 0$, el vector se encuentra ubicado en el <strong>segundo cuadrante</strong>.`;
                    calculoFormula = `
                        <div style="width: 100%; text-align: left;">
                            <p style="font-size: 0.85rem; color: #475569; margin: 0 0 0.5rem 0;"><strong>a.</strong> Se determina el ángulo de referencia en positivo:</p>
                        </div>
                        <p style="margin: 0 0 1rem 0; font-size: 0.95rem;">$$\\alpha = \\arctan\\left(\\frac{${absDy}}{${absDx}}\\right) = \\arctan(${strFraccion}) = ${anguloBase}^\\circ$$</p>
                        <div style="width: 100%; text-align: left;">
                            <p style="font-size: 0.85rem; color: #475569; margin: 0 0 0.5rem 0;"><strong>b.</strong> Al estar en el segundo cuadrante, se ajusta sumando $180^\\circ$ al ángulo original:</p>
                        </div>
                        <p style="margin: 0; font-size: 0.95rem;">$$\\theta = 180^\\circ - ${anguloBase}^\\circ = ${ang_red}^\\circ$$</p>`;
                } else if (dx < 0 && dy < 0) {
                    analisisCuadrante = `Como ambas componentes son negativas ($\\Delta x < 0$ y $\\Delta y < 0$), el vector se encuentra ubicado en el <strong>tercer cuadrante</strong>.`;
                    calculoFormula = `
                        <div style="width: 100%; text-align: left;">
                            <p style="font-size: 0.85rem; color: #475569; margin: 0 0 0.5rem 0;"><strong>a.</strong> Se determina el ángulo de referencia en positivo:</p>
                        </div>
                        <p style="margin: 0 0 1rem 0; font-size: 0.95rem;">$$\\alpha = \\arctan\\left(\\frac{${absDy}}{${absDx}}\\right) = \\arctan(${strFraccion}) = ${anguloBase}^\\circ$$</p>
                        <div style="width: 100%; text-align: left;">
                            <p style="font-size: 0.85rem; color: #475569; margin: 0 0 0.5rem 0;"><strong>b.</strong> Al estar en el tercer cuadrante, el ángulo se ajusta sumando $180^\\circ$:</p>
                        </div>
                        <p style="margin: 0; font-size: 0.95rem;">$$\\theta = 180^\\circ + ${anguloBase}^\\circ = ${ang_red}^\\circ$$</p>`;
                } else if (dx > 0 && dy < 0) {
                    analisisCuadrante = `Como $\\Delta x > 0$ y $\\Delta y < 0$, el vector se encuentra ubicado en el <strong>cuarto cuadrante</strong>.`;
                    calculoFormula = `
                        <div style="width: 100%; text-align: left;">
                            <p style="font-size: 0.85rem; color: #475569; margin: 0 0 0.5rem 0;"><strong>a.</strong> Se determina el ángulo de referencia en positivo:</p>
                        </div>
                        <p style="margin: 0 0 1rem 0; font-size: 0.95rem;">$$\\alpha = \\arctan\\left(\\frac{${absDy}}{${absDx}}\\right) = \\arctan(${strFraccion}) = ${anguloBase}^\\circ$$</p>
                        <div style="width: 100%; text-align: left;">
                            <p style="font-size: 0.85rem; color: #475569; margin: 0 0 0.5rem 0;"><strong>b.</strong> Al estar en el cuarto cuadrante, se ajusta restando de $360^\\circ$:</p>
                        </div>
                        <p style="margin: 0; font-size: 0.95rem;">$$\\theta = 360^\\circ - ${anguloBase}^\\circ = ${ang_red}^\\circ$$</p>`;
                } else if (dx === 0) {
                    analisisCuadrante = `Como $\\Delta x = 0$, el vector se encuentra directamente sobre el <strong>eje Y</strong>.`;
                    calculoFormula = `
                        <div style="width: 100%; text-align: left;">
                            <p style="font-size: 0.85rem; color: #475569; margin: 0 0 0.5rem 0;">Al estar sobre el eje, la dirección es directa por inspección:</p>
                        </div>
                        <p style="margin: 0; font-size: 0.95rem;">$$\\theta = ${ang_red}^\\circ$$</p>`;
                }
            }
            // --- FIN LÓGICA PASO 3 ---

            return `
                <!-- PASO 1: DESPLAZAMIENTO -->
                <div class="bg-white border rounded-xl p-4 shadow-sm flex flex-col justify-between hover:border-blue-300 transition">
                    <div>
                        <div class="flex items-center gap-2 mb-2">
                            <span class="bg-blue-600 text-white font-bold rounded-full w-6 h-6 flex items-center justify-center text-xs">1</span>
                            <h4 class="font-bold text-gray-800 text-sm">Paso 1: Vector Desplazamiento (<span id="${prefix}hdr-1"></span>)</h4>
                        </div>
                        <p class="text-xs text-gray-600 mb-2">
                            <strong>Origen de datos:</strong> Punto A($x_1=${x1}, y_1=${y1}$) y Punto B($x_2=${x2}, y_2=${y2}$).
                        </p>
                        <p class="text-xs text-gray-500 mb-1"><strong>Sustitución en $\\Delta\\ \\vec{r} = \\Delta x\\hat{i} + \\Delta y\\hat{j}$:</strong></p>
                        <div class="bg-gray-50 p-2.5 rounded text-center my-2 border" id="${prefix}paso1-math"></div>
                        <p class="text-xs text-gray-600 mt-2">
                            • Cambio Horizontal ($\Delta x$): $x_2 - x_1 = ${x2} - (${x1}) = ${dx}$<br>
                            • Cambio Vertical ($\Delta y$): $y_2 - y_1 = ${y2} - (${y1}) = ${dy}$
                        </p>
                    </div>
                    <div class="border-t pt-2 mt-3 bg-blue-50/60 -mx-4 -mb-4 p-3 rounded-b-xl border-blue-100 text-xs text-blue-900">
                        <strong>Resultado obtenido:</strong> <span id="${prefix}paso1-res"></span><br>
                        <em>Significado:</em> Muestra los componentes del movimiento en horizontal ($\Delta x = ${dx}$) y vertical ($\Delta y = ${dy}$).
                    </div>
                </div>

                <!-- PASO 2: MAGNITUD -->
                <div class="bg-white border rounded-xl p-4 shadow-sm flex flex-col justify-between hover:border-blue-300 transition">
                    <div>
                        <div class="flex items-center gap-2 mb-2">
                            <span class="bg-blue-600 text-white font-bold rounded-full w-6 h-6 flex items-center justify-center text-xs">2</span>
                            <h4 class="font-bold text-gray-800 text-sm">Paso 2: Magnitud del Desplazamiento (<span id="${prefix}hdr-2"></span>)</h4>
                        </div>
                        <p class="text-xs text-gray-600 mb-2">
                            <strong>Origen de datos:</strong> Componentes $\\Delta x = ${dx}$ y $\\Delta y = ${dy}$.
                        </p>
                        <p class="text-xs text-gray-500 mb-1"><strong>Aplicando $|\\Delta\\ \\vec{r}| = \\sqrt{(\\Delta x)^2 + (\\Delta y)^2}$:</strong></p>
                        <div class="bg-gray-50 p-2.5 rounded text-center my-2 border" id="${prefix}paso2-math"></div>
                    </div>
                    <div class="border-t pt-2 mt-3 bg-blue-50/60 -mx-4 -mb-4 p-3 rounded-b-xl border-blue-100 text-xs text-blue-900">
                        <strong>Resultado obtenido:</strong> <span id="${prefix}paso2-res"></span><br>
                        <em>Significado:</em> Distancia en línea recta desde el punto inicial hasta el final.
                    </div>
                </div>

                <!-- PASO 3: DIRECCIÓN (ESTILO ACTUALIZADO Y DIDÁCTICO) -->
                <div class="bg-white border rounded-xl p-4 shadow-sm flex flex-col justify-between hover:border-blue-300 transition">
                    <div>
                        <div class="flex items-center gap-2 mb-2">
                            <span class="bg-blue-600 text-white font-bold rounded-full w-6 h-6 flex items-center justify-center text-xs">3</span>
                            <h4 class="font-bold text-gray-800 text-sm">Paso 3: Dirección del Vector (<span id="${prefix}hdr-3"></span>)</h4>
                        </div>
                        
                        <div style="text-align: center; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 2px solid #e2e8f0;">
                            <p style="font-size: 0.95rem; color: #1e293b; margin: 0;">$$\\theta = \\arctan\\left(\\frac{\\Delta y}{\\Delta x}\\right)$$</p>
                        </div>

                        <!-- Texto explicativo -->
                        <div style="text-align: center; margin-bottom: 0.75rem;">
                            <p style="font-size: 0.85rem; color: #475569; margin: 0;">Se retoman los incrementos calculados:</p>
                        </div>

                        <!-- Cajas Responsivas de Delta X y Delta Y (Píldoras) -->
                        <div class="flex justify-center gap-4 mb-4 flex-wrap">
                            <div class="pill-delta flex items-center gap-2 bg-gray-50 border border-gray-300 px-3 py-1 rounded-full text-sm font-semibold text-gray-700 shadow-sm">
                                <span class="dot-dx w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_4px_rgba(168,85,247,0.5)]"></span>
                                <span>$\\Delta x = ${dx}$</span>
                            </div>
                            <div class="pill-delta flex items-center gap-2 bg-gray-50 border border-gray-300 px-3 py-1 rounded-full text-sm font-semibold text-gray-700 shadow-sm">
                                <span class="dot-dy w-2.5 h-2.5 rounded-full bg-teal-500 shadow-[0_0_4px_rgba(20,184,166,0.5)]"></span>
                                <span>$\\Delta y = ${dy}$</span>
                            </div>
                        </div>

                        <!-- Análisis de Cuadrante (Estilo Captura 2) -->
                        <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem;">
                            <p style="font-size: 0.85rem; color: #1e3a8a; margin: 0;"><strong>Análisis de cuadrante:</strong> ${analisisCuadrante}</p>
                        </div>

                        <!-- Procedimiento Desglosado a y b (Estilo Captura 1) -->
                        <div style="display: flex; flex-direction: column; align-items: center; padding: 0 0.5rem;">
                            ${calculoFormula}
                        </div>
                        
                        <!-- Div oculto necesario para no interferir con la función de renderizado KaTeX de app.js -->
                        <div id="${prefix}paso3-math" class="hidden"></div>
                    </div>
                    
                    <!-- Resultado Destacado Verde Esmeralda -->
                    <div class="resultado-exito-destacado mt-4 flex items-center" style="background-color: #ecfdf5; border-left: 4px solid #10b981; color: #065f46; padding: 0.75rem 1rem; border-radius: 4px; font-size: 0.9rem;">
                        <span><strong>Resultado final:</strong> $\\theta = ${ang_red}^\\circ$</span>
                    </div>
                </div>

                <!-- PASO 4: PENDIENTE -->
                <div class="bg-white border rounded-xl p-4 shadow-sm flex flex-col justify-between hover:border-blue-300 transition">
                    <div>
                        <div class="flex items-center gap-2 mb-2">
                            <span class="bg-blue-600 text-white font-bold rounded-full w-6 h-6 flex items-center justify-center text-xs">4</span>
                            <h4 class="font-bold text-gray-800 text-sm">Paso 4: Cálculo de la Pendiente ($m$)</h4>
                        </div>
                        <p class="text-xs text-gray-600 mb-2">
                            <strong>Origen de datos:</strong> Puntos A($x_1=${x1}, y_1=${y1}$) y B($x_2=${x2}, y_2=${y2}$).
                        </p>
                        <p class="text-xs text-gray-500 mb-1"><strong>Sustitución en $m = \\frac{y_2 - y_1}{x_2 - x_1}$:</strong></p>
                        <div class="bg-gray-50 p-2.5 rounded text-center my-2 border" id="${prefix}paso4-math"></div>
                        <p class="text-xs text-gray-600 mt-2">
                            • Cambio en Y ($\\Delta y$): $y_2 - y_1 = ${y2} - (${y1}) = ${dy}$<br>
                            • Cambio en X ($\\Delta x$): $x_2 - x_1 = ${x2} - (${x1}) = ${dx}$
                        </p>
                    </div>
                    <div class="border-t pt-2 mt-3 bg-blue-50/60 -mx-4 -mb-4 p-3 rounded-b-xl border-blue-100 text-xs text-blue-900">
                        <strong>Resultado obtenido:</strong> $m = ${m_red}$ ${Number.isInteger(m_exacta) ? '(número entero)' : '(redondeado a 2 decimales)'}.<br>
                        <em>Significado:</em> La trayectoria ${m_red >= 0 ? 'asciende' : 'desciende'} ${Math.abs(m_red)} unidades por cada paso en X.
                    </div>
                </div>

                <!-- PASO 5: PUNTO PENDIENTE -->
                <div class="bg-white border rounded-xl p-4 shadow-sm flex flex-col justify-between hover:border-blue-300 transition">
                    <div>
                        <div class="flex items-center gap-2 mb-2">
                            <span class="bg-blue-600 text-white font-bold rounded-full w-6 h-6 flex items-center justify-center text-xs">5</span>
                            <h4 class="font-bold text-gray-800 text-sm">Paso 5: Ecuación Punto-Pendiente</h4>
                        </div>
                        <p class="text-xs text-gray-600 mb-2">
                            <strong>Origen de datos:</strong> Pendiente $m = ${m_red}$ y Punto A($x_1=${x1}, y_1=${y1}$).
                        </p>
                        <p class="text-xs text-gray-500 mb-1"><strong>Sustitución directa en $y - y_1 = m(x - x_1)$:</strong></p>
                        <div class="bg-gray-50 p-2.5 rounded text-center my-2 border" id="${prefix}paso5-math"></div>
                        <p class="text-xs text-gray-600 mt-2 leading-relaxed">
                            <strong>Ajuste de signos:</strong><br>
                            • En Y: <span id="${prefix}paso5-y-sign"></span><br>
                            • En X: <span id="${prefix}paso5-x-sign"></span>
                        </p>
                    </div>
                    <div class="border-t pt-2 mt-3 bg-blue-50/60 -mx-4 -mb-4 p-3 rounded-b-xl border-blue-100 text-xs text-blue-900">
                        <strong>Resultado obtenido:</strong> $y ${str_y1_p2} = ${m_red}(x ${str_x1_p2})$<br>
                        <em>Estructura inicial lista para despejar.</em>
                    </div>
                </div>

                <!-- PASO 6: EXPLÍCITA -->
                <div class="bg-white border rounded-xl p-4 shadow-sm flex flex-col justify-between hover:border-blue-300 transition">
                    <div>
                        <div class="flex items-center gap-2 mb-2">
                            <span class="bg-blue-600 text-white font-bold rounded-full w-6 h-6 flex items-center justify-center text-xs">6</span>
                            <h4 class="font-bold text-gray-800 text-sm">Paso 6: Forma Explícita ($y = mx + b$)</h4>
                        </div>
                        <p class="text-xs text-gray-600 mb-2">
                            <strong>Origen de datos:</strong> Ecuación del Paso 5: $y ${str_y1_p2} = ${m_red}(x ${str_x1_p2})$.
                        </p>
                        <p class="text-xs text-gray-500 mb-1"><strong>Despeje paso a paso:</strong></p>
                        <div class="bg-gray-50 p-2.5 rounded text-center my-2 border" id="${prefix}paso6-math"></div>
                        <p class="text-xs text-gray-600 mt-2 space-y-1">
                            <span>1. <strong>Multiplicar paréntesis:</strong> $m \\cdot (${str_x1_p2.trim()}) = ${m_red} \\cdot (${-x1}) = ${val_distributiva.toFixed(2)}$</span><br>
                            <span class="font-mono text-blue-700 bg-blue-50 px-1 py-0.5 rounded inline-block">y ${str_y1_p2} = ${m_red}x ${str_val_distr}</span><br>
                            <span>2. <strong>Despejar y:</strong> Pasamos el número constante al lado derecho:</span><br>
                            <span class="font-mono text-blue-700 bg-blue-50 px-1 py-0.5 rounded inline-block">y = ${m_red}x ${str_val_distr} ${signo_y1_al_despejar}</span><br>
                            <span>3. <strong>Sumar constantes:</strong> $b = ${val_distributiva.toFixed(2)} ${signo_y1_al_despejar} = ${b_red >= 0 ? '+' + b_red.toFixed(2) : b_red.toFixed(2)}$</span>
                        </p>
                    </div>
                    <div class="border-t pt-2 mt-3 bg-blue-50/60 -mx-4 -mb-4 p-3 rounded-b-xl border-blue-100 text-xs text-blue-900">
                        <strong>Resultado obtenido:</strong> Ordenada al origen $b = ${b_red.toFixed(2)}$.<br>
                        <em>Significado:</em> Muestra exactamente el corte con el eje Y en $(0, ${b_red.toFixed(2)})$.
                    </div>
                </div>

                <!-- PASO 7: GENERAL -->
                <div class="bg-white border rounded-xl p-4 shadow-sm flex flex-col justify-between hover:border-blue-300 transition">
                    <div>
                        <div class="flex items-center gap-2 mb-2">
                            <span class="bg-blue-600 text-white font-bold rounded-full w-6 h-6 flex items-center justify-center text-xs">7</span>
                            <h4 class="font-bold text-gray-800 text-sm">Paso 7: Forma General ($Ax + By + C = 0$)</h4>
                        </div>
                        <p class="text-xs text-gray-600 mb-2">
                            <strong>Origen de datos:</strong> Igualar a cero la forma explícita $y = ${m_red}x ${b_red >= 0 ? '+ ' + b_red.toFixed(2) : '- ' + Math.abs(b_red).toFixed(2)}$.
                        </p>
                        <p class="text-xs text-gray-500 mb-1"><strong>Alineación canónica:</strong></p>
                        <div class="bg-gray-50 p-2.5 rounded text-center my-2 border font-bold" id="${prefix}paso7-math"></div>
                        <p class="text-xs text-gray-600 mt-2">
                            Identificación de valores:<br>
                            • Coeficiente $A = ${m_red}$<br>
                            • Coeficiente $B = -1$<br>
                            • Término independiente $C = ${b_red.toFixed(2)}$
                        </p>
                    </div>
                    <div class="border-t pt-2 mt-3 bg-blue-50/60 -mx-4 -mb-4 p-3 rounded-b-xl border-blue-100 text-xs text-blue-900">
                        <strong>Resultado obtenido:</strong> Ecuación General Formalizada.<br>
                        <em>Significado:</em> Expresión universal estandarizada.
                    </div>
                </div>
            `;
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
