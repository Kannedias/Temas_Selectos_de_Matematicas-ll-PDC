// =======================================================
// URL DE TU BACKEND EN GOOGLE APPS SCRIPT (SICAL)
// ¡NO OLVIDES PEGAR TU URL REAL AQUÍ!
// =======================================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyA7G85jucZJj7dtOsBWgI3Xo07pyhi-QP3cHeALPLzzzy1HFlKXldaY6EP6Y7sFdRGgw/exec"; 

// ==========================================
// 1. LÓGICA DE INICIO DE SESIÓN
// ==========================================
function iniciarSesion() {
    const matricula = document.getElementById('input-matricula').value.trim();
    const btnIngresar = document.getElementById('btn-ingresar');

    if (!matricula) {
        alert("Por favor, ingresa tu matrícula.");
        return;
    }

    btnIngresar.innerText = "⏳ Conectando...";
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
            
            if(data.fotoPerfilUrl) {
                document.getElementById('img-perfil').src = data.fotoPerfilUrl;
            }

            document.getElementById('vista-login').classList.add('hidden');
            document.getElementById('vista-dashboard').classList.remove('hidden');
            document.getElementById('user-menu').classList.remove('hidden');
            
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
        btnIngresar.innerText = "🚀 Ingresar al Portal";
        btnIngresar.disabled = false;
    });
}

function cerrarSesion() {
    sessionStorage.clear();
    document.getElementById('vista-dashboard').classList.add('hidden');
    document.getElementById('vista-admin').classList.add('hidden');
    document.getElementById('user-menu').classList.add('hidden');
    document.getElementById('vista-login').classList.remove('hidden');
    document.getElementById('input-matricula').value = "";
}

// ==========================================
// 2. SINCRONIZACIÓN DE DATOS CON GOOGLE SHEETS
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
                badge1_1.style.background = "#dcfce7";
                badge1_1.style.color = "#166534";
                badge1_1.innerHTML = "🟢 Concluido";
            } else {
                badge1_1.className = "badge-status status-pend";
                badge1_1.style.background = "#fef2f2";
                badge1_1.style.color = "#991b1b";
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
                data.historial.forEach(item => {
                    let estadoEmoji = item.estado.toLowerCase().includes("revisad") ? "✅" : (item.estado.toLowerCase().includes("cumplid") ? "🌟" : "⏳");
                    let colorClase = item.estado.toLowerCase().includes("pendient") ? 'status-pend' : 'status-ok';
                    let row = `<tr>
                        <td style="font-size: 0.9rem; font-weight: 500; padding: 12px 10px; border-bottom: 1px solid var(--border-card);">${item.actividad}</td>
                        <td style="font-size: 0.85rem; color: var(--text-muted); padding: 12px 10px; border-bottom: 1px solid var(--border-card);">${item.fecha}</td>
                        <td style="padding: 12px 10px; border-bottom: 1px solid var(--border-card);"><span class="badge-status ${colorClase}">${estadoEmoji} ${item.estado}</span></td>
                        <td style="text-align: center; padding: 12px 10px; border-bottom: 1px solid var(--border-card);"><strong>${item.nota}</strong></td>
                    </tr>`;
                    tbodyHistorial.innerHTML += row; 
                });
            }
        }

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
    })
    .catch(error => console.error("Error consultando avance:", error));
}

