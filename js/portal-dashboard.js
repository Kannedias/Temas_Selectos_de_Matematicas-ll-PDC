// =======================================================
// URL DE TU BACKEND EN GOOGLE APPS SCRIPT (SICAL)
// =======================================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyCMQODKXv1yJ3Muqisn2udm5BrbXyWUKEBQjY4WMDxEvl-5R541NGO4oftXTuQ6SuP0A/exec"; 

let miGrafica = null;
let grupoSeleccionadoAdmin = null;

// ==========================================
// 1. LÓGICA DE INICIO DE SESIÓN
// ==========================================
window.iniciarSesion = function() {
    const matricula = document.getElementById('input-matricula').value.trim();

    if (matricula === "") {
        alert("⚠️ Por favor, ingresa tu matrícula para acceder.");
        return;
    }

    // ==========================================
    // 🔑 ATAJO VIP PARA EL PANEL DOCENTE
    // ==========================================
    if (matricula.toUpperCase() === "ADMIN-JL") {
        document.getElementById('vista-login').classList.add('hidden');
        document.getElementById('vista-admin').classList.remove('hidden');
        const userMenu = document.getElementById('user-menu');
        if (userMenu) userMenu.classList.remove('hidden');
        
        const welcome = document.getElementById('welcome-name');
        if (welcome) welcome.innerText = "👨‍🏫 Bienvenido, Prof. Juan Luis";

        // ¡Disparo automático del Motor de Mis Grupos!
        window.cargarModuloMisGrupos("TODOS");
        return; 
    }

    // ==========================================
    // FLUJO NORMAL PARA ALUMNOS
    // ==========================================
    const btnIngresar = document.querySelector('#vista-login button') || document.getElementById('btn-ingresar');
    if (btnIngresar) {
        btnIngresar.innerText = "⏳ Consultando...";
        btnIngresar.disabled = true;
    }

    // Llamamos al backend para el LOGIN real
    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ accion: "login", matricula: matricula })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "éxito") {
            // Llenamos los datos del alumno
            document.getElementById('welcome-name').innerText = `👤 Bienvenido, ${data.primerNombre}`;
            document.getElementById('lbl-nombre').innerText = `${data.nombreCompleto}`;
            
            const lblMatricula = document.getElementById('lbl-matricula');
            if(lblMatricula) lblMatricula.innerText = matricula;
            
            const lblGrupo = document.getElementById('lbl-grupo');
            if(lblGrupo) lblGrupo.innerText = `Grupo ${data.grupo}`;

            // ✨ LA MAGIA: ENCENDEMOS LA FOTO Y APAGAMOS EL EMOJI ✨
            const imgPerfil = document.getElementById('img-perfil');
            const emojiCamara = document.getElementById('emoji-camara');
            
            if (data.fotoPerfilUrl && data.fotoPerfilUrl !== "") {
                if(imgPerfil) {
                    imgPerfil.src = data.fotoPerfilUrl;
                    imgPerfil.style.display = 'block';
                }
                if(emojiCamara) emojiCamara.style.display = 'none';
            }

            // Guardamos en memoria
            sessionStorage.setItem('matriculaActiva', matricula);
            sessionStorage.setItem('grupoActivo', data.grupo);
            sessionStorage.setItem('nombreActivo', data.nombreCompleto);

            // Cambiamos de pantalla
            document.getElementById('vista-login').classList.add('hidden');
            document.getElementById('vista-dashboard').classList.remove('hidden');
            
            const userMenu = document.getElementById('user-menu');
            if(userMenu) userMenu.classList.remove('hidden');
            
            // Disparamos la carga de avance e historial si existe la función
            if(typeof consultarAvanceReal === 'function') {
                consultarAvanceReal(matricula);
            }
        } else {
            alert("❌ " + data.mensaje);
        }
    })
    .catch(err => {
        console.error(err);
        alert("⚠️ Error de conexión con el servidor.");
    })
    .finally(() => {
        if (btnIngresar) {
            btnIngresar.innerText = "🚀 Ingresar al Portal";
            btnIngresar.disabled = false;
        }
    });
};

