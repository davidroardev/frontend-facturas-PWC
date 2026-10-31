# Cómo clonar y ejecutar el frontend

## Requisitos

- Node.js 20 o superior (probado con 24) y npm.
- El backend corriendo en `http://localhost:3000` (si no, el login fallará).

## 1. Clonar e instalar

```bash
git clone https://github.com/davidroardev/frontend-facturas-PWC.git
cd frontend-facturas-PWC
npm install
```

## 2. Configurar la URL del backend (opcional)

Por defecto la app usa `http://localhost:3000/api`. Si tu backend está en otra URL, crea un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:3000/api
```

## 3. Correr en desarrollo

```bash
npm run dev
```

Abre `http://localhost:5173`.

## 4. Compilar para producción

```bash
npm run build     # genera la carpeta dist/
npm run preview   # prueba el build en http://localhost:4173
```
