const formulario = document.getElementById('form-tarea');
const inputTarea = document.getElementById('input-tarea');
const inputFecha = document.getElementById('input-fecha');
const inputCategoria = document.getElementById('input-categoria');
const listaTareas = document.getElementById('lista-tareas');
const contadorPendientes = document.getElementById('contador-pendientes');
const botonesFiltro = document.querySelectorAll('.filtro');
const btnModo = document.getElementById('btn-modo');

let tareas = [];
let filtroActual = 'todas';

function cargarTareas() {
    const tareasGuardadas = localStorage.getItem('tareas');
    if (tareasGuardadas) {
        tareas = JSON.parse(tareasGuardadas);
    }
    renderizarTareas();
}

function guardarTareas() {
    localStorage.setItem('tareas', JSON.stringify(tareas));
}

function agregarTarea(texto, fecha, categoria) {
    const nuevaTarea = {
        id: Date.now(),
        texto: texto,
        fecha: fecha,
        categoria: categoria,
        completada: false
    };

    tareas.unshift(nuevaTarea);
    guardarTareas();
    renderizarTareas();
}

function toggleTarea(id) {
    tareas = tareas.map(tarea => {
        if (tarea.id === id) {
            return { ...tarea, completada: !tarea.completada };
        }
        return tarea;
    });

    guardarTareas();
    renderizarTareas();
}

function editarTarea(id) {
    const tareaActual = tareas.find(tarea => tarea.id === id);
    const nuevoTexto = prompt('Edita tu tarea:', tareaActual.texto);

    if (nuevoTexto !== null && nuevoTexto.trim() !== '') {
        tareas = tareas.map(tarea => {
            if (tarea.id === id) {
                return { ...tarea, texto: nuevoTexto.trim() };
            }
            return tarea;
        });

        guardarTareas();
        renderizarTareas();
    }
}

function eliminarTarea(id) {
    const li = listaTareas.querySelector(`[data-id='${id}']`);

    if (li) {
        li.classList.add('eliminandose');

        setTimeout(() => {
            tareas = tareas.filter(tarea => tarea.id !== id);
            guardarTareas();
            renderizarTareas();
        }, 400);
    } else {
        tareas = tareas.filter(tarea => tarea.id !== id);
        guardarTareas();
        renderizarTareas();
    }
}

function filtrarTareas() {
    switch (filtroActual) {
        case 'pendientes':
            return tareas.filter(tarea => !tarea.completada);
        case 'completadas':
            return tareas.filter(tarea => tarea.completada);
        default:
            return tareas;
    }
}

function renderizarTareas() {
    const tareasFiltradas = filtrarTareas();
    listaTareas.innerHTML = '';

    if (tareasFiltradas.length === 0) {
        listaTareas.innerHTML = `
            <li class="sin-tareas">
                ${filtroActual === 'todas'
                    ? '¡No hay tareas! Agrega una nueva.'
                    : `No hay tareas ${filtroActual}.`}
            </li>
        `;
        actualizarContador();
        return;
    }

    const hoy = new Date().toISOString().split('T')[0];

    tareasFiltradas.forEach(tarea => {
        const li = document.createElement('li');
        li.className = `tarea ${tarea.completada ? 'completada' : ''}`;
        li.dataset.id = tarea.id;

        const estaVencida = tarea.fecha < hoy && !tarea.completada;

        li.innerHTML = `
            <input
                type="checkbox"
                ${tarea.completada ? 'checked' : ''}
                aria-label="Marcar como ${tarea.completada ? 'pendiente' : 'completada'}"
            >
            <div class="contenido-tarea">
                <span class="tarea-texto">${escaparHTML(tarea.texto)}</span>
                <div class="detalles-tarea">
                    <span class="tarea-categoria">🏷️ ${tarea.categoria}</span>
                    <span class="tarea-fecha ${estaVencida ? 'vencida' : ''}">📅 ${tarea.fecha} ${estaVencida ? '(Vencida)' : ''}</span>
                </div>
            </div>
            <button class="btn-editar" aria-label="Editar tarea">✏️</button>
            <button class="btn-eliminar" aria-label="Eliminar tarea">🗑️</button>
        `;

        const checkbox = li.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => toggleTarea(tarea.id));

        const btnEditar = li.querySelector('.btn-editar');
        btnEditar.addEventListener('click', () => editarTarea(tarea.id));

        const btnEliminar = li.querySelector('.btn-eliminar');
        btnEliminar.addEventListener('click', () => eliminarTarea(tarea.id));

        listaTareas.appendChild(li);
    });

    actualizarContador();
}

function actualizarContador() {
    const pendientes = tareas.filter(tarea => !tarea.completada).length;
    contadorPendientes.textContent = pendientes;
}

function escaparHTML(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

formulario.addEventListener('submit', (e) => {
    e.preventDefault();

    const texto = inputTarea.value.trim();
    const fecha = inputFecha.value;
    const categoria = inputCategoria.value;

    if (texto && fecha) {
        agregarTarea(texto, fecha, categoria);
        inputTarea.value = '';
        inputFecha.value = '';
        inputTarea.focus();
    }
});

botonesFiltro.forEach(boton => {
    boton.addEventListener('click', () => {
        botonesFiltro.forEach(b => b.classList.remove('activo'));
        boton.classList.add('activo');
        filtroActual = boton.dataset.filtro;
        renderizarTareas();
    });
});

btnModo.addEventListener('click', () => {
    document.body.classList.toggle('modo-oscuro');
    
    if (document.body.classList.contains('modo-oscuro')) {
        btnModo.textContent = '☀️';
        localStorage.setItem('modo', 'oscuro');
    } else {
        btnModo.textContent = '🌙';
        localStorage.setItem('modo', 'claro');
    }
});

if (localStorage.getItem('modo') === 'oscuro') {
    document.body.classList.add('modo-oscuro');
    btnModo.textContent = '☀️';
}

cargarTareas();