import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Building2,
  ChevronLeft,
  ChevronRight,
  Coins,
  Eye,
  FileText,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { FacturasService } from '../services/facturas.service';
import { obtenerMensajeError } from '../utils/error';
import { formatearFecha, formatearMoneda } from '../utils/format';
import { CargarFacturaModal } from '../components/CargarFacturaModal';
import { EditarFacturaModal } from '../components/EditarFacturaModal';
import { DetalleFacturaModal } from '../components/DetalleFacturaModal';
import type { Factura, ReporteResumen } from '../types';

interface Filtros {
  proveedorNombre: string;
  fechaInicio: string;
  fechaFin: string;
}

const FILTROS_VACIOS: Filtros = {
  proveedorNombre: '',
  fechaInicio: '',
  fechaFin: '',
};

const OPCIONES_PAGE_SIZE = [5, 10, 20, 50];

interface KpiCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  hint?: string;
}

const KpiCard = ({ icon, label, value, hint }: KpiCardProps) => (
  <div className="rounded-2xl border border-slate-800 bg-slate-800/50 p-4">
    <div className="flex items-center gap-3">
      <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">{icon}</div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
    </div>
    <p className="mt-3 text-2xl font-bold text-white">{value}</p>
    {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
  </div>
);

export default function DashboardPage() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recargarKey, setRecargarKey] = useState(0);

  const [filtrosForm, setFiltrosForm] = useState<Filtros>(FILTROS_VACIOS);
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_VACIOS);

  const [resumen, setResumen] = useState<ReporteResumen[]>([]);
  const [resumenLoading, setResumenLoading] = useState(true);
  const [resumenError, setResumenError] = useState<string | null>(null);
  const [resumenKey, setResumenKey] = useState(0);

  const [modalCargarAbierto, setModalCargarAbierto] = useState(false);
  const [facturaEditando, setFacturaEditando] = useState<Factura | null>(null);
  const [facturaDetalleId, setFacturaDetalleId] = useState<number | null>(null);

  // Listado paginado: los filtros y la paginación se resuelven en el backend.
  useEffect(() => {
    let activo = true;

    const cargarFacturas = async () => {
      try {
        const res = await FacturasService.listar({
          page,
          pageSize,
          proveedorNombre: filtros.proveedorNombre.trim() || undefined,
          fechaInicio: filtros.fechaInicio || undefined,
          fechaFin: filtros.fechaFin || undefined,
        });

        if (!activo) return;

        setFacturas(res.data);
        setTotalItems(res.totalItems);
        setTotalPages(res.totalPages);
        setError(null);
      } catch (err: unknown) {
        if (activo) {
          setError(obtenerMensajeError(err, 'No se pudieron cargar las facturas.'));
        }
      } finally {
        if (activo) setLoading(false);
      }
    };

    void cargarFacturas();

    return () => {
      activo = false;
    };
  }, [page, pageSize, filtros, recargarKey]);

  // Reporte global agrupado por proveedor, mes y moneda.
  useEffect(() => {
    let activo = true;

    const cargarResumen = async () => {
      try {
        const res = await FacturasService.obtenerReporteResumen();

        if (!activo) return;

        setResumen(res.reporte);
        setResumenError(null);
      } catch (err: unknown) {
        if (activo) {
          setResumenError(obtenerMensajeError(err, 'No se pudo cargar el resumen.'));
        }
      } finally {
        if (activo) setResumenLoading(false);
      }
    };

    void cargarResumen();

    return () => {
      activo = false;
    };
  }, [resumenKey]);

  // Sumar por moneda es seguro: nunca se mezclan monedas distintas.
  const totalesPorMoneda = useMemo(() => {
    const acumulado = new Map<string, number>();

    for (const fila of resumen) {
      acumulado.set(fila.moneda, (acumulado.get(fila.moneda) ?? 0) + fila.totalFacturado);
    }

    return [...acumulado.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [resumen]);

  const proveedoresResumen = useMemo(
    () => new Set(resumen.map((fila) => fila.proveedor)).size,
    [resumen],
  );

  const recargarTodo = () => {
    setLoading(true);
    setResumenLoading(true);
    setRecargarKey((actual) => actual + 1);
    setResumenKey((actual) => actual + 1);
  };

  const recargarResumen = () => {
    setResumenLoading(true);
    setResumenKey((actual) => actual + 1);
  };

  const aplicarFiltros = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      filtrosForm.fechaInicio &&
      filtrosForm.fechaFin &&
      filtrosForm.fechaInicio > filtrosForm.fechaFin
    ) {
      setError('La fecha inicial no puede ser posterior a la fecha final.');
      return;
    }

    if (filtrosForm.proveedorNombre.trim().length > 100) {
      setError('El nombre del proveedor no puede superar los 100 caracteres.');
      return;
    }

    setError(null);
    setLoading(true);
    setPage(1);
    setFiltros({ ...filtrosForm });
  };

  const limpiarFiltros = () => {
    setError(null);
    setLoading(true);
    setPage(1);
    setFiltrosForm({ ...FILTROS_VACIOS });
    setFiltros({ ...FILTROS_VACIOS });
  };

  const cambiarPagina = (nuevaPagina: number) => {
    if (nuevaPagina < 1 || nuevaPagina > totalPages || nuevaPagina === page) return;

    setLoading(true);
    setPage(nuevaPagina);
  };

  const cambiarPageSize = (nuevoTamano: number) => {
    setLoading(true);
    setPageSize(nuevoTamano);
    setPage(1);
  };

  const eliminarFactura = async (factura: Factura) => {
    const confirmado = window.confirm(
      `¿Eliminar la factura N° ${factura.numeroFactura} de ${factura.proveedor.nombre}?`,
    );

    if (!confirmado) return;

    try {
      await FacturasService.eliminar(factura.id);

      if (facturas.length === 1 && page > 1) {
        setLoading(true);
        setPage((actual) => actual - 1);
        setResumenLoading(true);
        setResumenKey((actual) => actual + 1);
      } else {
        recargarTodo();
      }
    } catch (err: unknown) {
      setError(obtenerMensajeError(err, 'No se pudo eliminar la factura.'));
    }
  };

  const cerrarSesion = () => {
    logout();
    navigate('/auth', { replace: true });
  };

  const hayFiltrosActivos = Boolean(
    filtros.proveedorNombre || filtros.fechaInicio || filtros.fechaFin,
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-600 p-2">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-white">Gestor de Facturas</h1>
              <p className="text-xs text-slate-400">Extracción inteligente con IA</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-white">{usuario?.nombre ?? 'Usuario'}</p>
              <p className="text-xs text-slate-400">{usuario?.correo ?? ''}</p>
            </div>
            <button
              type="button"
              onClick={cerrarSesion}
              className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-red-500/50 hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Panel de facturas</h2>
            <p className="mt-1 text-sm text-slate-400">
              Carga, consulta y corrige las facturas procesadas por el modelo.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={recargarTodo}
              disabled={loading || resumenLoading}
              className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
            <button
              type="button"
              onClick={() => setModalCargarAbierto(true)}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              <Plus className="h-4 w-4" />
              Cargar factura
            </button>
          </div>
        </section>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button type="button" onClick={() => setError(null)} aria-label="Cerrar error">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <section className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              icon={<FileText className="h-4 w-4" />}
              label="Facturas listadas"
              value={String(totalItems)}
              hint={hayFiltrosActivos ? 'Con filtros aplicados' : 'Total registrado'}
            />
            <KpiCard
              icon={<Building2 className="h-4 w-4" />}
              label="Proveedores"
              value={String(proveedoresResumen)}
              hint="En el resumen"
            />
            <KpiCard
              icon={<Coins className="h-4 w-4" />}
              label="Monedas"
              value={String(totalesPorMoneda.length)}
              hint="Sin mezclar monedas"
            />
            {totalesPorMoneda.length > 0 ? (
              totalesPorMoneda.map(([moneda, total]) => (
                <KpiCard
                  key={moneda}
                  icon={<Coins className="h-4 w-4" />}
                  label={`Total en ${moneda}`}
                  value={formatearMoneda(total, moneda)}
                  hint="Suma del resumen"
                />
              ))
            ) : (
              <KpiCard
                icon={<Coins className="h-4 w-4" />}
                label="Total por moneda"
                value="—"
                hint="Sin datos"
              />
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-800/50">
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-4 sm:px-5">
              <div>
                <h3 className="font-semibold text-white">Resumen por proveedor, mes y moneda</h3>
                <p className="text-xs text-slate-400">
                  Los valores de monedas distintas no se suman entre sí.
                </p>
              </div>
              <button
                type="button"
                onClick={recargarResumen}
                disabled={resumenLoading}
                className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${resumenLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Recargar</span>
              </button>
            </div>

            {resumenLoading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
                Cargando resumen...
              </div>
            ) : resumenError ? (
              <div className="flex items-center gap-2 px-4 py-8 text-sm text-red-400 sm:px-5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="flex-1">{resumenError}</span>
                <button
                  type="button"
                  onClick={recargarResumen}
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                >
                  Reintentar
                </button>
              </div>
            ) : resumen.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-slate-400 sm:px-5">
                Todavía no hay facturas para generar el resumen.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="bg-slate-900/60 text-xs uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-semibold sm:px-5">Proveedor</th>
                      <th className="px-4 py-3 font-semibold">Mes</th>
                      <th className="px-4 py-3 font-semibold">Moneda</th>
                      <th className="px-4 py-3 text-right font-semibold">Total facturado</th>
                      <th className="px-4 py-3 text-right font-semibold sm:px-5">Facturas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {resumen.map((fila, indice) => (
                      <tr
                        key={`${fila.proveedor}-${fila.mes}-${fila.moneda}-${indice}`}
                        className="transition hover:bg-slate-800/60"
                      >
                        <td className="px-4 py-3 font-medium text-white sm:px-5">{fila.proveedor}</td>
                        <td className="px-4 py-3 text-slate-300">{fila.mes}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-slate-700/60 px-2 py-0.5 text-xs font-semibold text-slate-200">
                            {fila.moneda}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-white">
                          {formatearMoneda(fila.totalFacturado, fila.moneda)}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-300 sm:px-5">
                          {fila.cantidadFacturas}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-800/50 p-4 sm:p-5">
          <form
            onSubmit={aplicarFiltros}
            className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end"
          >
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-300">Proveedor</span>
              <input
                type="text"
                value={filtrosForm.proveedorNombre}
                onChange={(event) =>
                  setFiltrosForm((actual) => ({
                    ...actual,
                    proveedorNombre: event.target.value,
                  }))
                }
                placeholder="Ej. Empresa de Energía"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-300">
                Fecha Emisión desde 
              </span>
              <input
                type="date"
                value={filtrosForm.fechaInicio}
                onChange={(event) =>
                  setFiltrosForm((actual) => ({ ...actual, fechaInicio: event.target.value }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-300">Fecha Emisión hasta</span>
              <input
                type="date"
                value={filtrosForm.fechaFin}
                onChange={(event) =>
                  setFiltrosForm((actual) => ({ ...actual, fechaFin: event.target.value }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </label>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                <Search className="h-4 w-4" />
                Filtrar
              </button>
              <button
                type="button"
                onClick={limpiarFiltros}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-700"
              >
                Limpiar
              </button>
            </div>
          </form>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-800/50">
          <div className="flex flex-col gap-3 border-b border-slate-800 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <h3 className="font-semibold text-white">Facturas</h3>
              <p className="text-xs text-slate-400">
                {totalItems} resultado{totalItems === 1 ? '' : 's'}
                {hayFiltrosActivos ? ' con los filtros actuales' : ''}
              </p>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-400">
              Mostrar
              <select
                value={pageSize}
                onChange={(event) => cambiarPageSize(Number(event.target.value))}
                className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                {OPCIONES_PAGE_SIZE.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {opcion}
                  </option>
                ))}
              </select>
              por página
            </label>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
              Cargando facturas...
            </div>
          ) : facturas.length === 0 ? (
            <div className="px-4 py-16 text-center">
              <FileText className="mx-auto h-10 w-10 text-slate-600" />
              <p className="mt-3 text-sm text-slate-400">
                {hayFiltrosActivos
                  ? 'No hay facturas que coincidan con los filtros.'
                  : 'Todavía no has cargado ninguna factura.'}
              </p>
              <button
                type="button"
                onClick={() => setModalCargarAbierto(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                <Plus className="h-4 w-4" />
                Cargar factura
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-900/60 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold sm:px-5">Factura</th>
                    <th className="px-4 py-3 font-semibold">Proveedor</th>
                    <th className="px-4 py-3 font-semibold">Servicio / tipo</th>
                    <th className="px-4 py-3 font-semibold">Emisión</th>
                    <th className="px-4 py-3 font-semibold">Límite de pago</th>
                    <th className="px-4 py-3 text-right font-semibold">Valor</th>
                    <th className="px-4 py-3 text-right font-semibold sm:px-5">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {facturas.map((factura) => (
                    <tr key={factura.id} className="transition hover:bg-slate-800/60">
                      <td className="px-4 py-3 sm:px-5">
                        <p className="font-semibold text-white">#{factura.numeroFactura}</p>
                        <p className="text-xs text-slate-500">ID {factura.id}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-200">
                          {factura.proveedor?.nombre ?? '—'}
                        </p>
                        {factura.proveedor?.nit && (
                          <p className="text-xs text-slate-500">NIT {factura.proveedor.nit}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {factura.tipoFactura?.servicioOTipo ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {formatearFecha(factura.fechaEmision)}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {formatearFecha(factura.fechaLimitePago)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-white">
                        {formatearMoneda(factura.valorAPagar, factura.tipoDeMoneda)}
                      </td>
                      <td className="px-4 py-3 sm:px-5">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setFacturaDetalleId(factura.id)}
                            title={`Ver detalle de la factura ${factura.numeroFactura}`}
                            aria-label={`Ver detalle de la factura ${factura.numeroFactura}`}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-700 hover:text-slate-100"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setFacturaEditando(factura)}
                            title={`Editar factura ${factura.numeroFactura}`}
                            aria-label={`Editar factura ${factura.numeroFactura}`}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-500/10 hover:text-indigo-400"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void eliminarFactura(factura)}
                            title={`Eliminar factura ${factura.numeroFactura}`}
                            aria-label={`Eliminar factura ${factura.numeroFactura}`}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-800 px-4 py-3 sm:flex-row sm:px-5">
            <p className="text-xs text-slate-400">
              Página {totalPages === 0 ? 0 : page} de {totalPages} · {totalItems} factura
              {totalItems === 1 ? '' : 's'}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => cambiarPagina(page - 1)}
                disabled={page <= 1 || loading}
                className="flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </button>
              <button
                type="button"
                onClick={() => cambiarPagina(page + 1)}
                disabled={page >= totalPages || loading}
                className="flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      <CargarFacturaModal
        isOpen={modalCargarAbierto}
        onClose={() => setModalCargarAbierto(false)}
        onSuccess={() => {
          setPage(1);
          recargarTodo();
        }}
      />

      <EditarFacturaModal
        key={facturaEditando?.id ?? 'sin-factura'}
        factura={facturaEditando}
        isOpen={facturaEditando !== null}
        onClose={() => setFacturaEditando(null)}
        onSuccess={recargarTodo}
      />

      {facturaDetalleId !== null && (
        <DetalleFacturaModal
          key={facturaDetalleId}
          facturaId={facturaDetalleId}
          onClose={() => setFacturaDetalleId(null)}
          onEdit={(factura) => {
            setFacturaDetalleId(null);
            setFacturaEditando(factura);
          }}
        />
      )}
    </div>
  );
}
