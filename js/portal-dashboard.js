/* =======================================================
   LÓGICA DE SESIÓN, DASHBOARD Y ENVÍO A GOOGLE SHEETS
   ======================================================= */

// URL Oficial de tu Google Apps Script
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxN6sq6jWResoXjgGZ7xwhivUGM6rqFJcwfEcfK4Eqnjx63XwrLNm07-A-lmAvql5yB/exec";

function iniciarSesion() {
    const matricula = document.getElementById('input-matricula').value.trim();
    const grupo = document.getElementById('input-grupo').value;

    if (matricula === "") {
        alert("⚠️ Por favor, ingresa tu matrícula para acceder.");
        return;
    }

    const nombreSimulado = "Alumno Conalep"; 
    
    document.getElementById('welcome-name').innerText = `👤 Bienvenido, ${nombreSimulado}`;
    document.getElementById('lbl-nombre').innerText = `${nombreSimulado} (Matrícula: ${matricula})`;
    document.getElementById('lbl-grupo').innerText = `Grupo ${grupo}`;

    document.getElementById('vista-login').classList.add('hidden');
    document.getElementById('vista-dashboard').classList.remove('hidden');
    document.getElementById('user-menu').classList.remove('hidden');
    
    setTimeout(() => {
        document.getElementById('barra-avance').style.width = '50%';
        document.getElementById('lbl-porcentaje').innerText = '50%';
    }, 300);

    sessionStorage.setItem('matriculaActiva', matricula);
    sessionStorage.setItem('grupoActivo', grupo);
    sessionStorage.setItem('nombreActivo', nombreSimulado);
}

function cerrarSesion() {
    sessionStorage.clear();
    document.getElementById('vista-dashboard').classList.add('hidden');
    document.getElementById('user-menu').classList.add('hidden');
    document.getElementById('vista-login').classList.remove('hidden');
    document.getElementById('input-matricula').value = "";
    document.getElementById('barra-avance').style.width = '0%';
}

// NUEVA FUNCIÓN: Subir foto a Drive y registrar en Sheets
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
        document.getElementById('input-grupo').value = sessionStorage.getItem('grupoActivo');
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
