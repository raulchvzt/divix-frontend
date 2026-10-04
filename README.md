# Divix — frontend de acceso

React, JavaScript con JSX y CSS nativo, ejecutados con Vite. Sin router ni backend implementado.

## Revisar el login

1. Ejecutar `npm install` si es necesario y `npm run dev`.
2. Abrir la URL local indicada por Vite.
3. Probar el formulario con teclado, Enter, mostrar/ocultar contraseña y tamaños móviles.

### Datos ficticios (solo desarrollo)

| Usuario | Contraseña | Nombre | Rol |
| --- | --- | --- | --- |
| `cajero.demo` | `DivixDemo123!` | Alex Martínez | Cajero |
| `admin.demo` | `DivixDemo123!` | Andrea López | Administrador |

Cualquier otra combinación produce un error de credenciales. Un usuario vacío o de espacios y una contraseña vacía se rechazan antes del envío. La contraseña nunca se recorta.

La simulación está habilitada únicamente con `import.meta.env.DEV` y se identifica como «Modo demostración». Solo muestra una confirmación; no crea sesiones ni guarda datos en localStorage.

Para comprobar producción: `npm run build` y `npm run preview`, y abrir la URL indicada. Con datos no vacíos debe mostrar que el servicio no está disponible, sin conceder acceso simulado.

## Integración pendiente con backend

Sustituir la simulación en `src/services/auth.js` cuando se acuerden:

- URL base y endpoint, método y campos de la solicitud (usuario y contraseña).
- Respuesta con identidad y rol, y formato de errores de credenciales y disponibilidad.
- Cookies o tokens, expiración, cierre de sesión y protección de solicitudes.
- CORS, HTTPS y configuración por entorno.
- Autorización de roles en el servidor: el frontend no concede permisos.

No existe un endpoint configurado ni se realiza una petición real. Los destinos posteriores al acceso quedan fuera del alcance.

Validaciones de código: `npm run lint` y `npm run build`.
