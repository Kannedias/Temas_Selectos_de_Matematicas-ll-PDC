// =======================================================
// CONFIGURACIÓN PRINCIPAL
// =======================================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyCO1FHOxVxUSi1Z6QgMjttLXZ1WrNgBLBkjUNw5Lq0wK8UkdLJu68eVXp9qyNJoioa/exec"; 

let miGrafica = null; 
window.listaGlobalAlumnos = []; 
window.grupoSeleccionadoAdmin = null; 
window.alumnoSeleccionadoAdmin = null; 
// =======================================================
// SECCIÓN 1: LÓGICA DE INICIO DE SESIÓN
// =======================================================
window.iniciarSesion = function() {
    const matricula = document.getElementById('input-matricula').value.trim();

    if (matricula === "") {
        alert("⚠️ Por favor, ingresa tu matrícula para acceder.");
        return;
    }

    if (matricula.toUpperCase() === "ADMIN-JL") {
        window.inicializarPanelAdmin();
        return; 
    }

    const btnIngresar = document.querySelector('#vista-login button') || document.getElementById('btn-ingresar');
    if (btnIngresar) {
        btnIngresar.innerText = "⏳ Consultando...";
        btnIngresar.disabled = true;
    }

    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ accion: "login", matricula: matricula })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "éxito") {
            document.getElementById('welcome-name').innerText = `👤 Bienvenido, ${data.primerNombre}`;
            const lblNombre = document.getElementById('lbl-nombre');
            if(lblNombre) lblNombre.innerText = `${data.nombreCompleto}`;
            const lblMatricula = document.getElementById('lbl-matricula');
            if(lblMatricula) lblMatricula.innerText = matricula;
            const lblGrupo = document.getElementById('lbl-grupo');
            if(lblGrupo) lblGrupo.innerText = `Grupo ${data.grupo}`;

            const imgPerfil = document.getElementById('img-perfil');
            const emojiCamara = document.getElementById('emoji-camara');
            if (data.fotoPerfilUrl && data.fotoPerfilUrl !== "") {
                if(imgPerfil) { imgPerfil.src = data.fotoPerfilUrl; imgPerfil.style.display = 'block'; }
                if(emojiCamara) emojiCamara.style.display = 'none';
            }

                localStorage.setItem('matriculaActiva', matricula);
                localStorage.setItem('nombreActivo', data.nombreCompleto);
                localStorage.setItem('grupoActivo', data.grupo);

            document.getElementById('vista-login').classList.add('hidden');
            window.verificarCheckinPrevio(matricula);
            const vistaDash = document.getElementById('vista-dashboard');
            if(vistaDash) vistaDash.classList.remove('hidden');
            
            const userMenu = document.getElementById('user-menu');
            if(userMenu) userMenu.classList.remove('hidden');
            
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
    
    if (window.miGrafica) window.miGrafica.destroy();

    let p1 = parcialesData && parcialesData[0] ? parseFloat(parcialesData[0].total) || 0 : 0;
    let p2 = parcialesData && parcialesData[1] ? parseFloat(parcialesData[1].total) || 0 : 0;
    let p3 = parcialesData && parcialesData[2] ? parseFloat(parcialesData[2].total) || 0 : 0;

    window.datosDesgloseParciales = parcialesData;

    let datosGrafica = [p1, p2, p3];
    let coloresGrafica = ['#00806A', '#d97706', '#94a3b8']; 

    if (p1 === 0 && p2 === 0 && p3 === 0) {
        datosGrafica = [25, 30, 45]; 
        coloresGrafica = ['#e2e8f0', '#e2e8f0', '#e2e8f0']; 
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
// SECCIÓN 3: MOTOR DE AVANCE DINÁMICO E HISTORIAL
// =======================================================
window.consultarAvanceReal = function(matricula) {
    // 1. Carga de Gráficas, Historial y Catálogo Inteligente
    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ accion: "consultar", matricula: matricula })
    })
    .then(res => res.json())
    .then(data => {
        // 🛡️ Gráfica de Parciales
        if(typeof window.dibujarGrafica === 'function') {
            window.datosDesgloseParciales = data.parciales || [];
            window.dibujarGrafica(window.datosDesgloseParciales);
        }
        
        // ==========================================
        // DIBUJAR HISTORIAL ESTILO PANEL DOCENTE
        // ==========================================
        const tbodyHistorial = document.getElementById('tbody-historial');
        if (tbodyHistorial && data.historial) {
            tbodyHistorial.innerHTML = ""; 
            if (data.historial.length === 0) {
                tbodyHistorial.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 2rem; color: var(--text-muted);">📂 Aún no tienes evidencias entregadas.</td></tr>`;
            } else {
                data.historial.forEach(item => {
                    let estadoCrudo = String(item.estado).trim().toLowerCase();
                    let colorEstado = "#64748b";
                    let bgEstado = "#f1f5f9";
                    let icono = "⏳";
                    
                    if (estadoCrudo.includes("cumplid") || estadoCrudo.includes("revisad")) {
                        colorEstado = "#16a34a"; bgEstado = "#dcfce7"; icono = "✅";
                    } else if (estadoCrudo.includes("pendient")) {
                        colorEstado = "#d97706"; bgEstado = "#fef3c7"; icono = "⏳";
                    } else if (estadoCrudo.includes("corrección") || estadoCrudo.includes("rechazad") || estadoCrudo.includes("no entregada")) {
                        colorEstado = "#dc2626"; bgEstado = "#fef2f2"; icono = "⚠️";
                    }

                    let row = `<tr style="border-bottom: 1px solid #e2e8f0; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                        <td style="padding: 12px; font-weight: 500; color: #1e293b;">${item.actividad}</td>
                        <td style="padding: 12px; color: #475569; font-size: 0.9rem;">${item.fecha}</td>
                        <td style="padding: 12px;"><span style="background: ${bgEstado}; color: ${colorEstado}; padding: 4px 10px; border-radius: 12px; font-weight: bold; font-size: 0.85rem;">${icono} ${item.estado}</span></td>
                        <td style="padding: 12px; font-weight: bold; color: #0f172a; text-align: center;">${item.nota || '--'}</td>
                    </tr>`;
                    tbodyHistorial.innerHTML += row;
                });
            }
        }
        
        // ==========================================
        // LLENAR SELECT CON DESCRIPCIÓN (VENTANILLA)
        // ==========================================
        const selectTarea = document.getElementById('select-tarea');
        if (selectTarea && data.catalogo) {
            selectTarea.innerHTML = `<option value="">-- Selecciona una actividad --</option>`;
            data.catalogo.forEach(tarea => {
                let option = document.createElement('option');
                option.value = tarea.id + " - " + tarea.titulo; 
                let tituloVisible = tarea.estatus === "CONCLUIDA" ? `🔒 CERRADA | ${tarea.id} | ${tarea.titulo}` : `📝 ${tarea.id} | ${tarea.titulo}`;
                option.text = tituloVisible;
                // Guardamos instrucciones y estatus ocultos
                option.setAttribute('data-desc', tarea.desc || 'Sin instrucciones adicionales.');
                option.setAttribute('data-estatus', tarea.estatus);
                selectTarea.appendChild(option);
            });
            
            // Vigilar cuando el alumno cambie de tarea
            selectTarea.removeEventListener('change', window.validarVentanillaAlumno); // Evitar duplicados
            selectTarea.addEventListener('change', window.validarVentanillaAlumno);
        }
    })
    .catch(error => console.error("Error consultando avance:", error));

    // 2. Consulta al Motor Dinámico de Unidad 1
    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ accion: "consultar_avance_motor", matricula: matricula })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "éxito") {
            const badge1_1 = document.getElementById('status-mod-1.1');
            const barraAvance = document.getElementById('barra-avance');
            const lblPorcentaje = document.getElementById('lbl-porcentaje');
            
            if (badge1_1) {
                if (data.unidadCompletada) {
                    badge1_1.className = "badge-status status-ok";
                    badge1_1.innerHTML = "🟢 Concluido";
                } else if (data.tareasCumplidas > 0 || data.retosNivel1 > 0 || data.retosNivel2 > 0) {
                    badge1_1.className = "badge-status status-act";
                    badge1_1.innerHTML = "🟡 En Curso";
                } else {
                    badge1_1.className = "badge-status status-pend";
                    badge1_1.innerHTML = "🔴 Pendiente";
                }
            }

            if (barraAvance && lblPorcentaje) {
                let porcentaje = 0;
                if (data.unidadCompletada) porcentaje = 100;
                else if (data.tareasCumplidas > 0) porcentaje = 50;
                
                barraAvance.style.width = porcentaje + "%";
                lblPorcentaje.innerText = porcentaje + "%";
            }
        }
    }).catch(err => console.error("Error motor avance:", err));
};

