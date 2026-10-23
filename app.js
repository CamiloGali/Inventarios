// 1. REEMPLAZA ESTO CON LA URL DE TU WEB APP
const scriptURL = 'https://script.google.com/macros/s/AKfycbypyYLUVixRK14H-TOQNhEGULNPLaV-4dwj6BMwA7-tg6YVzT95L2ieEcuJbr6gdjRD/exec';

// Catálogo cargado desde Google Sheets
let catalogoProductos = [];

// 1. CARGAR CATÁLOGO DESDE GOOGLE SHEETS
function cargarCatalogo() {
    fetch(scriptURL)
        .then(res => res.json())
        .then(data => {
            catalogoProductos = data;
            actualizarListasUI();
        })
        .catch(error => {
            alert("Error al cargar los datos del servidor.");
        });
}

// Función utilitaria para normalizar texto (sin tildes, minúsculas, espacios)
function normalizarTexto(texto) {
    return (texto || '')
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

// 2. ACTUALIZAR VISUALMENTE LAS LISTAS EN EL HTML
function actualizarListasUI() {
    const dataList = document.getElementById('listaProductos');

    if (dataList) {
        dataList.innerHTML = '';
        catalogoProductos.sort((a, b) => a.descripcion.localeCompare(b.descripcion));
        catalogoProductos.forEach(item => {
            let opt = document.createElement('option');
            opt.value = item.descripcion;
            dataList.appendChild(opt);
        });
    }

    const filtroEdit = document.getElementById('filtroModificar')?.value || '';
    actualizarSelectEdit(filtroEdit);

    const filtroDel = document.getElementById('filtroEliminar')?.value || '';
    actualizarSelectDel(filtroDel);

    const contador = document.getElementById('contadorProductos');
    if (contador) contador.textContent = `${catalogoProductos.length} artículos`;
}

// 2.1 ACTUALIZAR Y FILTRAR SELECT EN "MODIFICAR"
function actualizarSelectEdit(filtro = '') {
    const selectEdit = document.getElementById('selectEdit');
    const badge = document.getElementById('badgeFiltroEdit');
    const btnLimpiar = document.getElementById('btnLimpiarFiltroEdit');
    if (!selectEdit) return;

    const valorPrevio = selectEdit.value;
    const filtroNorm = normalizarTexto(filtro);

    const filtrados = filtroNorm
        ? catalogoProductos.filter(p => {
            const codNorm = normalizarTexto(p.codigo);
            const descNorm = normalizarTexto(p.descripcion);
            return codNorm.includes(filtroNorm) || descNorm.includes(filtroNorm);
        })
        : catalogoProductos;

    selectEdit.innerHTML = '';

    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    if (filtroNorm) {
        defaultOpt.textContent = filtrados.length > 0
            ? `-- Selecciona un producto (${filtrados.length} encontrados) --`
            : `-- Sin coincidencias con "${filtro.trim()}" --`;
    } else {
        defaultOpt.textContent = '-- Selecciona un producto --';
    }
    selectEdit.appendChild(defaultOpt);

    filtrados.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.codigo;
        opt.textContent = `${item.codigo} - ${item.descripcion}`;
        selectEdit.appendChild(opt);
    });

    if (btnLimpiar) {
        if (filtro.trim().length > 0) {
            btnLimpiar.classList.remove('hidden');
        } else {
            btnLimpiar.classList.add('hidden');
        }
    }

    if (badge) {
        if (filtroNorm) {
            badge.textContent = `${filtrados.length} de ${catalogoProductos.length}`;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    if (valorPrevio && filtrados.some(p => p.codigo === valorPrevio)) {
        selectEdit.value = valorPrevio;
    } else if (filtrados.length === 1 && filtroNorm) {
        selectEdit.value = filtrados[0].codigo;
        cargarDatosModificar(filtrados[0].codigo);
    } else {
        selectEdit.value = '';
        if (valorPrevio) {
            limpiarCamposModificar();
        }
    }
}

// 2.2 ACTUALIZAR Y FILTRAR SELECT EN "ELIMINAR"
function actualizarSelectDel(filtro = '') {
    const selectDel = document.getElementById('selectDel');
    const badge = document.getElementById('badgeFiltroDel');
    const btnLimpiar = document.getElementById('btnLimpiarFiltroDel');
    if (!selectDel) return;

    const valorPrevio = selectDel.value;
    const filtroNorm = normalizarTexto(filtro);

    const filtrados = filtroNorm
        ? catalogoProductos.filter(p => {
            const codNorm = normalizarTexto(p.codigo);
            const descNorm = normalizarTexto(p.descripcion);
            return codNorm.includes(filtroNorm) || descNorm.includes(filtroNorm);
        })
        : catalogoProductos;

    selectDel.innerHTML = '';

    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    if (filtroNorm) {
        defaultOpt.textContent = filtrados.length > 0
            ? `-- Selecciona un producto (${filtrados.length} encontrados) --`
            : `-- Sin coincidencias con "${filtro.trim()}" --`;
    } else {
        defaultOpt.textContent = '-- Selecciona un producto --';
    }
    selectDel.appendChild(defaultOpt);

    filtrados.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.codigo;
        opt.textContent = `${item.codigo} - ${item.descripcion}`;
        selectDel.appendChild(opt);
    });

    if (btnLimpiar) {
        if (filtro.trim().length > 0) {
            btnLimpiar.classList.remove('hidden');
        } else {
            btnLimpiar.classList.add('hidden');
        }
    }

    if (badge) {
        if (filtroNorm) {
            badge.textContent = `${filtrados.length} de ${catalogoProductos.length}`;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    if (valorPrevio && filtrados.some(p => p.codigo === valorPrevio)) {
        selectDel.value = valorPrevio;
    } else if (filtrados.length === 1 && filtroNorm) {
        selectDel.value = filtrados[0].codigo;
    } else {
        selectDel.value = '';
    }
}

function cargarDatosModificar(codigo) {
    const p = catalogoProductos.find(p => String(p.codigo).trim() === String(codigo).trim());
    document.getElementById('editCodigo').value = p ? p.codigo : '';
    document.getElementById('editDesc').value = p ? p.descripcion : '';
    document.getElementById('editExistencia').value = p ? (p.existencia ?? '') : '';
    document.getElementById('editPiezas').value = p ? (p.piezas ?? '') : '';
}

function limpiarCamposModificar() {
    document.getElementById('editCodigo').value = '';
    document.getElementById('editDesc').value = '';
    document.getElementById('editExistencia').value = '';
    document.getElementById('editPiezas').value = '';
}

// 2.1 GESTIÓN DE PERSONAL (INTENDENTES / TIEMPOS COMPLETOS)
const LISTA_INTENDENTES = [
    { valor: "HERMELINDA", nombre: "Hermelinda" },
    { valor: "MAIKA", nombre: "Maika" },
    { valor: "LILI", nombre: "Lili" },
    { valor: "DIEGO", nombre: "Diego" },
    { valor: "ANITA", nombre: "Anita" },
    { valor: "RICARDO", nombre: "Ricardo" },
    { valor: "OSCAR", nombre: "Oscar" },
    { valor: "JESUS", nombre: "Jesus" },
    { valor: "GABRIELA", nombre: "Gabriela" },
    { valor: "CYNTHIA", nombre: "Cynthia" },
    { valor: "ENRIQUE", nombre: "Enrique" },
    { valor: "NORMA", nombre: "Norma" },
    { valor: "EVA", nombre: "Eva" },
    { valor: "SUSANA", nombre: "Susana" },
    { valor: "GERARDO", nombre: "Gerardo" },
    { valor: "ISMAEL", nombre: "Ismael" },
    { valor: "SOTERO", nombre: "Sotero" }
];

// Lista de Tiempos Completos guardada en la hoja de Excel 'tiempos completos'
let listaTiemposCompletos = [
    { valor: "ALVA ALVA ISAAC ANTONIO", nombre: "Alva Alva Isaac Antonio" },
    { valor: "ALVARADO SANTOS EDUARDO", nombre: "Alvarado Santos Eduardo" },
    { valor: "ARELLANO SANCHEZ NANCY", nombre: "Arellano Sanchez Nancy" },
    // { valor: "ARMENTA ESPINOSA OSCAR", nombre: "Armenta Espinosa Oscar" },
    { valor: "BARRON MURIAS MARIA CRISTAL", nombre: "Barron Murias Maria Cristal" },
    // { valor: "BAUTISTA DORANTES ANA LILIA", nombre: "Bautista Dorantes Ana Lilia" },
    { valor: "BOLANOS RODRIGUEZ ERNESTO", nombre: "Bolanos Rodriguez Ernesto" },
    { valor: "BUSTO VILLARREAL MARIA GUADALUPE", nombre: "Busto Villarreal Maria Guadalupe" },
    { valor: "CALLEJAS JIMENEZ ISMAEL", nombre: "Callejas Jimenez Ismael" },
    { valor: "CORONADO MENESES MYRIAM", nombre: "Coronado Meneses Myriam" },
    { valor: "DE LA CRUZ FONSECA LIZBETH", nombre: "De la Cruz Fonseca Lizbeth" },
    { valor: "DOMINGUEZ SANCHEZ ERIKA BERENICE", nombre: "Dominguez Sanchez Erika Berenice" },
    { valor: "DUARTE RIVERA MARIA DEL ROCIO", nombre: "Duarte Rivera Maria Del Rocio" },
    { valor: "ESTUDIANTE MARTINEZ CAROLINA", nombre: "Estudiante Martinez Carolina" },
    { valor: "FERNANDEZ LOPEZ LAURA TERESA", nombre: "Fernandez Lopez Laura Teresa" },
    { valor: "FERRER HERNANDEZ JANETH", nombre: "Ferrer Hernandez Janeth" },
    { valor: "FLORES AMADOR CRISTINA", nombre: "Flores Amador Cristina" },
    { valor: "FLORES GARCIA ERNESTO", nombre: "Flores Garcia Ernesto" },
    { valor: "FUENTES CESAR YOSCELIN ANANIA", nombre: "Fuentes Cesar Yoscelin Anania" },
    // { valor: "GALINDO ARTEAGA JESUS", nombre: "Galindo Arteaga Jesus" },
    { valor: "GARZA SOSA MARTHA ANAID", nombre: "Garza Sosa Martha Anaid" },
    { valor: "GOMEZ MARTINEZ JOSHUA ALDAIR", nombre: "Gomez Martinez Joshua Aldair" },
    { valor: "GOMEZ OLIVARES MARIEL", nombre: "Gomez Olivares Mariel" },
    { valor: "GONZALEZ CADENA MARIBEL", nombre: "Gonzalez Cadena Maribel" },
    { valor: "GONZALEZ CANTO ADRIANA", nombre: "Gonzalez Canto Adriana" },
    { valor: "GUADARRAMA ATRIZCO VICTOR HUGO", nombre: "Guadarrama Atrizco Victor Hugo" },
    { valor: "GUZMAN LERMA ALMA GUADALUPE", nombre: "Guzman Lerma Alma Guadalupe" },
    { valor: "HILARIO GONZALEZ JESSICA", nombre: "Hilario Gonzalez Jessica" },
    { valor: "LEZAMA LEON EVANGELINA", nombre: "Lezama Leon Evangelina" },
    { valor: "MARIANO BENITEZ CARLOS ALBERTO", nombre: "Mariano Benitez Carlos Alberto" },
    { valor: "MARIN RODRIGUEZ MARIELA", nombre: "Marin Rodriguez Mariela" },
    // { valor: "MARTINEZ SUAREZ DIEGO", nombre: "Martinez Suarez Diego" },
    // { valor: "MOLINA LORENZO HERMELINDA", nombre: "Molina Lorenzo Hermelinda" },
    // { valor: "OROZCO TELLEZ SOTERO", nombre: "Orozco Tellez Sotero" },
    { valor: "PEDRAZA AMADOR ELBA MARIANA", nombre: "Pedraza Amador Elba Mariana" },
    // { valor: "PEREZ HERNANDEZ RICARDO", nombre: "Perez Hernandez Ricardo" },
    { valor: "PEREZ HURTADO MARCOS JOEL", nombre: "Perez Hurtado Marcos Joel" },
    { valor: "PEREZ SALVADOR TEOFILO", nombre: "Perez Salvador Teofilo" },
    // { valor: "PINEDA BARRON ANA GABRIELA", nombre: "Pineda Barron Ana Gabriela" },
    // { valor: "RIVERO RODRIGUEZ ANA LILIA", nombre: "Rivero Rodriguez Ana Lilia" },
    { valor: "ROLDAN ROBLES MIGUEL ANGEL", nombre: "Roldan Robles Miguel Angel" },
    // { valor: "ROSAS ROSENDO MAIKA FAVIOLA", nombre: "Rosas Rosendo Maika Fabiola" },
    { valor: "RUIZ GONZALEZ HUGO", nombre: "Ruiz Gonzalez Hugo" },
    { valor: "SAN JUAN VILLEGAS ANA FERNANDA", nombre: "San Juan Villegas Ana Fernanda" },
    { valor: "SANTILLAN GUTIERREZ ALEJANDRA", nombre: "Santillan Gutierrez Alejandra" },
    { valor: "SOLIS GALINDO ALONSO ERNESTO", nombre: "Solis Galindo Alonso Ernesto" },
    { valor: "TORRES RANGEL CHRISTIAN", nombre: "Torres Rangel Christian" },
    { valor: "TREJO CAMPOS LUIS ALBERTO", nombre: "Trejo Campos Luis Alberto" },
    // { valor: "VALDEZ SOTO CYNTHIA", nombre: "Valdez Soto Cynthia" },
    { valor: "VALERIO NOLASCO MAYRA ANAID", nombre: "Valerio Nolasco Mayra Anaid" },
    { valor: "VEGA CANO GABY YOLANDA", nombre: "Vega Cano Gaby Yolanda" },
    { valor: "VILLALOBOS MONTER ERANDI", nombre: "Villalobos Monter Erandi" },
    { valor: "ZARATE LAGUNA LAURA NALLELY", nombre: "Zarate Laguna Laura Nallely" }
];

let tipoPersonalActual = 'intendente';

function actualizarSelectPersonal(filtro = '') {
    const selectEmpleado = document.getElementById('empleado');
    const badgeTipo = document.getElementById('badgeTipoEmpleado');
    const inputFiltro = document.getElementById('filtroEmpleadoTC');
    const contenedorFiltro = document.getElementById('contenedorFiltroTC');
    if (!selectEmpleado) return;

    selectEmpleado.innerHTML = '';

    if (tipoPersonalActual === 'intendente') {
        if (badgeTipo) {
            badgeTipo.textContent = `Intendente (${LISTA_INTENDENTES.length})`;
            badgeTipo.className = 'text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100';
        }
        if (contenedorFiltro) contenedorFiltro.classList.add('hidden');
        if (inputFiltro) inputFiltro.value = '';

        const optDefault = document.createElement('option');
        optDefault.value = '';
        optDefault.textContent = '-- Seleccionar intendente --';
        selectEmpleado.appendChild(optDefault);

        LISTA_INTENDENTES.forEach(item => {
            const opt = document.createElement('option');
            opt.value = item.valor;
            opt.textContent = item.nombre;
            selectEmpleado.appendChild(opt);
        });
    } else {
        if (badgeTipo) {
            badgeTipo.textContent = `Tiempos Completos (${listaTiemposCompletos.length})`;
            badgeTipo.className = 'text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100';
        }
        if (contenedorFiltro) contenedorFiltro.classList.remove('hidden');

        const filtroNorm = filtro.trim().toLowerCase();
        const listaFiltrada = filtroNorm
            ? listaTiemposCompletos.filter(item => {
                const texto = typeof item === 'object' && item !== null
                    ? `${item.nombre || ''} ${item.valor || ''}`
                    : String(item || '');
                return texto.toLowerCase().includes(filtroNorm);
            })
            : listaTiemposCompletos;

        const optDefault = document.createElement('option');
        optDefault.value = '';
        optDefault.textContent = `-- Seleccionar personal (${listaFiltrada.length}) --`;
        selectEmpleado.appendChild(optDefault);

        if (listaFiltrada.length === 0) {
            const optVacio = document.createElement('option');
            optVacio.value = '';
            optVacio.disabled = true;
            optVacio.textContent = 'Sin resultados con ese filtro';
            selectEmpleado.appendChild(optVacio);
        } else {
            listaFiltrada.forEach(item => {
                const opt = document.createElement('option');
                if (typeof item === 'object' && item !== null) {
                    opt.value = item.valor || item.nombre;
                    opt.textContent = item.nombre || item.valor;
                } else {
                    opt.value = item;
                    opt.textContent = item;
                }
                selectEmpleado.appendChild(opt);
            });
        }
    }
}

function cambiarTipoPersonal(tipo) {
    tipoPersonalActual = tipo;
    const inputHidden = document.getElementById('tipoPersonal');
    if (inputHidden) inputHidden.value = tipo;

    const btnIntendente = document.getElementById('btnTipoIntendente');
    const btnTC = document.getElementById('btnTipoTC');

    if (tipo === 'intendente') {
        if (btnIntendente) {
            btnIntendente.classList.add('bg-white', 'text-blue-600', 'shadow-xs', 'font-bold');
            btnIntendente.classList.remove('bg-transparent', 'text-slate-500', 'font-semibold');
        }
        if (btnTC) {
            btnTC.classList.remove('bg-white', 'text-blue-600', 'shadow-xs', 'font-bold');
            btnTC.classList.add('bg-transparent', 'text-slate-500', 'font-semibold');
        }
    } else {
        if (btnTC) {
            btnTC.classList.add('bg-white', 'text-blue-600', 'shadow-xs', 'font-bold');
            btnTC.classList.remove('bg-transparent', 'text-slate-500', 'font-semibold');
        }
        if (btnIntendente) {
            btnIntendente.classList.remove('bg-white', 'text-blue-600', 'shadow-xs', 'font-bold');
            btnIntendente.classList.add('bg-transparent', 'text-slate-500', 'font-semibold');
        }
    }

    actualizarSelectPersonal();
}

function cargarTiemposCompletos() {
    fetch(`${scriptURL}?action=obtener_tiempos_completos`)
        .then(res => res.json())
        .then(data => {
            if (!Array.isArray(data) || data.length === 0) return;

            // VALIDACIÓN CRÍTICA:
            // Si el backend aún no procesa 'obtener_tiempos_completos', devuelve el catálogo
            // de productos ({ codigo, descripcion, ... }). NUNCA usar esos datos como maestros.
            const contieneProductos = data.some(item =>
                item && typeof item === 'object' && ('codigo' in item || 'descripcion' in item)
            );
            if (contieneProductos) {
                console.warn('El servidor devolvió el catálogo de productos en lugar de Tiempos Completos. Se mantiene la lista de maestros.');
                return;
            }

            const itemsValidos = data.map(item => {
                if (typeof item === 'string') {
                    const limpio = item.replace(/\s+/g, ' ').trim();
                    if (!limpio || /^ESTi-/i.test(limpio)) return null;
                    return { valor: limpio.toUpperCase(), nombre: limpio };
                }
                if (typeof item === 'object' && item !== null) {
                    const nom = (item.nombre || item.NOMBRE || item.maestro || item.MAESTRO || item.profesor || item.PROFESOR || item.docente || item.DOCENTE || item.empleado || item.EMPLEADO || '').toString().trim();
                    const val = (item.valor || nom).toString().trim();
                    if (!nom || /^ESTi-/i.test(nom)) return null;
                    return { valor: val.toUpperCase(), nombre: nom };
                }
                return null;
            }).filter(Boolean);

            if (itemsValidos.length > 0) {
                listaTiemposCompletos = itemsValidos.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
                if (tipoPersonalActual === 'tiempos_completos') {
                    actualizarSelectPersonal();
                }
            }
        })
        .catch(err => {
            console.log('Usando lista local de Tiempos Completos:', err);
        });
}

// 3. INICIALIZAR AL ABRIR LA PÁGINA
window.addEventListener('load', () => {
    cargarCatalogo();
    cargarTiemposCompletos();
    actualizarSelectPersonal();
});
if (document.getElementById('fecha')) {
    document.getElementById('fecha').valueAsDate = new Date();
}

// 4. AUTOCOMPLETADO (SALIDAS Y ENTRADAS)
const inputDescripcion = document.getElementById('descripcion');
const inputCodigo = document.getElementById('codigo');

if (inputDescripcion && inputCodigo) {
    inputDescripcion.addEventListener('input', function () {
        const valorBuscado = this.value;
        const productoEncontrado = catalogoProductos.find(p => p.descripcion === valorBuscado);
        inputCodigo.value = productoEncontrado ? productoEncontrado.codigo : '';
    });
}

const inputEntradaDesc = document.getElementById('entradaDescripcion');
const inputEntradaCodigo = document.getElementById('entradaCodigo');

if (inputEntradaDesc && inputEntradaCodigo) {
    inputEntradaDesc.addEventListener('input', function () {
        const valorBuscado = this.value;
        const productoEncontrado = catalogoProductos.find(p => p.descripcion === valorBuscado);
        inputEntradaCodigo.value = productoEncontrado ? productoEncontrado.codigo : '';
    });
}

// 5. REGISTRAR MOVIMIENTO (FORMULARIO PRINCIPAL)
const form = document.getElementById('inventarioForm');
form.addEventListener('submit', e => {
    e.preventDefault();
    const mensaje = document.getElementById('mensaje');
    if (!inputCodigo.value) {
        mensaje.innerText = 'Selecciona un producto válido de la lista.';
        mensaje.className = 'error';
        return;
    }

    const btnSubmit = document.getElementById('btnSubmit');

    btnSubmit.disabled = true;
    btnSubmit.innerText = 'Guardando...';

    const datosRegistro = new FormData(form);
    datosRegistro.append('action', 'registrar_movimiento');
    const params = new URLSearchParams(datosRegistro);

    fetch(scriptURL, { method: 'POST', body: params })
        .then(async res => {
            const respuesta = await res.text();
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${respuesta}`);
            }

            // Apps Script puede devolver un error dentro de una respuesta HTTP 200.
            if (/error|exception|failed|falló|fallo|acción no reconocida|código no encontrado/i.test(respuesta)) {
                throw new Error(respuesta);
            }

            mensaje.innerText = respuesta || '¡Guardado con éxito!';
            mensaje.className = 'success';
            form.reset();
            cambiarTipoPersonal('intendente');
            document.getElementById('fecha').valueAsDate = new Date();
            btnSubmit.disabled = false;
            btnSubmit.innerText = 'Guardar Registro de Salida';
            setTimeout(() => mensaje.innerText = '', 3000);
        })
        .catch(error => {
            mensaje.innerText = `No se guardó: ${error.message}`;
            mensaje.className = 'error';
            btnSubmit.disabled = false;
            btnSubmit.innerText = 'Guardar Registro en Excel';
        });
});

// 5.1 REGISTRAR ENTRADA (FORMULARIO DE ENTRADAS)
const entradaForm = document.getElementById('entradaForm');
if (entradaForm) {
    entradaForm.addEventListener('submit', e => {
        e.preventDefault();
        const mensajeEntrada = document.getElementById('mensajeEntrada');
        const btnSubmitEntrada = document.getElementById('btnSubmitEntrada');
        const inputEntradaPiezas = document.getElementById('entradaPiezas');

        if (!inputEntradaCodigo || !inputEntradaCodigo.value) {
            mensajeEntrada.innerText = 'Selecciona un producto válido de la lista.';
            mensajeEntrada.className = 'error';
            return;
        }

        const piezas = parseInt(inputEntradaPiezas.value, 10);
        if (isNaN(piezas) || piezas <= 0) {
            mensajeEntrada.innerText = 'Ingresa una cantidad válida de piezas.';
            mensajeEntrada.className = 'error';
            return;
        }

        btnSubmitEntrada.disabled = true;
        btnSubmitEntrada.innerText = 'Guardando entrada...';

        const data = new FormData();
        data.append('action', 'registrar_entrada');
        data.append('codigo', inputEntradaCodigo.value);
        data.append('descripcion', inputEntradaDesc.value);
        data.append('piezas', piezas);

        const params = new URLSearchParams(data);

        fetch(scriptURL, { method: 'POST', body: params })
            .then(async res => {
                const respuesta = await res.text();
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}: ${respuesta}`);
                }
                if (/error|exception|failed|falló|fallo|acción no reconocida|código no encontrado/i.test(respuesta)) {
                    throw new Error(respuesta);
                }

                mensajeEntrada.innerText = respuesta || '¡Entrada registrada con éxito en celda E!';
                mensajeEntrada.className = 'success';
                entradaForm.reset();
                inputEntradaCodigo.value = '';
                cargarCatalogo();
                btnSubmitEntrada.disabled = false;
                btnSubmitEntrada.innerText = 'Registrar Entrada al Inventario';
                setTimeout(() => {
                    mensajeEntrada.innerText = '';
                    mensajeEntrada.className = '';
                }, 3500);
            })
            .catch(error => {
                mensajeEntrada.innerText = `No se guardó: ${error.message}`;
                mensajeEntrada.className = 'error';
                btnSubmitEntrada.disabled = false;
                btnSubmitEntrada.innerText = 'Registrar Entrada al Inventario';
            });
    });
}

