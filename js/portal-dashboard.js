// =======================================================
// CONFIGURACIÓN PRINCIPAL
// =======================================================
// URL DE TU BACKEND EN GOOGLE APPS SCRIPT (SICAL)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwgWAKxba4gm5BWu73EHsy02jChscCB4eQmHPQL-4GrfIdHgkb4Y09RalPPaLbAs3woQQ/exec"; 

// =======================================================
// VARIABLES GLOBALES DEL SISTEMA
// =======================================================
let miGrafica = null; // Instancia de Chart.js
window.listaGlobalAlumnos = []; // Almacena datos descargados de Sheets
window.grupoSeleccionadoAdmin = null; // Memoria del grupo activo
window.alumnoSeleccionadoAdmin = null; // Memoria del alumno en evaluación

// =======================================================
// SECCIÓN 1: LÓGICA DE INICIO DE SESIÓN
// =======================================================
window.iniciarSesion = function() {
    const matricula = document.getElementById('input-matricula').value.trim();

    if (matricula === "") {
        alert("⚠️ Por favor, ingresa tu matrícula para acceder.");
        return;
    }

    // Intercepción para la cuenta Maestra (Docente)
    if (matricula.toUpperCase() === "ADMIN-JL") {
        window.inicializarPanelAdmin();
        return; 
    }

    // Botón en estado de carga
    const btnIngresar = document.querySelector('#vista-login button') || document.getElementById('btn-ingresar');
    if (btnIngresar) {
        btnIngresar.innerText = "⏳ Consultando...";
        btnIngresar.disabled = true;
    }

    // Petición al Backend
    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ accion: "login", matricula: matricula })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "éxito") {
            // Llenado de Ficha de Identidad
            document.getElementById('welcome-name').innerText = `👤 Bienvenido, ${data.primerNombre}`;
            const lblNombre = document.getElementById('lbl-nombre');
            if(lblNombre) lblNombre.innerText = `${data.nombreCompleto}`;
            
            const lblMatricula = document.getElementById('lbl-matricula');
            if(lblMatricula) lblMatricula.innerText = matricula;
            
            const lblGrupo = document.getElementById('lbl-grupo');
            if(lblGrupo) lblGrupo.innerText = `Grupo ${data.grupo}`;

            // Renderizado de Foto de Perfil
            const imgPerfil = document.getElementById('img-perfil');
            const emojiCamara = document.getElementById('emoji-camara');
            
            if (data.fotoPerfilUrl && data.fotoPerfilUrl !== "") {
                if(imgPerfil) { imgPerfil.src = data.fotoPerfilUrl; imgPerfil.style.display = 'block'; }
                if(emojiCamara) emojiCamara.style.display = 'none';
            }

            // Almacenamiento en Memoria de Sesión
            sessionStorage.setItem('matriculaActiva', matricula);
            sessionStorage.setItem('grupoActivo', data.grupo);
            sessionStorage.setItem('nombreActivo', data.nombreCompleto);

            // Cambio de Vistas (Ocultar Login -> Mostrar Dashboard)
            document.getElementById('vista-login').classList.add('hidden');
            const vistaDash = document.getElementById('vista-dashboard');
            if(vistaDash) vistaDash.classList.remove('hidden');
            
            const userMenu = document.getElementById('user-menu');
            if(userMenu) userMenu.classList.remove('hidden');
            
            // Disparador de carga de datos pesados (Historial y Gráfica)
            if(typeof window.consultarAvanceReal === 'function') {
                window.consultarAvanceReal(matricula);
            }
        } else {
            alert("❌ " + data.mensaje);
        }
    })
    .catch(err => { console.error(err); alert("⚠️ Error de conexión."); })
    .finally(() => { if (btnIngresar) { btnIngresar.innerText = "🚀 Ingresar al Portal"; btnIngresar.disabled = false; }});
};

