import api from '../api/axiosInstance';

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
}

export interface LoginDTO {
  correo: string;
  contrasena: string;
}

export interface RegistroDTO {
  nombre: string;
  correo: string;
  contrasena: string;
  telefono?: string;
}

export interface AuthResponse {
  ok: boolean;
  token: string;
  usuario: Usuario;
}

export const AuthService = {
  login: async (data: LoginDTO): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', data);
    return res.data;
  },

  registro: async (data: RegistroDTO): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/registro', data);
    return res.data;
  },
};
