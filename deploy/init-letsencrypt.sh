#!/bin/bash

# Fail fast on errors and unset vars, and propagate pipe failures
set -euo pipefail

# =================== CONFIG ===================
DOMAIN="carteado.ferdinandes.com.br"
EMAIL="franmlfran@gmail.com"
COMPOSE_FILE="docker-compose-prod.yml"
DATA_PATH="./data/certbot"
DH_BITS=2048
STAGING=0
# =================================================

echo "[+] Script de inicialização SSL para $DOMAIN"

# Resolve directory of the script to safely use relative paths
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

if [ ! -f "$COMPOSE_FILE" ]; then
  echo "[ERRO] Arquivo $COMPOSE_FILE não encontrado em $SCRIPT_DIR" >&2
  exit 1
fi

LE_BASE="$DATA_PATH/conf"
CERT_LIVE_DIR="$LE_BASE/live/$DOMAIN"
DH_FILE="$LE_BASE/ssl-dhparams.pem"
OPTIONS_FILE="$LE_BASE/options-ssl-nginx.conf"

# ==================================================================
# ETAPA 1: CRIAR ARQUIVOS PRÉ-REQUISITO ANTES DE TUDO
# ==================================================================

echo "[1/7] Garantindo que os diretórios de base existem..."
mkdir -p "$LE_BASE"
mkdir -p "$DATA_PATH/www"

if [ ! -f "$OPTIONS_FILE" ]; then
    echo "[2/7] Baixando options-ssl-nginx.conf recomendado..."
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "$OPTIONS_FILE"
fi

if [ ! -f "$DH_FILE" ]; then
    echo "[3/7] Gerando ssl-dhparams.pem ($DH_BITS bits) — isso pode levar alguns minutos..."
    # Usa um container simples do OpenSSL, é mais leve que o do certbot
    docker run --rm -v "$SCRIPT_DIR/$LE_BASE:/etc/letsencrypt" frapsoft/openssl dhparam -out "/etc/letsencrypt/ssl-dhparams.pem" $DH_BITS
fi

# ==================================================================
# ETAPA 2: Lidar com certificados
# ==================================================================

# Se já houver certificado real, encerramos cedo.
if [ -f "$CERT_LIVE_DIR/fullchain.pem" ] && grep -q "BEGIN CERTIFICATE" "$CERT_LIVE_DIR/fullchain.pem"; then
  echo "[INFO] Certificado existente detectado. Iniciando serviços..."
  docker compose -f "$COMPOSE_FILE" up -d
  echo "[OK] Processo concluído."
  exit 0
fi

echo "[4/7] Gerando certificado autoassinado TEMPORÁRIO..."
mkdir -p "$CERT_LIVE_DIR"
docker compose -f "$COMPOSE_FILE" run --rm --entrypoint "sh -c '
  set -e;
  if [ ! -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]; then
    openssl req -x509 -nodes -newkey rsa:4096 -days 1 \
      -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem \
      -out /etc/letsencrypt/live/$DOMAIN/fullchain.pem \
      -subj /CN=localhost;
  fi;
'" certbot

echo "[5/7] Subindo Nginx em modo detach com certificado temporário..."
docker compose -f "$COMPOSE_FILE" up -d nginx

echo "[INFO] Aguardando Nginx estabilizar (5s)..."
sleep 5

echo "[6/7] Solicitando certificado real Let's Encrypt..."
local staging_flag=""
if [ "$STAGING" = "1" ]; then staging_flag="--staging"; fi

# Usa o serviço 'certbot' do compose para obter o certificado real
docker compose -f "$COMPOSE_FILE" run --rm certbot certonly --webroot --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --domain "$DOMAIN" \
    --agree-tos \
    --no-eff-email \
    --rsa-key-size 4096 \
    --force-renewal $staging_flag

echo "[7/7] Reiniciando Nginx para carregar certificado definitivo..."
docker compose -f "$COMPOSE_FILE" restart nginx

echo ">>> Configuração SSL automatizada concluída para $DOMAIN <<<"