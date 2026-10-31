import { useEffect, useState, type FC } from 'react';
import { AlertCircle, Loader2, Pencil, X } from 'lucide-react';
import { FacturasService } from '../services/facturas.service';
import { obtenerMensajeError } from '../utils/error';
import {
  formatearFecha,
  formatearFechaHora,
  formatearMoneda,
  formatearTamano,
} from '../utils/format';
import type { Factura } from '../types';

interface Props {
  facturaId: number;
  onClose: () => void;
  onEdit: (factura: Factura) => void;
}

interface DatoProps {
  etiqueta: string;
  valor: string;
}

const Dato = ({ etiqueta, valor }: DatoProps) => (
  <div>
    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{etiqueta}</p>
    <p className="mt-1 break-words text-sm text-slate-100">{valor || '—'}</p>
  </div>
);

export const DetalleFacturaModal: FC<Props> = ({ facturaId, onClose, onEdit }) => {
  const [factura, setFactura] = useState<Factura | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let activo = true;

    const cargarDetalle = async () => {
      try {
        const res = await FacturasService.obtenerDetalle(facturaId);

        if (!activo) return;

        setFactura(res.factura);
        setError(null);
      } catch (err: unknown) {
        if (activo) {
          setError(obtenerMensajeError(err, 'No se pudo cargar el detalle de la factura.'));
        }
      } finally {
        if (activo) setLoading(false);
      }
    };

    void cargarDetalle();

    return () => {
      activo = false;
    };
  }, [facturaId, intento]);

  const reintentar = () => {
    setLoading(true);
    setIntento((actual) => actual + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 text-slate-100 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-700 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-indigo-400">
              {factura
                ? `Detalle de la factura #${factura.numeroFactura}`
                : 'Detalle de la factura'}
            </h2>
            <p className="text-xs text-slate-400">
              Información extraída y metadatos del documento
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle"
            className="text-slate-400 transition hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
              Cargando detalle...
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center text-sm text-red-400">
              <AlertCircle className="h-6 w-6" />
              <p>{error}</p>
              <button
                type="button"
                onClick={reintentar}
                className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
              >
                Reintentar
              </button>
            </div>
          ) : factura ? (
            <div className="space-y-6">
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wide text-indigo-400">
                  Factura
                </h3>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <Dato etiqueta="N° factura" valor={factura.numeroFactura} />
                  <Dato etiqueta="Proveedor" valor={factura.proveedor?.nombre ?? '—'} />
                  <Dato etiqueta="NIT" valor={factura.proveedor?.nit ?? '—'} />
                  <Dato
                    etiqueta="Servicio / tipo"
                    valor={factura.tipoFactura?.servicioOTipo ?? '—'}
                  />
                  <Dato
                    etiqueta="Valor a pagar"
                    valor={formatearMoneda(factura.valorAPagar, factura.tipoDeMoneda)}
                  />
                  <Dato etiqueta="Moneda" valor={factura.tipoDeMoneda} />
                  <Dato etiqueta="Fecha emisión" valor={formatearFecha(factura.fechaEmision)} />
                  <Dato
                    etiqueta="Fecha límite de pago"
                    valor={formatearFecha(factura.fechaLimitePago)}
                  />
                  <Dato etiqueta="N° contrato" valor={factura.numeroContrato ?? '—'} />
                  <Dato etiqueta="N° cliente" valor={factura.numeroCliente ?? '—'} />
                  <Dato etiqueta="Fecha de subida" valor={formatearFechaHora(factura.fechaSubida)} />
                  <Dato etiqueta="Subida por" valor={factura.usuarioSubida?.nombre ?? '—'} />
                </div>
              </section>

              {factura.documento && (
                <section className="border-t border-slate-700 pt-5">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-indigo-400">
                    Documento
                  </h3>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <Dato etiqueta="Nombre" valor={factura.documento.nombreDocumento} />
                    <Dato etiqueta="Tipo" valor={factura.documento.tipoDocumento} />
                    <Dato
                      etiqueta="Tamaño"
                      valor={formatearTamano(factura.documento.tamanoBytes)}
                    />
                    <Dato
                      etiqueta="Fecha de carga"
                      valor={formatearFechaHora(factura.documento.fechaCarga)}
                    />
                    <Dato
                      etiqueta="Estado"
                      valor={factura.documento.estadoProcesamiento ?? '—'}
                    />
                  </div>

                  {factura.documento.respuestaLlm !== undefined &&
                    factura.documento.respuestaLlm !== null && (
                      <details className="mt-4 rounded-lg border border-slate-700 bg-slate-900 p-3">
                        <summary className="cursor-pointer text-xs font-semibold text-slate-300">
                          Respuesta original del LLM
                        </summary>
                        <pre className="mt-3 max-h-60 overflow-auto whitespace-pre-wrap text-[11px] text-slate-400">
                          {JSON.stringify(factura.documento.respuestaLlm, null, 2)}
                        </pre>
                      </details>
                    )}
                </section>
              )}
            </div>
          ) : null}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-700 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-100 transition hover:bg-slate-600"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={() => factura && onEdit(factura)}
            disabled={!factura}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
          >
            <Pencil className="h-4 w-4" />
            Editar factura
          </button>
        </div>
      </div>
    </div>
  );
};
