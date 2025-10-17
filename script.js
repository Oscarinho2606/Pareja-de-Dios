// CONFIGURACIÓN FIREBASE - PEGA TU CÓDIGO AQUÍ
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBJCVm-57WcdKTI-X4u0EVAZivdPT-19LU",
  authDomain: "parejadedios-f95cb.firebaseapp.com",
  projectId: "parejadedios-f95cb",
  storageBucket: "parejadedios-f95cb.firebasestorage.app",
  messagingSenderId: "184089417025",
  appId: "1:184089417025:web:ddf2c6b8338a8bcba37dc0",
  measurementId: "G-REWEQ8QK2X"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Datos iniciales
let datos = {
    fotos: [],
    promesas: [],
    metas: []
};

// HACER FUNCIONES GLOBALES
window.abrirModalFoto = function() {
    document.getElementById('modalFoto').style.display = 'block';
    document.getElementById('fechaFoto').valueAsDate = new Date();
    // Limpiar modo edición
    delete window.fotoEditando;
};

window.abrirModalPromesa = function() {
    document.getElementById('modalPromesa').style.display = 'block';
    // Limpiar modo edición
    delete window.promesaEditando;
};

window.abrirModalMeta = function() {
    document.getElementById('modalMeta').style.display = 'block';
    document.getElementById('fechaMeta').valueAsDate = new Date();
    // Limpiar modo edición
    delete window.metaEditando;
};

window.cerrarModal = function(id) {
    document.getElementById(id).style.display = 'none';
    // Limpiar campos
    document.querySelectorAll(`#${id} input, #${id} textarea`).forEach(campo => {
        campo.value = '';
    });
    // Limpiar modos edición
    delete window.fotoEditando;
    delete window.promesaEditando;
    delete window.metaEditando;
};

// FUNCIÓN PARA EDITAR FOTO
window.editarFoto = function(id) {
    const foto = datos.fotos.find(f => f.id === id);
    if (!foto) return;
    
    window.fotoEditando = id;
    document.getElementById('descripcionFoto').value = foto.descripcion;
    document.getElementById('fechaFoto').value = foto.fecha;
    document.getElementById('modalFoto').style.display = 'block';
};

// FUNCIÓN PARA ELIMINAR FOTO
window.eliminarFoto = async function(id) {
    if (confirm('¿Estás seguro de eliminar este recuerdo?')) {
        datos.fotos = datos.fotos.filter(f => f.id !== id);
        await guardarDatos();
        actualizarGaleria();
        mostrarNotificacion('🗑️ Foto eliminada');
    }
};

// FUNCIÓN PARA EDITAR PROMESA
window.editarPromesa = function(id) {
    const promesa = datos.promesas.find(p => p.id === id);
    if (!promesa) return;
    
    window.promesaEditando = id;
    document.getElementById('tituloPromesa').value = promesa.titulo;
    document.getElementById('textoPromesa').value = promesa.texto;
    document.getElementById('referenciaPromesa').value = promesa.referencia;
    document.getElementById('reflexionPromesa').value = promesa.reflexion || '';
    document.getElementById('modalPromesa').style.display = 'block';
};

// FUNCIÓN PARA ELIMINAR PROMESA
window.eliminarPromesa = async function(id) {
    if (confirm('¿Estás seguro de eliminar esta promesa?')) {
        datos.promesas = datos.promesas.filter(p => p.id !== id);
        await guardarDatos();
        actualizarPromesas();
        mostrarNotificacion('🗑️ Promesa eliminada');
    }
};

// FUNCIÓN PARA EDITAR META
window.editarMeta = function(id) {
    const meta = datos.metas.find(m => m.id === id);
    if (!meta) return;
    
    window.metaEditando = id;
    document.getElementById('tituloMeta').value = meta.titulo;
    document.getElementById('descripcionMeta').value = meta.descripcion;
    document.getElementById('fechaMeta').value = meta.fecha;
    document.getElementById('modalMeta').style.display = 'block';
};

// FUNCIÓN PARA ELIMINAR META
window.eliminarMeta = async function(id) {
    if (confirm('¿Estás seguro de eliminar esta meta?')) {
        datos.metas = datos.metas.filter(m => m.id !== id);
        await guardarDatos();
        actualizarMetas();
        mostrarNotificacion('🗑️ Meta eliminada');
    }
};

