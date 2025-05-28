#!/bin/bash
set -e

# === Konfiguration ===
SERVER_USER="bfuisz"
SERVER_HOST="78.47.24.156"
SERVER_PORT="6602"
REMOTE_DIR="/opt/containers/babylog"

# === Farben ===
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# === Hilfsfunktionen ===
info() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
fail() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# === Lokaler Build ===
info "Installing local dependencies..."
yarn install --frozen-lockfile

info "Building SvelteKit app..."
yarn build

# === Sync auf Server (nur relevante Dateien) ===
info "Syncing build artifacts to server..."
rsync -az --delete --exclude=".git" --exclude="node_modules" -e "ssh -p $SERVER_PORT" \
  build static  entrypoint.sh Dockerfile drizzle.config.ts src svelte.config.js package.json yarn.lock \
  $SERVER_USER@$SERVER_HOST:$REMOTE_DIR/

# === Remote Compose: down → up --build ===
info "Deploying with docker-compose..."
ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST << EOF
  set -e
  cd $REMOTE_DIR

  echo "[INFO] Shutting down old containers..."
  docker-compose -f docker-compose.production.yml down

  echo "[INFO] Starting and building new containers..."
  docker-compose -f docker-compose.production.yml up -d --build

  echo "[INFO] Showing logs:"
  docker-compose -f docker-compose.production.yml logs -f --tail=30 app
EOF