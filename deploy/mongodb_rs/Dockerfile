ARG MONGO_VERSION

FROM mongo:${MONGO_VERSION}

# we take over the default & start mongo in replica set mode in a background task
ENTRYPOINT mongod --port $MONGO_REPLICA_PORT --replSet rs0 --bind_ip 0.0.0.0 & MONGOD_PID=$!; \
  # we prepare the replica set with a single node and prepare the root user config
  INIT_REPL_CMD="rs.initiate({ _id: 'rs0', members: [{ _id: 0, host: '$MONGO_REPLICA_HOST:$MONGO_REPLICA_PORT' }] })"; \
  INIT_USER_CMD="db.getUser('$MONGO_INITDB_ROOT_USERNAME')  || db.createUser({ user: '$MONGO_INITDB_ROOT_USERNAME', pwd: '$MONGO_INITDB_ROOT_PASSWORD', roles: ['root'] })"; \
  # wait for mongo to accept connections, then init replica set (or skip if already initialized)
  until mongosh admin --port $MONGO_REPLICA_PORT --eval "db.adminCommand('ping')" >/dev/null 2>&1; do sleep 1; done; \
  mongosh admin --port $MONGO_REPLICA_PORT --eval "$INIT_REPL_CMD" 2>/dev/null || true; \
  until mongosh admin --port $MONGO_REPLICA_PORT --eval "rs.status()" >/dev/null 2>&1; do sleep 1; done; \
  # we are done but we keep the container by waiting on signals from the mongo task
  echo "REPLICA SET ONLINE"; wait $MONGOD_PID;