// =======================================================
// SECCIÓN 2: GRÁFICAS DE DESEMPEÑO DEL ALUMNO
// =======================================================
window.dibujarGrafica = function(parcialesData) {
    const canvas = document.getElementById('graficaParciales');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Destruir gráfica anterior si existe para evitar solapamientos
    if (window.miGrafica) window.miGrafica.destroy();

    let p1 = parcialesData && parcialesData[0] ? parseFloat(parcialesData[0].total) || 0 : 0;
    let p2 = parcialesData && parcialesData[1] ? parseFloat(parcialesData[1].total) || 0 : 0;
    let p3 = parcialesData && parcialesData[2] ? parseFloat(parcialesData[2].total) || 0 : 0;

    window.datosDesgloseParciales = parcialesData;

    // 🛡️ EL CANDADO VISUAL: Si el alumno tiene 0 en todo, pintamos la base en gris
    let datosGrafica = [p1, p2, p3];
    let coloresGrafica = ['#00806A', '#d97706', '#94a3b8']; // Verde, Ámbar, Azul Grisáceo

    if (p1 === 0 && p2 === 0 && p3 === 0) {
        datosGrafica = [25, 30, 45]; // Ponderación base de relleno
        coloresGrafica = ['#e2e8f0', '#e2e8f0', '#e2e8f0']; // Todo en gris pálido
    }

    window.miGrafica = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Parcial 1', 'Parcial 2', 'Parcial 3'],
            datasets: [{
                data: datosGrafica,
                backgroundColor: coloresGrafica,
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
                            const calif10 = (parseFloat(window.datosDesgloseParciales[index].total) / 10).toFixed(1);
                            return ` Calificación: ${calif10} / 10`;
                        }
                    }
                }
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    window.mostrarDesglose(elements[0].index);
                }
            }
        }
    });
};

// =======================================================
// SECCIÓN 3: ENRUTADOR DE VISTAS (PANEL ADMINISTRADOR)
// =======================================================
window.inicializarPanelAdmin = function() {
    document.getElementById('vista-login')?.classList.add('hidden');
    document.getElementById('vista-admin')?.classList.remove('hidden');
    document.getElementById('user-menu')?.classList.remove('hidden');
    const welcome = document.getElementById('welcome-name');
    if (welcome) welcome.innerText = "👨‍🏫 Bienvenido, Prof. Juan Luis";
    
    // Carga de datos base de Google Sheets
    window.cargarDatosAdministrativos();
    // Renderizado de pestaña por defecto
    window.cambiarVistaAdmin('dashboard'); 
};

window.cambiarVistaAdmin = function(vistaDestino) {
    const paneles = document.querySelectorAll('.admin-panel-vista');
    paneles.forEach(panel => panel.classList.add('hidden'));

    if (vistaDestino === 'dashboard') {
        document.getElementById('panel-dashboard-admin')?.classList.remove('hidden');
    } else if (vistaDestino === 'mis-grupos') {
        document.getElementById('panel-mis-grupos')?.classList.remove('hidden');
        window.renderizarTarjetasGrupos(); 
    } else if (vistaDestino === 'lista-alumnos') {
        document.getElementById('panel-lista-alumnos')?.classList.remove('hidden');
    } else if (vistaDestino === 'gestion-interno') {
        document.getElementById('panel-gestion-interno')?.classList.remove('hidden');
    } else if (vistaDestino === 'catalogo') {
        document.getElementById('panel-catalogo-tareas')?.classList.remove('hidden');
        if(typeof window.filtrarCatalogoGeneral === 'function') window.filtrarCatalogoGeneral();
    } else if (vistaDestino === 'asistencia') {
        document.getElementById('panel-asistencia')?.classList.remove('hidden');
    }
};

// =======================================================
// SECCIÓN 4: LÓGICA DE DIBUJADO Y EXTRACCIÓN (ADMIN)
// =======================================================
window.cargarDatosAdministrativos = function() {
    fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ accion: "consultar", matricula: "ADMIN-JL" }) })
    .then(res => res.json())
    .then(data => {
        if (data.status === "éxito") {
            window.catalogoGeneralTareas = data.catalogo || [];
            window.listaGlobalAlumnos = data.listaAlumnos || []; 
            if (typeof window.renderizarControlUnidades === "function") window.renderizarControlUnidades("TODOS");
        }
    }).catch(err => console.error(err));
};

window.renderizarTarjetasGrupos = function() {
    const contenedor = document.getElementById('contenedor-tarjetas-grupos');
    if (!contenedor || !window.listaGlobalAlumnos) return;
    
    // Extracción de Grupos Únicos sin duplicados
    const gruposUnicos = [...new Set(window.listaGlobalAlumnos.map(a => String(a.grupo).trim()))].filter(g => g !== "" && g !== "undefined");

    if (gruposUnicos.length === 0) {
        contenedor.innerHTML = `<div style="padding: 2rem; text-align: center; color: #64748b; background: #f8fafc; border-radius: 8px;">No se detectaron grupos.</div>`;
        return;
    }

    contenedor.innerHTML = gruposUnicos.sort().map(grupo => {
        const totalAlumnos = window.listaGlobalAlumnos.filter(a => String(a.grupo).trim() === grupo).length;
        return `
            <div onclick="window.abrirGestionGrupo('${grupo}')" 
                 style="background: #ffffff; border: 2px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; text-align: center; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(0,0,0,0.02);"
                 onmouseover="this.style.borderColor='var(--conalep-accent)'; this.style.transform='translateY(-2px)';"
                 onmouseout="this.style.borderColor='#e2e8f0'; this.style.transform='translateY(0)';">
                <h3 style="color: var(--conalep-dark); margin-top: 0; font-size: 1.25rem;">📘 Grupo ${grupo}</h3>
                <span style="display: inline-block; background: #f1f5f9; color: #475569; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; font-weight: bold; margin-top: 10px;">
                    👥 ${totalAlumnos} Alumnos
                </span>
            </div>
        `;
    }).join('');
};

