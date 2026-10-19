// =======================================================
// URL DE TU BACKEND EN GOOGLE APPS SCRIPT (SICAL)
// =======================================================
const SCRIPT_URL = "https://script.google.com/macros/library/d/1vQfTPyGBqwKITYOTe8jUGoAQLUktEsjJJQeEif2ubrU_kTTeV2ADaKaW/59"; 

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
        window.inicializarPanelAdmin();
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
                if(imgPerfil) {
                    imgPerfil.src = data.fotoPerfilUrl;
                    imgPerfil.style.display = 'block';
                }
                if(emojiCamara) emojiCamara.style.display = 'none';
            }

            sessionStorage.setItem('matriculaActiva', matricula);
            sessionStorage.setItem('grupoActivo', data.grupo);
            sessionStorage.setItem('nombreActivo', data.nombreCompleto);

            document.getElementById('vista-login').classList.add('hidden');
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
window.consultarAvanceReal = function(matricula) {
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
            window.dibujarGrafica(data.parciales);
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
};

// ==========================================
//  3. GRÁFICA DE EVALUACIÓN Y DESGLOSE
// ==========================================
window.dibujarGrafica = function(parcialesData) {
    const canvas = document.getElementById('graficaParciales');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    if (window.miGrafica) window.miGrafica.destroy();

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
                    window.mostrarDesglose(index);
                }
            }
        }
    });
};

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
window.inicializarPanelAdmin = function() {
    document.getElementById('vista-login')?.classList.add('hidden');
    document.getElementById('vista-admin')?.classList.remove('hidden');
    document.getElementById('user-menu')?.classList.remove('hidden');
    
    const welcome = document.getElementById('welcome-name');
    if (welcome) welcome.innerText = "👨‍🏫 Bienvenido, Prof. Juan Luis";
    
    // Disparamos la carga de la vista panorámica nueva
    window.cargarModuloMisGrupos("TODOS");
    
    // Y mantenemos la original por si la usas en otro lado
    window.cargarGruposDocente();
};

window.cargarModuloMisGrupos = function(grupoFiltro = "TODOS") {
    const tbodyAlumnos = document.getElementById('tabla-alumnos-maestra');
    
    if (tbodyAlumnos) {
        tbodyAlumnos.innerHTML = `<tr><td colspan="6" style="padding: 20px; text-align: center; color: #64748b;">⏳ Sincronizando datos con Google Sheets...</td></tr>`;
    }

    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ accion: "admin_obtener_grupo", grupo: grupoFiltro })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status !== "éxito") {
            if (tbodyAlumnos) tbodyAlumnos.innerHTML = `<tr><td colspan="6" style="padding: 20px; text-align: center; color: #ef4444;">⚠️ Error: ${data.mensaje}</td></tr>`;
            return;
        }

        const kpiGrupos = document.getElementById('kpi-grupos');
        const kpiAlumnos = document.getElementById('kpi-alumnos');
        const kpiTareas = document.getElementById('kpi-tareas');
        const kpiTasa = document.getElementById('kpi-tasa');

        if(kpiGrupos) kpiGrupos.innerText = data.kpis.gruposTexto;
        if(kpiAlumnos) kpiAlumnos.innerText = data.kpis.totalAlumnos;
        if(kpiTareas) kpiTareas.innerText = data.kpis.tareasEnCurso;
        if(kpiTasa) kpiTasa.innerText = data.kpis.tasaEntrega;

        if (tbodyAlumnos) {
            tbodyAlumnos.innerHTML = "";
            if (data.alumnos.length === 0) {
                tbodyAlumnos.innerHTML = `<tr><td colspan="6" style="padding: 20px; text-align: center; color: #64748b;">No hay alumnos registrados.</td></tr>`;
                return;
            }

            data.alumnos.forEach(alumno => {
                const tr = document.createElement('tr');
                tr.style.borderBottom = "1px solid #e2e8f0";

                let statusColor = "#475569";
                let statusBg = "#f1f5f9";
                if (alumno.estado === "Cumplido" || alumno.estado === "Revisado") {
                    statusColor = "#166534";
                    statusBg = "#dcfce7";
                } else if (alumno.estado === "Pendiente") {
                    statusColor = "#b45309";
                    statusBg = "#fef3c7";
                }

                tr.innerHTML = `
                    <td style="padding: 12px; font-family: monospace; color: #475569;">${alumno.matricula}</td>
                    <td style="padding: 12px; text-align: left; font-weight: bold; color: #1e293b;">${alumno.nombre}</td>
                    <td style="padding: 12px;"><span style="background: #e0f2fe; color: #0369a1; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 0.85rem;">G-${alumno.grupo}</span></td>
                    <td style="padding: 12px; text-align: left; color: #334155;">${alumno.ultimaTarea}</td>
                    <td style="padding: 12px; font-weight: bold; color: #004d40;">${alumno.calificacion}</td>
                    <td style="padding: 12px;"><span style="background: ${statusBg}; color: ${statusColor}; padding: 4px 10px; border-radius: 12px; font-weight: bold; font-size: 0.85rem;">${alumno.estado}</span></td>
                `;
                tbodyAlumnos.appendChild(tr);
            });
        }
    })
    .catch(err => {
        console.error("Error al cargar grupos:", err);
        if (tbodyAlumnos) tbodyAlumnos.innerHTML = `<tr><td colspan="6" style="padding: 20px; text-align: center; color: #ef4444;">❌ Error de conexión.</td></tr>`;
    });
};

