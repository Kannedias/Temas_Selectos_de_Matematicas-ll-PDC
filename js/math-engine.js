/**
 * MOTOR MATEMÁTICO: LA RECTA EN 2D Y VECTORES
 * Unidad 1 - Temas Selectos de Matemáticas II
 */

const MathEngine = {
    calcularSecuenciaRecta: function(x1, y1, x2, y2) {
        // PASO 1 y 2
        const dx = x2 - x1;
        const dy = y2 - y1;
        const magnitud = Math.sqrt(dx * dx + dy * dy);

        // PASO 3
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

        // PASO 4
        const esVertical = dx === 0;
        const pendiente = esVertical ? null : dy / dx;

        // --- FORMATEADOR ALGEBRAICO INTELIGENTE ---
        // Elimina decimales .00 innecesarios
        const fmt = (num) => Number.isInteger(Number(num)) ? Number(num).toString() : Number(num).toFixed(2);

        let formaPuntoPendiente = "";
        let formaExplicita = "";
        let formaGeneral = "";
        let b = null;

        if (esVertical) {
            formaPuntoPendiente = `x = ${fmt(x1)}`;
            formaExplicita = `x = ${fmt(x1)}`;
            formaGeneral = x1 === 0 ? `x = 0` : `x ${x1 > 0 ? `- ${fmt(x1)}` : `+ ${fmt(Math.abs(x1))}`} = 0`;
        } else {
            b = y1 - (pendiente * x1);
            
            // PASO 5: Forma Punto-Pendiente ( y - y1 = m(x - x1) )
            const leftSide = y1 === 0 ? `y` : `y ${y1 > 0 ? `- ${fmt(y1)}` : `+ ${fmt(Math.abs(y1))}`}`;
            let rightSide = "";
            
            if (pendiente === 0) {
                rightSide = "0";
            } else {
                let mStr = "";
                if (pendiente === 1) mStr = "";       // Si m=1, se oculta
                else if (pendiente === -1) mStr = "-"; // Si m=-1, solo queda el signo menos
                else mStr = fmt(pendiente);
                
                const xTerm = x1 === 0 ? `x` : `(x ${x1 > 0 ? `- ${fmt(x1)}` : `+ ${fmt(Math.abs(x1))}`})`;
                rightSide = `${mStr}${xTerm}`;
            }
            formaPuntoPendiente = `${leftSide} = ${rightSide}`;

            // PASO 6: Forma Explícita ( y = mx + b )
            let termsExp = [];
            if (pendiente !== 0) {
                if (pendiente === 1) termsExp.push("x");
                else if (pendiente === -1) termsExp.push("-x");
                else termsExp.push(`${fmt(pendiente)}x`);
            }
            if (b !== 0) {
                if (termsExp.length === 0) termsExp.push(fmt(b));
                else termsExp.push(b > 0 ? `+ ${fmt(b)}` : `- ${fmt(Math.abs(b))}`);
            }
            if (termsExp.length === 0) termsExp.push("0");
            formaExplicita = `y = ${termsExp.join(" ")}`;

            // PASO 7: Forma General ( Ax + By + C = 0 )
            let termsGen = [];
            if (pendiente !== 0) {
                if (pendiente === 1) termsGen.push("x");
                else if (pendiente === -1) termsGen.push("-x");
                else termsGen.push(`${fmt(pendiente)}x`);
            }
            
            // Insertar "y" respetando el formato
            termsGen.push(termsGen.length === 0 ? "-y" : "- y");
            
            // Término independiente (C)
            if (b !== 0) {
                termsGen.push(b > 0 ? `+ ${fmt(b)}` : `- ${fmt(Math.abs(b))}`);
            }
            formaGeneral = `${termsGen.join(" ")} = 0`;
        }

        return {
            puntos: { x1, y1, x2, y2 },
            vector: { dx, dy },
            magnitud: fmt(magnitud),
            direccion: { grados: fmt(anguloGrados), cuadrante: cuadrante, anguloReferencia: fmt(anguloReferencia) },
            pendiente: esVertical ? "Indefinida" : fmt(pendiente),
            esVertical: esVertical,
            ordenadaOrigen: b !== null ? fmt(b) : "N/A",
            ecuaciones: { puntoPendiente: formaPuntoPendiente, explicita: formaExplicita, general: formaGeneral }
        };
    }
};