// =======================================================
// SECCIÓN 5: GESTIÓN DE EVALUACIONES Y CATÁLOGOS (DOCENTE)
// =======================================================

// --- FLUJO 5.1: ABRIR GRUPO Y LISTAR ALUMNOS ---
window.abrirGestionGrupo = function(grupoId) {
    window.grupoSeleccionadoAdmin = grupoId;
    window.cambiarVistaAdmin('lista-alumnos'); 
    
    document.getElementById('titulo-lista-alumnos').innerText = `👥 Lista de Alumnos: Grupo ${grupoId}`;
    
    // Limpieza de filtros
    const buscador = document.getElementById('buscador-lista-alumnos');
    const selectorMod = document.getElementById('filtro-modalidad-lista');
    if (buscador) buscador.value = "";
    if (selectorMod) selectorMod.value = "TODOS";

    window.renderizarListaAlumnosGrupo();
};

// --- FLUJO 5.2: FILTRADO DE ALUMNOS (BARRA DE BÚSQUEDA) ---
window.renderizarListaAlumnosGrupo = function() {
    const tbody = document.getElementById('tabla-lista-alumnos-grupo');
    if (!tbody || !window.grupoSeleccionadoAdmin) return;

    const textoBusqueda = (document.getElementById('buscador-lista-alumnos')?.value || "").toLowerCase();
    const modalidadFiltro = document.getElementById('filtro-modalidad-lista')?.value || "TODOS";

    let alumnosDelGrupo = window.listaGlobalAlumnos.filter(a => String(a.grupo).trim() === String(window.grupoSeleccionadoAdmin).trim());

    if (modalidadFiltro !== "TODOS") {
        alumnosDelGrupo = alumnosDelGrupo.filter(a => String(a.modalidad).includes(modalidadFiltro));
    }

    if (textoBusqueda !== "") {
        alumnosDelGrupo = alumnosDelGrupo.filter(a => 
            String(a.nombre).toLowerCase().includes(textoBusqueda) || 
            String(a.matricula).toLowerCase().includes(textoBusqueda)
        );
    }

    if (alumnosDelGrupo.length > 0) {
        tbody.innerHTML = alumnosDelGrupo.map(a => `
            <tr style="border-bottom: 1px solid #e2e8f0; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                <td style="padding: 10px; font-family: monospace; color: #475569;">${a.matricula}</td>
                <td style="padding: 10px; font-weight: bold; color: var(--conalep-dark);">${a.nombre}</td>
                <td style="padding: 10px; text-align: center;"><span style="background: ${a.modalidad==='Dual' ? '#fef3c7' : '#dcfce7'}; color: ${a.modalidad==='Dual' ? '#b45309' : '#166534'}; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem;">${a.modalidad || 'Sin definir'}</span></td>
                <td style="padding: 10px; text-align: center;">
                    <button class="btn-conalep" style="padding: 0.35rem 0.7rem; font-size: 0.8rem;" onclick="window.abrirPanelAlumno('${a.matricula}', '${a.nombre}')">📝 Calificar</button>
                </td>
            </tr>
        `).join('');
    } else {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 2rem; color: var(--text-muted);">No se encontraron alumnos con esos filtros.</td></tr>`;
    }
};

