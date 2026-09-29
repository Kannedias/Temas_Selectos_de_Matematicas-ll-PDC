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
// CONTROLADOR DEL LABORATORIO Y RENDERIZADO DEL CANVAS
// =======================================================

function calcularLaboratorio() {
    // 1. Obtener coordenadas de entrada
    const x1 = parseFloat(document.getElementById('lab-x1').value) || 0;
    const y1 = parseFloat(document.getElementById('lab-y1').value) || 0;
    const x2 = parseFloat(document.getElementById('lab-x2').value) || 0;
    const y2 = parseFloat(document.getElementById('lab-y2').value) || 0;

    // Validar que el motor matemático esté cargado
    if (typeof MathEngine === 'undefined' || !MathEngine.calcularSecuenciaRecta) {
        console.error("El motor MathEngine no está disponible.");
        return;
    }

    // 2. Ejecutar cálculo de 7 pasos
    const res = MathEngine.calcularSecuenciaRecta(x1, y1, x2, y2);

    // 3. Renderizar las Tarjetas Explicativas en #pasos-container
    renderizarTarjetasLaboratorio(res, x1, y1, x2, y2);

    // 4. Dibujar el Plano Cartesiano en el Canvas
    dibujarPlanoCartesiano(x1, y1, x2, y2, res);
}

