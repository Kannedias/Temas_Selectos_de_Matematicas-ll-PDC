/* =======================================================
   LÓGICA DE SESIÓN, DASHBOARD, GRÁFICAS Y ENVÍO A SHEETS
   ======================================================= */

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyFXrNOStpu2hCVI5R6S534zS4Jt8hDoQ11zvQ74uf8kt338E8naY8HXD2yZiS7r5MLlw/exec"; // Asegúrate de colocar tu URL real
let miGrafica = null;
let datosDesgloseParciales = []; 

function iniciarSesion() {
    const matricula = document.getElementById('input-matricula').value.trim();
    const btnIngresar = document.querySelector('#vista-login button');

    if (matricula === "") {
        alert("⚠️ Por favor, ingresa tu matrícula para acceder.");
        return;
    }

    if (matricula === "ADMIN-JL") {
        document.getElementById('welcome-name').innerText = `👨‍🏫 Prof. Juan Luis`;
        document.getElementById('vista-login').classList.add('hidden');
        document.getElementById('vista-admin').classList.remove('hidden');
        document.getElementById('user-menu').classList.remove('hidden');
        return; 
    }

    btnIngresar.innerText = "⏳ Verificando matrícula...";
    btnIngresar.disabled = true;

    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ accion: "login", matricula: matricula })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "éxito") {
            document.getElementById('welcome-name').innerText = `👤 Bienvenido, ${data.primerNombre}`;
            document.getElementById('lbl-nombre').innerText = data.nombreCompleto;
            document.getElementById('lbl-matricula').innerText = matricula;
            document.getElementById('lbl-grupo').innerText = `Grupo ${data.grupo}`;
            
            // Carga la foto si existe en Sheets
            if(data.fotoPerfilUrl) {
                document.getElementById('img-perfil').src = data.fotoPerfilUrl;
            } else {
                document.getElementById('img-perfil').src = "assets/placeholder-avatar.png";
            }

            document.getElementById('vista-login').classList.add('hidden');
            document.getElementById('vista-dashboard').classList.remove('hidden');
            document.getElementById('user-menu').classList.remove('hidden');
            
            consultarAvanceReal(matricula); 

            sessionStorage.setItem('matriculaActiva', matricula);
            sessionStorage.setItem('nombreActivo', data.nombreCompleto);
            sessionStorage.setItem('grupoActivo', data.grupo);
            sessionStorage.setItem('fotoUrlActiva', data.fotoPerfilUrl || "");
       } else {
            // Esto obliga a la página a mostrar qué está leyendo Google Sheets realmente
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
        // Estatus del Módulo
        const badge1_1 = document.getElementById('status-mod-1.1');
        if (badge1_1) {
            if (data.modulo1_1 === "Concluido") {
                badge1_1.className = "badge-status status-ok";
                badge1_1.innerHTML = "🟢 Concluido";
            } else {
                badge1_1.className = "badge-status status-pend";
                badge1_1.innerHTML = "🔴 Pendiente de Entrega";
            }
        }
        
        // Cargar Parciales Reales y Dibujar Gráfica
        if(data.parciales) {
            datosDesgloseParciales = data.parciales;
            dibujarGrafica();
        }
    });
}

function dibujarGrafica() {
    const canvas = document.getElementById('graficaParciales');
    if (!canvas) return; 

    const ctx = canvas.getContext('2d');
    if(miGrafica !== null) { miGrafica.destroy(); }

    const puntajes = datosDesgloseParciales.map(p => p.total || 0);

    miGrafica = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Parcial 1', 'Parcial 2', 'Parcial 3'],
            datasets: [{
                data: puntajes, 
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
                legend: { position: 'right' }
            },
            onClick: (e, activeElements) => {
                if (activeElements.length > 0) {
                    const idx = activeElements[0].index;
                    mostrarDesglose(idx);
                }
            }
        }
    });
}

// Activa el recuadro de desglose al hacer clic en la rebanada
function mostrarDesglose(indice) {
    const desglose = datosDesgloseParciales[indice];
    const contenedor = document.getElementById('desglose-calificacion');
    
    if(!contenedor) return;

    document.getElementById('titulo-desglose').innerText = `Desglose ${desglose.titulo} (${desglose.total}/100)`;
    document.getElementById('val-tareas').innerText = desglose.tareas;
    document.getElementById('val-part').innerText = desglose.part;
    document.getElementById('val-asist').innerText = desglose.asist;
    document.getElementById('val-exam').innerText = desglose.exam;
    
    contenedor.style.display = 'block';
}

function subirFotoPerfil() {
    const fileInput = document.getElementById('input-foto-perfil');
    if (!fileInput.files.length) return;
    
    const file = fileInput.files[0];
    const matricula = sessionStorage.getItem('matriculaActiva');
    const grupo = sessionStorage.getItem('grupoActivo');
    const txtEstado = document.getElementById('txt-subiendo-foto');
    
    txtEstado.style.display = 'block';
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Data = e.target.result.split(',')[1];
        const payload = { 
            accion: "subir_foto_perfil", 
            matricula: matricula, 
            grupo: grupo,
            nombreArchivo: "Perfil_" + matricula + "_" + file.name, 
            mimeType: file.type, 
            archivoBase64: base64Data 
        };

        fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify(payload) })
        .then(response => response.json())
        .then(data => {
            if(data.status === "éxito") { 
                document.getElementById('img-perfil').src = data.url; 
                sessionStorage.setItem('fotoUrlActiva', data.url);
                alert("✅ Foto de perfil guardada exitosamente.");
            } else {
                alert("❌ Error: " + data.mensaje);
            }
        })
        .finally(() => { txtEstado.style.display = 'none'; });
    };
    reader.readAsDataURL(file);
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
    btn.innerText = "⏳ Subiendo..."; btn.disabled = true;

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Data = e.target.result.split(',')[1];
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
            } else { alert("❌ Ocurrió un error en el servidor: " + data.mensaje); }
        })
        .finally(() => {
            btn.innerText = "📤 Enviar Evidencia a Revisión";
            btn.disabled = false;
        });
    };
    reader.readAsDataURL(file);
}

function cerrarSesion() {
    sessionStorage.clear();
    document.getElementById('vista-dashboard').classList.add('hidden');
    
    const vistaAdmin = document.getElementById('vista-admin');
    if(vistaAdmin) vistaAdmin.classList.add('hidden');
    
    document.getElementById('user-menu').classList.add('hidden');
    document.getElementById('vista-login').classList.remove('hidden');
    document.getElementById('input-matricula').value = "";
    document.getElementById('desglose-calificacion').style.display = 'none';
    
    if(miGrafica !== null) { 
        miGrafica.destroy(); 
        miGrafica = null;
    }
}

document.addEventListener("DOMContentLoaded", function() {
    if (sessionStorage.getItem('matriculaActiva')) {
        document.getElementById('input-matricula').value = sessionStorage.getItem('matriculaActiva');
        iniciarSesion(); 
    }
});
