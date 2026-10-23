// ========================================================
// CONTROL DE INVENTARIOS, SALIDAS Y ENTRADAS (ESTi)
// ========================================================

// 1. Hoja donde están los productos y existencias ("Inventario")
function getCatalogSheet(ss) {
  return ss.getSheetByName("Inventario") || 
         ss.getSheetByName("inventario") || 
         ss.getSheetByName("INVENTARIO") || 
         ss.getSheets()[0];
}

// 2. Hoja donde se guardan los movimientos de empleados ("Salidas")
function getMovementsSheet(ss) {
  return ss.getSheetByName("Salidas") || 
         ss.getSheetByName("salidas") || 
         ss.getSheetByName("SALIDAS") || 
         ss.getSheets()[1];
}

// 3. Hoja donde se guardan los registros de entradas ("Entradas")
function getEntriesSheet(ss) {
  return ss.getSheetByName("Entradas") || 
         ss.getSheetByName("entradas") || 
         ss.getSheetByName("ENTRADAS");
}

// ========================================================
// GET: Devuelve catálogo o lista de maestros (Tiempos Completos)
// ========================================================
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var action = (e && e.parameter && e.parameter.action) ? String(e.parameter.action).trim() : '';

  // 1. OBTENER LISTA DE MAESTROS DE TIEMPOS COMPLETOS
  if (action === 'obtener_tiempos_completos') {
    var sheetTC = ss.getSheetByName('tiempos completos') 
               || ss.getSheetByName('Tiempos completos') 
               || ss.getSheetByName('TIEMPOS COMPLETOS')
               || ss.getSheetByName('Tiempos Completos');
    
    if (!sheetTC) {
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var valores = sheetTC.getDataRange().getValues();
    var maestros = [];

    // Recorre filas buscando la columna con los nombres
    for (var i = 0; i < valores.length; i++) {
      var fila = valores[i];
      for (var j = 0; j < fila.length; j++) {
        var texto = fila[j] ? fila[j].toString().trim() : '';
        // Ignora celdas vacías y encabezados habituales
        if (texto && !/^(nombre|maestro|profesor|docente|personal|id|no\.?)$/i.test(texto)) {
          maestros.push(texto);
          break; // Pasa a la siguiente fila una vez encontrado el nombre
        }
      }
    }

    return ContentService.createTextOutput(JSON.stringify(maestros))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // 2. CATÁLOGO REGULAR DE PRODUCTOS (desde la hoja "Inventario")
  var sheet = getCatalogSheet(ss);
  var data = sheet.getDataRange().getValues();
  var productos = [];
  
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var cod = String(row[0] || "").trim();
    var desc = String(row[1] || "").trim();
    if (cod || desc) {
      productos.push({
        codigo: cod,
        descripcion: desc,
        existencia: String(row[2] !== undefined ? row[2] : "").trim(),
        piezas: String(row[3] !== undefined ? row[3] : "").trim(),
        entradas: String(row[4] !== undefined ? row[4] : "").trim() // Celda E
      });
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify(productos))
    .setMimeType(ContentService.MimeType.JSON);
}

// ========================================================
// POST: Procesa el registro de salidas, entradas y catálogo
// ========================================================
function doPost(e) {
  try {
    var p = e.parameter || {};
    var action = String(p.action || "").trim();
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // -------------------------------------------------------------
    // A) REGISTRAR SALIDA / MOVIMIENTO (Hoja "Salidas")
    // -------------------------------------------------------------
    if (action === "registrar_movimiento" || (!action && p.empleado)) {
      var sheetMov = getMovementsSheet(ss);
      sheetMov.appendRow([
        p.fecha || new Date(),
        p.codigo || "",
        p.descripcion || "",
        p.cantidad || "",
        p.empleado || "",
        p.observaciones || ""
      ]);
      return ContentService.createTextOutput("¡Guardado con éxito en Salidas!");
    }
    
    var sheetCat = getCatalogSheet(ss);
    
    // -------------------------------------------------------------
    // B) REGISTRAR ENTRADA (Hoja "ENTRADAS" + Sumar en "Inventario")
    // -------------------------------------------------------------
    if (action === "registrar_entrada") {
      var codBuscado = String(p.codigo || "").trim().toUpperCase();
      var descBuscada = String(p.descripcion || "").trim().toUpperCase();
      var piezasEntrada = Number(p.cantidad || p.piezas) || 0;
      var fechaEntrada = p.fecha || Utilities.formatDate(new Date(), "GMT-6", "yyyy-MM-dd");
      var observaciones = String(p.observaciones || "").trim();
      
      if (!codBuscado && !descBuscada) {
        return ContentService.createTextOutput("Error: Código o Descripción no proporcionados.");
      }
      if (piezasEntrada <= 0) {
        return ContentService.createTextOutput("Error: La cantidad de piezas debe ser mayor a 0.");
      }
      
      var data = sheetCat.getDataRange().getValues();
      var fila = -1;
      var codOficial = codBuscado;
      var descOficial = descBuscada;
      
      // 1. Buscar fila por Código (Columna A)
      for (var i = 1; i < data.length; i++) {
        var codFila = String(data[i][0] || "").trim().toUpperCase();
        if (codBuscado && codFila === codBuscado) {
          fila = i + 1;
          codOficial = String(data[i][0] || "").trim();
          descOficial = String(data[i][1] || "").trim();
          break;
        }
      }
      
      // Respaldo: Si no coincide por código, buscar por Descripción (Columna B)
      if (fila === -1 && descBuscada) {
        for (var i = 1; i < data.length; i++) {
          var descFila = String(data[i][1] || "").trim().toUpperCase();
          if (descFila === descBuscada) {
            fila = i + 1;
            codOficial = String(data[i][0] || "").trim();
            descOficial = String(data[i][1] || "").trim();
            break;
          }
        }
      }
      
      if (fila === -1) {
        return ContentService.createTextOutput("Error: Producto (" + (codBuscado || descBuscada) + ") no encontrado en Inventario.");
      }
      
      // 2. Registrar en la hoja "ENTRADAS"
      // Columnas: [FECHA, CODIGO, DESCRIPCION, CANTIDAD, OBSERVACIONES]
      var sheetEntradas = getEntriesSheet(ss);
      if (!sheetEntradas) {
        sheetEntradas = ss.insertSheet("ENTRADAS");
        sheetEntradas.appendRow(["FECHA", "CODIGO", "DESCRIPCION", "CANTIDAD", "OBSERVACIONES"]);
      }
      sheetEntradas.appendRow([
        fechaEntrada,
        codOficial,
        descOficial,
        piezasEntrada,
        observaciones
      ]);
      
      // 3. Sumar en la hoja "Inventario" con lo ya registrado (Celda E = Columna 5)
      var celdaE = sheetCat.getRange(fila, 5);
      var valorActual = Number(celdaE.getValue()) || 0;
      var nuevoValor = valorActual + piezasEntrada;
      celdaE.setValue(nuevoValor);
      
      return ContentService.createTextOutput("¡Entrada registrada con éxito en ENTRADAS e inventario actualizado! Total acumulado en Celda E: " + nuevoValor);
    }
    
    // -------------------------------------------------------------
    // C) AGREGAR PRODUCTO (Hoja "Inventario")
    // -------------------------------------------------------------
    if (action === "agregar_producto") {
      var nuevoCodigo = String(p.codigo || "").trim();
      var nuevaDesc = String(p.descripcion || "").trim().toUpperCase();
      var existencia = String(p.existencia || "").trim();
      var piezas = String(p.piezas || "").trim();
      
      if (!nuevoCodigo || !nuevaDesc) {
        return ContentService.createTextOutput("Error: Código y Descripción son obligatorios.");
      }
      
      // Comprobar si ya existe el código en Inventario
      var data = sheetCat.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim().toUpperCase() === nuevoCodigo.toUpperCase()) {
          return ContentService.createTextOutput("Error: El código " + nuevoCodigo + " ya existe en Inventario.");
        }
      }
      
      // Agregar al final de la hoja "Inventario": [Código, Descripción, Existencia, Piezas]
      sheetCat.appendRow([nuevoCodigo, nuevaDesc, existencia, piezas]);
      return ContentService.createTextOutput("Producto agregado con éxito a Inventario.");
    }
    
    // -------------------------------------------------------------
    // D) MODIFICAR PRODUCTO EN "Inventario"
    // -------------------------------------------------------------
    if (action === "modificar_producto") {
      var codViejo = String(p.codigo_viejo || "").trim().toUpperCase();
      var codNuevo = String(p.codigo_nuevo || "").trim();
      var descNueva = String(p.descripcion_nueva || "").trim().toUpperCase();
      var existNueva = String(p.existencia_nueva || "").trim();
      var piezasNuevas = String(p.piezas_nuevas || "").trim();
      
      var data = sheetCat.getDataRange().getValues();
      var fila = -1;
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim().toUpperCase() === codViejo) {
          fila = i + 1;
          break;
        }
      }
      
      if (fila === -1) {
        return ContentService.createTextOutput("Error: Código no encontrado en Inventario.");
      }
      
      sheetCat.getRange(fila, 1, 1, 4).setValues([[codNuevo, descNueva, existNueva, piezasNuevas]]);
      return ContentService.createTextOutput("Producto modificado con éxito en Inventario.");
    }
    
    // -------------------------------------------------------------
    // E) ELIMINAR PRODUCTO DE "Inventario"
    // -------------------------------------------------------------
    if (action === "eliminar_producto") {
      var codEliminar = String(p.codigo || "").trim().toUpperCase();
      var data = sheetCat.getDataRange().getValues();
      var filaEliminar = -1;
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim().toUpperCase() === codEliminar) {
          filaEliminar = i + 1;
          break;
        }
      }
      
      if (filaEliminar === -1) {
        return ContentService.createTextOutput("Error: Código no encontrado en Inventario.");
      }
      
      sheetCat.deleteRow(filaEliminar);
      return ContentService.createTextOutput("Producto eliminado con éxito de Inventario.");
    }
    
    return ContentService.createTextOutput("Error: Acción no reconocida.");
    
  } catch (error) {
    return ContentService.createTextOutput("Error: " + error.toString());
  }
}
