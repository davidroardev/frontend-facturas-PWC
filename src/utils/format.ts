/** Formatea una fecha ISO (YYYY-MM-DD...) como dd/MM/yyyy sin desfase de zona horaria. */
export const formatearFecha = (fecha?: string | null): string => {
  if (!fecha) return '—';

  const [anio, mes, dia] = fecha.slice(0, 10).split('-');
  return anio && mes && dia ? `${dia}/${mes}/${anio}` : '—';
};

/** Formatea una marca de tiempo ISO como fecha y hora local. */
export const formatearFechaHora = (fecha?: string | null): string => {
  if (!fecha) return '—';

  const valor = new Date(fecha);
  if (Number.isNaN(valor.getTime())) return '—';

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(valor);
};

/** Formatea un valor monetario; si el código de moneda no es válido, usa un fallback. */
export const formatearMoneda = (valor: number, moneda: string): string => {
  const codigo = moneda?.trim() || 'COP';

  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: codigo,
      maximumFractionDigits: 2,
    }).format(valor);
  } catch {
    return `${new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valor)} ${codigo}`;
  }
};

/** Convierte bytes a una unidad legible. */
export const formatearTamano = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};
