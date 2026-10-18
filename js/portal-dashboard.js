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
            
            // Aquí puedes llamar a tu función que dibuja la gráfica
            // cargarDatosDashboard(matricula); 
        } else {
            alert("❌ " + data.mensaje);
        }
    })
    .catch(err => {
        console.error(err);
        alert("⚠️ Error de conexión con el servidor.");
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
// 3. GRÁFICA DE EVALUACIÓN Y DESGLOSE (ESCALA 1-10 Y LIMPIA)
// ==========================================
function dibujarGrafica(parcialesData) {
    const canvas = document.getElementById('graficaParciales');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    if (miGrafica) miGrafica.destroy();

    // Ahora graficamos los puntos reales (0 a 100 internamente para la proporción visual)
    const p1 = parcialesData[0] ? parseFloat(parcialesData[0].total) || 0 : 0;
    const p2 = parcialesData[1] ? parseFloat(parcialesData[1].total) || 0 : 0;
    const p3 = parcialesData[2] ? parseFloat(parcialesData[2].total) || 0 : 0;

    miGrafica = new Chart(ctx, {
        type: 'doughnut',
        data: {
            // Etiquetas limpias, sin porcentajes de ponderación
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
                        // Cambiamos el texto flotante para mostrar la calificación en escala de 1 a 10
                        label: function(context) {
                            const index = context.dataIndex;
                            const calif10 = parcialesData[index].enEscala10;
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

    const titulo = document.getElementById('titulo-desglose');
    const valTareas = document.getElementById('val-tareas');
    const valPart = document.getElementById('val-part');
    const valAsist = document.getElementById('val-asist');
    const valExam = document.getElementById('val-exam');

    // Mostramos el desglose usando los puntos base 100, pero el total general lo mostramos en escala 10
    if (titulo) titulo.innerText = `Desglose ${datos.titulo} (Calificación: ${datos.enEscala10})`;
    if (valTareas) valTareas.innerText = datos.tareas || 0;
    if (valPart) valPart.innerText = datos.part || 0;
    if (valAsist) valAsist.innerText = datos.asist || 0;
    if (valExam) valExam.innerText = datos.exam || 0;
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
                <div class="card-modulo" style="cursor: pointer; border-top: 4px solid var(--conalep-primary);" onclick="abrirGestionGrupo('${grupo}')">
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

function mostrarPanelGrupos() {
    document.getElementById('panel-gestion-interno')?.classList.add('hidden');
    document.getElementById('panel-mis-grupos')?.classList.remove('hidden');
    grupoSeleccionadoAdmin = null;
}

function abrirGestionGrupo(grupoId) {
    grupoSeleccionadoAdmin = grupoId;
    document.getElementById('panel-mis-grupos')?.classList.add('hidden');
    
    const titulo = document.getElementById('titulo-gestion-grupo');
    const lbl = document.getElementById('lbl-grupo-tarea');
    if (titulo) titulo.innerText = `👥 Panel de Gestión: Grupo ${grupoId}`;
    if (lbl) lbl.innerText = `Grupo ${grupoId}`;
    
    document.getElementById('panel-gestion-interno')?.classList.remove('hidden');
    document.getElementById('form-tarea-grupo')?.classList.add('hidden');
    cargarEntregasGrupo(grupoId);
}

function recargarDatosGrupoActual() {
    if (grupoSeleccionadoAdmin) cargarEntregasGrupo(grupoSeleccionadoAdmin);
}

function mostrarFormularioTareaGrupo() {
    document.getElementById('form-tarea-grupo')?.classList.toggle('hidden');
}

function cargarEntregasGrupo(grupoId) {
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
                    <td style="padding: 10px;">
                        <strong>${e.nombre}</strong><br>
                        <small style="color: var(--text-muted);">${e.matricula}</small>
                    </td>
                    <td style="padding: 10px;">${e.actividad}</td>
                    <td style="padding: 10px;">
                        <a href="${e.archivoUrl}" target="_blank" style="color: var(--conalep-accent); font-weight: bold; text-decoration: none;">📎 Ver Archivo</a>
                    </td>
                    <td style="padding: 10px; text-align: center;">
                        <span class="badge-status ${e.estado === 'Revisado' ? 'status-ok' : 'status-pend'}">${e.estado}</span>
                    </td>
                    <td style="padding: 10px; text-align: center;">
                        <input type="number" id="nota-${e.filaFisica}" value="${e.calificacion}" min="0" max="100" style="width: 60px; padding: 4px; text-align: center; border: 1px solid #cbd5e1; border-radius: 4px;">
                    </td>
                    <td style="padding: 10px; text-align: center;">
                        <button class="btn-conalep" style="padding: 0.35rem 0.7rem; font-size: 0.8rem;" onclick="guardarCalificacionFila(${e.filaFisica})">💾 Guardar</button>
                    </td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 1.5rem; color: var(--text-muted);">No hay evidencias registradas para el Grupo ${grupoId}.</td></tr>`;
        }
    })
    .catch(() => {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 1rem; color: red;">Error al consultar entregas.</td></tr>`;
    });
}

function guardarCalificacionFila(filaFisica) {
    const inputNota = document.getElementById(`nota-${filaFisica}`);
    const nota = inputNota ? inputNota.value : "";
    
    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
            accion: "calificar_entrega",
            fila: filaFisica,
            calificacion: nota,
            estado: "Revisado"
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "éxito") {
            alert("✅ Calificación guardada exitosamente.");
            recargarDatosGrupoActual();
        } else {
            alert("❌ Error: " + data.mensaje);
        }
    })
    .catch(() => alert("⚠️ Error de comunicación con el servidor."));
}

function publicarTareaGrupoActual() {
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

    // --- MAGIA DE GRUPOS MÚLTIPLES ---
    // 1. Iniciamos la lista con el grupo desde donde abriste el panel
    let gruposSeleccionados = [grupoSeleccionadoAdmin];
    
    // 2. Buscamos qué otros checkboxes se marcaron
    const checkboxesExtra = document.querySelectorAll('.chk-grupo-extra:checked');
    checkboxesExtra.forEach(chk => {
        // Evitamos duplicar si por accidente marcas el grupo en el que ya estás
        if (chk.value !== grupoSeleccionadoAdmin) {
            gruposSeleccionados.push(chk.value);
        }
    });

    // 3. Unimos todo con una coma y un espacio (Ej. "505, 508")
    const stringGruposDestino = gruposSeleccionados.join(", ");
    // ---------------------------------

    const btn = document.getElementById('btn-publicar-tarea');
    if (btn) {
        btn.disabled = true;
        btn.innerText = "Publicando...";
    }

    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
            accion: "nueva_tarea",
            idTarea: idTarea,
            unidad: unidad,
            titulo: titulo,
            desc: desc,
            fecha: fecha,
            puntos: puntos,
            grupo: stringGruposDestino // Enviamos la cadena combinada ("505, 508")
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "éxito") {
            alert(`✅ Tarea publicada correctamente para los grupos: ${stringGruposDestino}.`);
            
            // Limpiar los campos de texto
            document.querySelectorAll('#form-tarea-grupo input[type="text"], #form-tarea-grupo input[type="date"], #form-tarea-grupo input[type="number"], #form-tarea-grupo textarea').forEach(e => e.value = '');
            // Limpiar los checkboxes
            document.querySelectorAll('.chk-grupo-extra').forEach(chk => chk.checked = false); 
            
            // Ocultar el formulario
            document.getElementById('form-tarea-grupo')?.classList.add('hidden');
        } else {
            alert("❌ Error: " + data.mensaje);
        }
    })
    .finally(() => {
        if (btn) {
            btn.disabled = false;
            btn.innerText = "🚀 Publicar Tarea";
        }
    });
}
// ==========================================
// 6. GESTIÓN DEL CATÁLOGO DE TAREAS Y ASISTENCIA (PANEL DOCENTE)
// ==========================================
let catalogoGeneralTareas = [];
let listaCompletaAlumnos = [];

