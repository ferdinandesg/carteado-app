#!/bin/bash

# --- Configurações ---
DOMAIN="carteado.ferdinandes.com.br"
EMAIL="seu-email@dominio.com"
DATA_PATH="./data/certbot"
# ---------------------

if [ -d "$DATA_PATH/conf/live/$DOMAIN" ]; then
  echo ">>> Certificado SSL para $DOMAIN já existe. Saindo..."
  exit 0
fi

echo "### Criando certificado falso para $DOMAIN ..."
mkdir -p "$DATA_PATH/conf/live/$DOMAIN"
docker compose -f docker-compose-prod.yml run --rm --entrypoint "\
  openssl req -x509 -nodes -newkey rsa:4096 -days 1\
    -keyout '/etc/letsencrypt/live/$DOMAIN/privkey.pem' \
    -out '/etc/letsencrypt/live/$DOMAIN/fullchain.pem' \
    -subj '/CN=localhost'" certbot

echo "### Iniciando Nginx com certificado falso..."
docker compose -f docker-compose-prod.yml up -d nginx

echo "### Removendo certificado falso..."
docker compose -f docker-compose-prod.yml run --rm --entrypoint "\
  rm -Rf /etc/letsencrypt/live/$DOMAIN && \
  rm -Rf /etc/letsencrypt/archive/$DOMAIN && \
  rm -Rf /etc/letsencrypt/renewal/$DOMAIN.conf" certbot

echo "### Solicitando certificado real para $DOMAIN ..."
docker compose -f docker-compose-prod.yml run --rm --entrypoint "\
  certbot certonly --webroot --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --domain $DOMAIN \
    --agree-tos \
    --no-eff-email \
    --force-renewal" certbot

echo "### Reiniciando Nginx com certificado real..."
docker compose -f docker-compose-prod.yml restart nginx