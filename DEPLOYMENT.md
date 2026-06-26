# Deployment Guide

## Prerequisites

- Ubuntu 22.04+ VPS
- Domain name configured with DNS
- NVIDIA GPU (optional, for GPU acceleration)

## Quick Deploy

```bash
# 1. SSH into your VPS
ssh user@your-vps-ip

# 2. Run the setup script
sudo bash scripts/setup-vps.sh

# 3. Update the .env file
nano /opt/removeanything/.env

# 4. Restart services
docker-compose restart
```

## Manual Deployment

### 1. Install Dependencies

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx
sudo systemctl enable docker && sudo systemctl start docker
```

### 2. Setup Project

```bash
git clone https://github.com/yourusername/removeanything-ai.git /opt/removeanything
cd /opt/removeanything
cp .env.production .env
# Edit .env with your settings
nano .env
```

### 3. Configure SSL

```bash
sudo certbot --nginx -d app.removeanything.ai -d api.removeanything.ai
```

### 4. Start Services

```bash
docker-compose up -d
```

### 5. Verify

```bash
curl http://localhost:8000/health
curl http://localhost:3000
```

## GPU Acceleration

To enable GPU acceleration:

1. Install NVIDIA drivers and nvidia-container-toolkit
2. Set `DEVICE=cuda` in `.env`
3. In `docker-compose.yml`, uncomment the GPU reservation section

## Production Checklist

- [ ] Set strong API keys
- [ ] Configure rate limiting
- [ ] Enable Sentry error tracking
- [ ] Set up database backups
- [ ] Configure monitoring alerts
- [ ] Set up log rotation
- [ ] Enable HTTPS only
- [ ] Set CORS to your domain only
- [ ] Configure WAF/firewall
- [ ] Set up CI/CD pipeline

## Scaling

### Horizontal Scaling
```bash
# Add more backend workers
docker-compose up -d --scale backend=3
```

### Queue-based Processing
For high volume, enable Redis-backed job queues:

```yaml
# docker-compose.yml
services:
  redis:
    image: redis:alpine
  worker:
    build: ./backend
    command: rq worker --with-scheduler
    depends_on: [redis]
```

## Monitoring

- **Metrics**: Available at `/metrics` (Prometheus format)
- **Health**: Endpoint at `/health`
- **Logs**: `docker-compose logs -f`
- **Sentry**: Set `SENTRY_DSN` in `.env` for error tracking
