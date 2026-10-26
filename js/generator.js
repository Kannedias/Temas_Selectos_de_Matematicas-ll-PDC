const GeneratorEngine = {
    semilla: 12345,
    setSemilla: function(semillaTexto) {
        let hash = 0;
        for (let i = 0; i < semillaTexto.length; i++) hash = semillaTexto.charCodeAt(i) + ((hash << 5) - hash);
        this.semilla = Math.abs(hash);
    },
    random: function() {
        let x = Math.sin(this.semilla++) * 10000;
        return x - Math.floor(x);
    },
    randomRango: function(min, max) {
        return Math.floor(this.random() * (max - min + 1)) + min;
    },
    generarReto: function(nivel, matricula) {
        if (matricula && matricula.trim() !== "") this.setSemilla(matricula.trim() + "_Nivel_" + nivel);
        let x1 = this.randomRango(-8, 8), y1 = this.randomRango(-8, 8);
        let x2 = this.randomRango(-8, 8), y2 = this.randomRango(-8, 8);
        if (x1 === x2 && y1 === y2) { x2 += 3; y2 += 2; }

        const solucion = MathEngine.calcularSecuenciaRecta(x1, y1, x2, y2);
        let narrativa = nivel === 1 ? `Calcula la secuencia de 7 pasos.` : `Contexto nivel ${nivel}...`;
        let pregunta = `Dado P1(${x1}, ${y1}) y P2(${x2}, ${y2}), determina la ecuación.`;

        return { nivel: nivel, puntos: { x1, y1, x2, y2 }, narrativa: narrativa, pregunta: pregunta, solucion: solucion };
    }
};

// ============================================================================
// MOTOR DE GENERACIÓN DINÁMICA DE RETOS (js/generator.js)
// ============================================================================

const GeneradorRetos = {
    // Almacena los puntos del reto activo para que el validador pueda leerlos
    puntosActuales: { x1: 0, y1: 0, x2: 0, y2: 0 },

    // Generador de números enteros aleatorios en un rango (ej. -10 a 10)
    obtenerEnteroAleatorio: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Función Principal de Generación
    generarProblema: function(nivel) {
        let x1 = this.obtenerEnteroAleatorio(-10, 10);
        let y1 = this.obtenerEnteroAleatorio(-10, 10);
        let x2 = this.obtenerEnteroAleatorio(-10, 10);
        let y2 = this.obtenerEnteroAleatorio(-10, 10);

        // Candado matemático: Evitar que A y B sean exactamente el mismo punto
        while (x1 === x2 && y1 === y2) {
            x2 = this.obtenerEnteroAleatorio(-10, 10);
            y2 = this.obtenerEnteroAleatorio(-10, 10);
        }

        // Guardamos los puntos en memoria para poder calificarlos después
        this.puntosActuales = { x1, y1, x2, y2 };

        let textoHtml = "";
        const nivelInt = parseInt(nivel);

        if (nivelInt === 1) {
            // NIVEL 1: Puros Números sin distracciones
            textoHtml = `
                <p style="margin: 0 0 10px 0; color: #166534;">Calcula los parámetros matemáticos para la trayectoria delimitada por los siguientes puntos:</p>
                <div style="font-size: 1.25rem; text-align: center; padding: 12px; background: #ffffff; border-radius: 6px; border: 1px dashed #22c55e; margin-bottom: 10px; color: #1e293b;">
                    <strong>Punto A(${x1}, ${y1})</strong> &nbsp;&nbsp;y&nbsp;&nbsp; <strong>Punto B(${x2}, ${y2})</strong>
                </div>
                <p style="margin: 0; font-size: 0.9rem; color: #15803d;">Completa los campos que desees utilizando las fórmulas correspondientes. Puedes hacer los 7 pasos o solo algunos.</p>
            `;
        } else if (nivelInt === 2) {
            // NIVEL 2: Contextos Breves y Aleatorios
            const contextos = [
                `Un <strong>dron de vigilancia</strong> despega desde la base ubicada en la coordenada <strong>A(${x1}, ${y1})</strong> y vuela en línea recta para interceptar un objetivo en la coordenada <strong>B(${x2}, ${y2})</strong>.`,
                `Un <strong>brazo robótico industrial</strong> inicia su soldadura en el punto de anclaje <strong>A(${x1}, ${y1})</strong> y se desplaza rectilíneamente hasta finalizar en el punto <strong>B(${x2}, ${y2})</strong>.`,
                `Un radar detecta un <strong>navío de carga</strong> en la posición <strong>A(${x1}, ${y1})</strong> navegando con rumbo lineal fijo hacia el puerto de descarga ubicado en <strong>B(${x2}, ${y2})</strong>.`
            ];
            
            const historiaAleatoria = contextos[this.obtenerEnteroAleatorio(0, contextos.length - 1)];
            
            textoHtml = `
                <p style="margin: 0 0 10px 0; color: #166534;"><strong>Análisis de Caso:</strong></p>
                <div style="font-size: 1.05rem; padding: 12px; background: #ffffff; border-radius: 6px; border: 1px dashed #22c55e; margin-bottom: 10px; color: #1e293b;">
                    ${historiaAleatoria}
                </div>
                <p style="margin: 0; font-size: 0.9rem; color: #15803d;">Deduce las coordenadas de inicio y fin para determinar los parámetros exactos de su trayectoria.</p>
            `;
        }

        return {
            x1, y1, x2, y2,
            textoHtml
        };
    }
};

// Exponer globalmente para que app.js pueda usarlo
window.GeneradorRetos = GeneradorRetos;
