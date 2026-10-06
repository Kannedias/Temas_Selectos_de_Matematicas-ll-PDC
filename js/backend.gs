/* =======================================================
   GOOGLE APPS SCRIPT (BACKEND) - SICAL CONALEP
   ======================================================= */
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Entregas_Evidencias");
    var data = JSON.parse(e.postData.contents);
    
    // ==========================================
    // RUTA A: CONSULTAR AVANCE DEL ALUMNO
    // ==========================================
    if (data.accion === "consultar") {
      var registros = sheet.getDataRange().getValues();
      var modulo1_1_status = "Pendiente";
      
      for (var i = 1; i < registros.length; i++) {
        // Buscar las filas que coincidan con la matrícula del alumno
        if (registros[i][1].toString() === data.matricula) {
          // Si entregó algo del 1.1 y tiene calificación aprobatoria o está Revisado
          if (registros[i][3].includes("1.1") && (registros[i][6] >= 70 || registros[i][5] === "Revisado")) {
            modulo1_1_status = "Concluido";
          }
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        "status": "éxito",
        "modulo1_1": modulo1_1_status
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // ==========================================
    // RUTA B: SUBIR FOTO A DRIVE (Intacto)
    // ==========================================
    if (data.accion === "subir") {
      var carpeta505_ID = "1tIJY172s9tWj6jh7bixM1zZ52FKHkUmk"; 
      var carpeta508_ID = "10vm2B5kFIwKOsFW0RGA4JVmWCBAyM1Y-"; 
      
      var folderId = (data.grupo === "505") ? carpeta505_ID : carpeta508_ID;
      var folder = DriveApp.getFolderById(folderId); 
      
      var blob = Utilities.newBlob(Utilities.base64Decode(data.archivoBase64), data.mimeType, data.matricula + "_" + data.nombreArchivo);
      var file = folder.createFile(blob);
      var fileUrl = file.getUrl();
      
      sheet.appendRow([new Date(), data.matricula, data.grupo, data.actividad, fileUrl, "Pendiente", ""]);
      
      return ContentService.createTextOutput(JSON.stringify({"status": "éxito", "url": fileUrl}))
                           .setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "mensaje": error.toString()}))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}