// ==========================================
// LÓGICA DE LA VENTANILLA INTELIGENTE
// ==========================================
window.validarVentanillaAlumno = function() {
    const select = document.getElementById('select-tarea');
    const inputArchivo = document.getElementById('input-archivo'); 
    const btnEnviar = document.getElementById('btn-enviar'); // O el id exacto de tu botón de subida
    
    // Si no tiene id, lo buscamos por onclick
    const botonFinal = btnEnviar || document.querySelector('button[onclick="subirEvidencia()"]');
    
    // Contenedor de instrucciones (lo creamos dinámicamente)
    let cajaInfo = document.getElementById('caja-info-tarea');
    if (!cajaInfo) {
        cajaInfo = document.createElement('div');
        cajaInfo.id = 'caja-info-tarea';
        cajaInfo.style.margin = '12px 0';
        cajaInfo.style.padding = '12px';
        cajaInfo.style.borderRadius = '6px';
        cajaInfo.style.fontSize = '0.9rem';
        cajaInfo.style.display = 'none';
        select.parentNode.insertBefore(cajaInfo, select.nextSibling);
    }

    if (select.selectedIndex === 0) {
        cajaInfo.style.display = 'none';
        if (inputArchivo) inputArchivo.style.display = 'block';
        if (botonFinal) botonFinal.style.display = 'block';
        return;
    }

    const opcion = select.options[select.selectedIndex];
    const estatus = opcion.getAttribute('data-estatus');
    const descripcion = opcion.getAttribute('data-desc');

    if (estatus === "CONCLUIDA" || estatus === "TERMINADA") {
        // Tarea Cerrada: Ocultar subida, mostrar alerta
        if (inputArchivo) inputArchivo.style.display = 'none';
        if (botonFinal) botonFinal.style.display = 'none';
        
        cajaInfo.style.display = 'block';
        cajaInfo.style.background = '#fef2f2';
        cajaInfo.style.border = '1px dashed #dc2626';
        cajaInfo.style.color = '#991b1b';
        cajaInfo.innerHTML = `<strong>🔒 Evaluación Cerrada por el Docente</strong><br><span style="font-size:0.85rem;">Ya no se aceptan nuevas entregas para esta actividad.</span>`;
    } else {
        // Tarea Activa: Mostrar descripción e inputs
        if (inputArchivo) inputArchivo.style.display = 'block';
        if (botonFinal) botonFinal.style.display = 'block';
        
        cajaInfo.style.display = 'block';
        cajaInfo.style.background = '#f0fdfa';
        cajaInfo.style.border = '1px solid #5eead4';
        cajaInfo.style.color = '#0f766e';
        cajaInfo.innerHTML = `<strong>📋 Instrucciones de la Tarea:</strong><br><span style="color: #115e59;">${descripcion}</span>`;
    }
};

