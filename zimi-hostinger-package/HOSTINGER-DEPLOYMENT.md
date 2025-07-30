# 🌐 ZIMI PWA - Guía de Deployment en Hostinger

## Requisitos de Hostinger
- Plan Business o superior (necesario para Node.js y bases de datos)
- Acceso SSH habilitado
- Dominio configurado (app.drzerquera.com)

## Pasos de Deployment

### 1. Configuración del Dominio
- Panel de Hostinger → Dominios → Gestionar → app.drzerquera.com
- Configurar DNS si es necesario

### 2. Subir Archivos
```bash
# Conectar por SSH a Hostinger
ssh username@your-hostinger-server

# Subir archivos al directorio web
# Usar cPanel File Manager o SFTP
```

### 3. Configurar Base de Datos
- Crear base de datos MySQL/MongoDB en panel de Hostinger
- Actualizar credenciales en backend/.env

### 4. Instalar Dependencias
```bash
# Backend
cd backend/
pip install -r requirements.txt

# Frontend
cd ../frontend/
npm install
npm run build
```

### 5. Configurar Variables de Entorno
```bash
# Actualizar frontend/.env
REACT_APP_BACKEND_URL=https://app.drzerquera.com

# Actualizar backend/.env
MONGO_URL=mongodb://hostinger-db-url
DB_NAME=zimi_production
```