// ==========================================
// TUS FUNCIONES ADMINISTRATIVAS ORIGINALES
// ==========================================
window.cargarGruposDocente = function() {
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
    .catch(() => { contenedor.innerHTML = `<p style="color: red;">No se pudo conectar con el servidor.</p>`; });
};

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
    window.cargarEntregasGrupo(grupoId);
};

window.recargarDatosGrupoActual = function() {
    if (grupoSeleccionadoAdmin) window.cargarEntregasGrupo(grupoSeleccionadoAdmin);
};

window.mostrarFormularioTareaGrupo = function() {
    document.getElementById('form-tarea-grupo')?.classList.toggle('hidden');
};

window.cargarEntregasGrupo = function(grupoId) {
    const tbody = document.getElementById('tabla-gestion-entregas');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 1rem;">Cargando entregas...</td></tr>`;

    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ accion: "obtener_entregas_grupo", grupo: grupoId })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "éxito" && data.entregas.length > 0) {
            tbody.innerHTML = data.entregas.map(e => `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 10px;"><strong>${e.nombre}</strong><br><small style="color: var(--text-muted);">${e.matricula}</small></td>
                    <td style="padding: 10px;">${e.actividad}</td>
                    <td style="padding: 10px;"><a href="${e.archivoUrl}" target="_blank" style="color: var(--conalep-accent); font-weight: bold; text-decoration: none;">📎 Ver Archivo</a></td>
                    <td style="padding: 10px; text-align: center;"><span class="badge-status ${e.estado === 'Revisado' ? 'status-ok' : 'status-pend'}">${e.estado}</span></td>
                    <td style="padding: 10px; text-align: center;"><input type="number" id="nota-${e.filaFisica}" value="${e.calificacion}" min="0" max="100" style="width: 60px; padding: 4px; text-align: center; border: 1px solid #cbd5e1; border-radius: 4px;"></td>
                    <td style="padding: 10px; text-align: center;"><button class="btn-conalep" style="padding: 0.35rem 0.7rem; font-size: 0.8rem;" onclick="window.guardarCalificacionFila(${e.filaFisica})">💾 Guardar</button></td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 1.5rem; color: var(--text-muted);">No hay evidencias registradas para el Grupo ${grupoId}.</td></tr>`;
        }
    })
    .catch(() => { tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 1rem; color: red;">Error al consultar entregas.</td></tr>`; });
};

window.guardarCalificacionFila = function(filaFisica) {
    const inputNota = document.getElementById(`nota-${filaFisica}`);
    const nota = inputNota ? inputNota.value : "";
    
    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ accion: "calificar_entrega", fila: filaFisica, calificacion: nota, estado: "Revisado" })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "éxito") {
            alert("✅ Calificación guardada exitosamente.");
            window.recargarDatosGrupoActual();
        } else {
            alert("❌ Error: " + data.mensaje);
        }
    })
    .catch(() => alert("⚠️ Error de comunicación con el servidor."));
};