// =======================================================
// SECCIÓN 4: ENRUTADOR DE VISTAS (PANEL ADMINISTRADOR)
// =======================================================
window.inicializarPanelAdmin = function() {
    document.getElementById('vista-login')?.classList.add('hidden');
    document.getElementById('vista-admin')?.classList.remove('hidden');
    document.getElementById('user-menu')?.classList.remove('hidden');
    const welcome = document.getElementById('welcome-name');
    if (welcome) welcome.innerText = "👨‍🏫 Bienvenido, Prof. Juan Luis";
    
    window.cargarDatosAdministrativos();
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
// SECCIÓN 5: EXTRACCIÓN DE DATOS Y TARJETAS (ADMIN)
// =======================================================
window.cargarDatosAdministrativos = function() {
    // 1. Traer el catálogo de tareas (y renderizar unidades)
    fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ accion: "consultar", matricula: "ADMIN-JL" }) })
    .then(res => res.json())
    .then(data => {
        if (data.status === "éxito") {
            window.catalogoGeneralTareas = data.catalogo || [];
            if (typeof window.renderizarControlUnidades === "function") {
                window.renderizarControlUnidades("TODOS");
            }
            if(typeof window.filtrarCatalogoGeneral === 'function') {
                window.filtrarCatalogoGeneral();
            }
        }
    }).catch(err => console.error("Error al cargar catálogo:", err));

    // 2. Traer la lista global de alumnos para generar los grupos (KPIs y Tarjetas)
    fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ accion: "admin_obtener_grupo", grupo: "TODOS" }) })
    .then(res => res.json())
    .then(data => {
        if (data.status === "éxito") {
            window.listaGlobalAlumnos = data.alumnos || [];
            if(typeof window.renderizarTarjetasGrupos === 'function'){
                window.renderizarTarjetasGrupos();
            }
        }
    }).catch(err => console.error("Error al cargar alumnos:", err));
};

