// ==============================================
// BLOQUE 4: DIBUJO DEL PLANO CARTESIANO EN CANVAS
// ==============================================
function dibujarPlanoCartesianoLimpio(x1, y1, x2, y2, res) {
    const canvas = document.getElementById('planoCartesianoCanvas');
    if (!canvas) return;

    // 1. Leer estado de los checkboxes de capas
    const mostrarPuntos = document.getElementById('chk-puntos') ? document.getElementById('chk-puntos').checked : true;
    const mostrarTriangulo = document.getElementById('chk-triangulo') ? document.getElementById('chk-triangulo').checked : true;
    const mostrarMagnitud = document.getElementById('chk-magnitud') ? document.getElementById('chk-magnitud').checked : true;
    const mostrarAngulo = document.getElementById('chk-angulo') ? document.getElementById('chk-angulo').checked : true;
    const mostrarPendiente = document.getElementById('chk-pendiente') ? document.getElementById('chk-pendiente').checked : true;
    const mostrarOrdenada = document.getElementById('chk-ordenada') ? document.getElementById('chk-ordenada').checked : true;

    // 2. Ajuste dinámico del tamaño
    const rect = canvas.parentNode.getBoundingClientRect();
    canvas.width = rect.width || 600;
    canvas.height = 340;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Escalado para que los puntos siempre quepan en la pantalla
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

    // ----------------------------------------------------
    // INICIO DE RENDERIZADO POR CAPAS (SEGÚN CHECKBOXES)
    // ----------------------------------------------------

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
