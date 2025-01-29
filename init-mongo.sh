sleep 10


mongo --host mongodb1:27017 --eval 'rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongodb1:27017" },
    { _id: 1, host: "mongodb2:27017" },
    { _id: 2, host: "mongodb3:27017" }
  ]
})'

mongo --host mongodb1:27017 --eval 'rs.add("mongodb2:27017")'
mongo --host mongodb1:27017 --eval 'rs.add("mongodb3:27017")'

echo "Replica set configurado com réplicas secundárias!"