window.renderizarTarjetasGrupos = function() {
    const contenedor = document.getElementById('contenedor-tarjetas-grupos');
    if (!contenedor || !window.listaGlobalAlumnos) return;
    
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
// SECCIÓN 6: GESTIÓN DE EVALUACIONES (DOCENTE)
// =======================================================
window.abrirGestionGrupo = function(grupoId) {
    window.grupoSeleccionadoAdmin = grupoId;
    window.cambiarVistaAdmin('lista-alumnos'); 
    
    document.getElementById('titulo-lista-alumnos').innerText = `👥 Lista de Alumnos: Grupo ${grupoId}`;
    
    const buscador = document.getElementById('buscador-lista-alumnos');
    const selectorMod = document.getElementById('filtro-modalidad-lista');
    if (buscador) buscador.value = "";
    if (selectorMod) selectorMod.value = "TODOS";

    window.renderizarListaAlumnosGrupo();
};

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

window.abrirPanelAlumno = function(matricula, nombre) {
    window.alumnoSeleccionadoAdmin = matricula; 
    window.cambiarVistaAdmin('gestion-interno'); 
    window.nombreSeleccionadoAdmin = nombre;
    
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
                    let estadoActual = e.estado ? e.estado.trim() : "Pendiente de Entrega";
                    let statusColor, statusBg, statusIcon;
                    
                    if (estadoActual === "Cumplida") {
                        statusColor = "#166534"; statusBg = "#dcfce7"; statusIcon = "🌟";
                    } else if (estadoActual === "Requiere Corrección") {
                        statusColor = "#c2410c"; statusBg = "#ffedd5"; statusIcon = "⚠️";
                    } else if (estadoActual === "No Entregada") {
                        statusColor = "#be123c"; statusBg = "#ffe4e6"; statusIcon = "❌";
                    } else if (estadoActual === "Pendiente de Revisión") {
                        statusColor = "#b45309"; statusBg = "#fef3c7"; statusIcon = "⏳";
                    } else {
                        estadoActual = "Pendiente de Entrega";
                        statusColor = "#1e3a8a"; statusBg = "#dbeafe"; statusIcon = "📅";
                    }

                    let btnArchivo = e.archivoUrl 
                        ? `<a href="${e.archivoUrl}" target="_blank" style="color: #0369a1; font-weight: bold; text-decoration: none; font-size: 0.85rem;">📎 Ver Archivo</a>` 
                        : `<span style="color: #94a3b8;">- Sin archivo -</span>`;

                    return `
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 10px; font-weight: bold; color: var(--text-main);">${e.actividad}</td>
                        <td style="padding: 10px; text-align: center;">${btnArchivo}</td>
                        <td style="padding: 10px; text-align: center;">
                            <span style="background: ${statusBg}; color: ${statusColor}; padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: bold;">
                                ${statusIcon} ${estadoActual}
                            </span>
                        </td>
                        <td style="padding: 10px; text-align: center;">
                            <select id="estado-${e.filaFisica}" style="padding: 4px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.85rem;">
                                <option value="Pendiente de Entrega" ${estadoActual === 'Pendiente de Entrega' ? 'selected' : ''}>Pendiente de Entrega</option>
                                <option value="Pendiente de Revisión" ${estadoActual === 'Pendiente de Revisión' ? 'selected' : ''}>Pendiente de Revisión</option>
                                <option value="Requiere Corrección" ${estadoActual === 'Requiere Corrección' ? 'selected' : ''}>Requiere Corrección</option>
                                <option value="Cumplida" ${estadoActual === 'Cumplida' ? 'selected' : ''}>Cumplida</option>
                                <option value="No Entregada" ${estadoActual === 'No Entregada' ? 'selected' : ''}>No Entregada</option>
                            </select>
                        </td>
                        <td style="padding: 10px; text-align: center;"><input type="number" id="nota-${e.filaFisica}" value="${e.calificacion}" min="0" max="100" style="width: 60px; padding: 4px; text-align: center; border: 1px solid #cbd5e1; border-radius: 4px;"></td>
                        <td style="padding: 10px; text-align: center;"><button class="btn-conalep" style="background-color: #0284c7; padding: 0.35rem 0.7rem; font-size: 0.8rem;" onclick="window.guardarCalificacionFila(${e.filaFisica}, this)">💾 Guardar</button></td>
                    </tr>
                    `;
                }).join('');
            } else {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 1.5rem; color: var(--text-muted);">El alumno aún no ha subido evidencias.</td></tr>`;
            }
        } else {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 1.5rem; color: var(--text-muted);">No hay evidencias registradas.</td></tr>`;
        }
    }).catch(err => { console.error(err); tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 1rem; color: red;">Error servidor.</td></tr>`; });
};

window.guardarCalificacionFila = function(filaFisica, btnTarget) {
    const inputNota = document.getElementById(`nota-${filaFisica}`);
    const selectEstado = document.getElementById(`estado-${filaFisica}`);
    const nota = inputNota ? inputNota.value : "";
    const estadoNuevo = selectEstado ? selectEstado.value : "Pendiente de Entrega";
    let observacionTexto = "";

    if (estadoNuevo === "Requiere Corrección") {
        observacionTexto = prompt("Observaciones (¿Qué ajuste debe realizar el estudiante?):");
        if (observacionTexto === null) return; 
    }
    
    const textoOriginal = btnTarget.innerText;
    btnTarget.innerText = "⏳...";
    btnTarget.disabled = true;

    fetch(SCRIPT_URL, { 
        method: 'POST', 
        body: JSON.stringify({ 
            accion: "calificar_entrega", 
            fila: filaFisica, 
            calificacion: nota, 
            estado: estadoNuevo,
            observacion: observacionTexto 
        }) 
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "éxito") {
            alert(`✅ Tarea guardada con estado: ${estadoNuevo}`);
            window.abrirPanelAlumno(window.alumnoSeleccionadoAdmin, window.nombreSeleccionadoAdmin);
        } else { alert("❌ Error: " + data.mensaje); }
    }).catch(() => alert("⚠️ Error de comunicación con el servidor."))
    .finally(() => {
        btnTarget.innerText = textoOriginal;
        btnTarget.disabled = false;
    });
};

