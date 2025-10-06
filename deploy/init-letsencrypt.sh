#!/bin/bash

# --- Configurações ---
DOMAIN="carteado.ferdinandes.com.br"
EMAIL="franmlfran@gmail.com"
COMPOSE_FILE="docker-compose-prod.yml"
DATA_PATH="./data/certbot"
# ---------------------

set -e

# Verifica se o docker-compose está disponível
if ! docker compose -f "$COMPOSE_FILE" &>/dev/null; then
    echo "Erro: docker-compose-prod.yml não encontrado ou inválido."
    exit 1
fi

# Verifica se o certificado REAL já existe. Se sim, não faz nada.
if [ -d "$DATA_PATH/conf/live/$DOMAIN" ]; then
  echo ">>> Certificado SSL para $DOMAIN já existe. Saindo..."
  exit 0
fi

echo "### 1. Criando arquivos de configuração e certificado falso para $DOMAIN ..."
mkdir -p "$DATA_PATH/conf/live/$DOMAIN"
docker compose -f "$COMPOSE_FILE" run --rm --entrypoint "\
  sh -c ' \
    echo "### Gerando certificado falso..."; \
    openssl req -x509 -nodes -newkey rsa:4096 -days 1 \
      -keyout \"/etc/letsencrypt/live/$DOMAIN/privkey.pem\" \
      -out \"/etc/letsencrypt/live/$DOMAIN/fullchain.pem\" \
      -subj \"/CN=localhost\"; \
    echo "### Baixando configs recomendadas do Certbot..."; \
    if [ ! -f /etc/letsencrypt/options-ssl-nginx.conf ]; then \
      curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > /etc/letsencrypt/options-ssl-nginx.conf; \
    fi; \
    echo "### Gerando grupo DH forte..."; \
    if [ ! -f /etc/letsencrypt/ssl-dhparams.pem ]; then \
      openssl dhparam -out /etc/letsencrypt/ssl-dhparams.pem 2048; \
    fi; \
  '" certbot

echo "### 2. Iniciando Nginx..."
docker compose -f "$COMPOSE_FILE" up -d nginx

# A PAUSA CRÍTICA
echo "### 3. Aguardando 10 segundos para o Nginx estabilizar..."
sleep 10

echo "### 4. Solicitando certificado real para $DOMAIN ..."
# Deleta o certificado falso antes de pedir o real
docker compose -f "$COMPOSE_FILE" run --rm --entrypoint "rm -Rf /etc/letsencrypt/live/$DOMAIN" certbot
docker compose -f "$COMPOSE_FILE" run --rm --entrypoint "\
  certbot certonly --webroot --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --domain $DOMAIN \
    --agree-tos \
    --no-eff-email \
    --force-renewal" certbot

echo "### 5. Reiniciando Nginx para carregar certificado real..."
docker compose -f "$COMPOSE_FILE" restart nginx

echo ">>> Configuração SSL automatizada concluída! <<<"