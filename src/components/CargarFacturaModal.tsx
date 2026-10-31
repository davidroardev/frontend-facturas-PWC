import { useState, type ChangeEvent, type FC } from 'react';
import { FacturasService } from '../services/facturas.service';
import { obtenerMensajeError } from '../utils/error';
import { Upload, X, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CargarFacturaModal: FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccessMsg(null);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Validar tamaño (10 MB máximo)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('El archivo no debe superar los 10 MB.');
        return;
      }

      // Validar extensión/mime
      const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Formato no permitido. Adjunta un archivo PDF, PNG o JPG.');
        return;
      }

      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(selectedFile));
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await FacturasService.cargar(file);
      setSuccessMsg('¡Factura procesada con éxito por la IA!');
      setTimeout(() => {
        setFile(null);
        setPreviewUrl(null);
        setSuccessMsg(null);
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: unknown) {
      setError(obtenerMensajeError(err, 'Error al procesar la factura con el LLM.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-slate-800 p-6 shadow-2xl border border-slate-700 text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-700 pb-4">
          <h2 className="text-xl font-bold text-indigo-400">Cargar Nueva Factura</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* Zona de Drop/Selección */}
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-600 p-6 transition hover:border-indigo-500 bg-slate-900/50">
            <Upload className="h-10 w-10 text-indigo-400 mb-2" />
            <p className="text-sm text-slate-300">Arrastra tu factura aquí o haz clic para examinar</p>
            <p className="text-xs text-slate-500 mt-1">Soporta PDF, PNG, JPG (Máx 10 MB)</p>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="mt-4 text-xs text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:py-2 file:px-4 file:text-xs file:font-semibold file:text-white hover:file:bg-indigo-500 cursor-pointer"
            />
          </div>

          {/* Alert Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Alert Éxito */}
          {successMsg && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Vista previa del archivo */}
          {file && (
            <div className="rounded-lg bg-slate-900 p-3 border border-slate-700">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-indigo-400" />
                <div className="overflow-hidden text-xs">
                  <p className="truncate font-semibold text-white">{file.name}</p>
                  <p className="text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>

              {previewUrl && (
                <div className="mt-3 overflow-hidden rounded-lg border border-slate-700 max-h-40">
                  <img src={previewUrl} alt="Vista Previa" className="w-full object-cover" />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-slate-700 pt-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-700 py-2 px-4 text-xs font-semibold hover:bg-slate-600"
          >
            Cancelar
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 py-2 px-5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Procesando con IA...' : 'Procesar Factura'}
          </button>
        </div>
      </div>
    </div>
  );
};