window.filtrarCatalogoGeneral = function() {
    const tbody = document.getElementById('tabla-catalogo-general');
    if (!tbody) return;

    if (window.catalogoGeneralTareas && window.catalogoGeneralTareas.length > 0) {
        tbody.innerHTML = window.catalogoGeneralTareas.map(t => {
            let estadoCrudo = String(t.estatus).toUpperCase().trim();
            let estadoActual = "ACTIVA"; 
            
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
                    <select id="estatus-cat-${t.id}" style="padding: 4px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.85rem;">
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
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 1.5rem; color: var(--text-muted);">No hay tareas.</td></tr>`;
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
            alert(`✅ Tarea guardada con estado: ${nuevoEstatus}`);
            window.cargarDatosAdministrativos(); 
            setTimeout(() => window.cambiarVistaAdmin('catalogo'), 1500); 
        } else {
            alert("❌ Error: " + data.mensaje);
        }
    })
    .catch(() => alert("⚠️ Error de comunicación con el servidor."));
};

window.publicarNuevaTarea = function() {
    const idTarea = document.getElementById('nt-id').value.trim();
    const unidad = document.getElementById('nt-unidad').value.trim();
    const titulo = document.getElementById('nt-titulo').value.trim();
    const desc = document.getElementById('nt-desc').value.trim();
    const fecha = document.getElementById('nt-fecha').value;
    const puntos = document.getElementById('nt-puntos').value;
    const grupo = document.getElementById('nt-grupo').value;

    if (!idTarea || !titulo || !unidad) {
        alert("⚠️ Llena al menos ID, Módulo y Título.");
        return;
    }

    const btn = document.getElementById('btn-guardar-tarea');
    btn.innerText = "⏳ Publicando..."; 
    btn.disabled = true;

    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ accion: "nueva_tarea", idTarea: idTarea, unidad: unidad, titulo: titulo, desc: desc, fecha: fecha, puntos: puntos, grupo: grupo })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "éxito") {
            alert("✅ Tarea publicada.");
            document.querySelectorAll('#form-nueva-tarea input, #form-nueva-tarea textarea').forEach(el => el.value = '');
            document.getElementById('form-nueva-tarea').classList.add('hidden'); 
            window.cargarDatosAdministrativos();
            setTimeout(() => window.cambiarVistaAdmin('catalogo'), 1500);
        } else {
            alert("❌ Error: " + data.mensaje);
        }
    })
    .catch(() => alert("⚠️ Error de comunicación con el servidor."))
    .finally(() => { btn.innerText = "🚀 Publicar Actividad Oficial"; btn.disabled = false; });
};