// AGREGAR FOTO (CREAR O EDITAR)
window.agregarFoto = async function() {
    const input = document.getElementById('inputFoto');
    const descripcion = document.getElementById('descripcionFoto').value;
    const fecha = document.getElementById('fechaFoto').value;
    
    if (window.fotoEditando) {
        // MODO EDICIÓN
        const foto = datos.fotos.find(f => f.id === window.fotoEditando);
        if (foto) {
            foto.descripcion = descripcion;
            foto.fecha = fecha;
            // Si hay nueva imagen, procesarla
            if (input.files[0]) {
                const reader = new FileReader();
                reader.onload = async function(e) {
                    foto.imagen = e.target.result;
                    await guardarDatos();
                    cerrarModal('modalFoto');
                    actualizarGaleria();
                    mostrarNotificacion('📸 Foto actualizada');
                };
                reader.readAsDataURL(input.files[0]);
            } else {
                await guardarDatos();
                cerrarModal('modalFoto');
                actualizarGaleria();
                mostrarNotificacion('📸 Foto actualizada');
            }
        }
    } else {
        // MODO CREACIÓN
        if (!input.files[0] || !descripcion) {
            alert('Por favor, selecciona una foto y escribe una descripción');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = async function(e) {
            const nuevaFoto = {
                id: Date.now(),
                imagen: e.target.result,
                descripcion: descripcion,
                fecha: fecha || new Date().toISOString().split('T')[0]
            };
            
            datos.fotos.push(nuevaFoto);
            await guardarDatos();
            cerrarModal('modalFoto');
            actualizarGaleria();
            mostrarNotificacion('📸 Foto guardada');
        };
        reader.readAsDataURL(input.files[0]);
    }
};

// AGREGAR PROMESA (CREAR O EDITAR)
window.agregarPromesa = async function() {
    const titulo = document.getElementById('tituloPromesa').value;
    const texto = document.getElementById('textoPromesa').value;
    const referencia = document.getElementById('referenciaPromesa').value;
    const reflexion = document.getElementById('reflexionPromesa').value;
    
    if (!titulo || !texto) {
        alert('Por favor, completa al menos el título y el versículo');
        return;
    }
    
    if (window.promesaEditando) {
        // MODO EDICIÓN
        const promesa = datos.promesas.find(p => p.id === window.promesaEditando);
        if (promesa) {
            promesa.titulo = titulo;
            promesa.texto = texto;
            promesa.referencia = referencia;
            promesa.reflexion = reflexion;
            await guardarDatos();
            cerrarModal('modalPromesa');
            actualizarPromesas();
            mostrarNotificacion('📜 Promesa actualizada');
        }
    } else {
        // MODO CREACIÓN
        const nuevaPromesa = {
            id: Date.now(),
            titulo: titulo,
            texto: texto,
            referencia: referencia,
            reflexion: reflexion,
            fecha: new Date().toISOString().split('T')[0]
        };
        
        datos.promesas.push(nuevaPromesa);
        await guardarDatos();
        cerrarModal('modalPromesa');
        actualizarPromesas();
        mostrarNotificacion('📜 Promesa guardada');
    }
};

// AGREGAR META (CREAR O EDITAR)
window.agregarMeta = async function() {
    const titulo = document.getElementById('tituloMeta').value;
    const descripcion = document.getElementById('descripcionMeta').value;
    const fecha = document.getElementById('fechaMeta').value;
    
    if (!titulo) {
        alert('Por favor, escribe al menos el título de la meta');
        return;
    }
    
    if (window.metaEditando) {
        // MODO EDICIÓN
        const meta = datos.metas.find(m => m.id === window.metaEditando);
        if (meta) {
            meta.titulo = titulo;
            meta.descripcion = descripcion;
            meta.fecha = fecha;
            await guardarDatos();
            cerrarModal('modalMeta');
            actualizarMetas();
            mostrarNotificacion('🎯 Meta actualizada');
        }
    } else {
        // MODO CREACIÓN
        const nuevaMeta = {
            id: Date.now(),
            titulo: titulo,
            descripcion: descripcion,
            fecha: fecha,
            estado: 'pendiente'
        };
        
        datos.metas.push(nuevaMeta);
        await guardarDatos();
        cerrarModal('modalMeta');
        actualizarMetas();
        mostrarNotificacion('🎯 Meta guardada');
    }
};

// Cargar datos desde Firebase
async function cargarDatos() {
    try {
        const docRef = doc(db, 'datosPareja', 'nuestrosDatos');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            datos = docSnap.data();
            actualizarInterfaz();
            mostrarNotificacion('✅ Datos sincronizados');
            actualizarEstadoConexion('🟢 Conectado');
        } else {
            // Si no existe el documento, crearlo
            await setDoc(docRef, datos);
            mostrarNotificacion('✨ Espacio creado para ambos');
        }
    } catch (error) {
        console.log('Error cargando datos:', error);
        actualizarEstadoConexion('🔴 Error conexión');
        // Intentar cargar backup local
        const backup = localStorage.getItem('datosParejaBackup');
        if (backup) {
            datos = JSON.parse(backup);
            actualizarInterfaz();
        }
    }
}

