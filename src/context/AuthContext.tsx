import { useState, type ReactNode } from 'react';
import { AuthContext } from './auth-context';
import type { Usuario } from '../services/auth.service';

const leerUsuarioGuardado = (): Usuario | null => {
    const storedUsuario = localStorage.getItem('usuario');
    if (!storedUsuario) return null;

    try {
        return JSON.parse(storedUsuario) as Usuario;
    } catch {
        localStorage.removeItem('usuario');
        return null;
    }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
    const [usuario, setUsuario] = useState<Usuario | null>(leerUsuarioGuardado);

    const login = (newToken: string, newUsuario: Usuario) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('usuario', JSON.stringify(newUsuario));
        setToken(newToken);
        setUsuario(newUsuario);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setToken(null);
        setUsuario(null);
    };

    return (
        <AuthContext.Provider value={{ usuario, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};
