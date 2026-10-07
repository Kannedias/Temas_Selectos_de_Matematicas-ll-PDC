/* =======================================================
   LÓGICA DE SESIÓN, DASHBOARD, GRÁFICAS Y ENVÍO A SHEETS
   ======================================================= */

// ⚠️ PON AQUÍ TU ENLACE PÚBLICO ACTUAL DE APPS SCRIPT:
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw4vKVk46mYFIe-GEs6dbN249ElK2lIdgNENe8D9AsS8_pO6YT8YDmZPxl8x_7zj81z3g/exec"; 

let miGrafica = null;
let datosDesgloseParciales = []; 

function iniciarSesion() {
    const matricula = document.getElementById('input-matricula').value.trim();
    const btnIngresar = document.getElementById('btn-ingresar');

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

    if (btnIngresar) {
        btnIngresar.innerText = "⏳ Verificando matrícula...";
        btnIngresar.disabled = true;
    }

    // LOGIN REAL CON GOOGLE SHEETS
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
            alert("❌ " + data.mensaje);
        }
    })
    .catch(error => {
        alert("⚠️ Error de conexión con la base de datos.");
        console.error(error);
    })
    .finally(() => {
        if (btnIngresar) {
            btnIngresar.innerText = "🚀 Ingresar al Portal";
            btnIngresar.disabled = false;
        }
    });
}

function consultarAvanceReal(matricula) {
    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ accion: "consultar", matricula: matricula })
    })
    .then(response => response.json())
    .then(data => {
        // Estatus del Módulo 1.1
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

        // Llenar Historial de Evidencias
        const tablaHistorial = document.getElementById('tabla-historial');
        if (tablaHistorial && data.historial) {
            tablaHistorial.innerHTML = "";
            if (data.historial.length === 0) {
                tablaHistorial.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No hay entregas registradas.</td></tr>`;
            } else {
                data.historial.forEach(item => {
                   let estadoEmoji = item.estado.toLowerCase().includes("revisad") ? "✅" : "⏳";
                   let row = `<tr>
                      <td style="font-size: 0.9rem; font-weight: 500;">${item.actividad}</td>
                      <td style="font-size: 0.85rem; color: var(--text-muted);">${item.fecha}</td>
                      <td><span class="badge-status ${item.estado.toLowerCase().includes("revisad") ? 'status-ok' : 'status-pend'}">${estadoEmoji} ${item.estado}</span></td>
                      <td style="text-align: center;"><strong>${item.nota}</strong></td>
                  </tr>`;
               tbodyHistorial.innerHTML += row;
                });
            }
        }

        // Llenar Select del Catálogo de Tareas
        const selectTarea = document.getElementById('select-tarea');
        if (selectTarea && data.catalogo) {
            selectTarea.innerHTML = `<option value="">-- Selecciona una actividad --</option>`;
            data.catalogo.forEach(tarea => {
                let option = document.createElement('option');
                option.value = tarea.id + " - " + tarea.titulo; 
                option.text = tarea.id + " | " + tarea.titulo;
                selectTarea.appendChild(option);
            });
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
    const actividadCompleta = document.getElementById('select-tarea').value;
    const matricula = sessionStorage.getItem('matriculaActiva');
    const grupo = sessionStorage.getItem('grupoActivo');
    const nombre = sessionStorage.getItem('nombreActivo');

   // ==========================================
    // 1. NUEVO CANDADO: OBLIGAR A SELECCIONAR TAREA
    // ==========================================
    if (!actividadCompleta || actividadCompleta.includes("--") || actividadCompleta === "") {
        alert("⚠️ Por favor, selecciona la tarea o evidencia a la que corresponden los archivos.");
        return; // Detiene la subida hasta que elija una opción válida
    }

    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        alert("⚠️ Por favor, selecciona al menos un archivo.");
        return;
    }

    // Límite de peso total para evitar que saturen la red (aprox 15MB en total)
    let pesoTotal = 0;
    for (let i = 0; i < fileInput.files.length; i++) {
        pesoTotal += fileInput.files[i].size;
    }
    if (pesoTotal > 15728640) {
        alert("⚠️ El peso total de los archivos es muy alto (Máx 15MB). Intenta usar fotos de menor resolución o enviar en bloques.");
        return;
    }

    const btn = document.getElementById('btn-enviar');
    btn.innerText = "⏳ Procesando archivos..."; 
    btn.disabled = true;

    // Extraemos solo el ID de la tarea (Ej: "EV01" en lugar de "EV01 - Título completo")
    const idTarea = actividadCompleta.split(" - ")[0];

    // Leer todos los archivos seleccionados de forma simultánea
    const promesas = Array.from(fileInput.files).map(file => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => {
                resolve({
                    nombreOriginal: file.name,
                    mimeType: file.type,
                    base64: e.target.result.split(',')[1]
                });
            };
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    });

    // Cuando todos los archivos se terminen de leer, los enviamos a Sheets
    Promise.all(promesas).then(archivosProcesados => {
        btn.innerText = "⏳ Subiendo a tu Drive...";
        
        const payload = {
            accion: "subir_multiples", 
            matricula: matricula,
            grupo: grupo,
            nombre: nombre,
            actividad: actividadCompleta,
            idTarea: idTarea,
            archivos: archivosProcesados
        };

        fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            if(data.status === "éxito") {
                alert(`✅ ¡Tus ${archivosProcesados.length} archivos se enviaron correctamente a revisión!`);
                fileInput.value = ""; 
                consultarAvanceReal(matricula); // Recarga la tabla de historial automáticamente
            } else { 
                alert("❌ Ocurrió un error en el servidor: " + data.mensaje); 
            }
        })
        .finally(() => {
            btn.innerText = "📤 Enviar Evidencia a Revisión";
            btn.disabled = false;
        });
    }).catch(error => {
        alert("⚠️ Ocurrió un error al leer las fotos de tu dispositivo.");
        btn.innerText = "📤 Enviar Evidencia a Revisión";
        btn.disabled = false;
    });
}

function publicarTareaDocente() {
    const idTarea = document.getElementById('admin-id').value.trim();
    const unidad = document.getElementById('admin-mod').value.trim();
    const titulo = document.getElementById('admin-titulo').value.trim();
    const desc = document.getElementById('admin-desc').value.trim();
    const fecha = document.getElementById('admin-fecha').value;
    const puntos = document.getElementById('admin-puntos').value;

    if (!idTarea || !unidad || !titulo) {
        alert("⚠️ Por favor, completa al menos el ID, Módulo y Título de la tarea.");
        return;
    }

    const btn = document.getElementById('btn-publicar');
    btn.innerText = "⏳ Publicando en Sheets...";
    btn.disabled = true;

    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
            accion: "nueva_tarea", idTarea: idTarea, unidad: unidad,
            titulo: titulo, desc: desc, fecha: fecha, puntos: puntos
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "éxito") {
            alert("✅ ¡Tarea publicada con éxito! Los alumnos ya la pueden ver.");
            document.querySelectorAll('#form-nueva-tarea input, #form-nueva-tarea textarea').forEach(el => el.value = '');
            document.getElementById('form-nueva-tarea').classList.add('hidden');
        } else {
            alert("❌ Error al publicar: " + data.mensaje);
        }
    })
    .finally(() => {
        btn.innerText = "🚀 Publicar en el Portal";
        btn.disabled = false;
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