// Guardar datos en Firebase
async function guardarDatos() {
    try {
        const docRef = doc(db, 'datosPareja', 'nuestrosDatos');
        await setDoc(docRef, datos);
        // Guardar backup local también
        localStorage.setItem('datosParejaBackup', JSON.stringify(datos));
        mostrarNotificacion('💝 Guardado para ambos');
        actualizarEstadoConexion('🟢 Conectado');
    } catch (error) {
        console.log('Error guardando:', error);
        // Guardar local como respaldo
        localStorage.setItem('datosParejaBackup', JSON.stringify(datos));
        mostrarNotificacion('⚠️ Guardado local (sin conexión)');
        actualizarEstadoConexion('🟡 Sin conexión');
    }
}

// Escuchar cambios en tiempo real
function escucharCambios() {
    const docRef = doc(db, 'datosPareja', 'nuestrosDatos');
    
    onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            const nuevosDatos = docSnap.data();
            // Solo actualizar si hay cambios reales
            if (JSON.stringify(datos) !== JSON.stringify(nuevosDatos)) {
                datos = nuevosDatos;
                actualizarInterfaz();
                mostrarNotificacion('🔄 Tu pareja actualizó los datos');
            }
        }
    });
}

// Actualizar estado de conexión
function actualizarEstadoConexion(estado) {
    const elemento = document.getElementById('estadoConexion');
    if (elemento) {
        elemento.textContent = estado;
    }
}

// Notificaciones
function mostrarNotificacion(mensaje) {
    const notificacion = document.createElement('div');
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--gradiente-principal);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 10000;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    notificacion.textContent = mensaje;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notificacion.remove(), 300);
    }, 3000);
}

// Navegación entre secciones
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.nav-holograma').forEach(boton => {
        boton.addEventListener('click', function() {
            document.querySelectorAll('.nav-holograma').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.seccion-holografica').forEach(sec => sec.classList.remove('active'));
            
            this.classList.add('active');
            const seccion = this.getAttribute('data-section');
            document.getElementById(seccion).classList.add('active');
        });
    });

    // Cargar datos y escuchar cambios
    cargarDatos();
    escucharCambios();
    
    setInterval(cargarDatos, 60000);
});

// Actualizar interfaces
function actualizarInterfaz() {
    actualizarGaleria();
    actualizarPromesas();
    actualizarMetas();
}

