#!/bin/bash

# ZIMI PWA Domain Setup Script
# This script helps configure the application for a new domain

set -e

echo "🏥 ZIMI PWA Domain Configuration Setup"
echo "======================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Get domain from user input or environment
if [ -z "$1" ]; then
    echo -n "Enter your domain (e.g., app.drzerquera.com): "
    read DOMAIN
else
    DOMAIN=$1
fi

if [ -z "$DOMAIN" ]; then
    print_error "Domain is required!"
    exit 1
fi

print_status "Configuring ZIMI PWA for domain: $DOMAIN"

# Validate domain format
if [[ ! $DOMAIN =~ ^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$ ]]; then
    print_warning "Domain format might be invalid: $DOMAIN"
    echo -n "Continue anyway? (y/N): "
    read CONTINUE
    if [[ ! $CONTINUE =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Step 1: Update Frontend Environment
print_header "1. Updating Frontend Environment Configuration"

FRONTEND_ENV="frontend/.env"
if [ -f "$FRONTEND_ENV" ]; then
    # Backup existing .env
    cp "$FRONTEND_ENV" "$FRONTEND_ENV.backup.$(date +%Y%m%d_%H%M%S)"
    print_status "Backed up existing .env file"
fi

# Create new .env file
cat > "$FRONTEND_ENV" << EOF
REACT_APP_BACKEND_URL=https://$DOMAIN
REACT_APP_DOMAIN=$DOMAIN
WDS_SOCKET_PORT=443
EOF

print_status "Updated frontend/.env with new domain configuration"

# Step 2: Update Backend Environment
print_header "2. Updating Backend Environment Configuration"

BACKEND_ENV="backend/.env"
if [ -f "$BACKEND_ENV" ]; then
    # Backup existing .env
    cp "$BACKEND_ENV" "$BACKEND_ENV.backup.$(date +%Y%m%d_%H%M%S)"
    print_status "Backed up existing backend .env file"
fi

# Update or create backend .env
if [ -f "$BACKEND_ENV" ]; then
    # Update existing file
    sed -i.bak "s/^DOMAIN=.*/DOMAIN=$DOMAIN/" "$BACKEND_ENV" 2>/dev/null || echo "DOMAIN=$DOMAIN" >> "$BACKEND_ENV"
    sed -i.bak "s/^ENVIRONMENT=.*/ENVIRONMENT=production/" "$BACKEND_ENV" 2>/dev/null || echo "ENVIRONMENT=production" >> "$BACKEND_ENV"
else
    # Create new file
    cat > "$BACKEND_ENV" << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=zimi_production
ENVIRONMENT=production
DOMAIN=$DOMAIN
EOF
fi

print_status "Updated backend/.env with new domain configuration"

# Step 3: Update Domain-Specific Files
print_header "3. Updating Domain-Specific Configuration Files"

# Update robots.txt
sed -i.bak "s|https://app\.drzerquera\.com|https://$DOMAIN|g" frontend/public/robots.txt 2>/dev/null || true
print_status "Updated robots.txt with new domain"

# Update sitemap.xml
sed -i.bak "s|https://app\.drzerquera\.com|https://$DOMAIN|g" frontend/public/sitemap.xml 2>/dev/null || true
print_status "Updated sitemap.xml with new domain"

# Update nginx configuration if it exists
if [ -f "deployment/nginx.conf" ]; then
    sed -i.bak "s/app\.drzerquera\.com/$DOMAIN/g" deployment/nginx.conf
    print_status "Updated nginx.conf with new domain"
fi

# Update docker-compose configuration if it exists
if [ -f "deployment/docker-compose.production.yml" ]; then
    sed -i.bak "s/app\.drzerquera\.com/$DOMAIN/g" deployment/docker-compose.production.yml
    sed -i.bak "s/REACT_APP_BACKEND_URL=https:\/\/app\.drzerquera\.com/REACT_APP_BACKEND_URL=https:\/\/$DOMAIN/g" deployment/docker-compose.production.yml
    sed -i.bak "s/REACT_APP_DOMAIN=app\.drzerquera\.com/REACT_APP_DOMAIN=$DOMAIN/g" deployment/docker-compose.production.yml
    print_status "Updated docker-compose.production.yml with new domain"
fi

# Step 4: Generate SSL Certificate Command
print_header "4. SSL Certificate Setup"

print_status "To generate SSL certificate with Let's Encrypt, run:"
echo -e "${BLUE}docker-compose -f deployment/docker-compose.production.yml run --rm certbot certonly --webroot --webroot-path=/var/www/certbot --email admin@$(echo $DOMAIN | cut -d'.' -f2-) --agree-tos --no-eff-email -d $DOMAIN${NC}"

# Step 5: DNS Configuration Instructions
print_header "5. DNS Configuration Required"

# Extract main domain
MAIN_DOMAIN=$(echo $DOMAIN | sed 's/^[^.]*\.//')
SUBDOMAIN=$(echo $DOMAIN | sed 's/\..*//')

print_status "Add the following DNS record to your domain provider:"
echo ""
echo -e "${BLUE}Type:${NC} A"
echo -e "${BLUE}Name:${NC} $SUBDOMAIN"
echo -e "${BLUE}Value:${NC} [YOUR_SERVER_IP_ADDRESS]"
echo -e "${BLUE}TTL:${NC} 3600"
echo ""

# Step 6: Deployment Instructions
print_header "6. Deployment Instructions"

print_status "To deploy with the new domain configuration:"
echo ""
echo -e "${BLUE}1.${NC} Ensure DNS is configured and propagated"
echo -e "${BLUE}2.${NC} Run: ${YELLOW}cd deployment${NC}"
echo -e "${BLUE}3.${NC} Run: ${YELLOW}docker-compose -f docker-compose.production.yml up -d${NC}"
echo -e "${BLUE}4.${NC} Generate SSL certificate using the command above"
echo -e "${BLUE}5.${NC} Restart services: ${YELLOW}docker-compose -f docker-compose.production.yml restart${NC}"
echo ""

# Step 7: Verification Steps
print_header "7. Verification Steps"

print_status "After deployment, verify the following:"
echo ""
echo -e "${BLUE}✓${NC} Domain resolves to correct IP: ${YELLOW}nslookup $DOMAIN${NC}"
echo -e "${BLUE}✓${NC} HTTPS certificate is valid: ${YELLOW}curl -I https://$DOMAIN${NC}"
echo -e "${BLUE}✓${NC} API endpoints work: ${YELLOW}curl https://$DOMAIN/api/${NC}"
echo -e "${BLUE}✓${NC} PWA manifest loads: ${YELLOW}curl https://$DOMAIN/manifest.json${NC}"
echo -e "${BLUE}✓${NC} Service worker registers: Check browser dev tools"
echo -e "${BLUE}✓${NC} PWA installs correctly: Look for install button in browser"
echo ""

# Step 8: Create verification script
print_header "8. Creating Verification Script"

cat > "verify-domain-setup.sh" << 'EOF'
#!/bin/bash

# ZIMI Domain Verification Script

DOMAIN=$1
if [ -z "$DOMAIN" ]; then
    echo "Usage: $0 <domain>"
    exit 1
fi

echo "🔍 Verifying ZIMI PWA setup for: $DOMAIN"
echo "============================================"

# Test DNS resolution
echo -n "DNS Resolution: "
if nslookup $DOMAIN > /dev/null 2>&1; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

# Test HTTPS
echo -n "HTTPS Response: "
if curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN | grep -q "200"; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

# Test API
echo -n "API Endpoint: "
if curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/ | grep -q "200"; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

# Test PWA Manifest
echo -n "PWA Manifest: "
if curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/manifest.json | grep -q "200"; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

# Test Service Worker
echo -n "Service Worker: "
if curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/sw.js | grep -q "200"; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

echo ""
echo "🏥 ZIMI PWA Domain Verification Complete!"
EOF

chmod +x "verify-domain-setup.sh"
print_status "Created verification script: verify-domain-setup.sh"

# Summary
print_header "📋 Setup Summary"

print_status "Domain configuration completed for: $DOMAIN"
print_status "✅ Frontend environment updated"
print_status "✅ Backend environment updated"
print_status "✅ Domain-specific files updated"
print_status "✅ Deployment configurations updated"
print_status "✅ Verification script created"

print_warning "Remember to:"
echo "  • Configure DNS records"
echo "  • Generate SSL certificates"
echo "  • Deploy the application"
echo "  • Run verification tests"

echo ""
echo -e "${GREEN}🎉 ZIMI PWA is ready for deployment on $DOMAIN!${NC}"
echo ""
echo "For detailed deployment instructions, see: deployment/DEPLOYMENT-GUIDE.md"
echo "For DNS configuration help, see: deployment/DNS-SETUP.md"