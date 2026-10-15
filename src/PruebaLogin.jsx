import { useState } from 'react';
import { iniciarSesion } from './api/auth';
import { api } from './api/client';

// Componente TEMPORAL solo para probar la conexión con el backend.
// Bórralo cuando ya tengas tu pantalla de login real.
export default function PruebaLogin() {
  const [resultado, setResultado] = useState('Aún no has probado nada');

  async function probarLogin() {
    try {
      const usuario = await iniciarSesion('admin', 'Divix12345');
      setResultado('Login correcto: ' + JSON.stringify(usuario));
    } catch (error) {
      setResultado('Error: ' + error.message);
    }
  }

  async function probarClientes() {
    try {
      const clientes = await api('/clientes');
      setResultado('Clientes: ' + JSON.stringify(clientes));
    } catch (error) {
      setResultado('Error: ' + error.message);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <button onClick={probarLogin}>1. Probar login</button>{' '}
      <button onClick={probarClientes}>2. Probar clientes</button>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{resultado}</pre>
    </div>
  );
}