// --- FLUJO 5.3: ABRIR ALUMNO Y VER ENTREGAS INDIVIDUALES ---
window.abrirPanelAlumno = function(matricula, nombre) {
    window.alumnoSeleccionadoAdmin = matricula; 
    window.cambiarVistaAdmin('gestion-interno'); 
    
    document.getElementById('titulo-gestion-grupo').innerText = `📝 Calificando a: ${nombre}`;
    const tbody = document.getElementById('tabla-gestion-entregas');
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 1rem;">⏳ Consultando entregas en Google Sheets...</td></tr>`;

    fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ accion: "obtener_entregas_grupo", grupo: window.grupoSeleccionadoAdmin }) })
    .then(res => res.json())
    .then(data => {
        if (data.status === "éxito" && data.entregas.length > 0) {
            const entregasAlumno = data.entregas.filter(e => String(e.matricula).trim() === String(matricula).trim());
            
            if (entregasAlumno.length > 0) {
                tbody.innerHTML = entregasAlumno.map(e => {
                    const estPendiente = e.estado === 'Pendiente' ? 'selected' : '';
                    const estRevisando = e.estado === 'Revisando' ? 'selected' : '';
                    const estCumplido = (e.estado === 'Cumplido' || e.estado === 'Revisado') ? 'selected' : '';

                    return `
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 10px; font-weight: bold; color: var(--text-main);">${e.actividad}</td>
                        <td style="padding: 10px; text-align: center;"><a href="${e.archivoUrl}" target="_blank" style="color: var(--conalep-accent); font-weight: bold; text-decoration: none; font-size: 0.85rem;">📎 Ver Archivo</a></td>
                        <td style="padding: 10px; text-align: center;"><span class="badge-status ${e.estado === 'Cumplido' || e.estado === 'Revisado' ? 'status-ok' : 'status-pend'}">${e.estado}</span></td>
                        <td style="padding: 10px; text-align: center;">
                            <select id="estado-${e.filaFisica}" style="padding: 4px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.85rem;">
                                <option value="Pendiente" ${estPendiente}>Pendiente</option>
                                <option value="Revisando" ${estRevisando}>Revisando</option>
                                <option value="Cumplido" ${estCumplido}>Cumplido</option>
                            </select>
                        </td>
                        <td style="padding: 10px; text-align: center;"><input type="number" id="nota-${e.filaFisica}" value="${e.calificacion}" min="0" max="100" style="width: 60px; padding: 4px; text-align: center; border: 1px solid #cbd5e1; border-radius: 4px;"></td>
                        <td style="padding: 10px; text-align: center;"><button class="btn-conalep" style="background-color: #0284c7; padding: 0.35rem 0.7rem; font-size: 0.8rem;" onclick="window.guardarCalificacionFila(${e.filaFisica})">💾 Guardar</button></td>
                    </tr>
                    `
                }).join('');
            } else {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 1.5rem; color: var(--text-muted);">El alumno aún no ha subido evidencias.</td></tr>`;
            }
        } else {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 1.5rem; color: var(--text-muted);">No hay evidencias registradas en la base de datos.</td></tr>`;
        }
    }).catch(err => { console.error(err); tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 1rem; color: red;">Error al consultar servidor.</td></tr>`; });
};

window.guardarCalificacionFila = function(filaFisica) {
    const inputNota = document.getElementById(`nota-${filaFisica}`);
    const selectEstado = document.getElementById(`estado-${filaFisica}`);
    const nota = inputNota ? inputNota.value : "";
    const estadoNuevo = selectEstado ? selectEstado.value : "Revisado";
    
    fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ accion: "calificar_entrega", fila: filaFisica, calificacion: nota, estado: estadoNuevo }) })
    .then(res => res.json())
    .then(data => {
        if (data.status === "éxito") {
            alert(`✅ Tarea guardada con estado: ${estadoNuevo}`);
        } else { alert("❌ Error: " + data.mensaje); }
    }).catch(() => alert("⚠️ Error de comunicación con el servidor."));
};

// --- FLUJO 5.4: DIBUJADO DE CATÁLOGO GENERAL ---
window.filtrarCatalogoGeneral = function() {
    const tbody = document.getElementById('tabla-catalogo-general');
    if (!tbody) return;

    if (window.catalogoGeneralTareas && window.catalogoGeneralTareas.length > 0) {
        tbody.innerHTML = window.catalogoGeneralTareas.map(t => {
            // Evaluamos Estatus Base de Datos
            let estadoCrudo = String(t.estatus).toUpperCase().trim();
            let estadoActual = "ACTIVA"; // Default
            
            if (estadoCrudo === "CONCLUIDA" || estadoCrudo === "TERMINADA" || estadoCrudo === "FALSE") estadoActual = "TERMINADA";
            if (estadoCrudo === "REABIERTA") estadoActual = "REABIERTA";

            let colorEstatus = estadoActual === 'ACTIVA' ? '#16a34a' : (estadoActual === 'REABIERTA' ? '#0284c7' : '#64748b');
            let txtEstatus = estadoActual === 'ACTIVA' ? '🟢 ACTIVA' : (estadoActual === 'REABIERTA' ? '🔄 REABIERTA' : '🔒 TERMINADA');

            let selActiva = estadoActual === 'ACTIVA' ? 'selected' : '';
            let selTerminada = estadoActual === 'TERMINADA' ? 'selected' : '';
            let selReabierta = estadoActual === 'REABIERTA' ? 'selected' : '';

            return `
            <tr style="border-bottom: 1px solid #e2e8f0; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                <td style="padding: 10px;"><strong>${t.id}</strong><br><small style="color: var(--text-muted);">${t.titulo}</small></td>
                <td style="padding: 10px; text-align: center;"><span style="background: #e0f2fe; color: #0369a1; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">${t.grupos || 'Todos'}</span></td>
                <td style="padding: 10px; text-align: center; font-weight: bold; color: ${colorEstatus}">${txtEstatus}</td>
                
                <td style="padding: 10px; text-align: center;">
                    <select id="estatus-cat-${t.id}" style="padding: 4px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.85rem; outline: none; cursor: pointer;">
                        <option value="SÍ" ${selActiva}>Activa</option>
                        <option value="CONCLUIDA" ${selTerminada}>Terminada</option>
                        <option value="REABIERTA" ${selReabierta}>Reabierta</option>
                    </select>
                </td>
                
                <td style="padding: 10px; text-align: center;">
                    <button class="btn-conalep" style="background-color: #0f172a; padding: 0.35rem 0.8rem; font-size: 0.8rem;" onclick="window.cambiarEstatusOpciones('${t.id}')">💾 Guardar</button>
                </td>
            </tr>
            `;
        }).join('');
    } else {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 1.5rem; color: var(--text-muted);">No hay tareas registradas en el catálogo.</td></tr>`;
    }
};

