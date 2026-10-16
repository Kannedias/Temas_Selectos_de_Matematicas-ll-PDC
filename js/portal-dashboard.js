// =======================================================
// URL DE TU BACKEND EN GOOGLE APPS SCRIPT (SICAL)
// =======================================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyA7G85jucZJj7dtOsBWgI3Xo07pyhi-QP3cHeALPLzzzy1HFlKXldaY6EP6Y7sFdRGgw/exec"; 

let miGrafica = null;
let grupoSeleccionadoAdmin = null;

// ==========================================
// 1. LÓGICA DE INICIO DE SESIÓN
// ==========================================
function iniciarSesion() {
    const matriculaInput = document.getElementById('input-matricula');
    if (!matriculaInput) return;
    
    const matricula = matriculaInput.value.trim();
    const btnIngresar = document.getElementById('btn-ingresar');

    if (!matricula) {
        alert("⚠️ Por favor, ingresa tu matrícula.");
        return;
    }

    // ACCESO ADMINISTRATIVO (DOCENTE)
    if (matricula.toUpperCase() === "ADMIN-JL") {
        inicializarPanelAdmin();
        return;
    }

    if (btnIngresar) {
        btnIngresar.innerText = "⏳ Conectando...";
        btnIngresar.disabled = true;
    }

    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ accion: "login", matricula: matricula })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "éxito") {
            const welcome = document.getElementById('welcome-name');
            const lblNombre = document.getElementById('lbl-nombre');
            const lblMat = document.getElementById('lbl-matricula');
            const lblGrp = document.getElementById('lbl-grupo');
            const imgPerfil = document.getElementById('img-perfil');

            if (welcome) welcome.innerText = `👤 Bienvenido, ${data.primerNombre}`;
            if (lblNombre) lblNombre.innerText = data.nombreCompleto;
            if (lblMat) lblMat.innerText = matricula;
            if (lblGrp) lblGrp.innerText = `Grupo ${data.grupo}`;
            if (imgPerfil && data.fotoPerfilUrl) imgPerfil.src = data.fotoPerfilUrl;

            document.getElementById('vista-login')?.classList.add('hidden');
            document.getElementById('vista-dashboard')?.classList.remove('hidden');
            document.getElementById('user-menu')?.classList.remove('hidden');

            sessionStorage.setItem('matriculaActiva', matricula);
            sessionStorage.setItem('nombreActivo', data.nombreCompleto);
            sessionStorage.setItem('grupoActivo', data.grupo);

            consultarAvanceReal(matricula);
        } else {
            alert("❌ " + (data.mensaje || "Matrícula no encontrada"));
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

function cerrarSesion() {
    sessionStorage.clear();
    document.getElementById('vista-dashboard')?.classList.add('hidden');
    document.getElementById('vista-admin')?.classList.add('hidden');
    document.getElementById('user-menu')?.classList.add('hidden');
    document.getElementById('vista-login')?.classList.remove('hidden');
    
    const matInput = document.getElementById('input-matricula');
    if (matInput) matInput.value = "";
}

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
// 3. GRÁFICA DE EVALUACIÓN Y DESGLOSE
// ==========================================
function dibujarGrafica(parcialesData) {
    const canvas = document.getElementById('graficaParciales');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    if (miGrafica) miGrafica.destroy();

    const p1 = parcialesData[0] ? parseFloat(parcialesData[0].total) || 0 : 0;
    const p2 = parcialesData[1] ? parseFloat(parcialesData[1].total) || 0 : 0;
    const p3 = parcialesData[2] ? parseFloat(parcialesData[2].total) || 0 : 0;

    const ptjeP1 = (p1 * 0.25);
    const ptjeP2 = (p2 * 0.30);
    const ptjeP3 = (p3 * 0.45);

    miGrafica = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Parcial 1 (25%)', 'Parcial 2 (30%)', 'Parcial 3 (45%)'],
            datasets: [{
                data: [ptjeP1, ptjeP2, ptjeP3],
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
                legend: { position: 'right' }
            },
            // EVENTO CLICK QUE ENCIENDE EL DESGLOSE
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

    // Encender el contenedor que está oculto en el HTML
    const contenedorDesglose = document.getElementById('desglose-calificacion');
    if(contenedorDesglose) {
        contenedorDesglose.style.display = 'block';
    }

    // Inyectar los valores en los spans correspondientes
    const titulo = document.getElementById('titulo-desglose');
    const valTareas = document.getElementById('val-tareas');
    const valPart = document.getElementById('val-part');
    const valAsist = document.getElementById('val-asist');
    const valExam = document.getElementById('val-exam');

    if (titulo) titulo.innerText = `Desglose ${datos.titulo} (Total: ${datos.total}/100)`;
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
            grupo: grupoSeleccionadoAdmin
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "éxito") {
            alert(`✅ Tarea publicada correctamente para el Grupo ${grupoSeleccionadoAdmin}.`);
            document.querySelectorAll('#form-tarea-grupo input, #form-tarea-grupo textarea').forEach(e => e.value = '');
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