function actualizarGaleria() {
    const galeria = document.getElementById('galeria');
    
    if (datos.fotos.length === 0) {
        galeria.innerHTML = `
            <div class="placeholder-futurista">
                <div class="placeholder-icono">✨</div>
                <p>Tu historia comienza aquí</p>
                <small>Cada foto es un momento bendecido</small>
            </div>
        `;
        return;
    }
    
    galeria.innerHTML = datos.fotos.map(foto => `
        <div class="foto-holograma">
            <img src="${foto.imagen}" alt="${foto.descripcion}">
            <div class="foto-info-holograma">
                <div class="foto-descripcion">${foto.descripcion}</div>
                <div class="foto-fecha">${formatearFecha(foto.fecha)}</div>
                <div class="acciones-item">
                    <button class="btn-accion editar" onclick="editarFoto(${foto.id})" title="Editar">
                        ✏️
                    </button>
                    <button class="btn-accion eliminar" onclick="eliminarFoto(${foto.id})" title="Eliminar">
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function actualizarPromesas() {
    const lista = document.getElementById('lista-promesas');
    
    if (datos.promesas.length === 0) {
        lista.innerHTML = `
            <div class="placeholder-futurista">
                <div class="placeholder-icono">📜</div>
                <p>Guarda tus primeras promesas bíblicas</p>
                <small>Cada versículo fortalece vuestra relación</small>
            </div>
        `;
        return;
    }
    
    lista.innerHTML = datos.promesas.map(promesa => `
        <div class="promesa-holograma">
            <div class="promesa-header">
                <div class="promesa-titulo">${promesa.titulo}</div>
                <div class="acciones-item">
                    <button class="btn-accion editar" onclick="editarPromesa(${promesa.id})" title="Editar">
                        ✏️
                    </button>
                    <button class="btn-accion eliminar" onclick="eliminarPromesa(${promesa.id})" title="Eliminar">
                        🗑️
                    </button>
                </div>
            </div>
            <div class="promesa-texto">"${promesa.texto}"</div>
            <div class="promesa-referencia">${promesa.referencia}</div>
        </div>
    `).join('');
}

function actualizarMetas() {
    const lista = document.getElementById('lista-metas');
    
    if (datos.metas.length === 0) {
        lista.innerHTML = `
            <div class="placeholder-futurista">
                <div class="placeholder-icono">🎯</div>
                <p>Establece vuestras primeras metas</p>
                <small>Juntos pueden lograr cualquier propósito</small>
            </div>
        `;
        return;
    }
    
    lista.innerHTML = datos.metas.map(meta => `
        <div class="meta-holograma">
            <div class="meta-header-holograma">
                <div class="meta-titulo">${meta.titulo}</div>
                <div class="acciones-meta">
                    <button class="estado-holograma ${meta.estado === 'cumplido' ? 'estado-cumplido' : 'estado-pendiente'}" 
                            onclick="cambiarEstadoMeta(${meta.id})">
                        ${meta.estado === 'cumplido' ? '✅ Cumplido' : '⏳ Por cumplir'}
                    </button>
                    <div class="acciones-item">
                        <button class="btn-accion editar" onclick="editarMeta(${meta.id})" title="Editar">
                            ✏️
                        </button>
                        <button class="btn-accion eliminar" onclick="eliminarMeta(${meta.id})" title="Eliminar">
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
            <div class="meta-descripcion">${meta.descripcion}</div>
            <div class="meta-fecha">Para: ${formatearFecha(meta.fecha)}</div>
        </div>
    `).join('');
}

// Funciones auxiliares
window.verPromesa = function(id) {
    const promesa = datos.promesas.find(p => p.id === id);
    if (!promesa) return;
    
    document.getElementById('contenidoPromesa').innerHTML = `
        <h3>${promesa.titulo}</h3>
        <div style="font-style: italic; font-size: 1.2rem; margin: 20px 0; padding: 20px; background: var(--color-surface); border-radius: 10px; border-left: 4px solid var(--color-accento);">
            "${promesa.texto}"
        </div>
        <div style="text-align: right; color: var(--color-accento); margin-bottom: 20px; font-weight: 600;">
            ${promesa.referencia}
        </div>
        ${promesa.reflexion ? `
            <div style="background: rgba(6, 182, 212, 0.1); padding: 15px; border-radius: 10px; margin: 20px 0; border: 1px solid var(--color-borde);">
                <strong style="color: var(--color-accento);">Nuestra reflexión:</strong><br>
                ${promesa.reflexion}
            </div>
        ` : ''}
        <div style="color: var(--color-borde); font-size: 0.9rem; text-align: center; margin-top: 20px;">
            Agregada el: ${formatearFecha(promesa.fecha)}
        </div>
    `;
    
    document.getElementById('modalVerPromesa').style.display = 'block';
};

window.cambiarEstadoMeta = async function(id) {
    const meta = datos.metas.find(m => m.id === id);
    if (meta) {
        meta.estado = meta.estado === 'pendiente' ? 'cumplido' : 'pendiente';
        await guardarDatos();
        actualizarMetas();
    }
};

function formatearFecha(fechaStr) {
    if (!fechaStr) return 'Sin fecha específica';
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(fechaStr).toLocaleDateString('es-ES', opciones);
}

// Cerrar modal al hacer click fuera
window.onclick = function(event) {
    if (event.target.classList.contains('modal-futurista')) {
        event.target.style.display = 'none';
    }
}

// Agregar estilos para botones de acción
if (!document.querySelector('#estilos-acciones')) {
    const estilos = document.createElement('style');
    estilos.id = 'estilos-acciones';
    estilos.textContent = `
        .acciones-item {
            display: flex;
            gap: 8px;
            margin-top: 10px;
        }
        
        .btn-accion {
            background: none;
            border: none;
            padding: 5px 10px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.3s ease;
        }
        
        .btn-accion.editar {
            background: rgba(6, 182, 212, 0.2);
            color: var(--color-accento);
        }
        
        .btn-accion.eliminar {
            background: rgba(239, 68, 68, 0.2);
            color: #ef4444;
        }
        
        .btn-accion:hover {
            transform: scale(1.1);
        }
        
        .promesa-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
        }
        
        .acciones-meta {
            display: flex;
            gap: 10px;
            align-items: center;
        }
        
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .estado-sincronizacion {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255,255,255,0.1);
            padding: 5px 10px;
            border-radius: 10px;
            font-size: 0.8rem;
        }
    `;
    document.head.appendChild(estilos);
}