/**
 * MOTOR MATEMÁTICO: LA RECTA EN 2D Y VECTORES
 * Unidad 1 - Temas Selectos de Matemáticas II
 */

const MathEngine = {
    /**
     * Calcula la secuencia completa de 7 pasos a partir de dos puntos P1(x1, y1) y P2(x2, y2)
     */
    calcularSecuenciaRecta: function(x1, y1, x2, y2) {
        // PASO 1: Vector Desplazamiento (Δx, Δy)
        const dx = x2 - x1;
        const dy = y2 - y1;

        // PASO 2: Magnitud del Desplazamiento (|Δr|)
        const magnitud = Math.sqrt(dx * dx + dy * dy);

        // PASO 3: Dirección (θ) con ajuste estricto por cuadrante
        let anguloRadianes = Math.atan2(dy, dx);
        let anguloGrados = anguloRadianes * (180 / Math.PI);
        
        // Normalización del ángulo entre 0° y 360°
        if (anguloGrados < 0) {
            anguloGrados += 360;
        }

        // Determinación del cuadrante
        let cuadrante = "Primer Cuadrante";
        if (dx < 0 && dy >= 0) cuadrante = "Segundo Cuadrante";
        else if (dx < 0 && dy < 0) cuadrante = "Tercer Cuadrante";
        else if (dx > 0 && dy < 0) cuadrante = "Cuarto Cuadrante";
        else if (dx === 0 && dy !== 0) cuadrante = "Eje Vertical";
        else if (dy === 0 && dx !== 0) cuadrante = "Eje Horizontal";

        // NUEVO: Ángulo de Referencia (α) para el andamiaje pedagógico
        let anguloReferencia = 0;
        if (dx !== 0) {
            anguloReferencia = Math.abs(Math.atan(dy / dx) * (180 / Math.PI));
        } else if (dy !== 0) {
            anguloReferencia = 90;
        }

        // PASO 4: Pendiente (m)
        const esVertical = dx === 0;
        const pendiente = esVertical ? null : dy / dx;

        // PASO 5: Forma Punto-Pendiente [ y - y1 = m(x - x1) ]
        let formaPuntoPendiente = "";
        if (esVertical) {
            formaPuntoPendiente = `x = ${x1}`;
        } else {
            const signoY1 = y1 >= 0 ? `- ${y1}` : `+ ${Math.abs(y1)}`;
            const signoX1 = x1 >= 0 ? `- ${x1}` : `+ ${Math.abs(x1)}`;
            formaPuntoPendiente = `y ${signoY1} = ${pendiente.toFixed(2)}(x ${signoX1})`;
        }

        // PASO 6: Forma Explícita (Pendiente-Ordenada) [ y = mx + b ]
        let b = null;
        let formaExplicita = "";
        if (esVertical) {
            formaExplicita = `x = ${x1} \\text{ (Pendiente indefinida)}`;
        } else {
            b = y1 - (pendiente * x1);
            const signoB = b >= 0 ? `+ ${b.toFixed(2)}` : `- ${Math.abs(b).toFixed(2)}`;
            formaExplicita = `y = ${pendiente.toFixed(2)}x ${signoB}`;
        }

        // PASO 7: Forma General [ Ax + By + C = 0 ]
        let formaGeneral = "";
        if (esVertical) {
            formaGeneral = `x - ${x1} = 0`;
        } else {
            // Ax - y + (y1 - m*x1) = 0 => m*x - y + b = 0
            const A = pendiente;
            const B = -1;
            const C = b;
            const signoB = B >= 0 ? `+ ${B}` : `- ${Math.abs(B)}`;
            const signoC = C >= 0 ? `+ ${C.toFixed(2)}` : `- ${Math.abs(C).toFixed(2)}`;
            formaGeneral = `${A.toFixed(2)}x ${signoB}y ${signoC} = 0`;
        }

        return {
            puntos: { x1, y1, x2, y2 },
            vector: { dx, dy },
            magnitud: magnitud.toFixed(2),
            direccion: {
                grados: anguloGrados.toFixed(2),
                cuadrante: cuadrante,
                anguloReferencia: anguloReferencia.toFixed(2) // Dato necesario para la explicación pedagógica
            },
            pendiente: esVertical ? "Indefinida (Recta vertical)" : pendiente.toFixed(2),
            esVertical: esVertical,
            ordenadaOrigen: b !== null ? b.toFixed(2) : "N/A",
            ecuaciones: {
                puntoPendiente: formaPuntoPendiente,
                explicita: formaExplicita,
                general: formaGeneral
            }
        };
    }
};
