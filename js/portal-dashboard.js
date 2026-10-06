/* =======================================================
   LÓGICA DE SESIÓN, DASHBOARD, GRÁFICAS Y ENVÍO A SHEETS
   ======================================================= */

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwqGwRD-LBjR5Pi9Gx-o1ucFh9osN7e6u9i9A5RiwtQUSuLZiLXnDUWF3FQ6MOypY1J/exec";
let miGrafica = null;

function iniciarSesion() {
    const matricula = document.getElementById('input-matricula').value.trim();
    const btnIngresar = document.querySelector('#vista-login button');

    if (matricula === "") {
        alert("⚠️ Por favor, ingresa tu matrícula para acceder.");
        return;
    }

    // LOGIN DE ADMINISTRADOR (DOCENTE)
    if (matricula === "ADMIN-JL") {
        document.getElementById('welcome-name').innerText = `👨‍🏫 Prof. Juan Luis`;
        document.getElementById('vista-login').classList.add('hidden');
        document.getElementById('vista-admin').classList.remove('hidden');
        document.getElementById('user-menu').classList.remove('hidden');
        return; 
    }

    btnIngresar.innerText = "⏳ Verificando matrícula...";
    btnIngresar.disabled = true;

    // LOGIN REAL CON GOOGLE SHEETS
    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ accion: "login", matricula: matricula })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "éxito") {
            // Cargar datos reales en la interfaz
            document.getElementById('welcome-name').innerText = `👤 Bienvenido, ${data.primerNombre}`;
            document.getElementById('lbl-nombre').innerText = data.nombreCompleto;
            document.getElementById('lbl-matricula').innerText = matricula;
            document.getElementById('lbl-grupo').innerText = `Grupo ${data.grupo}`;

            document.getElementById('vista-login').classList.add('hidden');
            document.getElementById('vista-dashboard').classList.remove('hidden');
            document.getElementById('user-menu').classList.remove('hidden');
            
            dibujarGrafica();
            consultarAvanceReal(matricula); // Llama a la validación de módulos

            // Persistencia local
            sessionStorage.setItem('matriculaActiva', matricula);
            sessionStorage.setItem('nombreActivo', data.nombreCompleto);
            sessionStorage.setItem('grupoActivo', data.grupo);
        } else {
            alert("❌ " + data.mensaje);
        }
    })
    .catch(error => {
        alert("⚠️ Error de conexión con la base de datos.");
        console.error(error);
    })
    .finally(() => {
        btnIngresar.innerText = "🚀 Ingresar al Portal";
        btnIngresar.disabled = false;
    });
}

function consultarAvanceReal(matricula) {
    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ accion: "consultar", matricula: matricula })
    })
    .then(response => response.json())
    .then(data => {
        const badge1_1 = document.getElementById('status-mod-1.1');
        if (!badge1_1) return;
        
        if (data.modulo1_1 === "Concluido") {
            badge1_1.className = "badge-status status-ok";
            badge1_1.innerHTML = "🟢 Concluido";
        } else {
            badge1_1.className = "badge-status status-pend";
            badge1_1.innerHTML = "🔴 Pendiente de Entrega";
        }
    });
}

function cerrarSesion() {
    sessionStorage.clear();
    document.getElementById('vista-dashboard').classList.add('hidden');
    
    const vistaAdmin = document.getElementById('vista-admin');
    if(vistaAdmin) vistaAdmin.classList.add('hidden');
    
    document.getElementById('user-menu').classList.add('hidden');
    document.getElementById('vista-login').classList.remove('hidden');
    document.getElementById('input-matricula').value = "";
    
    if(miGrafica !== null) { 
        miGrafica.destroy(); 
        miGrafica = null;
    }
}

function dibujarGrafica() {
    const canvas = document.getElementById('graficaParciales');
    if (!canvas) return; 

    const ctx = canvas.getContext('2d');
    if(miGrafica !== null) { miGrafica.destroy(); }

    miGrafica = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Parcial 1 (25%) - Aprobado', 'Parcial 2 (30%) - En Curso', 'Parcial 3 (45%) - Pendiente'],
            datasets: [{
                data: [25, 30, 45], 
                backgroundColor: ['#00806A', '#d97706', '#e2e8f0'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: { position: 'right' },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return ` ${context.label}: ${context.raw}% de la calificación final`;
                        }
                    }
                }
            }
        }
    });
}

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
    
    if (file.size > 5242880) {
        alert("⚠️ El archivo es demasiado pesado. Intenta subir una foto de menor calidad (máx 5MB).");
        return;
    }

    const btn = document.getElementById('btn-enviar');
    btn.innerText = "⏳ Subiendo evidencia, por favor espera...";
    btn.disabled = true;

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Data = e.target.result.split(',')[1];
        
        // PAQUETE CON LA ACCIÓN "SUBIR"
        const payload = {
            accion: "subir", 
            matricula: matricula,
            nombreArchivo: file.name,
            mimeType: file.type,
            archivoBase64: base64Data,
            grupo: grupo,
            nombre: nombre,
            actividad: actividad
        };

        fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            if(data.status === "éxito") {
                alert("✅ ¡Tu evidencia se ha enviado correctamente a revisión!");
                fileInput.value = ""; 
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
