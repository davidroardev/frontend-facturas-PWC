import api from '../api/axiosInstance';
import type {
  ActualizarFacturaDTO,
  CargarFacturaResponse,
  Factura,
  FacturaResponse,
  ListarFacturasResponse,
  MensajeResponse,
  ReporteResumen,
  ReporteResumenResponse,
} from '../types';

// Prisma serializa los campos Decimal como string; la UI trabaja con number.
type FacturaApi = Omit<Factura, 'valorAPagar'> & { valorAPagar: string | number };
type ReporteResumenApi = Omit<ReporteResumen, 'totalFacturado'> & {
  totalFacturado: string | number;
};
type FacturaApiResponse = { ok: boolean; factura: FacturaApi };
type CargarFacturaApiResponse = FacturaApiResponse & { mensaje: string };
type ListarFacturasApiResponse = Omit<ListarFacturasResponse, 'data'> & { data: FacturaApi[] };
type ReporteResumenApiResponse = { ok: boolean; reporte: ReporteResumenApi[] };

const normalizarFactura = ({ valorAPagar, ...resto }: FacturaApi): Factura => ({
  ...resto,
  valorAPagar: Number(valorAPagar),
});

const normalizarRespuestaFactura = (res: FacturaApiResponse): FacturaResponse => ({
  ...res,
  factura: normalizarFactura(res.factura),
});

export const FacturasService = {
  // GET /api/facturas (Listado paginado y filtros)
  listar: async (params?: {
    page?: number;
    pageSize?: number;
    proveedorId?: string;
    proveedorNombre?: string;
    fechaInicio?: string;
    fechaFin?: string;
  }): Promise<ListarFacturasResponse> => {
    const res = await api.get<ListarFacturasApiResponse>('/facturas', { params });
    return { ...res.data, data: res.data.data.map(normalizarFactura) };
  },

  // POST /api/facturas (Subir archivo multipart/form-data)
  cargar: async (file: File): Promise<CargarFacturaResponse> => {
    const formData = new FormData();
    formData.append('archivo', file);
    const res = await api.post<CargarFacturaApiResponse>('/facturas', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return { ...res.data, factura: normalizarFactura(res.data.factura) };
  },

  // GET /api/facturas/:id (Detalle)
  obtenerDetalle: async (id: number): Promise<FacturaResponse> => {
    const res = await api.get<FacturaApiResponse>(`/facturas/${id}`);
    return normalizarRespuestaFactura(res.data);
  },

  // PUT /api/facturas/:id (Edición)
  actualizar: async (id: number, data: ActualizarFacturaDTO): Promise<FacturaResponse> => {
    const res = await api.put<FacturaApiResponse>(`/facturas/${id}`, data);
    return normalizarRespuestaFactura(res.data);
  },

  // DELETE /api/facturas/:id (Eliminar)
  eliminar: async (id: number): Promise<MensajeResponse> => {
    const res = await api.delete<MensajeResponse>(`/facturas/${id}`);
    return res.data;
  },

  // GET /api/facturas/reportes/resumen
  obtenerReporteResumen: async (): Promise<ReporteResumenResponse> => {
    const res = await api.get<ReporteResumenApiResponse>('/facturas/reportes/resumen');
    return {
      ...res.data,
      reporte: res.data.reporte.map((fila) => ({
        ...fila,
        totalFacturado: Number(fila.totalFacturado),
      })),
    };
  },
};