window.cambiarEstatusOpciones = function(idTarea) {
    const select = document.getElementById(`estatus-cat-${idTarea}`);
    if (!select) return;
    const nuevoEstatus = select.value;

    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ accion: "actualizar_estatus_tarea", idTarea: idTarea, nuevoEstatus: nuevoEstatus })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "éxito") {
            alert(`✅ La tarea ${idTarea} se guardó exitosamente con el estado: ${nuevoEstatus === 'SÍ' ? 'ACTIVA' : nuevoEstatus}`);
            window.cargarDatosAdministrativos(); // Recarga silenciosa
            setTimeout(() => window.cambiarVistaAdmin('catalogo'), 1500); 
        } else {
            alert("❌ Error: " + data.mensaje);
        }
    })
    .catch(() => alert("⚠️ Error de comunicación con el servidor."));
};

// --- FLUJO 5.5: CREACIÓN DE NUEVAS TAREAS ---
window.publicarNuevaTarea = function() {
    const idTarea = document.getElementById('nt-id').value.trim();
    const unidad = document.getElementById('nt-unidad').value.trim();
    const titulo = document.getElementById('nt-titulo').value.trim();
    const desc = document.getElementById('nt-desc').value.trim();
    const fecha = document.getElementById('nt-fecha').value;
    const puntos = document.getElementById('nt-puntos').value;
    const grupo = document.getElementById('nt-grupo').value;

    if (!idTarea || !titulo || !unidad) {
        alert("⚠️ Por favor, llena al menos el ID, el Módulo y el Título de la actividad.");
        return;
    }

    const btn = document.getElementById('btn-guardar-tarea');
    btn.innerText = "⏳ Publicando en la base de datos..."; 
    btn.disabled = true;

    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ accion: "nueva_tarea", idTarea: idTarea, unidad: unidad, titulo: titulo, desc: desc, fecha: fecha, puntos: puntos, grupo: grupo })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "éxito") {
            alert("✅ ¡La nueva tarea ha sido publicada!");
            document.querySelectorAll('#form-nueva-tarea input, #form-nueva-tarea textarea').forEach(el => el.value = '');
            document.getElementById('form-nueva-tarea').classList.add('hidden'); 
            window.cargarDatosAdministrativos();
            setTimeout(() => window.cambiarVistaAdmin('catalogo'), 1500);
        } else {
            alert("❌ Error al publicar: " + data.mensaje);
        }
    })
    .catch(() => alert("⚠️ Error de comunicación con el servidor."))
    .finally(() => { btn.innerText = "🚀 Publicar Actividad Oficial"; btn.disabled = false; });
};

// =======================================================
// SECCIÓN 6: VENTANILLA DE ESTUDIANTES (ENTREGAS)
// =======================================================
window.subirFotoPerfil = function() {
    const fileInput = document.getElementById('input-foto-perfil');
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) return;
    const file = fileInput.files[0];
    const matricula = sessionStorage.getItem('matriculaActiva');
    const nombre = sessionStorage.getItem('nombreActivo');
    const grupo = sessionStorage.getItem('grupoActivo');

    if (!matricula) { alert("⚠️ Inicia sesión para subir fotos."); return; }

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Data = e.target.result.split(',')[1];
        const imgPerfil = document.getElementById('img-perfil');
        const emojiCamara = document.getElementById('emoji-camara');
        if(imgPerfil && emojiCamara) { imgPerfil.src = e.target.result; imgPerfil.style.display = 'block'; emojiCamara.style.display = 'none'; }

        fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ accion: "subir_foto_perfil", matricula: matricula, nombre: nombre, grupo: grupo, nombreArchivo: file.name, mimeType: file.type, archivoBase64: base64Data }) })
        .then(res => res.json())
        .then(data => {
            if (data.status === "éxito") alert("✅ ¡Foto guardada!"); else alert("❌ Error: " + data.mensaje);
        })
        .catch(err => { console.error(err); alert("⚠️ Error de conexión."); });
    };
    reader.readAsDataURL(file);
};

