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
// 3. GRÁFICA DE DONA CLÁSICA Y DESGLOSE DINÁMICO
// ==========================================
function dibujarGrafica(parcialesData) {
    const canvas = document.getElementById('graficaParciales');
    if (!canvas) return; 
    const ctx = canvas.getContext('2d');
    
    if(window.miGrafica !== undefined && window.miGrafica !== null) { 
        window.miGrafica.destroy(); 
    }

    // Extraemos las calificaciones brutas (ej. 90/100)
    const p1 = parcialesData[0] ? parseFloat(parcialesData[0].total) || 0 : 0;
    const p2 = parcialesData[1] ? parseFloat(parcialesData[1].total) || 0 : 0;
    const p3 = parcialesData[2] ? parseFloat(parcialesData[2].total) || 0 : 0;
    const calificacionesReales = [p1, p2, p3];

    // Calculamos el global ponderado para dibujar el tamaño de las rebanadas
    const ptjeP1 = (p1 * 0.25);
    const ptjeP2 = (p2 * 0.30);
    const ptjeP3 = (p3 * 0.45);
    const califFinal = (ptjeP1 + ptjeP2 + ptjeP3).toFixed(1);

    window.miGrafica = new Chart(ctx, {
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
                legend: { position: 'right' },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            // EN LUGAR DE MOSTRAR EL PORCENTAJE PONDERADO, MOSTRAMOS LA CALIFICACIÓN
                            const rawScore = calificacionesReales[context.dataIndex];
                            return ` ${context.label}: Calificación ${rawScore}/100`;
                        }
                    }
                }
            },
            // EVENTO CLICK: CAMBIA EL TEXTO DEL CENTRO Y MUESTRA EL DESGLOSE
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    mostrarDesglose(index);
                    
                    // Inyectar calificación real en el centro (ej. 90/100)
                    window.miGrafica.centerTextActual = calificacionesReales[index] + "/100";
                    window.miGrafica.update();
                } else {
                    // Si da clic en lo blanco, regresa al porcentaje global
                    window.miGrafica.centerTextActual = califFinal + "%";
                    window.miGrafica.update();
                }
            }
        },
        plugins: [{
            id: 'textCenter',
            beforeDraw: function(chart) {
                var width = chart.width, height = chart.height, ctx = chart.ctx;
                ctx.restore();
                var fontSize = (height / 120).toFixed(2); // Ligeramente más pequeño para que quepa bien
                ctx.font = "bold " + fontSize + "em sans-serif";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "#004d40";
                
                // Leemos la propiedad dinámica o mostramos el global por defecto
                var text = chart.centerTextActual || califFinal + "%",
                    textX = Math.round((width - ctx.measureText(text).width) / 2) - 40,
                    textY = height / 2;
                
                ctx.fillText(text, textX, textY);
                ctx.save();
            }
        }]
    });

    // Iniciar con el texto global
    window.miGrafica.centerTextActual = califFinal + "%";
}

function mostrarDesglose(indexParcial) {
    if(!window.datosDesgloseParciales) return;
    
    const datos = window.datosDesgloseParciales[indexParcial];
    if(!datos) return;

    const contenedorDesglose = document.getElementById('desglose-calificacion');
    if(contenedorDesglose) {
        contenedorDesglose.style.display = 'block';
    }

    document.getElementById('titulo-desglose').innerText = `Desglose ${datos.titulo} (Total: ${datos.total}/100)`;
    document.getElementById('val-tareas').innerText = datos.tareas || 0;
    document.getElementById('val-part').innerText = datos.part || 0;
    document.getElementById('val-asist').innerText = datos.asist || 0;
    document.getElementById('val-exam').innerText = datos.exam || 0;
}

// ==========================================
// 4. LÓGICA DE VENTANILLA DE ENTREGAS
// ==========================================
function subirEvidencia() {
    const fileInput = document.getElementById('input-archivo');
    const selectTarea = document.getElementById
