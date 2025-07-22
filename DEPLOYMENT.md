# VoIP POC - Deployment Guide

## 🚀 Quick Deployment Options

### 1. Local Development (Recommended for testing)
```bash
npm run dev
```
Access at: http://localhost:5173

### 2. Production Build
```bash
npm run build
npm run preview
```

### 3. Docker Deployment
```bash
docker-compose up -d
```

### 4. Cloud Deployment
- **Frontend**: Deploy to Vercel/Netlify
- **Backend**: Deploy to Heroku/Railway/DigitalOcean

## Environment Variables

Create `.env` file:
```
NODE_ENV=production
PORT=3001
FRONTEND_URL=http://localhost:5173
```

## Health Checks

### API Health Check
```bash
curl http://localhost:3001/api/dashboard/stats
```

### Frontend Health Check
```bash
curl http://localhost:5173
```

## Monitoring

### PM2 Process Management
```bash
pm2 start server/index.js --name voip-poc
pm2 monit
```

### Logs
```bash
# Application logs
pm2 logs voip-poc

# System logs
tail -f /var/log/nginx/access.log
```

## Security Checklist

- [ ] Enable HTTPS in production
- [ ] Set up firewall rules
- [ ] Configure rate limiting
- [ ] Add authentication
- [ ] Enable CORS properly
- [ ] Secure WebSocket connections

## Performance Optimization

- [ ] Enable gzip compression
- [ ] Set up CDN for static assets
- [ ] Configure caching headers
- [ ] Optimize database queries
- [ ] Monitor memory usage