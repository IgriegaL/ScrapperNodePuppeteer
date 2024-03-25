// Importación de módulos necesarios
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const deepDiff = require('deep-diff');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const axios = require('axios');
const pdfkit = require('pdfkit');
require('dotenv').config();

// URL del sitio web a analizar
const url = 'www.example.com';

// Array para almacenar las diferencias encontradas
let Reporte = [];

// Función principal para obtener datos de la página web
async function getDataFromWebPage(destinatarios) {

  const NombreCarpeta = 'HistocalExample';

  // Define rutas de archivos y carpeta
  const folderPath = path.join(__dirname, NombreCarpeta);

  // Ruta para archivo de registro (log)
  const logFilePath = path.join(folderPath, 'log_HistocalExample.txt');

  // Crea la carpeta si no existe
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }

  // Redirige la salida de la consola a un archivo de registro
  const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });
  console.log = function (message) {
    logStream.write(moment().format('YYYY-MM-DD HH:mm:ss') + ' - ' + message + '\n');
    process.stdout.write(moment().format('YYYY-MM-DD HH:mm:ss') + ' - ' + message + '\n');
  };

  // Inicia el navegador Puppeteer
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {

    // Abre una nueva página en el navegador
    const page = await browser.newPage();
    await page.goto(url);

    // Espera a que se cargue un selector específico en la página
    //await page.waitForSelector();
    await page.waitForSelector("add here your selector web");

    let data = new Object;

    // Extrae datos de la página utilizando evaluación en el contexto de la página
    data = await page.evaluate(() => {
      const elementos = document.querySelectorAll("add here your selector web");
      const dataArray = [];

      elementos.forEach(elemento => {
        // Add here you sub selector
        dataArray.push({  // Add here you sub selector });
      });

      return dataArray;
    });

    // Genera nombres de archivo y carpeta basados en la fecha actual
    const NombreTexto = 'PrimaryTextExample';
    const currentDate = moment().format('YYYY-MM-DD_HH-mm-ss');
    const fileName = `${NombreTexto}${currentDate}.txt`;
    const beginHistoryFile = 'Secondary_Diff_TextExample';
    const differencesFile = `${beginHistoryFile}_${currentDate}.txt`;


    const filePath = path.join(folderPath, fileName);
    const differencesFilePath = path.join(folderPath, differencesFile);

    // Inicializa array para datos existentes
    let existingData = [];

    try {
      // Intenta leer el contenido del archivo más reciente
      const latestFile = fs.readdirSync(folderPath).filter(file => file.startsWith(NombreTexto)).pop();
      if (latestFile !== undefined) {
        const existingDataString = fs.readFileSync(path.join(folderPath, latestFile), 'utf-8');
        existingData = JSON.parse(existingDataString);
      } else {
        console.log(` se verifica si archivo local existe `)
        // verifica si existe folderPath si no la crea
        console.log(` se verifica si carpeta existe : ${fs.existsSync(folderPath)}`)
        if (!fs.existsSync(folderPath)) {
          console.log(`se crea carpeta ${folderPath}`)
          fs.mkdirSync(folderPath);
        }
        // veirifica si existe dentro de la carpeta un archivo con nombre texto
        console.log(`veirifica si existe dentro de la carpeta un archivo con ${NombreTexto} `)
        const latestFile = fs.readdirSync(folderPath).filter(file => file.startsWith(NombreTexto)).pop();
        if (latestFile !== undefined) {
          console.log(`Se encontró un archivo, se puede leer su contenido.`)
        } else {
          console.log(`No se encontraron archivos que comiencen con ${NombreTexto}.`)
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
          console.log(`Data guardada en el archivo: ${JSON.stringify(filePath)}`);
          return ;
        }

      }
    } catch (error) {
      console.log(`Error al comprobar texto en archivo local y comparar: ${error}`);
      return
    }

    console.log(`Verificacion de difererencias`);

    // Compara el contenido del archivo con el nuevo contenido
    const differences = deepDiff(existingData, data);
    console.log(`Compara el contenido del archivo con el nuevo contenido ${differences}`);


    if (differences != undefined) {
      // Muestra las diferencias por consola
      console.log(`Diferencias encontradas differences: ${JSON.stringify(differences)}`);

      try {
        differences.forEach(diff => {

          // formateo de objeto a texto legible

          if (diff.lhs !== undefined && diff.rhs !== undefined || diff.kind) {
            const formattedLhs = (
              diff.kind === 'N' ? 'Propiedad/elemento añadido' :
                diff.kind === 'D' ? 'Propiedad/elemento eliminado' :
                  diff.kind === 'E' ? 'Propiedad/elemento editado' :
                    diff.kind === 'A' ? 'Cambio en un Elemento' :
                      'Tipo de cambio no mapeado'
            );

            let posicion = undefined;
            let textoAntiguo = undefined;
            let textoNuevo = undefined;

            if (diff.path) {
              // Desestructurar el array cuando hay path
              const [index, ...restPath] = diff.path;
              posicion = `${index + 1} - "${restPath.join('", "')}"`;
              textoAntiguo = `${JSON.stringify(diff.lhs)}`;
              textoNuevo = `${JSON.stringify(diff.rhs)}`;
          } else if (diff.index && diff.item && (diff.item.rhs || diff.item.lhs)) {
              // Desestructurar el array cuando hay diff.index y diff.item.rhs
              posicion = `${JSON.stringify(diff.index)}`;
              textoAntiguo = 'texto Nuevo';
              const itemKey = Object.keys(diff.item).find(key => key !== "kind"); // Encuentra la clave que no sea "kind"
              const item = diff.item[itemKey];
              const titulo = item ? item.titulo : '';
              const contenido = item ? item.contenido : '';
              textoNuevo = `
                  "Title Example:": ,, ${JSON.stringify(titulo)} ,,
                  "Content Example": ,, ${JSON.stringify(contenido)}
              `;
          } else {
              console.log('ERROR when formatting');
              throw new Error('ERROR when formatting');
          }

          //   const respuestaConsola = `

          //   // add you json diferrence here

          //   }
          // `;

            // // Agrega las diferencias al array de Reporte
            // Reporte.push({

            // });

            // Muestra la diferencia en la consola
            console.log(JSON.stringify(respuestaConsola));
            console.log(' REport Example :' + JSON.stringify(Reporte));
          }
        });

      } catch (error) {
        throw `error to try transform the data : ${error.stack}`;
      }

      // Guarda el nuevo contenido solo si hay alguna diferencia
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`Data update and save on the file : ${JSON.stringify(filePath)}`);

      // Guarda las diferencias en un segundo archivo TXT
      fs.writeFileSync(differencesFilePath, JSON.stringify(Reporte, null, 2));
      console.log(`Save difference in the file: ${JSON.stringify(differencesFilePath)}`);

      // Elimina archivos antiguos para mantener solo los últimos dos
      cleanOldFiles(folderPath, NombreTexto);
      cleanOldFiles(folderPath, beginHistoryFile);

      // Envía un correo electrónico con ambos archivos adjuntos en PDF
      await sendEmailWithAttachmentAndPDF(filePath, differencesFilePath, Reporte, NombreTexto, destinatarios);
    } else {
      console.log('No changes detected, Dont save the data and dont send the email.');
    }

    logStream.end();
    await browser.close();
  } catch (error) {
    console.log(`Error al obtener datos de la página web: ${error}`);
    // Enviar correo electrónico de error en caso de fallo
    await sendErrorEmail(destinatarios, error, url);

    logStream.end();
    await browser.close();
  }
}

