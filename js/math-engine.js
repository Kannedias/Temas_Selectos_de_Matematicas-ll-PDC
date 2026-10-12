const MathEngine = {
    calcularSecuenciaRecta: function(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const magnitud = Math.sqrt(dx * dx + dy * dy);

        let anguloRadianes = Math.atan2(dy, dx);
        let anguloGrados = anguloRadianes * (180 / Math.PI);
        if (anguloGrados < 0) anguloGrados += 360;

        let cuadrante = "Primer Cuadrante";
        if (dx < 0 && dy >= 0) cuadrante = "Segundo Cuadrante";
        else if (dx < 0 && dy < 0) cuadrante = "Tercer Cuadrante";
        else if (dx > 0 && dy < 0) cuadrante = "Cuarto Cuadrante";
        else if (dx === 0 && dy !== 0) cuadrante = "Eje Vertical";
        else if (dy === 0 && dx !== 0) cuadrante = "Eje Horizontal";

        let anguloReferencia = 0;
        if (dx !== 0) anguloReferencia = Math.abs(Math.atan(dy / dx) * (180 / Math.PI));
        else if (dy !== 0) anguloReferencia = 90;

        const esVertical = dx === 0;
        const pendiente = esVertical ? null : dy / dx;

        let formaPuntoPendiente = esVertical ? `x = ${x1}` : `y ${y1 >= 0 ? `- ${y1}` : `+ ${Math.abs(y1)}`} = ${pendiente.toFixed(2)}(x ${x1 >= 0 ? `- ${x1}` : `+ ${Math.abs(x1)}`})`;
        let b = esVertical ? null : y1 - (pendiente * x1);
        let formaExplicita = esVertical ? `x = ${x1}` : `y = ${pendiente.toFixed(2)}x ${b >= 0 ? `+ ${b.toFixed(2)}` : `- ${Math.abs(b).toFixed(2)}`}`;
        
        let formaGeneral = "";
        if (esVertical) {
            formaGeneral = `x - ${x1} = 0`;
        } else {
            const B = -1;
            formaGeneral = `${pendiente.toFixed(2)}x ${B >= 0 ? `+ ${B}` : `- ${Math.abs(B)}`}y ${b >= 0 ? `+ ${b.toFixed(2)}` : `- ${Math.abs(b).toFixed(2)}`} = 0`;
        }

        return {
            puntos: { x1, y1, x2, y2 },
            vector: { dx, dy },
            magnitud: magnitud.toFixed(2),
            direccion: { grados: anguloGrados.toFixed(2), cuadrante: cuadrante, anguloReferencia: anguloReferencia.toFixed(2) },
            pendiente: esVertical ? "Indefinida" : pendiente.toFixed(2),
            esVertical: esVertical,
            ordenadaOrigen: b !== null ? b.toFixed(2) : "N/A",
            ecuaciones: { puntoPendiente: formaPuntoPendiente, explicita: formaExplicita, general: formaGeneral }
        };
    }
};
