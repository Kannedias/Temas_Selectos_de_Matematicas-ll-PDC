// =======================================================
// BLOQUE 1: CONTROL DE NAVEGACIÓN POR PESTAÑAS
// =======================================================
function cambiarPestana(idPestana) {
    const contenidos = document.querySelectorAll('.tab-content');
    contenidos.forEach(content => content.classList.remove('active'));

    const botones = document.querySelectorAll('.nav-tab');
    botones.forEach(btn => btn.classList.remove('active'));

    const pestanaSeleccionada = document.getElementById('sec-' + idPestana);
    if (pestanaSeleccionada) pestanaSeleccionada.classList.add('active');

    const botonActivo = document.querySelector(`button[onclick="cambiarPestana('${idPestana}')"]`);
    if (botonActivo) botonActivo.classList.add('active');

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
        <div><strong>Punto A:</strong> $A(${x1}, ${y1})$</div>
        <div><strong>Punto B:</strong> $B(${x2}, ${y2})$</div>
        <div><strong>Pendiente ($m$):</strong> $${mTexto}$</div>
        <div><strong>Ordenada ($b$):</strong> $${bTexto}$</div>
        <div><strong>Ecuación:</strong> $${res.ecuaciones.explicita}$</div>
    `;
    if (window.renderMathInElement) renderMathInElement(bar, { delimiters: [{left: "$", right: "$", display: false}] });
}

// =======================================================
// BLOQUE 3: CONSTRUCTOR DE TARJETAS
// =======================================================
function renderizarTarjetasPasoAPasoBeta(res, x1, y1, x2, y2) {
    const container = document.getElementById('pasos-container');
    if (!container) return;
    const dx = x2 - x1;
    const dy = y2 - y1;

    // Aquí se inyectan dinámicamente las 7 tarjetas
    const tarjetasHTML = [
        `<div style="border:1px solid #ccc; padding:15px; border-radius:5px;">
            <h4>1. Vector Desplazamiento ($\\Delta \\vec{r}$)</h4>
            <p>$$\\Delta \\vec{r} = (${x2} - (${x1}), ${y2} - (${y1})) = (${dx}, ${dy})$$</p>
        </div>`,
        `<div style="border:1px solid #ccc; padding:15px; border-radius:5px;">
            <h4>2. Magnitud ($|\\Delta \\vec{r}|$)</h4>
            <p>$$|\\Delta \\vec{r}| = \\sqrt{(${dx})^2 + (${dy})^2} = ${res.magnitud}$$</p>
        </div>`,
        `<div style="border:1px solid #ccc; padding:15px; border-radius:5px;">
            <h4>3. Dirección ($\\theta$)</h4>
            <p>$$\\theta = ${res.direccion.grados}^\\circ \\text{ (${res.direccion.cuadrante})}$$</p>
        </div>`,
        `<div style="border:1px solid #ccc; padding:15px; border-radius:5px;">
            <h4>4. Pendiente ($m$)</h4>
            <p>$$m = ${res.pendiente}$$</p>
        </div>`,
        `<div style="border:1px solid #ccc; padding:15px; border-radius:5px;">
            <h4>5. Punto-Pendiente</h4>
            <p>$$${res.ecuaciones.puntoPendiente}$$</p>
        </div>`,
        `<div style="border:1px solid #ccc; padding:15px; border-radius:5px;">
            <h4>6. Forma Explícita</h4>
            <p>$$${res.ecuaciones.explicita}$$</p>
        </div>`,
        `<div style="border:1px solid #ccc; padding:15px; border-radius:5px;">
            <h4>7. Forma General</h4>
            <p>$$${res.ecuaciones.general}$$</p>
        </div>`
    ];

    container.innerHTML = tarjetasHTML.join('');
    if (window.renderMathInElement) renderMathInElement(container, { delimiters: [{left: "$$", right: "$$", display: true}, {left: "$", right: "$", display: false}], throwOnError: false });
}

// ==============================================
// BLOQUE 4: PLANO CARTESIANO EN CANVAS
// ==============================================
function dibujarPlanoCartesianoLimpio(x1, y1, x2, y2, res) {
    const canvas = document.getElementById('planoCartesianoCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.parentNode.getBoundingClientRect();
    canvas.width = rect.width || 600;
    canvas.height = rect.height || 380;
    
    const width = canvas.width, height = canvas.height;
    const maxCoord = Math.max(Math.abs(x1), Math.abs(y1), Math.abs(x2), Math.abs(y2), 5) + 3;
    const scale = Math.min(width, height) / (maxCoord * 2.2);
    const cx = width / 2, cy = height / 2;

    const toPx = (x) => cx + (x * scale);
    const toPy = (y) => cy - (y * scale);

    // Fondo y Cuadrícula
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#f1f5f9"; ctx.lineWidth = 1;
    for (let x = -Math.floor(maxCoord); x <= Math.floor(maxCoord); x++) { ctx.beginPath(); ctx.moveTo(toPx(x), 0); ctx.lineTo(toPx(x), height); ctx.stroke(); }
    for (let y = -Math.floor(maxCoord); y <= Math.floor(maxCoord); y++) { ctx.beginPath(); ctx.moveTo(0, toPy(y)); ctx.lineTo(width, toPy(y)); ctx.stroke(); }

    // Ejes
    ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(width, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, height); ctx.stroke();

    // Recta
    ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 3;
    ctx.beginPath();
    if (res.esVertical) {
        ctx.moveTo(toPx(x1), 0); ctx.lineTo(toPx(x1), height);
    } else {
        const m = parseFloat(res.pendiente), b = parseFloat(res.ordenadaOrigen);
        ctx.moveTo(toPx(-maxCoord*2), toPy(m * (-maxCoord*2) + b));
        ctx.lineTo(toPx(maxCoord*2), toPy(m * (maxCoord*2) + b));
    }
    ctx.stroke();

    // Puntos A y B
    if(document.getElementById('chk-puntos') && document.getElementById('chk-puntos').checked) {
        ctx.fillStyle = "#084298"; ctx.beginPath(); ctx.arc(toPx(x1), toPy(y1), 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#dc3545"; ctx.beginPath(); ctx.arc(toPx(x2), toPy(y2), 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#0f172a"; ctx.font = "bold 12px sans-serif";
        ctx.fillText(`A(${x1}, ${y1})`, toPx(x1) + 12, toPy(y1) - 8);
        ctx.fillText(`B(${x2}, ${y2})`, toPx(x2) + 12, toPy(y2) - 8);
    }
}

document.addEventListener("DOMContentLoaded", function() { setTimeout(calcularLaboratorio, 200); });