// ==========================================
// 2. CONSULTA DE DATOS DEL ALUMNO
// ==========================================
function consultarAvanceReal(matricula) {
    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ accion: "consultar", matricula: matricula })
    })
    .then(response => response.json())
    .then(data => {
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

        if (data.parciales) {
            window.datosDesgloseParciales = data.parciales;
            dibujarGrafica(data.parciales);
        }

        const tbodyHistorial = document.getElementById('tbody-historial');
        if (tbodyHistorial && data.historial) {
            tbodyHistorial.innerHTML = "";
            if (data.historial.length === 0) {
                tbodyHistorial.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 15px;">No hay entregas registradas.</td></tr>`;
            } else {
                tbodyHistorial.innerHTML = data.historial.map(item => `
                    <tr>
                        <td style="font-size: 0.9rem; padding: 12px 10px; border-bottom: 1px solid var(--border-card);">${item.actividad}</td>
                        <td style="font-size: 0.85rem; color: var(--text-muted); padding: 12px 10px; border-bottom: 1px solid var(--border-card);">${item.fecha}</td>
                        <td style="padding: 12px 10px; border-bottom: 1px solid var(--border-card);"><span class="badge-status ${item.estado.toLowerCase().includes('pendient') ? 'status-pend' : 'status-ok'}">${item.estado}</span></td>
                        <td style="text-align: center; padding: 12px 10px; border-bottom: 1px solid var(--border-card);"><strong>${item.nota}</strong></td>
                    </tr>
                `).join('');
            }
        }

        const selectTarea = document.getElementById('select-tarea');
        if (selectTarea && data.catalogo) {
            selectTarea.innerHTML = `<option value="">-- Selecciona una actividad --</option>`;
            data.catalogo.forEach(tarea => {
                const opt = document.createElement('option');
                opt.value = tarea.id + " - " + tarea.titulo;
                opt.text = tarea.id + " | " + tarea.titulo;
                selectTarea.appendChild(opt);
            });
        }
    })
    .catch(error => console.error("Error consultando avance:", error));
}

// ==========================================
//  3. GRÁFICA DE EVALUACIÓN Y DESGLOSE
// ==========================================
function dibujarGrafica(parcialesData) {
    const canvas = document.getElementById('graficaParciales');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Evitamos duplicados
    if (window.miGrafica) window.miGrafica.destroy();

    // Extraemos el total bruto de cada parcial
    const p1 = parcialesData && parcialesData[0] ? parseFloat(parcialesData[0].total) || 0 : 0;
    const p2 = parcialesData && parcialesData[1] ? parseFloat(parcialesData[1].total) || 0 : 0;
    const p3 = parcialesData && parcialesData[2] ? parseFloat(parcialesData[2].total) || 0 : 0;

    window.datosDesgloseParciales = parcialesData;

    window.miGrafica = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Parcial 1', 'Parcial 2', 'Parcial 3'],
            datasets: [{
                data: [p1, p2, p3],
                backgroundColor: ['#00806A', '#d97706', '#94a3b8'],
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
                            const index = context.dataIndex;
                            if (!window.datosDesgloseParciales || !window.datosDesgloseParciales[index]) return "Sin datos";
                            const totalBase100 = parseFloat(window.datosDesgloseParciales[index].total) || 0;
                            const calif10 = (totalBase100 / 10).toFixed(1);
                            return ` Calificación: ${calif10} / 10`;
                        }
                    }
                }
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    mostrarDesglose(index);
                }
            }
        }
    });
}

// FUNCIÓN PARA MOSTRAR LA CAJA DE DESGLOSE INFERIOR
window.mostrarDesglose = function(indexParcial) {
    if(!window.datosDesgloseParciales) return;
    const datos = window.datosDesgloseParciales[indexParcial];
    if(!datos) return;

    const contenedorDesglose = document.getElementById('desglose-calificacion');
    if(contenedorDesglose) contenedorDesglose.style.display = 'block';

    const totalBase100 = parseFloat(datos.total) || 0;
    const calif10 = (totalBase100 / 10).toFixed(1);

    const titulo = document.getElementById('titulo-desglose');
    const valTareas = document.getElementById('val-tareas');
    const valPart = document.getElementById('val-part');
    const valAsist = document.getElementById('val-asist');
    const valExam = document.getElementById('val-exam');

    if(titulo) titulo.innerText = `Desglose ${datos.titulo} (Nota Final: ${calif10} / 10)`;
    if(valTareas) valTareas.innerText = datos.tareas || 0;
    if(valPart) valPart.innerText = datos.part || 0;
    if(valAsist) valAsist.innerText = datos.asist || 0;
    if(valExam) valExam.innerText = datos.exam || 0;
};

