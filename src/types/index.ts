export interface Proveedor {
  id: number;
  nombre: string;
  nit?: string;
}

export interface TipoFactura {
  id: number;
  servicioOTipo: string;
}

export interface Documento {
  id: number;
  nombreDocumento: string;
  tipoDocumento: string;
  tamanoBytes: number;
  fechaCarga?: string;
  estadoProcesamiento?: string;
  respuestaLlm?: unknown;
}

export interface UsuarioBasico {
  id: number;
  nombre: string;
  correo: string;
}

export interface Factura {
  id: number;
  numeroFactura: string;
  numeroContrato?: string;
  numeroCliente?: string;
  valorAPagar: number;
  tipoDeMoneda: string;
  fechaEmision?: string;
  fechaLimitePago?: string;
  fechaSubida: string;
  proveedor: Proveedor;
  tipoFactura?: TipoFactura;
  documento?: Documento;
  usuarioSubida?: UsuarioBasico;
}

export interface ReporteResumen {
  proveedor: string;
  mes: string;
  moneda: string;
  totalFacturado: number;
  cantidadFacturas: number;
}

export interface ActualizarFacturaDTO {
  numeroFactura?: string;
  numeroContrato?: string | null;
  numeroCliente?: string | null;
  valorAPagar?: number;
  tipoDeMoneda?: string;
  fechaEmision?: string | null;
  fechaLimitePago?: string | null;
}

export interface ListarFacturasResponse {
  ok: boolean;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  data: Factura[];
}

export interface FacturaResponse {
  ok: boolean;
  factura: Factura;
}

export interface CargarFacturaResponse extends FacturaResponse {
  mensaje: string;
}

export interface MensajeResponse {
  ok: boolean;
  mensaje: string;
}

export interface ReporteResumenResponse {
  ok: boolean;
  reporte: ReporteResumen[];
}