/// =======================================================
// SECCIÓN 7: VENTANILLA DE ESTUDIANTES (ENTREGAS MÚLTIPLES)
// =======================================================
window.subirEvidencia = function() {
    const fileInput = document.getElementById('input-archivo');
    const actividadCompleta = document.getElementById('select-tarea').value;
    const matricula = localStorage.getItem('matriculaActiva');
    const grupo = localStorage.getItem('grupoActivo');
    const nombre = localStorage.getItem('nombreActivo');

    if (!matricula) return alert("⚠️ Inicia sesión para enviar evidencias.");
    if (!actividadCompleta || actividadCompleta.includes("--")) return alert("⚠️ Selecciona la tarea antes de subir archivos.");
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) return alert("⚠️ Selecciona al menos un archivo.");
    
    // Sumar el peso de todos los archivos para no saturar
    let pesoTotal = 0;
    for (let i = 0; i < fileInput.files.length; i++) {
        pesoTotal += fileInput.files[i].size;
    }
    if (pesoTotal > 26214400) return alert("⚠️ El peso total supera los 25MB. Intenta subir archivos más ligeros.");

    const btn = document.getElementById('btn-enviar') || document.querySelector('button[onclick="window.subirEvidencia()"]');
    if (btn) { btn.innerText = "⏳ Procesando archivos..."; btn.disabled = true; }

    // Extraemos estrictamente el ID de la tarea (Ej: "EV05" de "EV05 - Ejercicios...")
    const idTarea = actividadCompleta.split(" - ")[0].trim();

    // Leemos todas las fotos al mismo tiempo usando Promesas
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

    // Cuando termine de procesar las fotos, las manda empaquetadas al backend
    Promise.all(promesas).then(archivosProcesados => {
        if (btn) btn.innerText = "⏳ Subiendo a tu Drive...";
        
        fetch(SCRIPT_URL, { 
            method: 'POST', 
            body: JSON.stringify({ 
                accion: "subir_multiples", // <--- Llama a la ruta correcta que renombra
                matricula: matricula, 
                grupo: grupo, 
                nombre: nombre, 
                actividad: actividadCompleta,
                idTarea: idTarea,
                archivos: archivosProcesados 
            }) 
        })
        .then(res => res.json())
        .then(data => { 
            if (data.status === "éxito") { 
                alert(`✅ ¡Tus ${archivosProcesados.length} archivos se enviaron correctamente!`); 
                fileInput.value = ""; 
                // Refrescamos el historial automáticamente
                if (typeof window.consultarAvanceReal === 'function') window.consultarAvanceReal(matricula);
            } else { 
                alert("❌ Error en el servidor: " + data.mensaje); 
            }
        })
        .catch(err => { console.error(err); alert("⚠️ Error de conexión."); })
        .finally(() => { if (btn) { btn.innerText = "📤 Enviar Evidencia a Revisión"; btn.disabled = false; }});
    });
};

// ==========================================
// SECCIÓN 8: PANEL DE ASISTENCIA Y RADAR (ADMIN)
// ==========================================
window.datosAsistenciaDia = []; 