window.subirEvidencia = function() {
    const fileInput = document.getElementById('input-archivo');
    const actividadCompleta = document.getElementById('select-tarea').value;
    const matricula = sessionStorage.getItem('matriculaActiva');
    const grupo = sessionStorage.getItem('grupoActivo');
    const nombre = sessionStorage.getItem('nombreActivo');

    if (!matricula) { alert("⚠️ Inicia sesión para subir evidencias."); return; }
    if (!actividadCompleta || actividadCompleta.includes("--")) { alert("⚠️ Selecciona la tarea correspondiente."); return; }
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) { alert("⚠️ Selecciona al menos un archivo."); return; }
    
    const file = fileInput.files[0];
    if (file.size > 26214400) { alert("⚠️ Archivo muy pesado (máx 25MB)."); return; }

    const btn = document.getElementById('btn-enviar');
    if (btn) { btn.innerText = "⏳ Subiendo..."; btn.disabled = true; }

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Data = e.target.result.split(',')[1];
        fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ accion: "subir", matricula: matricula, nombreArchivo: file.name, mimeType: file.type, archivoBase64: base64Data, grupo: grupo, nombre: nombre, actividad: actividadCompleta }) })
        .then(res => res.json())
        .then(data => {
            if (data.status === "éxito") { alert("✅ Evidencia enviada."); fileInput.value = ""; } else { alert("❌ Error: " + data.mensaje); }
        })
        .catch(err => { console.error(err); alert("⚠️ Error de conexión."); })
        .finally(() => { if (btn) { btn.innerText = "📤 Enviar Evidencia a Revisión"; btn.disabled = false; }});
    };
    reader.readAsDataURL(file);
};
// ==========================================
// SECCIÓN 7: PANEL DE ASISTENCIA Y RADAR (ADMIN)
// ==========================================
window.datosAsistenciaDia = []; 

window.cargarAsistenciasDia = function() {
    const tbody = document.getElementById('tabla-asistencia-dia');
    if (!tbody) return;

    // Ponemos la fecha de hoy por defecto si el input está vacío
    const inputFecha = document.getElementById('filtro-fecha-asis');
    if (inputFecha && !inputFecha.value) {
        const hoy = new Date();
        const yyyy = hoy.getFullYear();
        const mm = String(hoy.getMonth() + 1).padStart(2, '0');
        const dd = String(hoy.getDate()).padStart(2, '0');
        inputFecha.value = `${yyyy}-${mm}-${dd}`;
    }

    const fechaSeleccionada = inputFecha.value;
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem;">📡 Escaneando registros del ${fechaSeleccionada}...</td></tr>`;

    // 🚀 AQUÍ: Haremos la petición fetch() hacia una nueva acción en tu backend.gs ("consultar_asistencia")
    // Por ahora, simularemos que descargamos los datos para probar la interfaz visual interactiva.
    
    // Simulación de respuesta del servidor (Reemplazaremos esto en el siguiente paso)
    setTimeout(() => {
        window.datosAsistenciaDia = [
            { matricula: "242970437-8", nombre: "Jhannia Sayeli Álvarez", grupo: "505", mod: "Presencial", hora: "07:15 AM", estatus: "📍 En Plantel", global: 92 },
            { matricula: "242970030-1", nombre: "Jesús Israel Acevedo", grupo: "505", mod: "Dual", hora: "07:18 AM", estatus: "💻 App Activa (Remoto)", global: 100 },
            { matricula: "230910452-3", nombre: "Carlos Mendoza Pech", grupo: "508", mod: "Presencial", hora: "07:25 AM", estatus: "⚠️ Fuera de Rango", global: 85 }
        ];
        
        // Llenar dinámicamente los grupos en el filtro
        const selectorGrupos = document.getElementById('filtro-grupo-asis');
        if (selectorGrupos && selectorGrupos.options.length <= 1 && window.listaGlobalAlumnos) {
             const gUnicos = [...new Set(window.listaGlobalAlumnos.map(a => String(a.grupo).trim()))].filter(g => g !== "" && g !== "undefined");
             gUnicos.sort().forEach(g => {
                 let opt = document.createElement("option");
                 opt.value = g; opt.text = "Grupo " + g;
                 selectorGrupos.add(opt);
             });
        }
        
        window.filtrarTablaAsistencia();
    }, 1000);
};

