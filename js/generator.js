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
