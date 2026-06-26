#!/bin/bash
set -e

echo "========================================"
echo "  RemoveAnything AI - VPS Setup Script"
echo "========================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

log() { echo -e "${GREEN}[+]${NC} $1"; }
error() { echo -e "${RED}[!]${NC} $1"; exit 1; }

# Check root
if [ "$EUID" -ne 0 ]; then
  error "Please run as root"
fi

# Update system
log "Updating system packages..."
apt-get update && apt-get upgrade -y

# Install Docker
if ! command -v docker &> /dev/null; then
  log "Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
  log "Installing Docker Compose..."
  curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  chmod +x /usr/local/bin/docker-compose
fi

# Install NVIDIA container toolkit (for GPU)
if command -v nvidia-smi &> /dev/null; then
  log "Installing NVIDIA container toolkit..."
  distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
  curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | apt-key add -
  curl -s -L "https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list" > /etc/apt/sources.list.d/nvidia-docker.list
  apt-get update
  apt-get install -y nvidia-container-toolkit
  nvidia-ctk runtime configure --runtime=docker
  systemctl restart docker
fi

# Setup SSL with certbot
log "Setting up SSL..."
apt-get install -y certbot python3-certbot-nginx

# Clone repo
log "Cloning repository..."
cd /opt
if [ ! -d "removeanything" ]; then
  git clone https://github.com/yourusername/removeanything-ai.git removeanything
fi

cd removeanything

# Setup env
log "Configuring environment..."
if [ ! -f ".env" ]; then
  cp .env.production .env
  echo "Please update the .env file with your settings"
fi

# Create SSL directory
mkdir -p docker/ssl

# Start services
log "Starting services..."
docker-compose pull
docker-compose up -d

log "========================================"
log "  Setup complete!"
log "  Backend:  http://$(curl -s ifconfig.me):8000"
log "  Frontend: http://$(curl -s ifconfig.me):3000"
log "  API Docs: http://$(curl -s ifconfig.me):8000/api/docs"
log "========================================"
