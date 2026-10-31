import axios from 'axios';

interface ErrorApi {
  mensaje?: string;
}

/**
 * Extrae un mensaje legible de cualquier error.
 * El backend responde errores con la forma `{ ok: false, mensaje, codigo }`.
 */
export const obtenerMensajeError = (
  error: unknown,
  mensajePorDefecto = 'Ocurrió un error inesperado',
): string => {
  if (axios.isAxiosError<ErrorApi>(error)) {
    return error.response?.data?.mensaje ?? 'No se pudo conectar con el servidor';
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return mensajePorDefecto;
};
