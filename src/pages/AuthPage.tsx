import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/auth.service';
import { useAuth } from '../context/useAuth';
import { obtenerMensajeError } from '../utils/error';
import { Lock, Mail, User, Phone } from 'lucide-react';

type AuthFormValues = {
  nombre?: string;
  correo: string;
  contrasena: string;
  telefono?: string;
};

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [errorApi, setErrorApi] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { login: guardarSesion } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AuthFormValues>();

  const toggleTab = (loginTab: boolean) => {
    setIsLogin(loginTab);
    setErrorApi(null);
    reset();
  };

  const onSubmit = async (data: AuthFormValues) => {
    setErrorApi(null);
    setLoading(true);
    try {
      if (isLogin) {
        const res = await AuthService.login({
          correo: data.correo,
          contrasena: data.contrasena,
        });
        guardarSesion(res.token, res.usuario);
      } else {
        const res = await AuthService.registro({
          nombre: data.nombre ?? '',
          correo: data.correo,
          contrasena: data.contrasena,
          telefono: data.telefono,
        });
        guardarSesion(res.token, res.usuario);
      }
      navigate('/dashboard');
    } catch (err: unknown) {
      setErrorApi(obtenerMensajeError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4 text-slate-100">
      <div className="w-full max-w-md rounded-2xl bg-slate-800 p-8 shadow-2xl border border-slate-700">
        
        {/* Título principal */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-indigo-400">Gestor de Facturas</h1>
          <p className="mt-2 text-sm text-slate-400">Plataforma de Extracción Inteligente de Facturas</p>
        </div>

        {/* Pestañas Login / Registro */}
        <div className="mt-6 flex rounded-lg bg-slate-900 p-1">
          <button
            type="button"
            onClick={() => toggleTab(true)}
            className={`w-1/2 rounded-md py-2 text-sm font-semibold transition ${
              isLogin ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => toggleTab(false)}
            className={`w-1/2 rounded-md py-2 text-sm font-semibold transition ${
              !isLogin ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Registrarse
          </button>
        </div>

        {/* Mensaje de Error API */}
        {errorApi && (
          <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            {errorApi}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-300">Nombre Completo</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Juan Pérez"
                  {...register('nombre', { required: 'El nombre es obligatorio' })}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 py-2 pl-10 pr-4 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
              {errors.nombre && <span className="text-xs text-red-400">{String(errors.nombre.message)}</span>}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300">Correo Electrónico</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
              <input
                type="email"
                placeholder="usuario@correo.com"
                {...register('correo', { required: 'El correo es obligatorio' })}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 py-2 pl-10 pr-4 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            {errors.correo && <span className="text-xs text-red-400">{String(errors.correo.message)}</span>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300">Contraseña</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                {...register('contrasena', { required: 'La contraseña es obligatoria' })}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 py-2 pl-10 pr-4 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            {errors.contrasena && <span className="text-xs text-red-400">{String(errors.contrasena.message)}</span>}
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-300">Teléfono (Opcional)</label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="3001234567"
                  {...register('telefono')}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 py-2 pl-10 pr-4 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white shadow-lg transition hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Procesando...' : isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
}