// Esta función se puede llamar cuando se inicializa el Panel Admin
function cargarDatosAdministrativos() {
    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ accion: "consultar", matricula: "ADMIN-JL" }) // Forzamos una consulta general
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "éxito") {
            catalogoGeneralTareas = data.catalogo || [];
            listaCompletaAlumnos = data.listaAlumnos || [];
            
            // Poblar selectores de filtros de grupo
            poblarSelectoresGrupos(data.listaAlumnos);
            
            // Renderizar vistas por defecto
            filtrarCatalogoGeneral();
            filtrarAsistencia();
        }
    })
    .catch(err => console.error("Error al cargar datos administrativos:", err));
}

function poblarSelectoresGrupos(alumnos) {
    const grupos = [...new Set(alumnos.map(a => a.grupo).filter(g => g && g !== "Grupo"))];
    
    const selectCatalogo = document.getElementById('filtro-catalogo-grupo');
    const selectAsistencia = document.getElementById('filtro-asistencia-grupo');
    
    if (selectCatalogo) {
        selectCatalogo.innerHTML = `<option value="TODOS">Todos los Grupos</option>` + grupos.map(g => `<option value="${g}">Grupo ${g}</option>`).join('');
        selectCatalogo.onchange = filtrarCatalogoGeneral;
    }
    
    if (selectAsistencia) {
        selectAsistencia.innerHTML = `<option value="">-- Selecciona --</option>` + grupos.map(g => `<option value="${g}">Grupo ${g}</option>`).join('');
    }
}

