#!/bin/bash

# --- Configurações ---
DOMAIN="carteado.ferdinandes.com.br"
EMAIL="franmlfran@gmail.com" # Seu e-mail
COMPOSE_FILE="docker-compose-prod.yml"
# ---------------------

# Para o script se qualquer comando falhar
set -e

# Verifica se o docker-compose está disponível
if ! docker compose -f "$COMPOSE_FILE" &>/dev/null; then
    echo "Erro: docker-compose.yml não encontrado ou inválido."
    exit 1
fi

# Verifica se o certificado já existe
if [ -d "data/certbot/conf/live/$DOMAIN" ]; then
  echo ">>> Certificado SSL para $DOMAIN já existe. Pulando etapa."
  exit 0
fi

echo "### 1. Criando certificado falso para $DOMAIN ..."
mkdir -p ./data/certbot/conf
docker compose -f "$COMPOSE_FILE" run --rm --entrypoint "\
  openssl req -x509 -nodes -newkey rsa:4096 -days 1\
    -keyout '/etc/letsencrypt/live/$DOMAIN/privkey.pem' \
    -out '/etc/letsencrypt/live/$DOMAIN/fullchain.pem' \
    -subj '/CN=localhost'" certbot

echo "### 2. Iniciando Nginx com certificado falso..."
docker compose -f "$COMPOSE_FILE" up -d nginx

# A PAUSA CRÍTICA PARA RESOLVER O PROBLEMA DE TIMING
echo "### 3. Aguardando 10 segundos para o Nginx iniciar..."
sleep 10

echo "### 4. Removendo certificado falso..."
docker compose -f "$COMPOSE_FILE" run --rm --entrypoint "\
  rm -Rf /etc/letsencrypt/live/$DOMAIN && \
  rm -Rf /etc/letsencrypt/archive/$DOMAIN && \
  rm -Rf /etc/letsencrypt/renewal/$DOMAIN.conf" certbot

echo "### 5. Solicitando certificado real para $DOMAIN ..."
docker compose -f "$COMPOSE_FILE" run --rm --entrypoint "\
  certbot certonly --webroot --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --domain $DOMAIN \
    --agree-tos \
    --no-eff-email \
    --force-renewal" certbot

# O Nginx recarrega a configuração automaticamente, então um restart não é estritamente necessário,
# mas é uma boa prática para garantir.
echo "### 6. Reiniciando Nginx com certificado real..."
docker compose -f "$COMPOSE_FILE" restart nginx