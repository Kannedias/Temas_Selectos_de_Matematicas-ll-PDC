/* ============================================================================
   ETIQUETA: GENERADOR DE RETOS Y EXÁMENES (MOTOR PSEUDOALEATORIO)
   ============================================================================ */

const GeneratorEngine = {
    // 1. Semilla Base del Motor
    semilla: 12345,

    // 2. Traductor de Matrícula a Semilla Numérica Única
    setSemilla: function(semillaTexto) {
        let hash = 0;
        for (let i = 0; i < semillaTexto.length; i++) {
            hash = semillaTexto.charCodeAt(i) + ((hash << 5) - hash);
        }
        this.semilla = Math.abs(hash);
    },

    // 3. Generador de Números Pseudoaleatorios (0 a 1)
    random: function() {
        let x = Math.sin(this.semilla++) * 10000;
        return x - Math.floor(x);
    },

    // 4. Generador de Rangos (Ej. -10 a 10)
    randomRango: function(min, max) {
        return Math.floor(this.random() * (max - min + 1)) + min;
    },

    // ============================================================================
    // ETIQUETA: LÓGICA DE CONSTRUCCIÓN DE NIVELES (NIVEL 1 Y 2)
    // ============================================================================
    /**
     * Genera un reto según el nivel seleccionado
     * @param {number} nivel - 1 (Directo) o 2 (Contexto)
     * @param {string} matricula - Matrícula del alumno como semilla
     */
    generarReto: function(nivel, matricula) {
        // Bloqueo de Semilla: Si el alumno ingresó matrícula, amarramos la semilla a su identidad
        if (matricula && matricula.trim() !== "") {
            this.setSemilla(matricula.trim() + "_Nivel_" + nivel);
        }

        // Generación de coordenadas base (-10 a 10)
        let x1 = this.randomRango(-10, 10);
        let y1 = this.randomRango(-10, 10);
        let x2 = this.randomRango(-10, 10);
        let y2 = this.randomRango(-10, 10);

        // Candado Matemático: Evitar que P1 y P2 sean exactamente el mismo punto
        if (x1 === x2 && y1 === y2) {
            x2 += 3;
            y2 += 2;
        }

        // Cálculo silencioso de la solución real usando tu MathEngine
        const solucion = MathEngine.calcularSecuenciaRecta(x1, y1, x2, y2);

        let narrativaHtml = "";
        const nivelInt = parseInt(nivel);

        // ============================================================================
        // ETIQUETA: MAQUETACIÓN VISUAL DE LOS NIVELES
        // ============================================================================
        if (nivelInt === 1) {
            // NIVEL 1: Destreza Numérica Directa (Puros Números)
            narrativaHtml = `
                <p style="margin: 0 0 10px 0; color: #166534; font-size: 1.05rem;">Calcula los parámetros matemáticos para la trayectoria delimitada por los siguientes puntos:</p>
                <div style="font-size: 1.3rem; text-align: center; padding: 15px; background: #ffffff; border-radius: 8px; border: 2px dashed #22c55e; margin-bottom: 15px; color: #004d40;">
                    <strong>Punto A(${x1}, ${y1})</strong> &nbsp;&nbsp;y&nbsp;&nbsp; <strong>Punto B(${x2}, ${y2})</strong>
                </div>
                <p style="margin: 0; font-size: 0.9rem; color: #15803d;">Completa los 7 campos de respuesta utilizando las fórmulas de la geometría analítica vectorial.</p>
            `;
        } 
        else if (nivelInt === 2) {
            // NIVEL 2: Contextualización y Problemas de Aplicación
            const contextos = [
                `Un <strong>dron de reconocimiento forestal</strong> despega desde su estación base ubicada en la coordenada <strong>A(${x1}, ${y1}) km</strong>. El sistema le ordena volar en línea recta para analizar un foco de calor detectado en <strong>B(${x2}, ${y2}) km</strong>.`,
                `Un <strong>brazo robótico industrial</strong> inicia su secuencia de soldadura anclado en el punto <strong>A(${x1}, ${y1}) cm</strong> y se desplaza rectilíneamente hasta finalizar su trazo en la placa base ubicada en <strong>B(${x2}, ${y2}) cm</strong>.`,
                `Un radar de puerto detecta un <strong>navío mercante</strong> en la posición <strong>A(${x1}, ${y1}) millas</strong> navegando con rumbo de colisión directo hacia la boya de contención en <strong>B(${x2}, ${y2}) millas</strong>.`
            ];
            
            // Elegimos la historia usando la semilla para que al mismo alumno le toque la misma historia
            const idxHistoria = this.randomRango(0, contextos.length - 1);
            const historiaSeleccionada = contextos[idxHistoria];
            
            narrativaHtml = `
                <p style="margin: 0 0 10px 0; color: #166534; font-size: 1.05rem;"><strong>Análisis de Caso (Contexto Real):</strong></p>
                <div style="font-size: 1.05rem; padding: 15px; background: #ffffff; border-radius: 8px; border: 2px dashed #22c55e; margin-bottom: 15px; color: #004d40; line-height: 1.6;">
                    ${historiaSeleccionada}
                </div>
                <p style="margin: 0; font-size: 0.9rem; color: #15803d;">Deduce las coordenadas de inicio y fin dentro de la lectura para determinar los 7 parámetros exactos de su trayectoria.</p>
            `;
        }

        // Retornamos el paquete completo de datos al archivo app.js
        return {
            nivel: nivelInt,
            puntos: { x1, y1, x2, y2 },
            planteamientoHTML: narrativaHtml,
            solucion: solucion
        };
    }
};

// Exponer globalmente el motor de Generación
window.GeneratorEngine = GeneratorEngine;