window.cargarAsistenciasDia = function() {
    const tbody = document.getElementById('tabla-asistencia-dia');
    if (!tbody) return;

    const inputFecha = document.getElementById('filtro-fecha-asis');
    if (inputFecha && !inputFecha.value) {
        const hoy = new Date();
        const yyyy = hoy.getFullYear();
        const mm = String(hoy.getMonth() + 1).padStart(2, '0');
        const dd = String(hoy.getDate()).padStart(2, '0');
        inputFecha.value = `${yyyy}-${mm}-${dd}`;
    }

    const fechaSeleccionada = inputFecha.value;
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem;">📡 Escaneando registros...</td></tr>`;

    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ accion: "consultar_asistencia", fecha: fechaSeleccionada })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "éxito") {
            window.datosAsistenciaDia = data.asistencias.map(asis => ({
                matricula: asis.matricula, nombre: asis.nombre, grupo: asis.grupo, modalidad: asis.modalidad, 
                hora: asis.hora, estatus: asis.estatus, global: asis.global 
            }));
            const selectorGrupos = document.getElementById('filtro-grupo-asis');
            if (selectorGrupos && selectorGrupos.options.length <= 1 && window.listaGlobalAlumnos) {
                 const gUnicos = [...new Set(window.listaGlobalAlumnos.map(a => String(a.grupo).trim()))].filter(g => g !== "" && g !== "undefined");
                 gUnicos.sort().forEach(g => {
                     let opt = document.createElement("option"); opt.value = g; opt.text = "Grupo " + g; selectorGrupos.add(opt);
                 });
            }
            window.filtrarTablaAsistencia();
        } else {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: red;">❌ Error: ${data.mensaje}</td></tr>`;
        }
    }).catch(err => { tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: red;">⚠️ Error de conexión.</td></tr>`; });
};

window.filtrarTablaAsistencia = function() {
    const tbody = document.getElementById('tabla-asistencia-dia');
    if (!tbody) return;

    const fGrupo = document.getElementById('filtro-grupo-asis')?.value || "TODOS";
    const fMod = document.getElementById('filtro-mod-asis')?.value || "TODOS";

    let html = '';
    let countHoy = 0, countPres = 0, countDual = 0, countFuera = 0;
    const datos = window.datosAsistenciaDia || [];

    datos.forEach(asis => {
        const grupoAsis = String(asis.grupo).replace('Grupo ', '').trim();
        const modAsis = String(asis.modalidad || asis.mod || "Presencial").trim(); 
        const estatus = String(asis.estatus).trim();

        if ((fGrupo === "TODOS" || fGrupo === grupoAsis) && (fMod === "TODOS" || fMod === modAsis)) {
            countHoy++;
            if (modAsis === "Presencial") countPres++;
            if (modAsis === "Dual") countDual++;
            if (estatus.includes("Fuera") || estatus.includes("⚠️")) countFuera++;

            let badgeEstatus = `<span style="background: #e2e8f0; padding: 4px 10px; border-radius: 12px; font-size: 0.8rem;">${estatus}</span>`;
            if (estatus.includes("Plantel") || estatus.includes("✅")) badgeEstatus = `<span style="background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: bold;">${estatus}</span>`;
            else if (estatus.includes("Remoto") || estatus.includes("App")) badgeEstatus = `<span style="background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: bold;">${estatus}</span>`;
            else if (estatus.includes("Fuera") || estatus.includes("⚠️")) badgeEstatus = `<span style="background: #fee2e2; color: #991b1b; padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: bold;">${estatus}</span>`;

            html += `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 12px;"><strong style="color: var(--conalep-dark);">${asis.nombre}</strong><br><small style="color: var(--text-muted);">${asis.matricula}</small></td>
                    <td style="padding: 12px; text-align: center; font-weight: bold; color: var(--conalep-accent);">G-${grupoAsis}</td>
                    <td style="padding: 12px; text-align: center;"><span style="background: ${modAsis === 'Dual' ? '#fef9c3' : '#f1f5f9'}; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem;">${modAsis}</span></td>
                    <td style="padding: 12px; text-align: center; font-size: 0.85rem; color: var(--text-muted);">${asis.hora}</td>
                    <td style="padding: 12px; text-align: center;">${badgeEstatus}</td>
                    <td style="padding: 12px; text-align: center;">
                        <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                            <div style="background: #e2e8f0; width: 60px; height: 6px; border-radius: 3px; overflow: hidden;"><div style="background: var(--conalep-primary); height: 100%; width: ${asis.global}%;"></div></div>
                            <span style="font-size: 0.75rem; font-weight: bold;">${asis.global}%</span>
                        </div>
                    </td>
                </tr>`;
        }
    });

    tbody.innerHTML = html === '' ? `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">No hay check-ins para este grupo/modalidad.</td></tr>` : html;
    document.getElementById('kpi-asis-hoy').innerText = countHoy;
    document.getElementById('kpi-asis-pres').innerText = countPres;
    document.getElementById('kpi-asis-dual').innerText = countDual;
    document.getElementById('kpi-asis-fuera').innerText = countFuera;
};

// ==========================================
// SECCIÓN 8.1: EXPORTACIÓN DE REPORTE A PDF
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
    
    setTimeout(() => {
        ventanaImpresion.focus();
        ventanaImpresion.print();
    }, 500);
};

