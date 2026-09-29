// CONTROL DE NAVEGACIÓN POR PESTAÑAS
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

    // 4. Activar el botón presionado
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
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

// INICIALIZACIÓN AL CARGAR EL DOCUMENTO
document.addEventListener("DOMContentLoaded", function() {
    // Renderizado inicial de notación matemática mediante KaTeX
    if (window.renderMathInElement) {
        renderMathInElement(document.body, {
            delimiters: [
                {left: "$$", right: "$$", display: true},
                {left: "$", right: "$", display: false}
            ],
            throwOnError: false
        });
    }
});
// =======================================================
// CONTROLADOR DEL LABORATORIO Y RENDERIZADO DIDÁCTICO
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

    // Cálculo formal de 7 pasos
    const res = MathEngine.calcularSecuenciaRecta(x1, y1, x2, y2);

    // Renderizado del resumen numérico sobre la gráfica
    renderizarResumenBarra(res, x1, y1, x2, y2);

    // Renderizar tarjetas con desglose ampliado
    renderizarTarjetasPasoAPaso(res, x1, y1, x2, y2);

    // Dibujar el canvas gráfico limpio
    dibujarPlanoCartesianoLimpio(x1, y1, x2, y2, res);
}

// BARRA DE RESUMEN DEBAJO DE LA GRÁFICA
function renderizarResumenBarra(res, x1, y1, x2, y2) {
    const bar = document.getElementById('resumen-grafica-bar');
    if (!bar) return;

    const mTexto = res.esVertical ? "Indefinida (Vertical)" : res.pendiente;
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

// DESGLOSE ARITMÉTICO Y ÁLGEBRAICO EXPANDIDO
function renderizarTarjetasPasoAPaso(res, x1, y1, x2, y2) {
    const container = document.getElementById('pasos-container');
    if (!container) return;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const m = res.pendiente;
    const b = res.ordenadaOrigen;

    // Formateo de cadenas para mostrar operaciones intermadias con signos explícitos
    const x1Sign = x1 < 0 ? `(${x1})` : `${x1}`;
    const y1Sign = y1 < 0 ? `(${y1})` : `${y1}`;
    const x2Sign = x2 < 0 ? `(${x2})` : `${x2}`;
    const y2Sign = y2 < 0 ? `(${y2})` : `${y2}`;

    const pasosData = [
        {
            num: 1,
            titulo: "Vector Desplazamiento ($\\Delta \\vec{r}$)",
            que: "Calculamos el avance horizontal ($\\Delta x$) y el cambio vertical ($\\Delta y$) restando las coordenadas del origen a las del destino.",
            como: `
                $$\\Delta x = x_2 - x_1 = ${x2Sign} - ${x1Sign} = ${dx.toFixed(2)}$$
                $$\\Delta y = y_2 - y_1 = ${y2Sign} - ${y1Sign} = ${dy.toFixed(2)}$$
                $$\\Delta \\vec{r} = (\\Delta x, \\Delta y) = (${dx.toFixed(2)}, \\, ${dy.toFixed(2)})$$
            `,
            porque: `Significa que para ir desde el Punto A hasta el Punto B se avanzan **${dx.toFixed(2)} unidades** en el eje X y **${dy.toFixed(2)} unidades** en el eje Y.`
        },
        {
            num: 2,
            titulo: "Magnitud del Desplazamiento ($\vert{}\\Delta \\vec{r}\vert{}$)",
            que: "Aplicamos el Teorema de Pitágoras con las variaciones $\\Delta x$ y $\\Delta y$ para hallar la distancia directa entre ambos puntos.",
            como: `
                $$|\\Delta \\vec{r}| = \\sqrt{(\\Delta x)^2 + (\\Delta y)^2}$$
                $$|\\Delta \\vec{r}| = \\sqrt{(${dx.toFixed(2)})^2 + (${dy.toFixed(2)})^2}$$
                $$|\\Delta \\vec{r}| = \\sqrt{${(dx*dx).toFixed(2)} + ${(dy*dy).toFixed(2)}} = \\sqrt{${(dx*dx + dy*dy).toFixed(2)}} = ${res.magnitud}$$
            `,
            porque: "Es la longitud geométrica exacta del segmento rectilíneo dibujado en el plano."
        },
        {
            num: 3,
            titulo: "Dirección y Cuadrante ($\\theta$)",
            que: "Obtenemos el ángulo del vector mediante la función arcotangente $\\arctan\\left(\\frac{\vert{}\\Delta y\vert{}}{\vert{}\\Delta x\vert{}}\\right)$ ajustando según el cuadrante.",
            como: `
                $$\\alpha = \\arctan\\left(\\left|\\frac{${dy.toFixed(2)}}{${dx.toFixed(2)}}\\right|\\right) = ${Math.abs(res.direccion.grados).toFixed(2)}^\\circ$$
                $$\\text{Ubicación: } ${res.direccion.cuadrante}$$
                $$\\theta = ${res.direccion.grados}^\\circ$$
            `,
            porque: "Nos indica la inclinación sexagesimal medida desde el eje X positivo en sentido antihorario."
        },
        {
            num: 4,
            titulo: "Pendiente de la Recta ($m$)",
            que: "Dividimos la variación vertical entre la variación horizontal para obtener la inclinación constante.",
            como: `
                $$m = \\frac{\\Delta y}{\\Delta x} = \\frac{y_2 - y_1}{x_2 - x_1}$$
                $$m = \\frac{${dy.toFixed(2)}}{${dx.toFixed(2)}} = ${m}$$
            `,
            porque: res.esVertical ? "Como $\\Delta x = 0$, la división por cero no está definida (recta vertical)." : `Indica que por cada unidad que la recta avanza hacia la derecha en X, sube o baja **${m} unidades** en Y.`
        },
        {
            num: 5,
            titulo: "Forma Punto-Pendiente",
            que: "Sustituimos el Punto A $(x_1, y_1)$ y la pendiente $m$ en el modelo estándar $y - y_1 = m(x - x_1)$.",
            como: `
                $$y - ${y1Sign} = ${m} \\cdot (x - ${x1Sign})$$
                $$${res.ecuaciones.puntoPendiente}$$
            `,
            porque: "Permite construir la ecuación formal de la recta conociendo únicamente un punto inicial y la tasa de cambio."
        },
        {
            num: 6,
            titulo: "Forma Explícita ($y = mx + b$)",
            que: "Despejamos la variable $y$ resolviendo la multiplicación y simplificando los términos independientes.",
            como: `
                $$y = ${m}x + (${y1} - ${m} \\cdot ${x1})$$
                $$${res.ecuaciones.explicita}$$
            `,
            porque: `Nos revela la ordenada al origen **$b = ${b}$**, que es el punto $(0, ${b})$ donde la recta cruza el eje vertical Y.`
        },
        {
            num: 7,
            titulo: "Forma General ($Ax + By + C = 0$)",
            que: "Pasamos todos los términos al lado izquierdo de la igualdad para obtener la expresión canónica estándar.",
            como: `
                $$${res.ecuaciones.general}$$
            `,
            porque: "Es la representación algebraica unificada para analizar sistemas de ecuaciones lineales y cortes cónicos."
        }
    ];

    // Inyección HTML en el contenedor
    container.innerHTML = pasosData.map(p => `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1.1rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.03); min-width: 0;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.6rem;">
                <span style="background: #004d40; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem; flex-shrink: 0;">${p.num}</span>
                <h4 style="margin: 0; color: #004d40; font-size: 0.98rem; overflow-wrap: break-word; word-break: break-word;">${p.titulo}</h4>
            </div>
            <p style="font-size: 0.83rem; color: #475569; margin: 0 0 0.5rem 0; line-height: 1.35;"><strong>¿Qué se hizo?</strong> ${p.que}</p>
            <div style="background: #f8fafc; padding: 0.6rem; border-radius: 6px; border-left: 3px solid #0d6efd; margin-bottom: 0.5rem; overflow-x: auto; font-size: 0.85rem;">
                <strong style="color: #0d6efd; font-size: 0.78rem;">¿Cómo se hizo?</strong>
                <div style="margin-top: 0.2rem;">${p.como}</div>
            </div>
            <p style="font-size: 0.82rem; color: #64748b; margin: 0; line-height: 1.35;"><strong>¿Por qué?</strong> ${p.porque}</p>
        </div>
    `).join('');

    // Procesar expresiones matemáticas con KaTeX en títulos y fórmulas
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

// RENDIMIENTO Y DIBUJO DEL PLANO CARTESIANO LIMPIO
function dibujarPlanoCartesianoLimpio(x1, y1, x2, y2, res) {
    const canvas = document.getElementById('planoCartesianoCanvas');
    if (!canvas) return;

    const rect = canvas.parentNode.getBoundingClientRect();
    canvas.width = rect.width || 500;
    canvas.height = 340;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Rango dinámico
    const maxCoord = Math.max(Math.abs(x1), Math.abs(y1), Math.abs(x2), Math.abs(y2), 5) + 3;
    const scale = Math.min(width, height) / (maxCoord * 2);
    
    const cx = width / 2;
    const cy = height / 2;

    const toPx = (x) => cx + (x * scale);
    const toPy = (y) => cy - (y * scale);

    // Fondo limpio
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

    // Triángulo de Pendiente (Punteado en Naranja)
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(toPx(x1), toPy(y1));
    ctx.lineTo(toPx(x2), toPy(y1));
    ctx.lineTo(toPx(x2), toPy(y2));
    ctx.stroke();
    ctx.setLineDash([]);

    // Trazado de la Recta Principal (Azul)
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

    // Ordenada al origen (Verde)
    if (!res.esVertical && res.ordenadaOrigen !== "N/A") {
        const b = parseFloat(res.ordenadaOrigen);
        ctx.fillStyle = "#10b981";
        ctx.beginPath();
        ctx.arc(toPx(0), toPy(b), 5, 0, Math.PI * 2);
        ctx.fill();
    }

    // Punto A (Azul Oscuro)
    ctx.fillStyle = "#084298";
    ctx.beginPath();
    ctx.arc(toPx(x1), toPy(y1), 6, 0, Math.PI * 2);
    ctx.fill();

    // Punto B (Rojo)
    ctx.fillStyle = "#dc3545";
    ctx.beginPath();
    ctx.arc(toPx(x2), toPy(y2), 6, 0, Math.PI * 2);
    ctx.fill();

    // Etiquetas sobre la gráfica limpia
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText(`A(${x1}, ${y1})`, toPx(x1) + 8, toPy(y1) - 6);
    ctx.fillText(`B(${x2}, ${y2})`, toPx(x2) + 8, toPy(y2) - 6);
}

// Inicialización
document.addEventListener("DOMContentLoaded", function() {
    setTimeout(calcularLaboratorio, 200);
});