// Función para enviar un correo electrónico con archivos adjuntos, incluidos los PDF
async function sendEmailWithAttachmentAndPDF(textFilePath, differencesFilePath, Reporte, NombreTexto, destinatarios) {
  // Rutas para los archivos PDF convertidos
  const pdfFilePath = textFilePath.replace('.txt', '.pdf');
  const pdfDifferencesFilePath = differencesFilePath.replace('.txt', '.pdf');

  try {
    // Convierte los archivos de texto a PDF
    await convertTextToPDF(textFilePath, pdfFilePath);
    await convertTextToPDF(differencesFilePath, pdfDifferencesFilePath);

    console.log(`PDf files created: ${pdfFilePath}, ${pdfDifferencesFilePath}`);

    // Envía el correo electrónico con los archivos PDF adjuntos
    await sendEmailWithAttachment(pdfFilePath, pdfDifferencesFilePath, Reporte, NombreTexto, destinatarios);
  } catch (error) {
    console.log(`Error  to try the convert text file on pdf or send email : ${error}`);

    // Elimina los archivos PDF recién creados
    if (fs.existsSync(pdfFilePath)) {
      fs.unlinkSync(pdfFilePath);
      console.log(`PDF file ${pdfFilePath} deleted.`);
    }
    if (fs.existsSync(pdfDifferencesFilePath)) {
      fs.unlinkSync(pdfDifferencesFilePath);
      console.log(`PDF fike ${pdfDifferencesFilePath} deleted.`);
    }

    // Elimina los archivos de texto recién creados
    if (fs.existsSync(textFilePath)) {
      fs.unlinkSync(textFilePath);
      console.log(`Text file ${textFilePath} deleted.`);
    }
    if (fs.existsSync(differencesFilePath)) {
      fs.unlinkSync(differencesFilePath);
      console.log(`Text file ${differencesFilePath} deleted.`);
    }
  }
}

