#!/bin/bash

# Script para exportar ZIMI PWA para deployment en Hostinger
# Crear paquete completo para migración desde Emergent

echo "🏥 Preparando ZIMI PWA para Hostinger..."
echo "========================================="

# Crear directorio de exportación
EXPORT_DIR="zimi-hostinger-package"
rm -rf $EXPORT_DIR
mkdir -p $EXPORT_DIR

# Copiar archivos esenciales del proyecto
echo "📁 Copiando archivos del proyecto..."

# Backend files
cp -r backend/ $EXPORT_DIR/
rm -rf $EXPORT_DIR/backend/__pycache__
rm -rf $EXPORT_DIR/backend/.pytest_cache

# Frontend files (sin node_modules)
mkdir -p $EXPORT_DIR/frontend
cp -r frontend/src/ $EXPORT_DIR/frontend/
cp -r frontend/public/ $EXPORT_DIR/frontend/
cp frontend/package.json $EXPORT_DIR/frontend/
cp frontend/tailwind.config.js $EXPORT_DIR/frontend/
cp frontend/postcss.config.js $EXPORT_DIR/frontend/
cp frontend/craco.config.js $EXPORT_DIR/frontend/

# Deployment configurations
cp -r deployment/ $EXPORT_DIR/

# Documentation and scripts
cp DOMAIN-MIGRATION-GUIDE.md $EXPORT_DIR/
cp domain-setup.sh $EXPORT_DIR/
cp README.md $EXPORT_DIR/
cp ADMIN_GUIDE.md $EXPORT_DIR/

# Create Hostinger-specific files
echo "🔧 Creando configuraciones específicas para Hostinger..."

# Hostinger deployment guide
cat > $EXPORT_DIR/HOSTINGER-DEPLOYMENT.md << 'EOF'
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

EOF

# Update environment files for Hostinger
echo "⚙️ Actualizando configuraciones para Hostinger..."

# Frontend environment for Hostinger
cat > $EXPORT_DIR/frontend/.env << EOF
REACT_APP_BACKEND_URL=https://app.drzerquera.com
REACT_APP_DOMAIN=app.drzerquera.com
WDS_SOCKET_PORT=443
EOF

# Backend environment template for Hostinger
cat > $EXPORT_DIR/backend/.env.hostinger-template << EOF
# Configuración para Hostinger
# Copiar a .env y actualizar con credenciales reales

# MongoDB Connection (actualizar con credenciales de Hostinger)
MONGO_URL=mongodb://username:password@hostname:port/dbname
DB_NAME=zimi_production

# Production Settings
ENVIRONMENT=production
DOMAIN=app.drzerquera.com

# Security (generar valores únicos)
SECRET_KEY=your-secret-key-here
JWT_SECRET=your-jwt-secret-here
EOF

# Create simplified nginx config for Hostinger
cat > $EXPORT_DIR/nginx-hostinger.conf << 'EOF'
# Configuración Nginx simplificada para Hostinger
# (Hostinger maneja SSL automáticamente)