// ==========================================
// 3. GRÁFICA DE DONA (ESCALA A 10.0 Y TEXTO ADAPTATIVO)
// ==========================================
function dibujarGrafica(parcialesData) {
    const canvas = document.getElementById('graficaParciales');
    if (!canvas) return; 
    const ctx = canvas.getContext('2d');
    
    if(window.miGrafica !== undefined && window.miGrafica !== null) { 
        window.miGrafica.destroy(); 
    }

    // Extraemos las calificaciones brutas de 0 a 100 y las convertimos a escala de 10
    const p1 = parcialesData[0] ? parseFloat(parcialesData[0].total) || 0 : 0;
    const p2 = parcialesData[1] ? parseFloat(parcialesData[1].total) || 0 : 0;
    const p3 = parcialesData[2] ? parseFloat(parcialesData[2].total) || 0 : 0;
    
    const escala10P1 = (p1 / 10).toFixed(1);
    const escala10P2 = (p2 / 10).toFixed(1);
    const escala10P3 = (p3 / 10).toFixed(1);
    const calificacionesReales10 = [escala10P1, escala10P2, escala10P3];

    // Calculamos el global ponderado (Base 10) para el centro default
    // P1 vale 2.5 pts, P2 vale 3.0 pts, P3 vale 4.5 pts
    const ptjeP1 = (p1 / 10) * 0.25;
    const ptjeP2 = (p2 / 10) * 0.30;
    const ptjeP3 = (p3 / 10) * 0.45;
    const califFinal10 = (ptjeP1 + ptjeP2 + ptjeP3).toFixed(1);

    // Los datos para dibujar el tamaño de las rebanadas siguen siendo los porcentajes reales
    const rawP1 = p1 * 0.25;
    const rawP2 = p2 * 0.30;
    const rawP3 = p3 * 0.45;

    window.miGrafica = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Parcial 1 (25%)', 'Parcial 2 (30%)', 'Parcial 3 (45%)'],
            datasets: [{
                data: [rawP1, rawP2, rawP3], 
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
                            const calif10 = calificacionesReales10[context.dataIndex];
                            return ` ${context.label}: Calif. ${calif10} / 10.0`;
                        }
                    }
                }
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    mostrarDesglose(index);
                    window.miGrafica.centerTextActual = calificacionesReales10[index] + " / 10";
                    window.miGrafica.update();
                } else {
                    window.miGrafica.centerTextActual = califFinal10 + " / 10";
                    window.miGrafica.update();
                }
            }
        },
        plugins: [{
            id: 'textCenter',
            beforeDraw: function(chart) {
                var width = chart.width, height = chart.height, ctx = chart.ctx;
                ctx.restore();
                
                // AJUSTE: El texto se hace dinámicamente más pequeño para que no se corte
                // Si el área del canvas es pequeña (como en móviles), el divisor aumenta.
                var divisorFuente = width < 300 ? 180 : 130; 
                var fontSize = (height / divisorFuente).toFixed(2); 
                
                ctx.font = "bold " + fontSize + "em sans-serif";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "#004d40";
                
                var text = chart.centerTextActual || califFinal10 + " / 10",
                    textX = Math.round((width - ctx.measureText(text).width) / 2) - 40,
                    textY = height / 2;
                
                ctx.fillText(text, textX, textY);
                ctx.save();
            }
        }]
    });

    // Iniciar con el texto global en escala a 10
    window.miGrafica.centerTextActual = califFinal10 + " / 10";
}

function mostrarDesglose(indexParcial) {
    if(!window.datosDesgloseParciales) return;
    
    const datos = window.datosDesgloseParciales[indexParcial];
    if(!datos) return;

    const contenedorDesglose = document.getElementById('desglose-calificacion');
    if(contenedorDesglose) {
        contenedorDesglose.style.display = 'block';
    }

    // El desglose inferior también en escala de 1 a 10
    const califTotal10 = ((parseFloat(datos.total) || 0) / 10).toFixed(1);
    const califTareas10 = ((parseFloat(datos.tareas) || 0) / 10).toFixed(1);
    const califPart10 = ((parseFloat(datos.part) || 0) / 10).toFixed(1);
    const califAsist10 = ((parseFloat(datos.asist) || 0) / 10).toFixed(1);
    const califExam10 = ((parseFloat(datos.exam) || 0) / 10).toFixed(1);

    document.getElementById('titulo-desglose').innerText = `Desglose ${datos.titulo} (Calificación: ${califTotal10})`;
    document.getElementById('val-tareas').innerText = califTareas10 + " pts";
    document.getElementById('val-part').innerText = califPart10 + " pts";
    document.getElementById('val-asist').innerText = califAsist10 + " pts";
    document.getElementById('val-exam').innerText = califExam10 + " pts";
}

