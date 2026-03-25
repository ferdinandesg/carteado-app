#!/bin/bash
set -euo pipefail

# Replica set de um nó + utilizador root em admin.
# createUser só é aceite quando o nó é PRIMARY; antes disso falha (e antes estava escondido com 2>/dev/null).

MONGO_PORT="${MONGO_REPLICA_PORT:-27017}"
MONGO_HOST="${MONGO_REPLICA_HOST:-mongodb}"
USER_NAME="${MONGO_INITDB_ROOT_USERNAME:-root}"
USER_PWD="${MONGO_INITDB_ROOT_PASSWORD:-password}"

js_escape() {
  printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'
}

echo "[mongo] starting mongod (replica set rs0)..."
mongod --port "$MONGO_PORT" --replSet rs0 --bind_ip 0.0.0.0 &
MONGOD_PID=$!

INIT_REPL_CMD="rs.initiate({ _id: 'rs0', members: [{ _id: 0, host: '${MONGO_HOST}:${MONGO_PORT}' }] })"

echo "[mongo] waiting for ping..."
until mongosh admin --port "$MONGO_PORT" --eval "db.adminCommand('ping')" >/dev/null 2>&1; do sleep 1; done

echo "[mongo] rs.initiate (ignora erro se já existir)..."
mongosh admin --port "$MONGO_PORT" --eval "$INIT_REPL_CMD" 2>&1 || true

echo "[mongo] waiting for rs.status()..."
until mongosh admin --port "$MONGO_PORT" --eval "rs.status()" >/dev/null 2>&1; do sleep 1; done

echo "[mongo] waiting for PRIMARY (até ~120s)..."
for _ in $(seq 1 120); do
  if mongosh admin --port "$MONGO_PORT" --quiet --eval "db.isMaster().ismaster" 2>/dev/null | grep -q true; then
    echo "[mongo] this node is PRIMARY (ismaster)."
    break
  fi
  sleep 1
done

EVAL_USER="$(js_escape "$USER_NAME")"
EVAL_PWD="$(js_escape "$USER_PWD")"

echo "[mongo] createUser (erro 'already exists' é normal em restart com volume já populado)..."
set +e
OUT=$(mongosh admin --port "$MONGO_PORT" --eval "db.createUser({ user: \"${EVAL_USER}\", pwd: \"${EVAL_PWD}\", roles: [{ role: 'root', db: 'admin' }] })" 2>&1)
RC=$?
set -e
echo "$OUT"
if [[ "$RC" -ne 0 ]]; then
  echo "[mongo] createUser exit code: $RC"
fi

echo "REPLICA SET ONLINE"
wait "$MONGOD_PID"