// ==========================================
// SECCIÓN 9: CHECK-IN Y RADAR GPS (ALUMNOS)
// ==========================================
window.marcarAsistencia = function() {
    const btn = document.getElementById('btn-checkin');
    const msg = document.getElementById('msg-checkin');
    
    const matricula = sessionStorage.getItem('matriculaActiva') || document.getElementById('lbl-matricula').innerText;
    const nombre = sessionStorage.getItem('nombreActivo') || document.getElementById('lbl-nombre').innerText;
    const grupo = sessionStorage.getItem('grupoActivo') || document.getElementById('lbl-grupo').innerText.replace('Grupo ', '');

    btn.disabled = true; btn.innerText = "🔍 Verificando perfil..."; msg.style.color = "#64748b"; msg.innerText = "Consultando permisos en servidor...";

    fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ accion: "consultar_modalidad", matricula: matricula }) })
    .then(res => res.json())
    .then(data => {
        const modalidadReal = data.modalidad || "Presencial";
        if (modalidadReal === "Dual" || modalidadReal.toLowerCase().includes("dual")) {
            btn.innerText = "📡 Registrando...";
            window.enviarRegistroAsistencia(matricula, nombre, grupo, "Dual", "💻 App Activa (Remoto)");
        } else {
            btn.innerText = "📡 Detectando GPS...";
            msg.innerText = "Calculando distancia al plantel...";

            if (!navigator.geolocation) {
                msg.innerText = "⚠️ Navegador no soporta GPS.";
                return window.enviarRegistroAsistencia(matricula, nombre, grupo, "Presencial", "⚠️ Sin GPS");
            }

            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const latAlumno = pos.coords.latitude, lonAlumno = pos.coords.longitude;
                    const latConalep = 20.685056, lonConalep = -87.058308;
                    const R = 6371e3, φ1 = latAlumno * Math.PI/180, φ2 = latConalep * Math.PI/180;
                    const Δφ = (latConalep - latAlumno) * Math.PI/180, Δλ = (lonConalep - lonAlumno) * Math.PI/180;
                    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
                    const distancia = R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))); 

                    let estatus = (distancia <= 150) ? "📍 En Plantel" : "⚠️ Fuera de Rango";
                    window.enviarRegistroAsistencia(matricula, nombre, grupo, "Presencial", estatus);
                },
                (err) => {
                    msg.innerText = "❌ GPS Denegado.";
                    window.enviarRegistroAsistencia(matricula, nombre, grupo, "Presencial", "⚠️ GPS Bloqueado");
                }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        }
    })
    .catch(err => { btn.disabled = false; btn.innerText = "📍 Reintentar Check-In"; msg.style.color = "red"; msg.innerText = "Error de red."; });
};

window.enviarRegistroAsistencia = function(mat, nom, gru, mod, estatus) {
    const btn = document.getElementById('btn-checkin');
    const msg = document.getElementById('msg-checkin');

    fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ accion: "registrar_asistencia", matricula: mat, nombre: nom, grupo: gru, modalidad: mod, estatus: estatus }) })
    .then(res => res.json())
    .then(data => {
        if (data.status === "éxito" || data.status === "duplicado") {
            btn.style.background = "#16a34a"; btn.innerText = "✅ Asistencia Registrada"; btn.disabled = true; 
            msg.style.color = estatus.includes("Fuera") || estatus.includes("⚠️") ? "#dc2626" : "#16a34a";
            msg.innerText = data.status === "duplicado" ? "Tu asistencia ya estaba registrada." : `Estatus: ${estatus}`;
            localStorage.setItem(`checkin_${mat}`, new Date().toLocaleDateString('en-CA'));
        } else {
            btn.disabled = false; btn.innerText = "📍 Reintentar Check-In"; msg.style.color = "red"; msg.innerText = "Error: " + data.mensaje;
        }
    }).catch(err => { btn.disabled = false; btn.innerText = "📍 Reintentar"; msg.innerText = "Error de red."; });
};

// ==========================================
// NUEVA FUNCIÓN: Verificar al Iniciar Sesión (Con Candado de Fin de Semana)
// ==========================================
window.verificarCheckinPrevio = function(mat) {
    const hoy = new Date();
    const diaSemana = hoy.getDay(); // 0 = Domingo, 6 = Sábado
    const hoyStr = hoy.toLocaleDateString('en-CA');
    const btn = document.getElementById('btn-checkin');
    const msg = document.getElementById('msg-checkin');
    
    // CANDADO 1: Bloqueo de Sábados y Domingos
    if (diaSemana === 0 || diaSemana === 6) {
        if (btn && msg) {
            btn.disabled = true;
            btn.style.background = "#64748b";
            btn.innerText = "🏖️ Descanso de Fin de Semana";
            msg.style.color = "#64748b";
            msg.innerText = "El pase de lista solo está habilitado de lunes a viernes.";
        }
        return; // Detenemos la función aquí
    }

    // CANDADO 2: Si ya hizo check-in hoy
    if (localStorage.getItem(`checkin_${mat}`) === hoyStr && btn && msg) {
        btn.disabled = true;
        btn.style.background = "#16a34a";
        btn.innerText = "✅ Asistencia de Hoy Lista";
        msg.style.color = "#16a34a";
        msg.innerText = "Ya registraste tu check-in exitosamente el día de hoy.";
    } else if (btn) {
        // Día normal de lunes a viernes
        btn.disabled = false;
        btn.style.background = "#0f172a";
        btn.innerText = "📍 Registrar Asistencia (Hoy)";
        msg.innerText = "";
    }
};

// ==========================================
// SECCIÓN 10: MOTOR DE RETOS INTERACTIVOS
// ==========================================
let tiempoInicio = null;

window.iniciarCronometroReto = function() {
    tiempoInicio = Date.now();
};
