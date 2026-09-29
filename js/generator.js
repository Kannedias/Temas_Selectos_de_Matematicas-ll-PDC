/**
 * GENERADOR DE RETOS Y EXÁMENES POR NIVELES
 * Generación pseudoaleatoria basada en matrícula / semilla
 */

const GeneratorEngine = {
    // Generador PRNG (Pseudo-Random Number Generator) basado en Semilla
    semilla: 12345,

    setSemilla: function(semillaTexto) {
        let hash = 0;
        for (let i = 0; i < semillaTexto.length; i++) {
            hash = semillaTexto.charCodeAt(i) + ((hash << 5) - hash);
        }
        this.semilla = Math.abs(hash);
    },

    random: function() {
        let x = Math.sin(this.semilla++) * 10000;
        return x - Math.floor(x);
    },

    randomRango: function(min, max) {
        return Math.floor(this.random() * (max - min + 1)) + min;
    },

    /**
     * Genera un reto según el nivel seleccionado
     * @param {number} nivel - 1, 2 o 3
     * @param {string} matricula - Matrícula del alumno como semilla
     */
    generarReto: function(nivel, matricula) {
        if (matricula && matricula.trim() !== "") {
            this.setSemilla(matricula.trim() + "_Nivel_" + nivel);
        }

        let x1 = this.randomRango(-8, 8);
        let y1 = this.randomRango(-8, 8);
        let x2 = this.randomRango(-8, 8);
        let y2 = this.randomRango(-8, 8);

        // Evitar que P1 y P2 sean el mismo punto
        if (x1 === x2 && y1 === y2) {
            x2 += 3;
            y2 += 2;
        }

        // Calcular solución completa usando el motor matemático
        const solucion = MathEngine.calcularSecuenciaRecta(x1, y1, x2, y2);

        let narrativa = "";
        let pregunta = "";

        if (nivel === 1) {
            narrativa = `Calcula la secuencia matemática completa de 7 pasos para los puntos dados.`;
            pregunta = `Dado $P_1(${x1}, ${y1})$ y $P_2(${x2}, ${y2})$, determina la pendiente $m$, la dirección $\\theta$ y la ecuación general.`;
        } else if (nivel === 2) {
            const contextos = [
                `Un dron despega desde la estación base en $A(${x1}, ${y1})$ y vuela en línea recta hasta la torre de transmisión en $B(${x2}, ${y2})$.`,
                `Un vehículo autónomo se desplaza en una ruta plana desde el sensor $P_1(${x1}, ${y1})$ hasta el objetivo $P_2(${x2}, ${y2})$.`,
                `Una tubería industrial de transporte conecta el contenedor $A(${x1}, ${y1})$ con la válvula de alivio $B(${x2}, ${y2})$.`
            ];
            const idx = this.randomRango(0, contextos.length - 1);
            narrativa = contextos[idx];
            pregunta = `Determina el vector desplazamiento $\\Delta \\vec{r}$, la magnitud $|\Delta \\vec{r}|$ del recorrido y la inclinación $m$ de la ruta.`;
        } else if (nivel === 3) {
            narrativa = `En un proyecto de infraestructura urbana, una rampa de acceso inicia en $P_1(${x1}, ${y1})$ y requiere mantener una pendiente constante hasta conectar con la estructura superior en $P_2(${x2}, ${y2})$.`;
            pregunta = `Obtén la ecuación explícita $y = mx + b$ de la rampa y calcula el ángulo de inclinación $\\theta$ con corrección de cuadrante.`;
        }

        return {
            nivel: nivel,
            puntos: { x1, y1, x2, y2 },
            narrativa: narrativa,
            pregunta: pregunta,
            solucion: solucion
        };
    }
};
