ARG MONGO_VERSION=7.0

FROM mongo:${MONGO_VERSION}

# Entrypoint próprio: imagem oficial usa docker-entrypoint.sh para MONGO_INITDB_*,
# mas precisamos de mongod com --replSet; o script em linha única usava process.env no mongosh,
# que muitas vezes vem vazio — o createUser falhava em silêncio (|| true) e o root não ficava com a password do compose.

COPY docker-entrypoint.sh /usr/local/bin/custom-mongo-entrypoint.sh
RUN chmod +x /usr/local/bin/custom-mongo-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/custom-mongo-entrypoint.sh"]