// RENDERIZADO DE LAS 7 TARJETAS DIDÁCTICAS (¿Qué?, ¿Cómo?, ¿Por qué?)
function renderizarTarjetasLaboratorio(res, x1, y1, x2, y2) {
    const container = document.getElementById('pasos-container');
    if (!container) return;

    const dx = res.vector.dx;
    const dy = res.vector.dy;
    const m = res.pendiente;
    const b = res.ordenadaOrigen;

    const pasosData = [
        {
            num: 1,
            titulo: "Vector Desplazamiento (\\Delta \\vec{r})",
            que: "Calculamos las variaciones horizontales (\\Delta x) y verticales (\\Delta y) entre los puntos.",
            como: `$$\\Delta \\vec{r} = (${dx.toFixed(2)}, \\, ${dy.toFixed(2)})$$`,
            porque: `Indica un avance horizontal de ${dx.toFixed(2)} unidades y un desplazamiento vertical de ${dy.toFixed(2)} unidades.`
        },
        {
            num: 2,
            titulo: "Magnitud del Desplazamiento (|\\Delta \\vec{r}|)",
            que: "Obtenemos la distancia en línea recta entre el Punto A y el Punto B mediante la norma vectorial.",
            como: `$$|\\Delta \\vec{r}| = \\sqrt{(${dx.toFixed(2)})^2 + (${dy.toFixed(2)})^2} = ${res.magnitud}$$`,
            porque: "Representa la longitud escalar real del segmento que conecta ambos puntos."
        },
        {
            num: 3,
            titulo: "Dirección y Cuadrante (\\theta)",
            que: "Determinamos el ángulo de inclinación respecto al eje X positivo con corrección por cuadrante.",
            como: `$$\\theta = ${res.direccion.grados}^\\circ \\quad \\text{(${res.direccion.cuadrante})}$$`,
            porque: "Define la orientación exacta del vector en el sistema de coordenadas 2D."
        },
        {
            num: 4,
            titulo: "Cálculo de la Pendiente (m)",
            que: "Calculamos la tasa de cambio dividiendo el cambio vertical entre el cambio horizontal.",
            como: `$$m = \\frac{\\Delta y}{\\Delta x} = \\frac{${dy.toFixed(2)}}{${dx.toFixed(2)}} = ${m}$$`,
            porque: res.esVertical ? "La recta es vertical, por lo que su pendiente es indefinida." : `Indica que por cada unidad que avanza en X, la recta varía ${m} unidades en Y.`
        },
        {
            num: 5,
            titulo: "Forma Punto-Pendiente",
            que: "Estructuramos la ecuación inicial utilizando las coordenadas del Punto A y la pendiente obtenida.",
            como: `$$${res.ecuaciones.puntoPendiente}$$`,
            porque: "Permite definir la recta formalmente a partir de un punto conocido y su inclinación."
        },
        {
            num: 6,
            titulo: "Forma Explícita (y = mx + b)",
            que: "Despejamos la variable Y para obtener la función explícita y hallar la ordenada al origen (b).",
            como: `$$${res.ecuaciones.explicita}$$`,
            porque: `El término b = ${b} representa la coordenada exacta de intersección con el eje Y en (0, ${b}).`
        },
        {
            num: 7,
            titulo: "Forma General (Ax + By + C = 0)",
            que: "Reordenamos todos los términos de la ecuación e igualamos a cero.",
            como: `$$${res.ecuaciones.general}$$`,
            porque: "Es el formato canónico estándar para representar cualquier tipo de recta en geometría analítica."
        }
    ];

    container.innerHTML = pasosData.map(p => `
        <div class="card-aplicacion" style="background: #ffffff; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.04);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                <span style="background: #004d40; color: white; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.85rem;">${p.num}</span>
                <h4 style="margin: 0; color: #004d40; font-size: 1rem;">${p.titulo}</h4>
            </div>
            <p style="font-size: 0.85rem; color: #475569; margin: 0 0 0.5rem 0;"><strong>¿Qué se hizo?</strong> ${p.que}</p>
            <div style="background: #f8fafc; padding: 0.75rem; border-radius: 6px; border-left: 3px solid #0d6efd; margin-bottom: 0.5rem; overflow-x: auto;">
                <strong>¿Cómo se hizo?</strong>
                <div>${p.como}</div>
            </div>
            <p style="font-size: 0.85rem; color: #64748b; margin: 0;"><strong>¿Por qué?</strong> ${p.porque}</p>
        </div>
    `).join('');

    // Re-renderizar símbolos matemáticos con KaTeX
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

// DIBUJO DEL PLANO CARTESIANO EN HTML5 CANVAS
function dibujarPlanoCartesiano(x1, y1, x2, y2, res) {
    const canvas = document.getElementById('planoCartesianoCanvas');
    if (!canvas) return;

    // Ajustar resolución del canvas al contenedor
    const rect = canvas.parentNode.getBoundingClientRect();
    canvas.width = rect.width || 400;
    canvas.height = 320;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Determinar límites del plano con margen
    const maxCoord = Math.max(Math.abs(x1), Math.abs(y1), Math.abs(x2), Math.abs(y2), 6) + 3;
    const scale = Math.min(width, height) / (maxCoord * 2);
    
    const cx = width / 2;
    const cy = height / 2;

    // Mapeo de coordenadas matemáticas a píxeles en Canvas
    const toPx = (x) => cx + (x * scale);
    const toPy = (y) => cy - (y * scale);

    // 1. Limpiar fondo
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // 2. Dibujar cuadrícula tenue
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;

    for (let x = -Math.floor(maxCoord); x <= Math.floor(maxCoord); x += 2) {
        ctx.beginPath();
        ctx.moveTo(toPx(x), 0);
        ctx.lineTo(toPx(x), height);
        ctx.stroke();
    }
    for (let y = -Math.floor(maxCoord); y <= Math.floor(maxCoord); y += 2) {
        ctx.beginPath();
        ctx.moveTo(0, toPy(y));
        ctx.lineTo(width, toPy(y));
        ctx.stroke();
    }

    // 3. Dibujar Ejes X e Y principales
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    // Eje X
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(width, cy); ctx.stroke();
    // Eje Y
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, height); ctx.stroke();

    // 4. Dibujar Triángulo de Pendiente (Δx, Δy)
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(toPx(x1), toPy(y1));
    ctx.lineTo(toPx(x2), toPy(y1)); // Base horizontal (Δx)
    ctx.lineTo(toPx(x2), toPy(y2)); // Altura vertical (Δy)
    ctx.stroke();
    ctx.setLineDash([]); // Restablecer línea sólida

    // 5. Trazar la Recta Principal
    ctx.strokeStyle = "#0d6efd";
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

    // 6. Dibujar la Ordenada al Origen (0, b) si aplica
    if (!res.esVertical && res.ordenadaOrigen !== "N/A") {
        const b = parseFloat(res.ordenadaOrigen);
        ctx.fillStyle = "#10b981";
        ctx.beginPath();
        ctx.arc(toPx(0), toPy(b), 6, 0, Math.PI * 2);
        ctx.fill();
    }

    // 7. Dibujar Puntos A y B
    // Punto A (Azul)
    ctx.fillStyle = "#084298";
    ctx.beginPath();
    ctx.arc(toPx(x1), toPy(y1), 7, 0, Math.PI * 2);
    ctx.fill();

    // Punto B (Rojo)
    ctx.fillStyle = "#dc3545";
    ctx.beginPath();
    ctx.arc(toPx(x2), toPy(y2), 7, 0, Math.PI * 2);
    ctx.fill();

    // Etiquetas de Texto
    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText(`A(${x1}, ${y1})`, toPx(x1) + 8, toPy(y1) - 8);
    ctx.fillText(`B(${x2}, ${y2})`, toPx(x2) + 8, toPy(y2) - 8);
}

// INICIALIZAR AUTOMÁTICAMENTE AL CARGAR LA PÁGINA
document.addEventListener("DOMContentLoaded", function() {
    setTimeout(calcularLaboratorio, 300);
});
