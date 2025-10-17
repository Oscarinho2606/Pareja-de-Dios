// Datos iniciales
let datos = {
    fotos: [],
    promesas: [],
    metas: []
};

// Cargar datos guardados
function cargarDatos() {
    const guardado = localStorage.getItem('datosPareja');
    if (guardado) {
        datos = JSON.parse(guardado);
    }
    actualizarInterfaz();
}

// Guardar datos
function guardarDatos() {
    localStorage.setItem('datosPareja', JSON.stringify(datos));
}

// Navegación entre secciones - VERSIÓN CORREGIDA
document.addEventListener('DOMContentLoaded', function() {
    // Configurar navegación
    document.querySelectorAll('.nav-holograma').forEach(boton => {
        boton.addEventListener('click', function() {
            // Remover activo de todos los botones
            document.querySelectorAll('.nav-holograma').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.seccion-holografica').forEach(sec => sec.classList.remove('active'));
            
            // Activar botón y sección clickeada
            this.classList.add('active');
            const seccion = this.getAttribute('data-section');
            document.getElementById(seccion).classList.add('active');
        });
    });

    // Cargar datos iniciales
    cargarDatos();
});

// Funciones para MODALES
function abrirModalFoto() {
    document.getElementById('modalFoto').style.display = 'block';
    document.getElementById('fechaFoto').valueAsDate = new Date();
}

function abrirModalPromesa() {
    document.getElementById('modalPromesa').style.display = 'block';
}

function abrirModalMeta() {
    document.getElementById('modalMeta').style.display = 'block';
    document.getElementById('fechaMeta').valueAsDate = new Date();
}

function cerrarModal(id) {
    document.getElementById(id).style.display = 'none';
    // Limpiar campos
    document.querySelectorAll(`#${id} input, #${id} textarea`).forEach(campo => {
        campo.value = '';
    });
}

// Agregar FOTO
function agregarFoto() {
    const input = document.getElementById('inputFoto');
    const descripcion = document.getElementById('descripcionFoto').value;
    const fecha = document.getElementById('fechaFoto').value;
    
    if (!input.files[0] || !descripcion) {
        alert('Por favor, selecciona una foto y escribe una descripción');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const nuevaFoto = {
            id: Date.now(),
            imagen: e.target.result,
            descripcion: descripcion,
            fecha: fecha || new Date().toISOString().split('T')[0]
        };
        
        datos.fotos.push(nuevaFoto);
        guardarDatos();
        cerrarModal('modalFoto');
        actualizarGaleria();
    };
    reader.readAsDataURL(input.files[0]);
}

// Agregar PROMESA
function agregarPromesa() {
    const titulo = document.getElementById('tituloPromesa').value;
    const texto = document.getElementById('textoPromesa').value;
    const referencia = document.getElementById('referenciaPromesa').value;
    const reflexion = document.getElementById('reflexionPromesa').value;
    
    if (!titulo || !texto) {
        alert('Por favor, completa al menos el título y el versículo');
        return;
    }
    
    const nuevaPromesa = {
        id: Date.now(),
        titulo: titulo,
        texto: texto,
        referencia: referencia,
        reflexion: reflexion,
        fecha: new Date().toISOString().split('T')[0]
    };
    
    datos.promesas.push(nuevaPromesa);
    guardarDatos();
    cerrarModal('modalPromesa');
    actualizarPromesas();
}

// Agregar META
function agregarMeta() {
    const titulo = document.getElementById('tituloMeta').value;
    const descripcion = document.getElementById('descripcionMeta').value;
    const fecha = document.getElementById('fechaMeta').value;
    
    if (!titulo) {
        alert('Por favor, escribe al menos el título de la meta');
        return;
    }
    
    const nuevaMeta = {
        id: Date.now(),
        titulo: titulo,
        descripcion: descripcion,
        fecha: fecha,
        estado: 'pendiente'
    };
    
    datos.metas.push(nuevaMeta);
    guardarDatos();
    cerrarModal('modalMeta');
    actualizarMetas();
}

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
        <div class="promesa-holograma" onclick="verPromesa(${promesa.id})">
            <div class="promesa-titulo">${promesa.titulo}</div>
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
                <button class="estado-holograma ${meta.estado === 'cumplido' ? 'estado-cumplido' : 'estado-pendiente'}" 
                        onclick="cambiarEstadoMeta(${meta.id})">
                    ${meta.estado === 'cumplido' ? '✅ Cumplido' : '⏳ Por cumplir'}
                </button>
            </div>
            <div class="meta-descripcion">${meta.descripcion}</div>
            <div class="meta-fecha">Para: ${formatearFecha(meta.fecha)}</div>
        </div>
    `).join('');
}

// Funciones auxiliares
function verPromesa(id) {
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
}

function cambiarEstadoMeta(id) {
    const meta = datos.metas.find(m => m.id === id);
    if (meta) {
        meta.estado = meta.estado === 'pendiente' ? 'cumplido' : 'pendiente';
        guardarDatos();
        actualizarMetas();
    }
}

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