// ==========================================
// 4. LÓGICA DE VENTANILLA DE ENTREGAS
// ==========================================
function subirEvidencia() {
    const fileInput = document.getElementById('input-archivo');
    const selectTarea = document.getElementById('select-tarea');
    const matricula = sessionStorage.getItem('matriculaActiva');
    const nombre = sessionStorage.getItem('nombreActivo');
    const grupo = sessionStorage.getItem('grupoActivo');

    if (!matricula) {
        alert("⚠️ Sesión no válida. Inicia sesión nuevamente.");
        return;
    }
    
    if (!selectTarea.value) {
        alert("❌ Por favor, selecciona una actividad del catálogo antes de subir tu evidencia.");
        return;
    }

    if (!fileInput.files || fileInput.files.length === 0) {
        alert("⚠️ Selecciona al menos un archivo.");
        return;
    }

    const btnEnviar = document.getElementById('btn-enviar');
    btnEnviar.innerText = "⏳ Subiendo archivos...";
    btnEnviar.disabled = true;

    const idTarea = selectTarea.value.split(" - ")[0];
    const actividadCompleta = selectTarea.value;

    let archivosBase64 = [];
    let procesados = 0;

    Array.from(fileInput.files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            let base64 = e.target.result.split(',')[1];
            archivosBase64.push({
                nombreOriginal: file.name,
                mimeType: file.type,
                base64: base64
            });
            procesados++;

            if (procesados === fileInput.files.length) {
                enviarArchivosBackend(matricula, nombre, grupo, actividadCompleta, idTarea, archivosBase64, btnEnviar);
            }
        };
        reader.readAsDataURL(file);
    });
}

function enviarArchivosBackend(matricula, nombre, grupo, actividadCompleta, idTarea, archivosBase64, btnEnviar) {
    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
            accion: "subir_multiples",
            matricula: matricula,
            nombre: nombre,
            grupo: grupo,
            actividad: actividadCompleta,
            idTarea: idTarea,
            archivos: archivosBase64
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "éxito") {
            alert("✅ Evidencia enviada correctamente a revisión.");
            document.getElementById('input-archivo').value = "";
            document.getElementById('select-tarea').value = "";
            consultarAvanceReal(matricula); 
        } else {
            alert("❌ Error en el servidor: " + data.mensaje);
        }
    })
    .catch(error => {
        alert("⚠️ Error de conexión. Intenta de nuevo.");
        console.error(error);
    })
    .finally(() => {
        btnEnviar.innerText = "📤 Enviar Evidencia a Revisión";
        btnEnviar.disabled = false;
    });
}

// ==========================================
// 5. CARGA DE FOTOGRAFÍA DE PERFIL
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const inputFoto = document.getElementById('input-foto-perfil');
    if (inputFoto) {
        inputFoto.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            const matricula = sessionStorage.getItem('matriculaActiva');
            const nombre = sessionStorage.getItem('nombreActivo');
            const grupo = sessionStorage.getItem('grupoActivo');
            
            if (!matricula) return;

            const reader = new FileReader();
            reader.onload = function(evt) {
                const base64 = evt.target.result.split(',')[1];
                document.getElementById('img-perfil').src = evt.target.result; 
                
                fetch(SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify({
                        accion: "subir_foto_perfil",
                        matricula: matricula,
                        nombre: nombre,
                        grupo: grupo,
                        nombreArchivo: file.name,
                        mimeType: file.type,
                        archivoBase64: base64
                    })
                })
                .then(res => res.json())
                .then(data => {
                    if(data.status !== "éxito") alert("⚠️ Hubo un error guardando la foto en el servidor.");
                })
                .catch(err => console.error("Error subiendo foto:", err));
            };
            reader.readAsDataURL(file);
        });
    }
});
