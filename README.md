# Proyecto: Scraper de pagina web

Este proyecto consiste en un scraper de una página web que extrae información de una página web específica y la compara con versiones anteriores para identificar cambios. Además, envía un correo electrónico con un informe de diferencias en formato PDF a destinatarios configurados.

## Descripción del Proyecto

El proyecto consta de varios archivos:

- `deployment.yml`: Archivo de configuración para el despliegue del servicio en un contenedor Docker.
- `Dockerfile`: Archivo de Docker para la construcción de la imagen del contenedor.
- `index.js`: Código JavaScript que contiene la lógica del scraper.

## Uso del Proyecto

Para utilizar este proyecto, sigue estos pasos:

- Configura los destinatarios de correo electrónico editando el archivo `.env`, si no esta disponible, debes crear uno, agregar los correos de destinatarios bajo la variable `DESTINATARIOS_CORREO`, separados por comas.

El servicio se ejecutará automáticamente de acuerdo con la programación establecida en `index.js` utilizando la biblioteca `node-cron`. Cada vez que se encuentren diferencias en los términos y condiciones, se enviará un correo electrónico a los destinatarios especificados en el archivo `.env`.

## Archivo .env

El archivo `.env` contiene la configuración del proyecto, incluidos los destinatarios de correo electrónico. Asegúrate de agregar los correos de destinatarios bajo la variable `DESTINATARIOS_CORREO` en este archivo.

Aquí hay un ejemplo de cómo se vería el archivo `.env`:

```plaintext
DESTINATARIOS_CORREO=correo1@example.com,correo2@example.com