// ==========================================
// 4. CONTROLADOR DEL PANEL ADMINISTRATIVO
// ==========================================
function inicializarPanelAdmin() {
    document.getElementById('vista-login')?.classList.add('hidden');
    document.getElementById('vista-admin')?.classList.remove('hidden');
    document.getElementById('user-menu')?.classList.remove('hidden');
    
    const welcome = document.getElementById('welcome-name');
    if (welcome) welcome.innerText = "👨‍🏫 Bienvenido, Prof. Juan Luis";
    
    cargarGruposDocente();
}

function cargarGruposDocente() {
    const contenedor = document.getElementById('contenedor-tarjetas-grupos');
    if (!contenedor) return;
    contenedor.innerHTML = `<p style="color: var(--text-muted);">Consultando grupos...</p>`;

    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ accion: "obtener_resumen_admin" })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "éxito") {
            contenedor.innerHTML = Object.keys(data.grupos).map(grupo => `
                <div class="card-modulo" style="cursor: pointer; border-top: 4px solid var(--conalep-primary);" onclick="window.abrirGestionGrupo('${grupo}')">
                    <h4 style="margin: 0; font-size: 1.2rem;">📘 Grupo ${grupo}</h4>
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin: 5px 0 15px 0;">Matemáticas</p>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.85rem; background: #e0f2fe; color: #0369a1; padding: 3px 8px; border-radius: 4px;">👥 ${data.grupos[grupo]} Alumnos</span>
                        <span style="font-size: 0.85rem; color: var(--conalep-accent); font-weight: bold;">Gestionar ➜</span>
                    </div>
                </div>
            `).join('');
        } else {
            contenedor.innerHTML = `<p style="color: red;">Error: ${data.mensaje}</p>`;
        }
    })
    .catch(() => {
        contenedor.innerHTML = `<p style="color: red;">No se pudo conectar con el servidor.</p>`;
    });
}

// DECLARACIÓN GLOBAL DE LAS FUNCIONES DE NAVEGACIÓN
window.mostrarPanelGrupos = function() {
    document.getElementById('panel-gestion-interno')?.classList.add('hidden');
    document.getElementById('panel-mis-grupos')?.classList.remove('hidden');
    grupoSeleccionadoAdmin = null;
};

window.abrirGestionGrupo = function(grupoId) {
    grupoSeleccionadoAdmin = grupoId;
    document.getElementById('panel-mis-grupos')?.classList.add('hidden');
    
    const titulo = document.getElementById('titulo-gestion-grupo');
    const lbl = document.getElementById('lbl-grupo-tarea');
    if (titulo) titulo.innerText = `👥 Panel de Gestión: Grupo ${grupoId}`;
    if (lbl) lbl.innerText = `Grupo ${grupoId}`;
    
    document.getElementById('panel-gestion-interno')?.classList.remove('hidden');
    document.getElementById('form-tarea-grupo')?.classList.add('hidden');
    cargarEntregasGrupo(grupoId);
};

window.recargarDatosGrupoActual = function() {
    if (grupoSeleccionadoAdmin) cargarEntregasGrupo(grupoSeleccionadoAdmin);
};

window.mostrarFormularioTareaGrupo = function() {
    document.getElementById('form-tarea-grupo')?.classList.toggle('hidden');
};

// ==========================================
// 5. SUBIDA DE FOTO DE PERFIL (ALUMNOS)
// ==========================================
window.subirFotoPerfil = function() {
    const fileInput = document.getElementById('input-foto-perfil');
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) return;

    const file = fileInput.files[0];
    const matricula = sessionStorage.getItem('matriculaActiva');
    const nombre = sessionStorage.getItem('nombreActivo');
    const grupo = sessionStorage.getItem('grupoActivo');

    if (!matricula) {
        alert("⚠️ Debes iniciar sesión para subir una foto.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Data = e.target.result.split(',')[1];

        const imgPerfil = document.getElementById('img-perfil');
        const emojiCamara = document.getElementById('emoji-camara');
        if(imgPerfil && emojiCamara) {
            imgPerfil.src = e.target.result;
            imgPerfil.style.display = 'block';
            emojiCamara.style.display = 'none';
        }

        alert("⏳ Guardando tu foto de perfil... Por favor espera.");

        fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                accion: "subir_foto_perfil",
                matricula: matricula,
                nombre: nombre,
                grupo: grupo,
                nombreArchivo: file.name, 
                mimeType: file.type,
                archivoBase64: base64Data 
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === "éxito") {
                alert("✅ ¡Foto de perfil guardada exitosamente!");
            } else {
                alert("❌ Error en la nube: " + data.mensaje);
            }
        })
        .catch(err => {
            console.error(err);
            alert("⚠️ Error de conexión.");
        });
    };
    reader.readAsDataURL(file);
};
