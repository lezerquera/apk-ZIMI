# 🌐 ZIMI PWA Domain Migration Guide

## Overview

This guide helps you migrate your ZIMI PWA from the current preview URL to a permanent custom domain like `app.drzerquera.com`. The migration includes updating all configurations, DNS setup, SSL certificates, and ensuring full PWA functionality.

## 🚀 Quick Start

### Automated Setup
```bash
# Run the automated domain setup script
./domain-setup.sh app.drzerquera.com

# Or specify domain interactively
./domain-setup.sh
```

### Manual Setup
Follow the detailed steps in the sections below.

## 📋 Pre-Migration Checklist

### Requirements
- [ ] Domain name registered and accessible (e.g., drzerquera.com)
- [ ] DNS management access for the domain
- [ ] Server with Docker and Docker Compose installed
- [ ] SSL certificate capability (Let's Encrypt recommended)
- [ ] Basic understanding of DNS configuration

### Domain Planning
- **Recommended**: `app.drzerquera.com` (subdomain for the PWA)
- **Alternative**: `zimi.drzerquera.com` (branded subdomain)
- **API Option**: `api.drzerquera.com` (separate API subdomain)

## 🛠️ Migration Steps

### Step 1: Update Application Configuration

#### Frontend Configuration
```bash
# Update frontend/.env
REACT_APP_BACKEND_URL=https://app.drzerquera.com
REACT_APP_DOMAIN=app.drzerquera.com
WDS_SOCKET_PORT=443
```

#### Backend Configuration
```bash
# Update backend/.env
MONGO_URL=mongodb://localhost:27017
DB_NAME=zimi_production
ENVIRONMENT=production
DOMAIN=app.drzerquera.com
```

### Step 2: DNS Configuration

#### Required DNS Records
```
Type: A
Name: app
Value: [YOUR_SERVER_IP_ADDRESS]
TTL: 3600 (1 hour)
```

#### Optional: API Subdomain
```
Type: A
Name: api
Value: [YOUR_SERVER_IP_ADDRESS]
TTL: 3600
```

#### Security Enhancement
```
Type: CAA
Name: @
Value: 0 issue "letsencrypt.org"
TTL: 3600
```

### Step 3: SSL Certificate Setup

#### Using Let's Encrypt (Recommended)
```bash
# Navigate to deployment directory
cd deployment/

# Start services without SSL first
docker-compose -f docker-compose.production.yml up -d

# Generate SSL certificate
docker-compose -f docker-compose.production.yml run --rm certbot \
  certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email admin@drzerquera.com \
  --agree-tos --no-eff-email \
  -d app.drzerquera.com

# Restart with SSL
docker-compose -f docker-compose.production.yml restart nginx
```

#### Using Custom SSL Certificate
```bash
# Copy certificate files
cp your-certificate.crt deployment/ssl/app.drzerquera.com.crt
cp your-private-key.key deployment/ssl/app.drzerquera.com.key

# Set permissions
chmod 600 deployment/ssl/app.drzerquera.com.key
chmod 644 deployment/ssl/app.drzerquera.com.crt
```

### Step 4: Deploy Application

#### Full Deployment
```bash
cd deployment/
docker-compose -f docker-compose.production.yml up -d
```

#### Verify Services
```bash
# Check service status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f

# Test endpoints
curl -I https://app.drzerquera.com
curl https://app.drzerquera.com/api/
```

## 🔍 Verification & Testing

### Automated Verification
```bash
# Run verification script
./verify-domain-setup.sh app.drzerquera.com
```

### Manual Testing Checklist

#### Basic Functionality
- [ ] Domain resolves to correct IP address
- [ ] HTTPS certificate is valid and trusted
- [ ] HTTP redirects to HTTPS automatically
- [ ] Website loads correctly
- [ ] All API endpoints respond properly

#### PWA Functionality
- [ ] PWA manifest loads successfully
- [ ] Service worker registers without errors
- [ ] PWA installation prompt appears
- [ ] App installs correctly on desktop
- [ ] App installs correctly on mobile
- [ ] Offline functionality works
- [ ] App icons display correctly
- [ ] App shortcuts work (if configured)

#### Performance & SEO
- [ ] Page load speed is acceptable
- [ ] Lighthouse PWA score is high (>90)
- [ ] Meta tags are correct for the new domain
- [ ] Sitemap.xml is accessible
- [ ] Robots.txt is configured properly

### Testing Commands

#### DNS and Network
```bash
# Test DNS resolution
nslookup app.drzerquera.com
dig app.drzerquera.com A

# Test HTTPS
curl -I https://app.drzerquera.com
openssl s_client -connect app.drzerquera.com:443

# Test API
curl https://app.drzerquera.com/api/services
```

#### PWA Specific
```bash
# Check manifest
curl https://app.drzerquera.com/manifest.json | jq .

# Check service worker
curl https://app.drzerquera.com/sw.js

# Lighthouse audit
lighthouse https://app.drzerquera.com --view
```

## 🎯 Domain-Specific Features

### PWA Enhancements
The domain configuration includes several PWA enhancements:

#### App Shortcuts
- Quick access to appointment booking
- Direct link to services page
- Fast contact access

#### Enhanced Caching
- Domain-flexible service worker
- Offline API endpoint caching
- Improved cache management

#### Security Headers
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options protection

### SEO Optimizations
- Dynamic canonical URLs
- Domain-specific sitemap
- Optimized robots.txt
- Open Graph meta tags

## 🔧 Troubleshooting

### Common Issues

#### DNS Not Propagating
```bash
# Check DNS propagation globally
dig @8.8.8.8 app.drzerquera.com
dig @1.1.1.1 app.drzerquera.com

# Clear local DNS cache
sudo systemctl flush-dns  # Linux
sudo dscacheutil -flushcache  # macOS
ipconfig /flushdns  # Windows
```

#### SSL Certificate Problems
```bash
# Check certificate validity
openssl s_client -connect app.drzerquera.com:443 -servername app.drzerquera.com

# Test certificate renewal
docker-compose -f docker-compose.production.yml run --rm certbot renew --dry-run

# Force certificate renewal
docker-compose -f docker-compose.production.yml run --rm certbot renew --force-renewal
```

#### PWA Installation Issues
- Ensure HTTPS is working properly
- Check that manifest.json is accessible
- Verify service worker registers successfully
- Test in private/incognito browsing mode
- Clear browser cache and try again

#### API CORS Errors
- Verify nginx CORS configuration
- Check backend CORS settings
- Ensure domain names match exactly (no trailing slashes)

### Debug Commands

#### Service Logs
```bash
# View all logs
docker-compose -f docker-compose.production.yml logs

# View specific service logs
docker-compose -f docker-compose.production.yml logs nginx
docker-compose -f docker-compose.production.yml logs backend
```

#### System Health
```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check running containers
docker ps

# Check nginx configuration
docker-compose -f docker-compose.production.yml exec nginx nginx -t
```

## 📊 Monitoring & Maintenance

### Health Monitoring
Set up monitoring for:
- Domain resolution
- SSL certificate expiration
- Service uptime
- API response times
- PWA installation rates

### Automated Maintenance
The deployment includes scripts for:
- Daily database backups
- SSL certificate auto-renewal
- Log rotation
- Health checks

### Performance Monitoring
```bash
# Regular performance checks
lighthouse https://app.drzerquera.com --only-categories=performance

# API performance
curl -w "@curl-format.txt" -o /dev/null -s https://app.drzerquera.com/api/services
```

## 🔄 Rollback Plan

If issues occur, you can rollback:

### Quick Rollback
```bash
# Restore previous environment files
cp frontend/.env.backup.[timestamp] frontend/.env
cp backend/.env.backup.[timestamp] backend/.env

# Restart services
docker-compose restart
```

### Full Rollback
```bash
# Switch DNS back to previous domain
# Update environment variables to previous URLs
# Restart all services
```

## 📚 Additional Resources

### Documentation
- [DEPLOYMENT-GUIDE.md](./deployment/DEPLOYMENT-GUIDE.md) - Complete deployment instructions
- [DNS-SETUP.md](./deployment/DNS-SETUP.md) - Detailed DNS configuration
- [nginx.conf](./deployment/nginx.conf) - Web server configuration

### Tools & Services
- **DNS Management**: Your domain provider's control panel
- **SSL Certificates**: Let's Encrypt (free) or commercial providers
- **Monitoring**: UptimeRobot, Pingdom, or similar services
- **Performance**: Google PageSpeed Insights, GTmetrix

### Support
For technical support:
1. Check the troubleshooting section above
2. Review application logs
3. Verify DNS and SSL configuration
4. Test in different browsers and devices

---

## 🎉 Success!

Once completed, your ZIMI PWA will be:
- ✅ Accessible at your custom domain
- ✅ Secured with HTTPS
- ✅ Installable as a native app
- ✅ Optimized for performance
- ✅ SEO-friendly
- ✅ Production-ready

**Your patients can now install ZIMI directly from `https://app.drzerquera.com`!**