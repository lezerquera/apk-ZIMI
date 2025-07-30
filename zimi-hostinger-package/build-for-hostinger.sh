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