window.publicarTareaGrupoActual = function() {
    const idTarea = document.getElementById('admin-id')?.value.trim();
    const unidad = document.getElementById('admin-mod')?.value.trim();
    const titulo = document.getElementById('admin-titulo')?.value.trim();
    const desc = document.getElementById('admin-desc')?.value.trim();
    const fecha = document.getElementById('admin-fecha')?.value;
    const puntos = document.getElementById('admin-puntos')?.value;

    if (!idTarea || !unidad || !titulo) {
        alert("⚠️ Completa los campos obligatorios: ID, Módulo y Título.");
        return;
    }

    let gruposSeleccionados = [grupoSeleccionadoAdmin];
    const checkboxesExtra = document.querySelectorAll('.chk-grupo-extra:checked');
    checkboxesExtra.forEach(chk => {
        if (chk.value !== grupoSeleccionadoAdmin) gruposSeleccionados.push(chk.value);
    });

    const stringGruposDestino = gruposSeleccionados.join(", ");
    const btn = document.getElementById('btn-publicar-tarea');
    if (btn) { btn.disabled = true; btn.innerText = "Publicando..."; }

    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ accion: "nueva_tarea", idTarea: idTarea, unidad: unidad, titulo: titulo, desc: desc, fecha: fecha, puntos: puntos, grupo: stringGruposDestino })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "éxito") {
            alert(`✅ Tarea publicada correctamente para los grupos: ${stringGruposDestino}.`);
            document.querySelectorAll('#form-tarea-grupo input, #form-tarea-grupo textarea').forEach(e => e.value = '');
            document.querySelectorAll('.chk-grupo-extra').forEach(chk => chk.checked = false); 
            document.getElementById('form-tarea-grupo')?.classList.add('hidden');
        } else {
            alert("❌ Error: " + data.mensaje);
        }
    })
    .finally(() => { if (btn) { btn.disabled = false; btn.innerText = "🚀 Publicar Tarea"; } });
};

// ==========================================
// 5. GESTIÓN DEL CATÁLOGO DE TAREAS Y ASISTENCIA
// ==========================================
let catalogoGeneralTareas = [];
let listaCompletaAlumnos = [];

window.cargarDatosAdministrativos = function() {
    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ accion: "consultar", matricula: "ADMIN-JL" }) 
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "éxito") {
            catalogoGeneralTareas = data.catalogo || [];
            listaCompletaAlumnos = data.listaAlumnos || [];
            window.poblarSelectoresGrupos(data.listaAlumnos);
            window.filtrarCatalogoGeneral();
            window.filtrarAsistencia();
        }
    })
    .catch(err => console.error("Error al cargar datos administrativos:", err));
};

window.poblarSelectoresGrupos = function(alumnos) {
    const grupos = [...new Set(alumnos.map(a => a.grupo).filter(g => g && g !== "Grupo"))];
    const selectCatalogo = document.getElementById('filtro-catalogo-grupo');
    const selectAsistencia = document.getElementById('filtro-asistencia-grupo');
    
    if (selectCatalogo) {
        selectCatalogo.innerHTML = `<option value="TODOS">Todos los Grupos</option>` + grupos.map(g => `<option value="${g}">Grupo ${g}</option>`).join('');
        selectCatalogo.onchange = window.filtrarCatalogoGeneral;
    }
    if (selectAsistencia) {
        selectAsistencia.innerHTML = `<option value="">-- Selecciona --</option>` + grupos.map(g => `<option value="${g}">Grupo ${g}</option>`).join('');
    }
};

window.filtrarCatalogoGeneral = function() {
    const grupoSeleccionado = document.getElementById('filtro-catalogo-grupo')?.value;
    const tbody = document.getElementById('tabla-catalogo-general');
    if (!tbody) return;

    let tareasFiltradas = catalogoGeneralTareas;
    if (grupoSeleccionado && grupoSeleccionado !== "TODOS") {
        tareasFiltradas = catalogoGeneralTareas.filter(t => t.grupos === "Todos" || t.grupos.includes(grupoSeleccionado));
    }

    if (tareasFiltradas.length > 0) {
        tbody.innerHTML = tareasFiltradas.map(t => `
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px;"><strong>${t.id}</strong><br><small>${t.titulo}</small></td>
                <td style="padding: 10px; text-align: center;"><span style="background: #e0f2fe; color: #0369a1; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem;">${t.grupos}</span></td>
                <td style="padding: 10px; text-align: center; color: var(--text-muted);">${t.fecha}</td>
                <td style="padding: 10px; text-align: center;"><button class="btn-conalep" style="background-color: #ef4444; padding: 0.35rem 0.8rem; font-size: 0.8rem;" onclick="window.desactivarTarea('${t.id}')">🛑 Desactivar</button></td>
            </tr>
        `).join('');
    } else {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 1.5rem; color: var(--text-muted);">No hay tareas encontradas para este filtro.</td></tr>`;
    }
};

