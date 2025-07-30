# ZIMI PWA Custom Domain Deployment Guide

## Overview
This guide walks you through deploying the ZIMI PWA to a custom domain (`app.drzerquera.com`) with full PWA functionality, SSL certificates, and production-ready configuration.

## Prerequisites

### Server Requirements
- Ubuntu 20.04+ or similar Linux distribution
- Minimum 2GB RAM, 2 CPU cores
- 20GB available disk space
- Root or sudo access
- Docker and Docker Compose installed

### Domain Requirements
- Registered domain (drzerquera.com)
- DNS management access
- SSL certificate (Let's Encrypt recommended)

## Step 1: Server Preparation

### Install Docker and Docker Compose
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### Create Application Directory
```bash
sudo mkdir -p /var/www/zimi-app
sudo chown -R $USER:$USER /var/www/zimi-app
cd /var/www/zimi-app
```

## Step 2: Application Setup

### Clone/Upload Application Files
```bash
# If using Git
git clone [your-repo-url] .

# Or upload files manually to /var/www/zimi-app/
```

### Update Environment Configuration
```bash
# Frontend environment
cat > frontend/.env << EOF
REACT_APP_BACKEND_URL=https://app.drzerquera.com
REACT_APP_DOMAIN=app.drzerquera.com
WDS_SOCKET_PORT=443
EOF

# Backend environment
cat > backend/.env << EOF
MONGO_URL=mongodb://mongo:27017
DB_NAME=zimi_production
ENVIRONMENT=production
DOMAIN=app.drzerquera.com
EOF
```

## Step 3: DNS Configuration

### Configure DNS Records
Add the following DNS records to your domain provider:

```
Type: A
Name: app
Value: [YOUR_SERVER_IP]
TTL: 3600
```

See [DNS-SETUP.md](./DNS-SETUP.md) for detailed DNS configuration.

## Step 4: SSL Certificate Setup

### Using Let's Encrypt (Recommended)
```bash
# Create SSL directory
mkdir -p deployment/ssl

# Generate initial certificate
docker-compose -f deployment/docker-compose.production.yml run --rm certbot

# Verify certificate creation
ls -la deployment/ssl/live/app.drzerquera.com/
```

### Using Custom SSL Certificate
```bash
# Copy your certificate files
cp your-certificate.crt deployment/ssl/app.drzerquera.com.crt
cp your-private-key.key deployment/ssl/app.drzerquera.com.key

# Set proper permissions
chmod 600 deployment/ssl/app.drzerquera.com.key
chmod 644 deployment/ssl/app.drzerquera.com.crt
```

## Step 5: Application Deployment

### Build and Deploy
```bash
# Navigate to deployment directory
cd deployment/

# Start all services
docker-compose -f docker-compose.production.yml up -d

# Check service status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f
```

### Verify Deployment
```bash
# Test HTTP redirect to HTTPS
curl -I http://app.drzerquera.com

# Test HTTPS response
curl -I https://app.drzerquera.com

# Test API endpoint
curl https://app.drzerquera.com/api/

# Test PWA manifest
curl https://app.drzerquera.com/manifest.json
```

## Step 6: PWA Verification

### Test PWA Installation
1. Open https://app.drzerquera.com in Chrome/Edge
2. Look for "Install" button in address bar
3. Test installation on mobile device
4. Verify offline functionality

### PWA Audit Tools
```bash
# Using Lighthouse CLI
npm install -g lighthouse
lighthouse https://app.drzerquera.com --view

# Check PWA manifest
curl -s https://app.drzerquera.com/manifest.json | jq .
```

## Step 7: Monitoring and Maintenance

### Set Up Log Monitoring
```bash
# Create log rotation
sudo cat > /etc/logrotate.d/zimi-app << EOF
/var/www/zimi-app/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 0644 root root
}
EOF
```

### Health Check Script
```bash
cat > health-check.sh << 'EOF'
#!/bin/bash
# ZIMI Health Check Script

DOMAIN="app.drzerquera.com"
LOG_FILE="/var/log/zimi-health.log"

echo "$(date): Starting health check" >> $LOG_FILE

# Check HTTPS
if curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN | grep -q "200"; then
    echo "$(date): HTTPS OK" >> $LOG_FILE
else
    echo "$(date): HTTPS FAILED" >> $LOG_FILE
fi

# Check API
if curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/ | grep -q "200"; then
    echo "$(date): API OK" >> $LOG_FILE
else
    echo "$(date): API FAILED" >> $LOG_FILE
fi

# Check SSL certificate expiration
EXPIRY=$(openssl s_client -connect $DOMAIN:443 -servername $DOMAIN 2>/dev/null | openssl x509 -noout -dates | grep "Not After" | cut -d= -f2)
echo "$(date): SSL expires: $EXPIRY" >> $LOG_FILE
EOF

chmod +x health-check.sh

# Add to crontab for regular checks
(crontab -l 2>/dev/null; echo "*/15 * * * * /var/www/zimi-app/health-check.sh") | crontab -
```

## Step 8: Backup Strategy

### Database Backup
```bash
cat > backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/zimi"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup MongoDB
docker exec $(docker-compose -f docker-compose.production.yml ps -q mongo) mongodump --db zimi_production --out /tmp/backup
docker cp $(docker-compose -f docker-compose.production.yml ps -q mongo):/tmp/backup $BACKUP_DIR/mongo_$DATE

# Keep only last 30 days of backups
find $BACKUP_DIR -name "mongo_*" -mtime +30 -delete
EOF

chmod +x backup-db.sh

# Schedule daily backups
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/zimi-app/backup-db.sh") | crontab -
```

## Step 9: Security Hardening

### Firewall Configuration
```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Additional Security
```bash
# Disable password authentication (use SSH keys)
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart ssh

# Install fail2ban
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
```

## Step 10: Post-Deployment Testing

### Comprehensive Testing Checklist
- [ ] Domain resolves to correct IP
- [ ] HTTPS certificate valid and trusted
- [ ] HTTP redirects to HTTPS
- [ ] PWA installs on desktop and mobile
- [ ] All API endpoints respond correctly
- [ ] Service worker caches resources
- [ ] Offline functionality works
- [ ] Push notifications work (if enabled)
- [ ] Database connections secure
- [ ] Log monitoring active
- [ ] Backup system operational

### Performance Testing
```bash
# Test website speed
lighthouse https://app.drzerquera.com --only-categories=performance --view

# Test API response times
curl -w "@curl-format.txt" -o /dev/null -s https://app.drzerquera.com/api/services
```

## Troubleshooting

### Common Issues and Solutions

#### Domain Not Resolving
```bash
# Check DNS propagation
dig app.drzerquera.com
nslookup app.drzerquera.com 8.8.8.8
```

#### SSL Certificate Issues
```bash
# Check certificate validity
openssl s_client -connect app.drzerquera.com:443 -servername app.drzerquera.com

# Renew Let's Encrypt certificate
docker-compose -f docker-compose.production.yml run --rm certbot renew
```

#### PWA Not Installing
- Verify HTTPS is working
- Check manifest.json is accessible
- Ensure service worker registers correctly
- Test in incognito/private mode

#### API CORS Errors
- Verify nginx.conf CORS headers
- Check backend CORS configuration
- Ensure domain matches exactly

### Log Locations
```bash
# Application logs
docker-compose -f docker-compose.production.yml logs [service-name]

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# System logs
journalctl -f -u docker
```

## Maintenance Schedule

### Daily
- Monitor application health
- Check error logs
- Verify backup completion

### Weekly
- Review security logs
- Update system packages
- Check SSL certificate status

### Monthly
- Full system backup
- Security audit
- Performance review
- Dependency updates

## Support and Documentation

For additional support:
- Review logs in `/var/log/zimi-app/`
- Check the troubleshooting section
- Consult nginx and Docker documentation
- Contact your hosting provider for server issues

---

**Note**: This deployment guide assumes a production environment. Always test in a staging environment first before deploying to production.