// Función para convertir el archivo de texto a PDF
function convertTextToPDF(textFilePath, pdfFilePath) {
  return new Promise((resolve, reject) => {
    const doc = new pdfkit();
    const writeStream = fs.createWriteStream(pdfFilePath);

    // Manejo de errores
    writeStream.on('error', err => {
      reject(err);
    });

    // Finalización exitosa
    writeStream.on('finish', () => {
      resolve();
    });

    // Convierte el archivo de texto a PDF con formato adecuado
    doc.pipe(writeStream);
    const textContent = fs.readFileSync(textFilePath, 'utf-8');
    const dataArray = JSON.parse(textContent); // formato JSON

    dataArray.forEach(item => {
      for (const key in item) {
        let value = item[key];

        // Aplicar los formateos 
        if (key.includes(!'"Titulo":')) {
          value = value
            .replace(/\\\"/g, '"') // Reemplaza las comillas escapadas por comillas simples
            .replace(/\s+/g, ' ') // Elimina espacios en blanco adicionales
            .replace(/[\t\n]/g, '') // Elimina tabulaciones y saltos de línea
            .trim(); // Elimina espacios en blanco al principio y al final
        } else {
          value = value
            .replace(/\\\"/g, '"') // Reemplaza las comillas escapadas por comillas simples
            .replace(/\s+/g, ' ') // Elimina espacios en blanco adicionales
            .replace(/[\t\n]/g, '') // Elimina tabulaciones y saltos de línea
            .replace(/,,/g, '\n') // si hay doble coma reemplaza por coma y salto de linea
            .replace(/"/g, '')
            .trim(); // Elimina espacios en blanco al principio y al final
        }
        doc
          .font('Helvetica-Bold')
          .fontSize(12)
          .text(`${key}:`, { align: 'left' })
          .font('Helvetica')
          .fontSize(10)
          .text(`${value}`, { align: 'left' })
          .moveDown();
      }
      // Agregar un salto de línea después de cada item
      doc.moveDown();

    });
    doc.end();
  });
}

// Función para enviar un correo electrónico con archivos adjuntos
async function sendEmailWithAttachment(attachmentFilePath, differencesFilePath, Reporte, NombreTexto, destinatarios) {
  // Construye la tabla HTML con las diferencias
  const differencesTable = Reporte.map(diff => {
    // Corta para mostrar solo los primeros 100 caracteres
    const truncatedAntiguo = diff.TextoAntiguo.slice(0, 100);
    const truncatedNuevo = diff.TextoNuevo.slice(0, 100);

    return `
        <tr>
          <td>${diff.TipoDeCambio}</td>
          <td>${diff.TipoDeElemento}</td>
          <td>${truncatedAntiguo}</td>
          <td>${truncatedNuevo}</td>
        </tr>
      `;
  }).join('');

  console.log(`Resume differences founds: ${differencesTable}`);

  // Construir el objeto de datos para enviar al endpoint
  const dataToSend = {
    asunto: ' EXAMPLE ',
    destinatarios: destinatarios,   // Lista de destinatarios
    cuerpoCorreo: {
      contenido: `
      <p>Found difference on ${NombreTexto}:</p>
      <table border="1">
        <thead>
          <tr>
            <th>Type of difference</th>
            <th>Element</th>
            <th>Old Text</th>
            <th>New Text</th>
          </tr>
        </thead>
        <tbody>
          ${differencesTable}
        </tbody>
      </table>
      <p>Add into the update file and the Difference file.</p>
    `,
      tipo: 'HTML',
      imagenes: {}
    },
    adjuntos: [
      {
        nombre: path.basename(attachmentFilePath),
        extension: "PDF",
        archivoBase64: fs.readFileSync(attachmentFilePath, 'base64'),
      },
      {
        nombre: path.basename(differencesFilePath),
        extension: "PDF",
        archivoBase64: fs.readFileSync(differencesFilePath, 'base64'),
      },
    ]
  };

  console.log(`Before send ${JSON.stringify(dataToSend)}`);
  console.log(`Try to send the email: ${destinatarios}`);

  try {
    const response = await axios.post('URL_POST', dataToSend);

    if (response.status === 200) {
      console.log(`Email send to the endpoint: ${JSON.stringify(response.data)}`);
    } else {
      console.log(`Error to send the email, STATUS response: ${response.status}`);
      console.log(`RESPONSE SERVER: ${JSON.stringify(response.data)}`);
      console.log(`Stack trace: ${error.stack}`);
    }
  } catch (error) {
    if (error.response) {
      // El servidor respondió con un código de estado diferente de 2xx
      console.log(`Error to send the email, STATUS response: ${error.response.status}`);
      console.log(`RESPONSE service: ${JSON.stringify(error.response.data)}`);
      console.log(`Stack trace: ${error.stack}`);
    } else if (error.request) {
      // La solicitud fue realizada pero no se recibió respuesta del servidor
      console.log(`SERVER dont response: ${JSON.stringify(error.request)}`);
    } else {
      // Ocurrió un error durante la configuración de la solicitud
      console.log(`Error minewhile the configuration request: ${error.message}`);
      console.log(`Stack trace: ${error.stack}`);
    }
  }
}

// Función para dejar solo los últimos 2 archivos en una carpeta
function cleanOldFiles(folderPath, prefix) {
  const files = fs.readdirSync(folderPath).filter(file => file.startsWith(prefix));

  // Obtiene los archivos a eliminar (todos excepto los últimos 2)
  const filesToDelete = files.slice(0, -2);

  // Elimina los archivos seleccionados
  filesToDelete.forEach(file => {
    const filePathToDelete = path.join(folderPath, file);
    fs.unlinkSync(filePathToDelete);
    console.log(`File save eliminated: ${filePathToDelete}`);
  });
}

// Función para enviar un correo electrónico en caso de error
async function sendErrorEmail(destinatarios, error, url = '') {

  let asunto = 'Error: to try generate document';
  if (url) {
    asunto += ` ${url}`;
  }

  const dataToSend = {
    asunto: asunto,
    destinatarios: destinatarios,
    cuerpoCorreo: {
      contenido: `
      <p> its happends an error when try to found the information on the web site</p>
      <p> Detail error : ${error}:</p>`
      ,
      tipo: 'HTML',
      imagenes: {}
    },
    adjuntos: [] // Sin adjuntos
  };

  try {
    const response = await axios.post('http://172.17.26.68:9080/Rest-EnvioCorreo/enviarCorrreo', dataToSend);
    console.log(`Send Error Email. SERVER RESPONSE: ${JSON.stringify(response.data)}`);
  } catch (error) {
    console.log(`Error to try send the email: ${JSON.stringify(error)}`);
  }
}


/*
* Manejo hora configurable
*/

// Ejecutar todos los días a las 09:00 horas:
const ejecucionCronHora = process.env.HORA_EJECUCION_CRON || '0 9 * * *'; // Por defecto a las 09:00
const destinatariosCorreo = process.env.DESTINATARIOS_CORREO ? process.env.DESTINATARIOS_CORREO.split(',') : [];

if (destinatariosCorreo.length === 0) {
  throw new Error('ERRROR: DONT FOUND THE DESTINATARY EMAIL.');
}
cron.schedule(ejecucionCronHora, () => {
  console.log(`EXECUTING getDataFromWebPage ON ${moment().format('HH:mm')} HOURS.`);
  getDataFromWebPage(destinatariosCorreo);
});