server {
    listen 80;
    server_name app.drzerquera.com;
    root /public_html/zimi-frontend/build;
    index index.html;

    # Security headers
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header X-XSS-Protection "1; mode=block" always;

    # PWA files
    location /manifest.json {
        add_header Content-Type "application/manifest+json";
        expires 1d;
    }

    location /sw.js {
        expires 0;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # API proxy to backend
    location /api/ {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# Create database migration script
cat > $EXPORT_DIR/migrate-database.py << 'EOF'
#!/usr/bin/env python3
"""
Script para migrar datos desde Emergent a Hostinger
Exporta datos existentes y los prepara para importación
"""

import os
import json
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

async def export_data():
    # Conectar a la base de datos actual (Emergent)
    current_mongo_url = "mongodb://localhost:27017"  # Actualizar si es diferente
    client = AsyncIOMotorClient(current_mongo_url)
    db = client["test_database"]
    
    # Exportar colecciones
    collections_to_export = ["appointments", "patients", "messages", "flyers"]
    export_data = {}
    
    for collection_name in collections_to_export:
        collection = db[collection_name]
        documents = await collection.find().to_list(1000)
        export_data[collection_name] = documents
        print(f"Exported {len(documents)} documents from {collection_name}")
    
    # Guardar datos exportados
    with open("zimi_data_export.json", "w") as f:
        json.dump(export_data, f, indent=2, default=str)
    
    print("✅ Datos exportados a zimi_data_export.json")
    client.close()

if __name__ == "__main__":
    import asyncio
    asyncio.run(export_data())
EOF

# Create deployment checklist
cat > $EXPORT_DIR/DEPLOYMENT-CHECKLIST.md << 'EOF'
# ✅ Lista de Verificación - Deployment Hostinger

## Pre-Deployment
- [ ] Plan Hostinger Business o superior contratado
- [ ] SSH habilitado en cuenta de Hostinger
- [ ] Dominio app.drzerquera.com configurado
- [ ] Base de datos creada en panel de Hostinger

## Files Upload
- [ ] Archivos subidos via SFTP/cPanel File Manager
- [ ] Permisos correctos configurados (755 para directorios, 644 para archivos)
- [ ] Variables de entorno configuradas (.env files)

## Backend Setup
- [ ] Python/Node.js habilitado en Hostinger
- [ ] Dependencias instaladas (pip install -r requirements.txt)
- [ ] Base de datos conectada correctamente
- [ ] API endpoints respondiendo

## Frontend Setup
- [ ] Node.js instalado y funcionando
- [ ] npm install completado sin errores
- [ ] npm run build ejecutado exitosamente
- [ ] Archivos build/ copiados a directorio web público

## Domain & SSL
- [ ] Dominio app.drzerquera.com apuntando a Hostinger
- [ ] SSL certificado instalado (automático en Hostinger)
- [ ] HTTPS funcionando correctamente

## Testing
- [ ] Sitio web carga correctamente
- [ ] API endpoints funcionando
- [ ] PWA installable (manifest.json accesible)
- [ ] Service Worker funcionando
- [ ] Login de pacientes y admin funcionando
- [ ] Sistema de citas funcionando
- [ ] Sistema de mensajes funcionando

## Security
- [ ] Credenciales de base de datos seguras
- [ ] Variables de entorno protegidas
- [ ] Backup de datos configurado
- [ ] Logs de seguridad habilitados

## Post-Deployment
- [ ] Monitoreo de sitio configurado
- [ ] Backup automático configurado
- [ ] Documentación actualizada
- [ ] Team notificado de nueva URL
EOF

# Create build script for Hostinger
cat > $EXPORT_DIR/build-for-hostinger.sh << 'EOF'
#!/bin/bash

echo "🏗️ Building ZIMI PWA for Hostinger..."

# Build Frontend
echo "Building frontend..."
cd frontend/
npm install
npm run build

# Verify build
if [ -d "build/" ]; then
    echo "✅ Frontend build successful"
    echo "📁 Static files ready in frontend/build/"
else
    echo "❌ Frontend build failed"
    exit 1
fi

# Backend setup
echo "Setting up backend..."
cd ../backend/
pip install -r requirements.txt

echo "✅ Build complete! Ready for Hostinger deployment"
echo ""
echo "Next steps:"
echo "1. Upload all files to Hostinger via SFTP/cPanel"
echo "2. Configure database connection in backend/.env"
echo "3. Run the build script on Hostinger server"
echo "4. Point your domain to the build/ directory"
EOF

chmod +x $EXPORT_DIR/build-for-hostinger.sh

# Create archive
echo "📦 Creando archivo comprimido..."
tar -czf zimi-hostinger-package.tar.gz $EXPORT_DIR/

echo ""
echo "✅ ¡Paquete creado exitosamente!"
echo "📁 Directorio: $EXPORT_DIR/"
echo "📦 Archivo: zimi-hostinger-package.tar.gz"
echo ""
echo "🚀 Próximos pasos:"
echo "1. Descargar el archivo zimi-hostinger-package.tar.gz"
echo "2. Seguir las instrucciones en HOSTINGER-DEPLOYMENT.md"
echo "3. Configurar base de datos en Hostinger"
echo "4. Subir archivos y configurar dominio"
echo ""