window.filtrarAsistencia = function() {
    const grupoSeleccionado = document.getElementById('filtro-asistencia-grupo')?.value;
    const modalidadSeleccionada = document.getElementById('filtro-asistencia-modalidad')?.value;
    const tbody = document.getElementById('tabla-lista-asistencia');
    
    if (!tbody) return;
    if (!grupoSeleccionado) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 2rem; color: var(--text-muted);">Por favor, selecciona un grupo para ver la lista.</td></tr>`;
        return;
    }

    let alumnosFiltrados = listaCompletaAlumnos.filter(a => a.grupo === grupoSeleccionado);
    if (modalidadSeleccionada && modalidadSeleccionada !== "TODAS") {
        alumnosFiltrados = alumnosFiltrados.filter(a => a.modalidad.includes(modalidadSeleccionada));
    }

    if (alumnosFiltrados.length > 0) {
        tbody.innerHTML = alumnosFiltrados.map((a, index) => `
            <tr style="border-bottom: 1px solid #e2e8f0; background: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'}">
                <td style="padding: 10px; font-family: monospace; color: var(--text-muted);">${a.matricula}</td>
                <td style="padding: 10px; font-weight: bold; color: var(--conalep-dark);">${a.nombre}</td>
                <td style="padding: 10px; text-align: center;"><span style="font-size: 0.8rem; background: ${a.modalidad.includes('Dual') ? '#fef3c7' : '#dcfce7'}; color: ${a.modalidad.includes('Dual') ? '#b45309' : '#166534'}; padding: 3px 8px; border-radius: 4px;">${a.modalidad || "Sin Definir"}</span></td>
                <td style="padding: 10px; text-align: center;">
                    <select id="asist-${a.matricula}" style="padding: 0.4rem; border-radius: 4px; border: 1px solid #cbd5e1;">
                        <option value="Presente">✅ Presente</option>
                        <option value="Falta">❌ Falta</option>
                        <option value="Justificado">📝 Justificado</option>
                    </select>
                </td>
            </tr>
        `).join('');
    } else {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 1.5rem; color: var(--text-muted);">No hay alumnos que coincidan con este filtro.</td></tr>`;
    }
};

// ==========================================
// 6. SUBIDA DE FOTO DE PERFIL (ALUMNOS)
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
            body: JSON.stringify({ accion: "subir_foto_perfil", matricula: matricula, nombre: nombre, grupo: grupo, nombreArchivo: file.name, mimeType: file.type, archivoBase64: base64Data })
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

// ==========================================
// 7. BUSCADOR EN VIVO DE ALUMNOS (MEJORADO)
// ==========================================
window.filtrarBusquedaAlumnos = function() {
    // 1. Capturamos lo que escribes y lo pasamos a minúsculas
    const input = document.getElementById("buscador-alumno");
    if (!input) return;
    const filtro = input.value.toLowerCase();
    
    // 2. Tomamos solo las filas del cuerpo de la tabla (tbody)
    const tbody = document.getElementById("tabla-alumnos-maestra");
    if (!tbody) return;
    const filas = tbody.getElementsByTagName("tr");

    // 3. Recorremos fila por fila
    for (let i = 0; i < filas.length; i++) {
        const fila = filas[i];
        // Si la fila es un mensaje de carga, la ignoramos
        if (fila.innerText.includes("Sincronizando") || fila.innerText.includes("No hay alumnos")) continue;

        const celdas = fila.getElementsByTagName("td");
        let textoFilaCompleta = "";

        // Unimos el texto de todas las celdas de esa fila
        for (let j = 0; j < celdas.length; j++) {
            textoFilaCompleta += celdas[j].innerText.toLowerCase() + " ";
        }

        // Si el texto de la fila contiene lo que escribiste, la mostramos, sino, la ocultamos
        if (textoFilaCompleta.includes(filtro)) {
            fila.style.display = ""; 
        } else {
            fila.style.display = "none"; 
        }
    }
};
