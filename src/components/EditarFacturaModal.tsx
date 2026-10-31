import { useEffect, useState, type FC } from 'react';
import { useForm } from 'react-hook-form';
import type { Factura } from '../types';
import { FacturasService } from '../services/facturas.service';
import { obtenerMensajeError } from '../utils/error';
import { AlertCircle, X, Save } from 'lucide-react';

interface Props {
  factura: Factura | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FacturaFormValues {
  numeroFactura: string;
  valorAPagar: number;
  tipoDeMoneda: string;
  numeroContrato?: string;
  numeroCliente?: string;
  fechaEmision?: string;
  fechaLimitePago?: string;
}

export const EditarFacturaModal: FC<Props> = ({ factura, isOpen, onClose, onSuccess }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FacturaFormValues>();
  const [errorApi, setErrorApi] = useState<string | null>(null);

  useEffect(() => {
    if (factura) {
      reset({
        numeroFactura: factura.numeroFactura,
        valorAPagar: factura.valorAPagar,
        tipoDeMoneda: factura.tipoDeMoneda,
        numeroContrato: factura.numeroContrato || '',
        numeroCliente: factura.numeroCliente || '',
        fechaEmision: factura.fechaEmision ? factura.fechaEmision.split('T')[0] : '',
        fechaLimitePago: factura.fechaLimitePago ? factura.fechaLimitePago.split('T')[0] : '',
      });
    }
  }, [factura, reset]);

  if (!isOpen || !factura) return null;

  const onSubmit = async (data: FacturaFormValues) => {
    setErrorApi(null);

    try {
      // El backend y Prisma esperan un DateTime ISO-8601 completo; el
      // input type="date" entrega solo "YYYY-MM-DD". Se completa a medianoche UTC.
      const aIso = (fecha?: string) => (fecha ? `${fecha}T00:00:00.000Z` : null);

      await FacturasService.actualizar(factura.id, {
        numeroFactura: data.numeroFactura.trim(),
        valorAPagar: Number(data.valorAPagar),
        tipoDeMoneda: data.tipoDeMoneda.trim().toUpperCase(),
        numeroContrato: data.numeroContrato?.trim() || null,
        numeroCliente: data.numeroCliente?.trim() || null,
        fechaEmision: aIso(data.fechaEmision),
        fechaLimitePago: aIso(data.fechaLimitePago),
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setErrorApi(obtenerMensajeError(err, 'No se pudo actualizar la factura.'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-slate-800 p-6 shadow-2xl border border-slate-700 text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-700 pb-4">
          <h2 className="text-xl font-bold text-indigo-400">Editar Factura #{factura.numeroFactura}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        {errorApi && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{errorApi}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300">N° Factura</label>
              <input
                type="text"
                maxLength={100}
                {...register('numeroFactura', {
                  required: 'El número de factura es obligatorio',
                })}
                className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 p-2 text-xs text-white"
              />
              {errors.numeroFactura && (
                <p className="mt-1 text-[11px] text-red-400">{errors.numeroFactura.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">Moneda</label>
              <input
                type="text"
                maxLength={3}
                placeholder="COP"
                {...register('tipoDeMoneda', {
                  required: 'La moneda es obligatoria',
                  minLength: { value: 3, message: 'Usa el código ISO de 3 letras (COP, USD)' },
                })}
                className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 p-2 text-xs uppercase text-white"
              />
              {errors.tipoDeMoneda && (
                <p className="mt-1 text-[11px] text-red-400">{errors.tipoDeMoneda.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300">Valor a Pagar</label>
              <input
                type="number"
                step="0.01"
                {...register('valorAPagar', {
                  required: 'El valor es obligatorio',
                  valueAsNumber: true,
                  validate: (value) =>
                    (Number.isFinite(value) && value > 0) || 'El valor debe ser mayor a 0',
                })}
                className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 p-2 text-xs text-white"
              />
              {errors.valorAPagar && (
                <p className="mt-1 text-[11px] text-red-400">{errors.valorAPagar.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">N° Contrato</label>
              <input
                type="text"
                maxLength={100}
                {...register('numeroContrato')}
                className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 p-2 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300">N° Cliente</label>
            <input
              type="text"
              maxLength={100}
              {...register('numeroCliente')}
              className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 p-2 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300">Fecha Emisión</label>
              <input
                type="date"
                {...register('fechaEmision', {
                  validate: (value) =>
                    !value || !Number.isNaN(Date.parse(value)) || 'La fecha no es válida',
                })}
                className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 p-2 text-xs text-white"
              />
              {errors.fechaEmision && (
                <p className="mt-1 text-[11px] text-red-400">{errors.fechaEmision.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">Fecha Límite Pago</label>
              <input
                type="date"
                {...register('fechaLimitePago', {
                  validate: (value, values) =>
                    !value ||
                    !values.fechaEmision ||
                    value >= values.fechaEmision ||
                    'No puede ser anterior a la fecha de emisión',
                })}
                className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 p-2 text-xs text-white"
              />
              {errors.fechaLimitePago && (
                <p className="mt-1 text-[11px] text-red-400">{errors.fechaLimitePago.message}</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-700 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-slate-700 py-2 px-4 text-xs font-semibold hover:bg-slate-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-indigo-600 py-2 px-5 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              <Save className="h-4 w-4" /> Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};