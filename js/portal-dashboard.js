/* =======================================================
   LÓGICA DE SESIÓN, DASHBOARD, GRÁFICAS Y ENVÍO A SHEETS
   ======================================================= */

// URL Oficial de tu Google Apps Script
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxN6sq6jWResoXjgGZ7xwhivUGM6rqFJcwfEcfK4Eqnjx63XwrLNm07-A-lmAvql5yB/exec";

// Variable global para la gráfica de Chart.js
let miGrafica = null;

function iniciarSesion() {
    // Ya no buscamos el grupo en el HTML, solo la matrícula
    const matricula = document.getElementById('input-matricula').value.trim();

    if (matricula === "") {
        alert("⚠️ Por favor, ingresa tu matrícula para acceder.");
        return;
    }

    // ==========================================
    // SIMULACIÓN DE LECTURA DE GOOGLE SHEETS
    // ==========================================
    // Aquí el sistema asume que buscó en tu hoja y extrajo estos datos:
    const simulacionBaseDatos = {
        primerNombre: "Jesús Israel",
        nombreCompleto: "JESÚS ISRAEL ACEVEDO BRET",
        grupo: "505"
    };
    
    // Configurar Ficha de Identidad
    document.getElementById('welcome-name').innerText = `👤 Bienvenido, ${simulacionBaseDatos.primerNombre}`;
    document.getElementById('lbl-nombre').innerText = simulacionBaseDatos.nombreCompleto;
    document.getElementById('lbl-matricula').innerText = matricula;
    document.getElementById('lbl-grupo').innerText = `Grupo ${simulacionBaseDatos.grupo}`;

    // Transición de Vistas
    document.getElementById('vista-login').classList.add('hidden');
    document.getElementById('vista-dashboard').classList.remove('hidden');
    document.getElementById('user-menu').classList.remove('hidden');
    
    // Renderizar Gráfica de Avance (Cambio implementado)
    dibujarGrafica();

    // Persistencia local
    sessionStorage.setItem('matriculaActiva', matricula);
    sessionStorage.setItem('nombreActivo', simulacionBaseDatos.nombreCompleto);
    sessionStorage.setItem('grupoActivo', simulacionBaseDatos.grupo);
}

function cerrarSesion() {
    sessionStorage.clear();
    document.getElementById('vista-dashboard').classList.add('hidden');
    document.getElementById('user-menu').classList.add('hidden');
    document.getElementById('vista-login').classList.remove('hidden');
    document.getElementById('input-matricula').value = "";
    
    // Destruir la gráfica al salir para que no se duplique al volver a entrar
    if(miGrafica !== null) { 
        miGrafica.destroy(); 
        miGrafica = null;
    }
}

// NUEVA FUNCIÓN: Dibujar Gráfica de Parciales
function dibujarGrafica() {
    const canvas = document.getElementById('graficaParciales');
    if (!canvas) return; // Evita errores si el canvas no ha cargado

    const ctx = canvas.getContext('2d');
    
    // Evitar duplicados si se recarga la gráfica
    if(miGrafica !== null) { miGrafica.destroy(); }

    miGrafica = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Parcial 1 (Aprobado)', 'Parcial 2 (En Curso)', 'Parcial 3 (Pendiente)'],
            datasets: [{
                data: [35, 25, 40], // Ponderación de ejemplo
                backgroundColor: [
                    '#00806A', // Verde Conalep para completado
                    '#d97706', // Ámbar para en curso
                    '#e2e8f0'  // Gris para pendiente
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: { position: 'right' }
            }
        }
    });
}

// FUNCIÓN INTACTA: Subir foto a Drive y registrar en Sheets
function subirEvidencia() {
    const fileInput = document.getElementById('input-archivo');
    const actividad = document.getElementById('select-tarea').value;
    const matricula = sessionStorage.getItem('matriculaActiva');
    const grupo = sessionStorage.getItem('grupoActivo');
    const nombre = sessionStorage.getItem('nombreActivo');

    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        alert("⚠️ Por favor, selecciona una foto o archivo primero.");
        return;
    }

    const file = fileInput.files[0];
    
    // Limitar tamaño a 5MB aprox para evitar colapso de red
    if (file.size > 5242880) {
        alert("⚠️ El archivo es demasiado pesado. Intenta subir una foto de menor calidad (máx 5MB).");
        return;
    }

    const btn = document.getElementById('btn-enviar');
    btn.innerText = "⏳ Subiendo evidencia, por favor espera...";
    btn.disabled = true;

    const reader = new FileReader();
    reader.onload = function(e) {
        // Extraer solo la cadena base64 limpia
        const base64Data = e.target.result.split(',')[1];
        
        const payload = {
            matricula: matricula,
            nombreArchivo: file.name,
            mimeType: file.type,
            archivoBase64: base64Data,
            grupo: grupo,
            nombre: nombre,
            actividad: actividad
        };

        // Enviar datos al Google Apps Script
        fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            if(data.status === "éxito") {
                alert("✅ ¡Tu evidencia se ha enviado correctamente a revisión!");
                fileInput.value = ""; // Limpiar la casilla de archivo
            } else {
                alert("❌ Ocurrió un error en el servidor: " + data.mensaje);
            }
        })
        .catch(error => {
            alert("❌ Error de conexión. Revisa tu internet e intenta de nuevo.");
            console.error(error);
        })
        .finally(() => {
            btn.innerText = "📤 Enviar Evidencia a Revisión";
            btn.disabled = false;
        });
    };
    
    reader.readAsDataURL(file);
}

document.addEventListener("DOMContentLoaded", function() {
    if (sessionStorage.getItem('matriculaActiva')) {
        document.getElementById('input-matricula').value = sessionStorage.getItem('matriculaActiva');
        iniciarSesion(); 
    }

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