window.filtrarTablaAsistencia = function() {
    const tbody = document.getElementById('tabla-asistencia-dia');
    const filtroG = document.getElementById('filtro-grupo-asis')?.value || "TODOS";
    const filtroM = document.getElementById('filtro-mod-asis')?.value || "TODOS";

    let datosFiltrados = window.datosAsistenciaDia;

    if (filtroG !== "TODOS") datosFiltrados = datosFiltrados.filter(d => String(d.grupo) === filtroG);
    if (filtroM !== "TODOS") datosFiltrados = datosFiltrados.filter(d => String(d.mod) === filtroM);

    // Calcular KPIs
    let total = datosFiltrados.length;
    let pres = datosFiltrados.filter(d => d.estatus.includes("Plantel")).length;
    let dual = datosFiltrados.filter(d => d.estatus.includes("Remoto")).length;
    let fuera = datosFiltrados.filter(d => d.estatus.includes("Fuera")).length;

    document.getElementById('kpi-asis-hoy').innerText = total;
    document.getElementById('kpi-asis-pres').innerText = pres;
    document.getElementById('kpi-asis-dual').innerText = dual;
    document.getElementById('kpi-asis-fuera').innerText = fuera;

    if (datosFiltrados.length > 0) {
        tbody.innerHTML = datosFiltrados.map(d => {
            let colorSt = d.estatus.includes("Plantel") ? "#16a34a" : (d.estatus.includes("Remoto") ? "#0284c7" : "#dc2626");
            let bgSt = d.estatus.includes("Plantel") ? "#dcfce7" : (d.estatus.includes("Remoto") ? "#e0f2fe" : "#fee2e2");
            
            return `
            <tr style="border-bottom: 1px solid #e2e8f0; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                <td style="padding: 10px;"><strong>${d.nombre}</strong><br><small style="color: var(--text-muted);">${d.matricula}</small></td>
                <td style="padding: 10px; text-align: center; font-weight: bold; color: var(--conalep-dark);">G-${d.grupo}</td>
                <td style="padding: 10px; text-align: center;"><span style="background: ${d.mod==='Dual' ? '#fef3c7' : '#f1f5f9'}; color: ${d.mod==='Dual' ? '#b45309' : '#475569'}; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem;">${d.mod}</span></td>
                <td style="padding: 10px; text-align: center; font-family: monospace; color: #475569;">${d.hora}</td>
                <td style="padding: 10px; text-align: center;"><span style="background: ${bgSt}; color: ${colorSt}; padding: 4px 10px; border-radius: 12px; font-size: 0.85rem; font-weight: bold;">${d.estatus}</span></td>
                <td style="padding: 10px; text-align: center;">
                    <div style="background: #e2e8f0; border-radius: 8px; width: 100%; height: 8px; margin-bottom: 4px; overflow: hidden;">
                        <div style="background: ${d.global >= 80 ? '#16a34a' : '#d97706'}; width: ${d.global}%; height: 100%;"></div>
                    </div>
                    <span style="font-size: 0.8rem; font-weight: bold; color: #334155;">${d.global}%</span>
                </td>
            </tr>
            `;
        }).join('');
    } else {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">No hay check-ins para este grupo/modalidad en la fecha seleccionada.</td></tr>`;
    }
};
// ==========================================
// SECCIÓN 7.1: EXPORTACIÓN DE REPORTE A PDF
// ==========================================
window.generarReporteAsistenciaPDF = function() {
    // 1. Recolectar datos actuales de la tabla y filtros
    const fechaSeleccionada = document.getElementById('filtro-fecha-asis')?.value || "Fecha No Definida";
    const grupoSeleccionado = document.getElementById('filtro-grupo-asis')?.value || "TODOS";
    const modSeleccionada = document.getElementById('filtro-mod-asis')?.value || "TODOS";
    const kpiPres = document.getElementById('kpi-asis-pres')?.innerText || "0";
    const kpiDual = document.getElementById('kpi-asis-dual')?.innerText || "0";
    const kpiFuera = document.getElementById('kpi-asis-fuera')?.innerText || "0";

    const tbody = document.getElementById('tabla-asistencia-dia');
    if (!tbody || tbody.innerText.includes("escaneando") || tbody.innerText.includes("No hay check-ins")) {
        alert("⚠️ No hay datos de asistencia válidos para generar el reporte.");
        return;
    }

    // 2. Extraer las filas de la tabla visible
    const filas = tbody.querySelectorAll('tr');
    let htmlTablaReporte = '';
    
    filas.forEach(tr => {
        const celdas = tr.querySelectorAll('td');
        if (celdas.length >= 6) {
            const nombre = celdas[0].querySelector('strong').innerText;
            const matricula = celdas[0].querySelector('small').innerText;
            const grupo = celdas[1].innerText;
            const modalidad = celdas[2].innerText;
            const hora = celdas[3].innerText;
            const estatus = celdas[4].innerText;
            
            htmlTablaReporte += `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #1e293b;"><strong>${nombre}</strong><br><span style="color: #64748b;">${matricula}</span></td>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 12px; font-weight: bold;">${grupo}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 12px;">${modalidad}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 12px;">${hora}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 12px; font-weight: bold;">${estatus}</td>
                </tr>
            `;
        }
    });

    // 3. Ensamblar la plantilla HTML del documento oficial
    const documentoElegante = `
    <html>
    <head>
        <title>Reporte Asistencia_${grupoSeleccionado}_${fechaSeleccionada}</title>
        <style>
            body { font-family: 'Arial', sans-serif; padding: 40px; color: #0f172a; }
            .header-oficial { border-bottom: 3px solid #00806A; padding-bottom: 15px; margin-bottom: 30px; }
            .titulo-reporte { font-size: 24px; color: #00806A; margin: 0; text-transform: uppercase; }
            .subtitulo { font-size: 14px; color: #475569; margin-top: 5px; }
            .kpi-container { display: flex; gap: 20px; margin-bottom: 30px; }
            .kpi-box { border: 1px solid #cbd5e1; padding: 10px 15px; border-radius: 6px; background: #f8fafc; flex: 1; text-align: center; }
            .kpi-titulo { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 5px; }
            .kpi-valor { font-size: 18px; font-weight: bold; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #00806A; color: white; padding: 12px; text-align: center; font-size: 13px; text-transform: uppercase; }
            .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            .firma-box { margin-top: 60px; text-align: center; width: 300px; margin-left: auto; margin-right: auto; }
            .firma-linea { border-bottom: 1px solid #0f172a; margin-bottom: 5px; }
        </style>
    </head>
    <body>
        <div class="header-oficial">
            <h1 class="titulo-reporte">Reporte Diario de Asistencia</h1>
            <div class="subtitulo"><strong>Módulo:</strong> Matemáticas II (SICAL) | <strong>Fecha del Reporte:</strong> ${fechaSeleccionada}</div>
            <div class="subtitulo"><strong>Docente:</strong> Prof. Juan Luis | <strong>Grupo Filtrado:</strong> ${grupoSeleccionado} | <strong>Modalidad:</strong> ${modSeleccionada}</div>
        </div>

        <div class="kpi-container">
            <div class="kpi-box"><span class="kpi-titulo">Total en Plantel (Presenciales)</span><span class="kpi-valor" style="color: #16a34a;">${kpiPres}</span></div>
            <div class="kpi-box"><span class="kpi-titulo">Total Remotos (Duales)</span><span class="kpi-valor" style="color: #0284c7;">${kpiDual}</span></div>
            <div class="kpi-box"><span class="kpi-titulo">Fuera de Rango / Alertas</span><span class="kpi-valor" style="color: #dc2626;">${kpiFuera}</span></div>
        </div>

        <table>
            <thead>
                <tr>
                    <th style="text-align: left;">Alumno / Matrícula</th>
                    <th>Grupo</th>
                    <th>Modalidad</th>
                    <th>Hora Check-In</th>
                    <th>Estatus Check-In</th>
                </tr>
            </thead>
            <tbody>
                ${htmlTablaReporte}
            </tbody>
        </table>

        <div class="firma-box">
            <div class="firma-linea"></div>
            <strong>Firma del Docente</strong><br>Prof. Juan Luis
        </div>

        <div class="footer">
            Sistema Interactivo de Calificación y Asistencia Local (SICAL)<br>
            Generado automáticamente el: ${new Date().toLocaleString()}
        </div>
    </body>
    </html>
    `;

    // 4. Crear ventana emergente, inyectar el diseño e imprimir
    const ventanaImpresion = window.open('', '_blank', 'width=800,height=900');
    ventanaImpresion.document.write(documentoElegante);
    ventanaImpresion.document.close();
    
    // Pequeño retardo para asegurar que los estilos carguen antes de llamar al PDF
    setTimeout(() => {
        ventanaImpresion.focus();
        ventanaImpresion.print();
        // Opcional: ventanaImpresion.close(); // Si quieres que se cierre sola tras imprimir
    }, 500);
};
