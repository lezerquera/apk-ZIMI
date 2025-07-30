# DNS Configuration for ZIMI PWA Custom Domain

## Overview
This guide helps you set up DNS records for deploying the ZIMI PWA on `app.drzerquera.com`.

## Required DNS Records

### A Records
```
Type: A
Name: app
Value: [YOUR_SERVER_IP_ADDRESS]
TTL: 3600 (1 hour)
```

### CNAME Record (Alternative to A record)
```
Type: CNAME
Name: app
Value: your-server.com
TTL: 3600 (1 hour)
```

### Additional Recommended Records

#### AAAA Record (IPv6 - if supported)
```
Type: AAAA
Name: app
Value: [YOUR_IPv6_ADDRESS]
TTL: 3600
```

#### CAA Record (Certificate Authority Authorization)
```
Type: CAA
Name: app
Value: 0 issue "letsencrypt.org"
TTL: 3600
```

## SSL Certificate Setup

### Using Let's Encrypt (Recommended)
1. Use the provided docker-compose.production.yml
2. Run: `docker-compose -f docker-compose.production.yml up certbot`
3. Certificates will be automatically generated and renewed

### Manual SSL Certificate
If you have your own SSL certificate:
1. Place your certificate files in `/app/deployment/ssl/`
2. Update the nginx.conf file with correct paths
3. Ensure certificate includes both app.drzerquera.com and drzerquera.com if needed

## Domain Verification

### Google Search Console
1. Add property for `https://app.drzerquera.com`
2. Use HTML file verification method
3. Upload verification file to `/.well-known/` directory

### Other Services
Place verification files in `/app/deployment/.well-known/` directory:
- Google: `google[hash].html`
- Bing: `BingSiteAuth.xml`
- Facebook: `facebook-domain-verification`

## Subdomain Configuration

### API Subdomain (Optional)
If you want to use api.drzerquera.com instead of app.drzerquera.com/api:

```
Type: A
Name: api
Value: [YOUR_SERVER_IP_ADDRESS]
TTL: 3600
```

Update the frontend environment variable:
```
REACT_APP_BACKEND_URL=https://api.drzerquera.com
```

## Testing DNS Configuration

### Command Line Tools
```bash
# Check A record
dig app.drzerquera.com A

# Check CNAME record
dig app.drzerquera.com CNAME

# Check if domain resolves
nslookup app.drzerquera.com

# Test HTTPS
curl -I https://app.drzerquera.com
```

### Online Tools
- DNS Checker: https://dnschecker.org/
- SSL Test: https://www.ssllabs.com/ssltest/
- PWA Test: https://web.dev/measure/

## Domain Provider Specific Instructions

### GoDaddy
1. Login to GoDaddy DNS Management
2. Add A record: `app` pointing to your server IP
3. Save changes (propagation: 24-48 hours)

### Cloudflare
1. Login to Cloudflare dashboard
2. Add A record: `app` pointing to your server IP
3. Enable proxy (orange cloud) for CDN and DDoS protection
4. Enable SSL/TLS (Full or Full Strict)

### Namecheap
1. Login to Namecheap account
2. Go to Domain List > Manage
3. Advanced DNS tab
4. Add A record: `app` with your server IP

## Security Considerations

### HSTS (HTTP Strict Transport Security)
The nginx.conf includes HSTS headers to enforce HTTPS.

### Content Security Policy
Configured to allow necessary external resources while maintaining security.

### Firewall Rules
Ensure your server firewall allows:
- Port 80 (HTTP - for redirects)
- Port 443 (HTTPS)
- Port 22 (SSH - for management)

## Monitoring and Maintenance

### SSL Certificate Renewal
Certificates auto-renew via certbot. Monitor expiration:
```bash
# Check certificate expiration
openssl x509 -in /path/to/cert.crt -text -noout | grep "Not After"

# Test auto-renewal
certbot renew --dry-run
```

### Domain Health Monitoring
Set up monitoring for:
- SSL certificate expiration
- Domain resolution
- Website uptime
- PWA installation functionality

## Troubleshooting

### Common Issues
1. **DNS not propagating**: Wait 24-48 hours, clear DNS cache
2. **SSL certificate errors**: Check certificate installation and renewal
3. **CORS errors**: Verify nginx.conf CORS headers
4. **PWA not installing**: Ensure HTTPS and valid manifest.json

### Debug Commands
```bash
# Check nginx configuration
nginx -t

# View nginx logs
docker-compose logs nginx

# Check SSL certificate
openssl s_client -connect app.drzerquera.com:443

# Test API endpoint
curl https://app.drzerquera.com/api/
```