function filtrarCatalogoGeneral() {
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
                <td style="padding: 10px; text-align: center;">
                    <button class="btn-conalep" style="background-color: #ef4444; padding: 0.35rem 0.8rem; font-size: 0.8rem;" onclick="window.desactivarTarea('${t.id}')">🛑 Desactivar</button>
                </td>
            </tr>
        `).join('');
    } else {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 1.5rem; color: var(--text-muted);">No hay tareas encontradas para este filtro.</td></tr>`;
    }
}

function filtrarAsistencia() {
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
                <td style="padding: 10px; text-align: center;">
                    <span style="font-size: 0.8rem; background: ${a.modalidad.includes('Dual') ? '#fef3c7' : '#dcfce7'}; color: ${a.modalidad.includes('Dual') ? '#b45309' : '#166534'}; padding: 3px 8px; border-radius: 4px;">
                        ${a.modalidad || "Sin Definir"}
                    </span>
                </td>
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
}
// ==========================================
// 7. SUBIDA DE FOTO DE PERFIL (ALUMNOS) CON COMPRESIÓN
// ==========================================
window.subirFotoPerfil = function() {
    const fileInput = document.getElementById('input-foto-perfil');
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) return;

    const file = fileInput.files[0];
    const matricula = sessionStorage.getItem('matriculaActiva');
    const grupo = sessionStorage.getItem('grupoActivo');
    const nombre = sessionStorage.getItem('nombreActivo');
    
    const imgPerfil = document.getElementById('img-perfil');
    const emojiCamara = document.getElementById('emoji-camara');

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Data = e.target.result.split(',')[1];
        
        // ✨ MOSTRAR VISTA PREVIA INMEDIATA ✨
        if (imgPerfil && emojiCamara) {
            imgPerfil.src = e.target.result;
            imgPerfil.style.display = 'block';
            emojiCamara.style.display = 'none';
        }

        alert("⏳ Guardando foto en la nube... Por favor espera.");

        fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                accion: "subir_foto_perfil",
                matricula: matricula,
                grupo: grupo,
                nombre: nombre,
                nombreArchivo: "Perfil_" + matricula + "_" + file.name,
                mimeType: file.type,
                archivoBase64: base64Data
            })
        })
        .then(res => res.json())
        .then(data => {
            if(data.status === "éxito") { 
                // Actualizamos a la URL definitiva de Drive
                if(imgPerfil) imgPerfil.src = data.url; 
                alert("✅ ¡Foto guardada exitosamente!");
            } else {
                alert("❌ Error: " + data.mensaje);
            }
        })
        .catch(err => console.error(err));
    };
    reader.readAsDataURL(file);
};
