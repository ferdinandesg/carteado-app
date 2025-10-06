#!/bin/bash

# Fail fast on errors and unset vars, and propagate pipe failures
set -euo pipefail

# =================== CONFIG ===================
DOMAIN="carteado.ferdinandes.com.br"
EMAIL="franmlfran@gmail.com"
COMPOSE_FILE="docker-compose-prod.yml"
DATA_PATH="./data/certbot"        # Host path (relative to this script dir)
DH_BITS=2048                       # DH param size (2048 is OK, 4096 is slower)
STAGING=0                          # Ajuste para 1 se quiser usar ambiente de testes do Let's Encrypt
# =================================================

echo "[+] Script de inicialização SSL para $DOMAIN"

# Resolve directory of the script to safely use relative paths
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

if [ ! -f "$COMPOSE_FILE" ]; then
  echo "[ERRO] Arquivo $COMPOSE_FILE não encontrado em $SCRIPT_DIR" >&2
  exit 1
fi

CERT_LIVE_DIR="$DATA_PATH/conf/live/$DOMAIN"
LE_BASE="$DATA_PATH/conf"              # Host path that maps to /etc/letsencrypt
DH_FILE="$LE_BASE/ssl-dhparams.pem"
OPTIONS_FILE="$LE_BASE/options-ssl-nginx.conf"

ensure_base_dirs() {
  mkdir -p "$CERT_LIVE_DIR"
}

generate_fake_cert() {
  echo "[1/6] Gerando certificado autoassinado TEMPORÁRIO..."
  docker compose -f "$COMPOSE_FILE" run --rm --entrypoint "sh -c '
    set -e; \
    if [ ! -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]; then \
      echo Generating self-signed cert; \
      mkdir -p /etc/letsencrypt/live/$DOMAIN; \
      openssl req -x509 -nodes -newkey rsa:4096 -days 1 \
        -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem \
        -out /etc/letsencrypt/live/$DOMAIN/fullchain.pem \
        -subj /CN=localhost; \
    else \
      echo 'Self-signed cert already present - skipping'; \
    fi; \
  '" certbot
}

ensure_options_file() {
  if [ ! -f "$OPTIONS_FILE" ]; then
    echo "[2/6] Baixando options-ssl-nginx.conf recomendado..."
    docker compose -f "$COMPOSE_FILE" run --rm --entrypoint "sh -c '
      set -e; \
      if [ ! -f /etc/letsencrypt/options-ssl-nginx.conf ]; then \
        apk add --no-cache curl >/dev/null 2>&1 || true; \
        curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot_nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > /etc/letsencrypt/options-ssl-nginx.conf; \
      fi; \
    '" certbot
  else
    echo "[2/6] options-ssl-nginx.conf já existe."
  fi
}

ensure_dhparams() {
  if [ -f "$DH_FILE" ]; then
    echo "[3/6] ssl-dhparams.pem já existe."
    return 0
  fi
  echo "[3/6] Gerando ssl-dhparams.pem ($DH_BITS bits) — isso pode levar alguns minutos..."
  # Gera usando container temporário para não poluir host; usa a mesma definição de volumes do serviço certbot.
  docker compose -f "$COMPOSE_FILE" run --rm --entrypoint "sh -c '
    set -e; \
    if [ ! -f /etc/letsencrypt/ssl-dhparams.pem ]; then \
      openssl dhparam -out /etc/letsencrypt/ssl-dhparams.pem $DH_BITS; \
    fi; \
  '" certbot
  # Verificação
  if [ ! -s "$DH_FILE" ]; then
    echo "[ERRO] Falha ao gerar ssl-dhparams.pem" >&2
    exit 1
  fi
}

request_real_cert() {
  echo "[5/6] Solicitando certificado real Let's Encrypt..."
  local staging_flag=""
  if [ "$STAGING" = "1" ]; then staging_flag="--staging"; fi
  # Remove somente o live do domínio (mantém dhparams e options)
  docker compose -f "$COMPOSE_FILE" run --rm --entrypoint "rm -rf /etc/letsencrypt/live/$DOMAIN" certbot || true
  docker compose -f "$COMPOSE_FILE" run --rm --entrypoint "sh -c '
    set -e; \
    certbot certonly --webroot --webroot-path=/var/www/certbot \
      --email $EMAIL \
      --domain $DOMAIN \
      --agree-tos \
      --no-eff-email \
      --rsa-key-size 4096 \
      --force-renewal $staging_flag; \
  '" certbot
}

restart_nginx() {
  echo "[6/6] Reiniciando Nginx para carregar certificado definitivo..."
  docker compose -f "$COMPOSE_FILE" restart nginx
  echo "[OK] Processo concluído."
}

# ================= MAIN FLOW =================

ensure_base_dirs

# Se já houver certificado real, encerramos cedo.
if [ -f "$CERT_LIVE_DIR/fullchain.pem" ] && grep -q "BEGIN CERTIFICATE" "$CERT_LIVE_DIR/fullchain.pem"; then
  echo "[INFO] Certificado existente detectado em $CERT_LIVE_DIR. Nada a fazer."
  exit 0
fi

generate_fake_cert
ensure_options_file
ensure_dhparams

echo "[4/6] Subindo (ou atualizando) Nginx em modo detach..."
docker compose -f "$COMPOSE_FILE" up -d nginx

# Pequena espera para garantir que o Nginx esteja atendendo no :80 para o desafio HTTP
echo "[INFO] Aguardando Nginx estabilizar (5s)..."
sleep 5

request_real_cert
restart_nginx

echo ">>> Configuração SSL automatizada concluída para $DOMAIN <<<"