// 6. FUNCIONES DE GESTIÓN (AGREGAR, MODIFICAR, ELIMINAR)
function mostrarMensajeCatalogo(texto, tipo = 'error') {
    const elemento = document.getElementById('catalogoMensaje');
    if (!elemento) return;
    elemento.textContent = texto;
    elemento.className = `catalog-message ${tipo}`;
    clearTimeout(mostrarMensajeCatalogo.timer);
    mostrarMensajeCatalogo.timer = setTimeout(() => {
        elemento.textContent = '';
        elemento.className = 'catalog-message';
    }, 4000);
}

function enviarPeticionCatalogo(formData, boton, textoOriginal, alCompletar) {
    boton.disabled = true;
    boton.innerText = 'Procesando...';

    const params = new URLSearchParams(formData);
    fetch(scriptURL, { method: 'POST', body: params })
        .then(async res => {
            const texto = await res.text();
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${texto}`);
            }
            if (/error|exception|failed|falló|fallo|acción no reconocida|código no encontrado/i.test(texto)) {
                throw new Error(texto);
            }
            return texto;
        })
        .then(texto => {
            mostrarMensajeCatalogo(texto || 'Operación realizada correctamente.', 'success');
            cargarCatalogo(); // Recarga los datos actualizados del Excel
            if (alCompletar) alCompletar();
            boton.disabled = false;
            boton.innerText = textoOriginal;
        })
        .catch(error => {
            mostrarMensajeCatalogo(`No se pudo completar la operación: ${error.message}`, 'error');
            boton.disabled = false;
            boton.innerText = textoOriginal;
        });
}

function obtenerCamposFaltantes(codigo, descripcion) {
    const faltantes = [];
    if (!codigo || !codigo.trim()) faltantes.push('Código');
    if (!descripcion || !descripcion.trim()) faltantes.push('Descripción');
    return faltantes;
}

// Agregar
document.getElementById('btnAgregar').addEventListener('click', function () {
    const cod = document.getElementById('newCodigo').value.trim();
    const desc = document.getElementById('newDesc').value.trim().toUpperCase();
    const existencia = document.getElementById('newExistencia').value.trim();
    const piezas = document.getElementById('newPiezas').value.trim();
    const faltantes = obtenerCamposFaltantes(cod, desc);
    if (faltantes.length) return mostrarMensajeCatalogo(`Falta completar: ${faltantes.join(', ')}.`, 'error');

    let data = new FormData();
    data.append('action', 'agregar_producto');
    data.append('codigo', cod);
    data.append('descripcion', desc);
    data.append('existencia', existencia);
    data.append('piezas', piezas);

    enviarPeticionCatalogo(data, this, 'Agregar al inventario', () => {
        document.getElementById('newCodigo').value = '';
        document.getElementById('newDesc').value = '';
        document.getElementById('newExistencia').value = '';
        document.getElementById('newPiezas').value = '';
    });
});

// Cargar datos en Modificar
document.getElementById('selectEdit').addEventListener('change', function () {
    cargarDatosModificar(this.value);
});

// Modificar
document.getElementById('btnModificar').addEventListener('click', function () {
    const codViejo = document.getElementById('selectEdit').value;
    const codNuevo = document.getElementById('editCodigo').value.trim();
    const descNueva = document.getElementById('editDesc').value.trim().toUpperCase();
    const existenciaNueva = document.getElementById('editExistencia').value.trim();
    const piezasNuevas = document.getElementById('editPiezas').value.trim();
    if (!codViejo) return mostrarMensajeCatalogo('Selecciona un producto para modificar.', 'error');
    const faltantes = obtenerCamposFaltantes(codNuevo, descNueva);
    if (faltantes.length) {
        return mostrarMensajeCatalogo(`Falta completar: ${faltantes.join(', ')}.`, 'error');
    }

    let data = new FormData();
    data.append('action', 'modificar_producto');
    data.append('codigo_viejo', codViejo);
    data.append('codigo_nuevo', codNuevo);
    data.append('descripcion_nueva', descNueva);
    data.append('existencia_nueva', existenciaNueva);
    data.append('piezas_nuevas', piezasNuevas);

    const boton = this;
    enviarPeticionCatalogo(data, boton, 'Modificar Producto', () => {
        document.getElementById('selectEdit').value = '';
        limpiarCamposModificar();
        const fMod = document.getElementById('filtroModificar');
        if (fMod) fMod.value = '';
        actualizarSelectEdit('');
    });
});

// 7. MODAL DE CONFIRMACIÓN CON TAILWIND (ELIMINAR PRODUCTO)
const modalEliminar = document.getElementById('modalEliminar');
const modalEliminarCard = document.getElementById('modalEliminarCard');
const modalProdInfo = document.getElementById('modalProdInfo');
const btnCancelarEliminar = document.getElementById('btnCancelarEliminar');
const btnCerrarModalX = document.getElementById('btnCerrarModalX');
const btnConfirmarEliminar = document.getElementById('btnConfirmarEliminar');

let productoAEliminar = null;

function abrirModalEliminar(codigo, descripcion) {
    productoAEliminar = codigo;
    modalProdInfo.textContent = descripcion ? `${codigo} - ${descripcion}` : codigo;
    modalEliminar.classList.remove('hidden');
    modalEliminar.classList.add('flex');
    void modalEliminar.offsetWidth; // Forzar reflujo de estilos
    modalEliminar.classList.remove('opacity-0');
    modalEliminar.classList.add('opacity-100');
    modalEliminarCard.classList.remove('scale-95');
    modalEliminarCard.classList.add('scale-100');
}

function cerrarModalEliminar() {
    modalEliminar.classList.remove('opacity-100');
    modalEliminar.classList.add('opacity-0');
    modalEliminarCard.classList.remove('scale-100');
    modalEliminarCard.classList.add('scale-95');
    setTimeout(() => {
        modalEliminar.classList.remove('flex');
        modalEliminar.classList.add('hidden');
        productoAEliminar = null;
    }, 250);
}

btnCancelarEliminar.addEventListener('click', cerrarModalEliminar);
btnCerrarModalX.addEventListener('click', cerrarModalEliminar);
modalEliminar.addEventListener('click', e => {
    if (e.target === modalEliminar) cerrarModalEliminar();
});
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modalEliminar.classList.contains('hidden')) {
        cerrarModalEliminar();
    }
});

// Eliminar
document.getElementById('btnEliminar').addEventListener('click', function () {
    const cod = document.getElementById('selectDel').value;
    if (!cod) return mostrarMensajeCatalogo('Selecciona un producto para eliminar.', 'error');

    const producto = catalogoProductos.find(p => p.codigo === cod);
    const desc = producto ? producto.descripcion : '';
    abrirModalEliminar(cod, desc);
});

btnConfirmarEliminar.addEventListener('click', function () {
    if (!productoAEliminar) return;

    let data = new FormData();
    data.append('action', 'eliminar_producto');
    data.append('codigo', productoAEliminar);

    const btn = document.getElementById('btnEliminar');
    cerrarModalEliminar();
    enviarPeticionCatalogo(data, btn, 'Eliminar Producto', () => {
        document.getElementById('selectDel').value = '';
        const fDel = document.getElementById('filtroEliminar');
        if (fDel) fDel.value = '';
        actualizarSelectDel('');
    });
});

// 8. REGISTRO DEL SERVICE WORKER (PWA)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
}

// 9. CONTROL DE PESTAÑAS (SEGMENTED TABS) EN GESTIÓN DE CATÁLOGO
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        const targetId = this.dataset.tab;

        document.querySelectorAll('.tab-btn').forEach(b => {
            b.classList.remove('bg-white', 'text-blue-600', 'shadow-xs', 'font-bold');
            b.classList.add('bg-transparent', 'text-slate-500', 'font-semibold');
        });

        this.classList.add('bg-white', 'text-blue-600', 'shadow-xs', 'font-bold');
        this.classList.remove('bg-transparent', 'text-slate-500', 'font-semibold');

        document.querySelectorAll('.tab-content').forEach(content => {
            if (content.id === targetId) {
                content.classList.remove('hidden');
            } else {
                content.classList.add('hidden');
            }
        });

        // Foco automático en el filtro o campo correspondiente
        if (targetId === 'tab-modificar') {
            setTimeout(() => document.getElementById('filtroModificar')?.focus(), 50);
        } else if (targetId === 'tab-eliminar') {
            setTimeout(() => document.getElementById('filtroEliminar')?.focus(), 50);
        } else if (targetId === 'tab-agregar') {
            setTimeout(() => document.getElementById('newCodigo')?.focus(), 50);
        }
    });
});

// 10. CONTROL DE PESTAÑAS (SALIDAS / ENTRADAS) EN REGISTRO DE MOVIMIENTOS
document.querySelectorAll('.mov-tab-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        const targetId = this.dataset.movTab;

        document.querySelectorAll('.mov-tab-btn').forEach(b => {
            b.classList.remove('bg-white', 'text-blue-600', 'shadow-xs', 'font-bold');
            b.classList.add('bg-transparent', 'text-slate-500', 'font-semibold');
        });

        this.classList.add('bg-white', 'text-blue-600', 'shadow-xs', 'font-bold');
        this.classList.remove('bg-transparent', 'text-slate-500', 'font-semibold');

        document.querySelectorAll('.mov-tab-content').forEach(content => {
            if (content.id === targetId) {
                content.classList.remove('hidden');
            } else {
                content.classList.add('hidden');
            }
        });
    });
});

// 11. CONTROL DE SELECTOR DE PERSONAL (INTENDENTE / TIEMPOS COMPLETOS)
document.querySelectorAll('.tipo-personal-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        const tipo = this.dataset.tipoPersonal;
        if (tipo && tipo !== tipoPersonalActual) {
            cambiarTipoPersonal(tipo);
        }
    });
});

const inputFiltroTC = document.getElementById('filtroEmpleadoTC');
if (inputFiltroTC) {
    inputFiltroTC.addEventListener('input', function () {
        actualizarSelectPersonal(this.value);
    });
}

// 12. FILTROS DE BÚSQUEDA EN "MODIFICAR" Y "ELIMINAR" PRODUCTOS
const inputFiltroModificar = document.getElementById('filtroModificar');
if (inputFiltroModificar) {
    inputFiltroModificar.addEventListener('input', function () {
        actualizarSelectEdit(this.value);
    });
    inputFiltroModificar.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const select = document.getElementById('selectEdit');
            if (select && select.options.length > 1) {
                if (!select.value && select.options[1].value) {
                    select.value = select.options[1].value;
                    cargarDatosModificar(select.value);
                }
                document.getElementById('editCodigo')?.focus();
            }
        }
    });
}

const btnLimpiarFiltroEdit = document.getElementById('btnLimpiarFiltroEdit');
if (btnLimpiarFiltroEdit) {
    btnLimpiarFiltroEdit.addEventListener('click', function () {
        const input = document.getElementById('filtroModificar');
        if (input) {
            input.value = '';
            actualizarSelectEdit('');
            input.focus();
        }
    });
}

const inputFiltroEliminar = document.getElementById('filtroEliminar');
if (inputFiltroEliminar) {
    inputFiltroEliminar.addEventListener('input', function () {
        actualizarSelectDel(this.value);
    });
    inputFiltroEliminar.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const select = document.getElementById('selectDel');
            if (select && select.options.length > 1) {
                if (!select.value && select.options[1].value) {
                    select.value = select.options[1].value;
                }
                document.getElementById('btnEliminar')?.focus();
            }
        }
    });
}

const btnLimpiarFiltroDel = document.getElementById('btnLimpiarFiltroDel');
if (btnLimpiarFiltroDel) {
    btnLimpiarFiltroDel.addEventListener('click', function () {
        const input = document.getElementById('filtroEliminar');
        if (input) {
            input.value = '';
            actualizarSelectDel('');
            input.focus();
        }
    });
}
